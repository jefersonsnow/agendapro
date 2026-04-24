"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cache } from "react"
import bcrypt from "bcryptjs"
import { getPlanLimits, isWithinLimit, isFeatureAllowed } from "@/lib/plan-limits"
import { isAfter } from "date-fns"
import { logAction } from "@/lib/audit"

import { getSalonId, getGlobalConfigCache } from "@/lib/dal"
import { clientSchema, serviceSchema, staffSchema } from "@/lib/validations/dashboard"
import { supportTicketSchema } from "@/lib/validations/support"


// --- CLIENTS ---
export async function getClients(page: number = 1, pageSize: number = 50, search: string = "") {
  const salonId = await getSalonId()
  if (!salonId) return { clients: [], totalCount: 0 }

  const where: any = {
    salon_id: salonId
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [clients, totalCount] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.client.count({ where })
  ])

  return {
    clients: clients.map((client: any) => ({
      ...client,
      total_spent: Number(client.total_spent),
    })),
    totalCount
  }
}

export async function getClientProfile(clientId: string) {
  const salonId = await getSalonId()
  if (!salonId) return null
  const client = await prisma.client.findFirst({
    where: { id: clientId, salon_id: salonId },
    include: {
      appointments: {
        include: {
          service: true,
          staff: true
        },
        orderBy: { starts_at: 'desc' },
      }
    }
  })
  if (!client) return null

  return {
    ...client,
    total_spent: Number(client.total_spent),
    appointments: client.appointments.map((app: any) => ({
      ...app,
      price: Number(app.price),
      service: {
        ...app.service,
        price: Number(app.service.price)
      },
      staff: {
        ...app.staff
      }
    }))
  }
}

export async function upsertClient(id: string | null, data: any) {
  const validatedFields = clientSchema.safeParse(data)
  if (!validatedFields.success) {
    throw new Error("Dados inválidos: " + JSON.stringify(validatedFields.error.flatten().fieldErrors))
  }
  const validatedData = validatedFields.data

  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")


  const salon = await (prisma as any).salon.findUnique({ where: { id: salonId }, select: { plan: true } })
  const plan = salon?.plan || "free"
  
  const config = await getGlobalConfigCache()
  const dynamicPlans = config?.landing_page ? JSON.parse(config.landing_page).plans : null

  let updatePayload: any = {
    name: validatedData.name,
    email: validatedData.email || null,
    phone: validatedData.phone || null,
    address: validatedData.address || null,
    nif: validatedData.nif || null,
    notes: validatedData.notes || null,
    loyalty_points: validatedData.loyalty_points || 0,
  }


  if (data.password) {
    updatePayload.password = await bcrypt.hash(data.password, 10)
  }

  if (id) {
    await prisma.client.update({
      where: { id, salon_id: salonId },
      data: updatePayload
    })
    await logAction({ action: "update_client", entity: "client", entityId: id, salonId })
  } else {
    // Validar limite de clientes
    const salon = await (prisma as any).salon.findUnique({ where: { id: salonId }, select: { plan: true, status: true } })
    const plan = salon?.plan || "free"
    const status = salon?.status || "active"
    
    const currentCount = await prisma.client.count({ where: { salon_id: salonId } })
    if (!isWithinLimit(plan, "clients", currentCount, dynamicPlans, status)) {
       const limit = getPlanLimits(plan, dynamicPlans, status).clients
       throw new Error(`Limite de clientes atingido para o plano ${plan}. Máximo permitido: ${limit}`)
    }

    const client = await prisma.client.create({
      data: {
        ...updatePayload,
        salon_id: salonId
      }
    })
    await logAction({ action: "create_client", entity: "client", entityId: client.id, salonId })
  }
  revalidatePath("/dashboard/clientes")
}

export async function deleteClient(id: string) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")
  await prisma.client.delete({ where: { id, salon_id: salonId } })
  await logAction({ action: "delete_client", entity: "client", entityId: id, salonId })
  revalidatePath("/dashboard/clientes")
}

// --- SERVICES ---
export async function getServices() {
  const salonId = await getSalonId()
  if (!salonId) return []

  const salon = await prisma.salon.findUnique({ where: { id: salonId }, select: { plan: true, status: true } })
  const plan = salon?.plan || "free"
  const status = salon?.status || "active"
  
  const config = await getGlobalConfigCache()
  const dynamicPlans = config?.landing_page ? JSON.parse(config.landing_page).plans : null
  const limits = getPlanLimits(plan, dynamicPlans, status)

  const services = await prisma.service.findMany({
    where: { salon_id: salonId },
    orderBy: { display_order: "asc" },
    include: {
      staff: {
        include: {
          staff: { select: { id: true, name: true, color: true } }
        }
      }
    }
  })

  // Retornamos um objeto 100% limpo de instâncias complexas (Decimal, Date, etc)
  return services.map((service: any, index: number) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    duration_minutes: service.duration_minutes,
    price: Number(service.price),
    category: service.category,
    is_active: service.is_active,
    is_plan_blocked: limits.services !== -1 && index >= (limits.services || 3),
    staffAssignments: (service.staff || []).map((ss: any) => ({
      staffId: ss.staff_id,
      name: ss.staff.name,
      color: ss.staff.color,
      commission: ss.commission_value !== null ? Number(ss.commission_value) : null
    }))
  }))
}

export async function upsertService(id: string | null, data: any) {
  const validatedFields = serviceSchema.safeParse(data)
  if (!validatedFields.success) {
    const errorMsg = validatedFields.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw new Error("Dados inválidos: " + errorMsg)
  }
  const validatedData = validatedFields.data

  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")


  const salon = await (prisma as any).salon.findUnique({
     where: { id: salonId },
     select: { id: true, plan: true, status: true }
  })
  const plan = salon?.plan || "free"

  const config = await getGlobalConfigCache()
  const dynamicPlans = config?.landing_page ? JSON.parse(config.landing_page).plans : null

  const serviceData = {
    name: validatedData.name,
    description: validatedData.description || null,
    price: validatedData.price,
    duration_minutes: validatedData.duration_minutes,
    category: validatedData.category || "Geral",
    is_active: validatedData.is_active ?? true,
    image_url: validatedData.image_url || null,
    salon_id: salonId

  }


  let serviceId = id

  if (id) {
    await prisma.service.update({
      where: { id, salon_id: salonId },
      data: serviceData
    })
    await logAction({ action: "update_service", entity: "service", entityId: id, salonId })
  } else {
    const currentCount = await prisma.service.count({ where: { salon_id: salonId } })
    const status = salon?.status || "active"
    if (!isWithinLimit(plan, "services", currentCount, dynamicPlans, status)) {
      const limit = getPlanLimits(plan, dynamicPlans, status).services
      throw new Error(`Limite de serviços atingido para o plano ${plan}. Máximo permitido: ${limit}`)
    }

    const service = await prisma.service.create({ data: serviceData })
    serviceId = service.id
    await logAction({ action: "create_service", entity: "service", entityId: service.id, salonId })
  }

  // --- Upsert StaffService assignments ---
  if (data.staffAssignments !== undefined && serviceId) {
    // Remove all existing assignments for this service, then re-create
    await (prisma as any).staffService.deleteMany({ where: { service_id: serviceId } })

    if (data.staffAssignments.length > 0) {
      await (prisma as any).staffService.createMany({
        data: data.staffAssignments.map((a: any) => ({
          staff_id: a.staffId,
          service_id: serviceId,
          commission_value: a.commission !== null && a.commission !== undefined && a.commission !== "" 
            ? parseFloat(a.commission) 
            : null
        }))
      })
    }
  }

  revalidatePath("/dashboard/servicos")
}

export async function deleteService(id: string) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")
  await prisma.service.delete({ where: { id, salon_id: salonId } })
  await logAction({ action: "delete_service", entity: "service", entityId: id, salonId })
  revalidatePath("/dashboard/servicos")
}

// --- PRODUCTS ---
export async function getProducts() {
  const salonId = await getSalonId()
  if (!salonId) return []
  const products = await prisma.product.findMany({
    where: { salon_id: salonId },
    orderBy: { created_at: "desc" }
  })
  return products.map((product: any) => ({
    ...product,
    price: Number(product.price)
  }))
}

export async function upsertProduct(id: string | null, data: any) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")

  const productData = {
    name: data.name,
    description: data.description || null,
    price: data.price,
    stock_quantity: parseInt(data.stock_quantity) || 0,
    category: data.category || "Geral",
    is_active: data.is_active ?? true,
    salon_id: salonId
  }

  if (id) {
    await prisma.product.update({
      where: { id, salon_id: salonId },
      data: productData
    })
    await logAction({ action: "update_product", entity: "product", entityId: id, salonId })
  } else {
    const product = await prisma.product.create({
      data: productData
    })
    await logAction({ action: "create_product", entity: "product", entityId: product.id, salonId })
  }
  revalidatePath("/dashboard/servicos")
}

export async function deleteProduct(id: string) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")
  await prisma.product.delete({ where: { id, salon_id: salonId } })
  await logAction({ action: "delete_product", entity: "product", entityId: id, salonId })
  revalidatePath("/dashboard/servicos")
}

// --- STAFF ---
export async function getStaff() {
  const salonId = await getSalonId()
  if (!salonId) return []

  const salon = await prisma.salon.findUnique({ where: { id: salonId }, select: { plan: true, status: true } })
  const plan = salon?.plan || "free"
  const status = salon?.status || "active"
  
  const config = await getGlobalConfigCache()
  const dynamicPlans = config?.landing_page ? JSON.parse(config.landing_page).plans : null
  const limits = getPlanLimits(plan, dynamicPlans, status)

  const staff = await prisma.staff.findMany({
    where: { salon_id: salonId },
    orderBy: { created_at: "asc" }
  })

  return staff.map((member: any, index: number) => {
    let parsedHours = member.working_hours
    if (typeof parsedHours === "string" && parsedHours.length > 0) {
      try {
        parsedHours = JSON.parse(parsedHours)
        if (parsedHours && typeof parsedHours === "object" && parsedHours["0"]) {
          const validKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
          const cleaned: any = {}
          validKeys.forEach(k => { if (parsedHours[k]) cleaned[k] = parsedHours[k] })
          parsedHours = cleaned
        }
      } catch (e) {
        parsedHours = {}
      }
    }
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      avatar_url: member.avatar_url,
      color: member.color,
      is_active: member.is_active,
      working_hours: parsedHours,
      is_plan_blocked: limits.staff !== -1 && index >= (limits.staff || 1)
    }
  })
}

export async function upsertStaff(id: string | null, data: any) {
  const validatedFields = staffSchema.safeParse(data)
  if (!validatedFields.success) {
    const errorMsg = validatedFields.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw new Error("Dados inválidos: " + errorMsg)
  }
  const validatedData = validatedFields.data

  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")


  const salon = await (prisma as any).salon.findUnique({
     where: { id: salonId },
     select: { id: true, plan: true, status: true }
  })
  const plan = salon?.plan || "free"

  const config = await getGlobalConfigCache()
  const dynamicPlans = config?.landing_page ? JSON.parse(config.landing_page).plans : null

  // --- CONTROLO DE PERMISSÕES ---
  const session = await auth()
  const dbUser = await prisma.user.findFirst({
    where: { 
      OR: [
        { id: session?.user?.id || "" },
        { email: session?.user?.email as string || "" }
      ]
    },
    select: { role: true, email: true }
  })
  
  let loggedInRole = dbUser?.role || "professional"


  if (!id) {
    const status = salon?.status || "active"
    const currentCount = await prisma.staff.count({ where: { salon_id: salonId } })
    if (!isWithinLimit(plan, "staff", currentCount, dynamicPlans, status)) {
       const limit = getPlanLimits(plan, dynamicPlans, status).staff
       throw new Error(`Limite de profissionais atingido para o plano ${plan}. Máximo permitido: ${limit}`)
    }
  }

  let userId = data.user_id || null

  // Se tem email e password, tratamos da conta de utilizador para login
  if (data.email && data.password) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    if (userId) {
       // SEGURANÇA: Verificar se este User pertence realmente a um Staff deste salão antes de atualizar
       const staffCheck = await prisma.staff.findFirst({
         where: { user_id: userId, salon_id: salonId }
       })

       if (staffCheck) {
          await prisma.user.update({
             where: { id: userId },
             data: { name: data.name, email: data.email, password: hashedPassword }
          })
       } else {
          console.warn(`Tentativa de atualizar utilizador ${userId} que não pertence ao salão ${salonId}`)
          // Impedimos a atualização de utilizadores "alheios"
          userId = null 
       }
    }
    
    if (!userId) {
       // Verifica se já existe um user com este email (contexto global ou deste salão)
       const existingUser = await prisma.user.findFirst({ where: { email: data.email } })
       if (existingUser) {
           // Se já existe, só vinculamos se ele já for deste salão (prevenir roubo de contas)
           const isFromSalon = await prisma.staff.findFirst({ where: { user_id: existingUser.id, salon_id: salonId } })
           if (isFromSalon) {
              userId = existingUser.id
              if (existingUser.role !== "owner") {
                 await prisma.user.update({ where: { id: userId }, data: { role: data.role || "professional" } })
              }
           } else {
              // Se já existe um usuário, mas não está neste salão, vamos verificar se ele é staff em OUTRO lugar
              const isStaffElsewhere = await prisma.staff.findFirst({ where: { user_id: existingUser.id } })
              
              if (isStaffElsewhere) {
                 throw new Error("Este profissional já está registado num outro salão no sistema AgendarPro.")
              }
              
              // Se não é staff em lugar nenhum (ex: era apenas cliente), podemos vinculá-lo como staff deste salão!
              userId = existingUser.id
              if (existingUser.role !== "owner") {
                 await prisma.user.update({ where: { id: userId }, data: { role: data.role || "professional" } })
              }
           }
        } else {
          const newUser = await prisma.user.create({
            data: {
              name: data.name,
              email: data.email,
              password: hashedPassword,
              role: data.role, // Use the role from the form
              salon_id: salonId // VINCULAR AO SALÃO (Multi-Tenancy)
            }
          })
          userId = newUser.id
       }
    }
  }

  const staffData: any = {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    role: data.role || "professional",
    bio: data.bio || null,
    color: data.color || "#0D9488",
    working_hours: data.working_hours && typeof data.working_hours === "object" 
      ? JSON.stringify(data.working_hours) 
      : data.working_hours,
    is_active: data.is_active ?? true,
    salon_id: salonId,
    user_id: userId
  }

  if (id) {
    const member = await prisma.staff.update({
      where: { id, salon_id: salonId },
      data: staffData
    })
    await logAction({ action: "update_staff", entity: "staff", entityId: id, salonId })
  } else {
    const member = await prisma.staff.create({
      data: staffData
    })
    await logAction({ action: "create_staff", entity: "staff", entityId: member.id, salonId })
  }
  revalidatePath("/dashboard/equipa")
}

export async function deleteStaff(id: string) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")
  await prisma.staff.delete({ where: { id, salon_id: salonId } })
  await logAction({ action: "delete_staff", entity: "staff", entityId: id, salonId })
  revalidatePath("/dashboard/equipa")
}

// --- SALON SETTINGS ---
export async function getSalon() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
       console.log("getSalon: No session found")
       return null
    }



    const salonId = await getSalonId()
    if (!salonId) {
       console.log("getSalon: No salonId found for session user")
       return null
    }

    const [salon, config] = await Promise.all([
      prisma.salon.findUnique({
        where: { id: salonId }
      }),
      getGlobalConfigCache().catch((e: any) => {
         console.error("Erro ao buscar global_configs:", e.message)
         return null
      })
    ])
    
    if (!salon) {
       console.log("getSalon: No salon found for user", session.user.id)
       return null
    }

    // Processar salon data com segurança
    const salonData = { ...salon }
    if (salonData.working_hours && typeof salonData.working_hours === "string") {
      try { (salonData as any).working_hours = JSON.parse(salonData.working_hours) } catch(e) {
         console.error("Erro parse working_hours:", e)
      }
    }
    if (salonData.settings && typeof salonData.settings === "string") {
      try { (salonData as any).settings = JSON.parse(salonData.settings) } catch(e) {
         console.error("Erro parse settings:", e)
      }
    }

    // Processar dynamic plans
    let dynamicPlans = null
    if ((config as any)?.[0]?.landing_page) {
       try {
          const lp = JSON.parse((config as any)[0].landing_page)
          dynamicPlans = lp.plans || null
       } catch(e) {
          console.error("Erro parse landing_page config:", e)
       }
    }

    return JSON.parse(JSON.stringify({
       ...salonData,
       dynamicPlans
    }))
  } catch (error: any) {
    console.error("ERRO CRÍTICO EM getSalon:", error.message || error)
    return null
  }
}


export async function updateSalonSettings(data: any) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")

  const salonCheck = await prisma.salon.findUnique({
    where: { id: salonId },
    select: { plan: true, status: true }
  })
  const plan = salonCheck?.plan || "free"
  const status = salonCheck?.status || "active"

  const updateData: any = {
    name: data.name,
    description: data.description || null,
    address: data.address || null,
    phone: data.phone || null,
    email: data.email || null,
    working_hours: data.working_hours && typeof data.working_hours === "object" 
      ? JSON.stringify(data.working_hours) 
      : data.working_hours,
    settings: data.settings && typeof data.settings === "object" 
      ? JSON.stringify(data.settings) 
      : data.settings,
    locale: data.locale,
    timezone: data.timezone,
  }

  // Só permite atualizar logo e cover se o plano permitir
  if (isFeatureAllowed(plan, "logo", null, status)) {
    updateData.logo_url = data.logo_url || null
  }
  if (isFeatureAllowed(plan, "cover", null, status)) {
    updateData.cover_url = data.cover_url || null
  }

  const salon = await prisma.salon.update({
    where: { id: salonId },
    data: updateData,
    select: { slug: true }
  })
  
  await logAction({ action: "update_salon_settings", entity: "salon", entityId: salonId, salonId })
  
  revalidatePath("/dashboard/configuracoes")
  revalidatePath(`/reservar/${salon.slug}`)
}

export async function getUserRole() {
  const session = await auth()
  if (!session?.user?.id) return { role: "professional", name: "", image: null, status: "active", plan: "free", trialEndsAt: null }
  
  try {
     // Buscar papel (role), nome e imagem diretamente na BD por ID ou Email
     const user = await prisma.user.findFirst({
       where: { 
         OR: [
           { id: session.user.id },
           { email: session.user.email as string }
         ]
       },
       select: { role: true, name: true, image: true, email: true }
     })

     console.log("DEBUG: User in DB:", user?.email, "Role:", user?.role)

     const salonId = await getSalonId()
     let status = "active"
     let plan = "free"
     let trialEndsAt = null
     let salonSlug = ""
     
     if (salonId) {
        const salon = await (prisma as any).salon.findUnique({
           where: { id: salonId },
           select: { status: true, plan: true, trial_ends_at: true, slug: true }
        })
        
        status = salon?.status || "active"
        plan = salon?.plan || "free"
        trialEndsAt = salon?.trial_ends_at
        salonSlug = (salon as any)?.slug || ""

        // VERIFICAÇÃO DE EXPIRAÇÃO DE TRIAL (AUTO-DOWNGRADE)
        if (status === 'trial' && trialEndsAt && isAfter(new Date(), new Date(trialEndsAt))) {
           console.log(`Trial expirado para salon ${salonId}. Realizando auto-downgrade para FREE...`)
           
           // Realizar downgrade via Raw SQL para saltar lógicas de Prisma Client se necessário
           await (prisma as any).$executeRawUnsafe(
              `UPDATE salons SET plan = 'free', status = 'active' WHERE id = $1`,
              salonId
           )
           
           status = "active"
           plan = "free"
        }

        // Regra de Ouro da NAPP: Trial = Premium (se não expirou)
        if (status === 'trial') {
           plan = 'premium'
        }
     }

     const result = { 
       role: user?.role || "professional", 
       name: user?.name || session.user.name || "",
       image: user?.image || session.user.image || null,
       status: status,
       plan: plan,
       trialEndsAt: trialEndsAt,
       salonSlug: salonSlug
     }


     
     return result
  } catch (err) {
     console.error("DEBUG: Error in getUserRole:", err)
     return { role: "professional", name: session.user.name || "", image: session.user.image || null, status: "active", plan: "free", trialEndsAt: null }
  }
}

export async function getStaffStats(startDate?: Date, endDate?: Date) {
  const session = await auth()
  if (!session?.user?.id) return null

  const staff = await prisma.staff.findFirst({
    where: { user_id: session.user.id },
    select: { id: true }
  })

  if (!staff) return null

  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const filterStart = startDate || defaultStart
  const filterEnd = endDate || defaultEnd

  const appointments = await prisma.appointment.findMany({
    where: {
      staff_id: staff.id,
      status: "completed",
      starts_at: { gte: filterStart, lte: filterEnd }
    },
    include: {
      service: { select: { id: true, name: true } },
      client: { select: { name: true } }
    },
    orderBy: { starts_at: "desc" }
  })

  // Buscar comissões por serviço deste profissional
  const staffServices = await (prisma as any).staffService.findMany({
    where: { staff_id: staff.id },
    select: { service_id: true, commission_value: true }
  })
  const commissionMap = new Map<string, number>()
  staffServices.forEach((ss: any) => {
    commissionMap.set(ss.service_id, ss.commission_value !== null ? Number(ss.commission_value) : 0)
  })

  const totalRevenue = appointments.reduce((sum: number, apt: any) => sum + Number(apt.price), 0)
  const totalCommission = appointments.reduce((sum: number, apt: any) => {
    return sum + (commissionMap.get(apt.service_id) ?? 0)
  }, 0)
  const appointmentCount = appointments.length

  return {
    totalRevenue,
    totalCommission,
    appointmentCount,
    appointments: JSON.parse(JSON.stringify(appointments)).map((apt: any) => ({
      ...apt,
      commission: commissionMap.get(apt.service_id) ?? 0
    }))
  }
}

export async function getReportStats(startDate?: Date, endDate?: Date) {
  const salonId = await getSalonId()
  if (!salonId) return null

  const salon = await prisma.salon.findFirst({
    where: { id: salonId },
    select: { name: true }
  })

  if (!salon) return null

  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const filterStart = startDate || defaultStart
  const filterEnd = endDate || defaultEnd
  
  const [completedAppointments, dailyProjection] = await Promise.all([
    prisma.appointment.findMany({
      where: { 
        salon_id: salonId, 
        status: "completed",
        starts_at: { gte: filterStart, lte: filterEnd }
       },
      include: { 
        service: true,
        client: { select: { name: true } }
      }
    }),
    prisma.appointment.findMany({
      where: {
        salon_id: salonId,
        starts_at: {
          gte: new Date(new Date().setHours(0,0,0,0)),
          lte: new Date(new Date().setHours(23,59,59,999))
        },
        status: { not: "cancelled" }
      }
    })
  ])

  const totalRevenue = completedAppointments.reduce((acc, apt) => acc + Number(apt.price), 0)
  
  // Serviços mais vendidos
  const serviceStats = new Map()
  completedAppointments.forEach((apt: any) => {
    const serviceName = apt.service?.name || "Outros"
    const current = serviceStats.get(serviceName) || { name: serviceName, count: 0, revenue: 0 }
    current.count++
    current.revenue += Number(apt.price)
    serviceStats.set(serviceName, current)
  })

  const topServices = Array.from(serviceStats.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Calcular comissões por staff usando commission_value por serviço (da tabela StaffService)
  const staffCommStats = new Map()
  
  const allStaff = await prisma.staff.findMany({
    where: { salon_id: salonId },
    select: { id: true, name: true }
  })

  // Buscar todos os valores de comissão por (staff, serviço) para este salão
  const staffServices = await (prisma as any).staffService.findMany({
    where: {
      staff: { salon_id: salonId }
    },
    select: { staff_id: true, service_id: true, commission_value: true }
  })
  // Mapa: "staffId:serviceId" → commission_value
  const commissionMap = new Map<string, number>()
  staffServices.forEach((ss: any) => {
    commissionMap.set(`${ss.staff_id}:${ss.service_id}`, ss.commission_value !== null ? Number(ss.commission_value) : 0)
  })
  
  allStaff.forEach(s => {
    staffCommStats.set(s.id, { 
      id: s.id,
      name: s.name, 
      revenue: 0, 
      commission: 0,
      appointments: []
    })
  })

  completedAppointments.forEach((apt: any) => {
    const s = staffCommStats.get(apt.staff_id)
    if (s) {
      const aptCommission = commissionMap.get(`${apt.staff_id}:${apt.service_id}`) ?? 0
      s.revenue += Number(apt.price)
      s.commission += aptCommission
      s.appointments.push({
        id: apt.id,
        date: apt.starts_at,
        client: apt.client?.name || "Cliente Final",
        service: apt.service?.name || "Serviço",
        price: Number(apt.price),
        commission: aptCommission
      })
    }
  })

  return {
    totalRevenue,
    totalCompleted: completedAppointments.length,
    ticketMedio: completedAppointments.length > 0 
      ? (totalRevenue / completedAppointments.length).toFixed(2) 
      : 0,
    dailyProjection: dailyProjection.reduce((acc, apt) => acc + Number(apt.price), 0),
    topServices,
    staffCommissions: Array.from(staffCommStats.values()).sort((a, b) => b.commission - a.commission),
    salonName: salon.name
  }
}

export async function getSupportConfig() {
  try {
    const session = await auth()
    if (!session) return {}
    
    const config = await getGlobalConfigCache()
    
    if (!config?.support_config) return {}
    try {
      return JSON.parse(config.support_config)
    } catch(e) {
      return {}
    }
  } catch (err) {
    return {}
  }
}

export async function createSupportTicket(data: any) {
  const validatedFields = supportTicketSchema.safeParse(data)
  if (!validatedFields.success) {
    const errorMsg = validatedFields.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
    throw new Error("Dados inválidos: " + errorMsg)
  }
  const validatedData = validatedFields.data

  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")

  await prisma.supportTicket.create({
    data: {
      salon_id: salonId,
      subject: validatedData.subject,
      message: validatedData.message,
      priority: validatedData.priority
    }
  })


  await logAction({ action: "create_support_ticket", entity: "support_ticket", entityId: "new", salonId })
}

export async function getSupportTickets() {
  const salonId = await getSalonId()
  if (!salonId) return []

  return await prisma.supportTicket.findMany({
    where: { salon_id: salonId },
    orderBy: { created_at: "desc" }
  })
}
