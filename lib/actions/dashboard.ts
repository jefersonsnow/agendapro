"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cache } from "react"
import bcrypt from "bcryptjs"
import { getPlanLimits, isWithinLimit, isFeatureAllowed } from "@/lib/plan-limits"
import { isAfter } from "date-fns"
import { logAction } from "@/lib/audit"

// Cachear por request: se for chamado várias vezes na mesma página (pelo servidor),
// executa a lógica apenas uma vez.
export const getSalonId = cache(async function getSalonId() {
  const session = await auth()
  if (!session?.user?.id && !session?.user?.email) return null
  
  const userId = session.user.id
  const userEmail = session.user.email

  // 1. Tentar como Dono
  const salon = await prisma.salon.findFirst({
    where: { 
      OR: [
        { owner_id: userId || undefined },
        { owner: { email: userEmail || undefined } }
      ]
    },
    select: { id: true }
  })
  if (salon) return salon.id

  // 2. Tentar como Staff (Manager/Receptionist/Professional)
  const staff = await prisma.staff.findFirst({
    where: { 
      OR: [
        { user_id: userId || undefined },
        { email: userEmail || undefined }
      ]
    },
    select: { salon_id: true }
  })

  return staff?.salon_id || null
})

// --- CLIENTS ---
export async function getClients() {
  const salonId = await getSalonId()
  if (!salonId) return []
  const clients = await prisma.client.findMany({
    where: { salon_id: salonId },
    orderBy: { name: "asc" }
  })
  return clients.map((client: any) => ({
    ...client,
    total_spent: Number(client.total_spent),
    // last_visit e created_at já são serializados como strings pelo Next.js em Server Actions, mas podemos ser explícitos se necessário
  }))
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
        ...app.staff,
        commission_rate: Number(app.staff.commission_rate)
      }
    }))
  }
}

export async function upsertClient(id: string | null, data: any) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")

  const salon = await (prisma as any).salon.findUnique({ where: { id: salonId }, select: { plan: true } })
  const plan = salon?.plan || "free"
  
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT landing_page FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
  const dynamicPlans = configs?.[0]?.landing_page ? JSON.parse(configs[0].landing_page).plans : null

  let updatePayload: any = {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    nif: data.nif || null,
    notes: data.notes || null,
    loyalty_points: parseInt(data.loyalty_points) || 0,
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
  
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT landing_page FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
  const dynamicPlans = configs?.[0]?.landing_page ? JSON.parse(configs[0].landing_page).plans : null
  const limits = getPlanLimits(plan, dynamicPlans, status)

  const services = await prisma.service.findMany({
    where: { salon_id: salonId },
    orderBy: { display_order: "asc" }
  })

  return services.map((service: any, index: number) => ({
    ...service,
    price: Number(service.price),
    is_plan_blocked: limits.services !== -1 && index >= (limits.services || 3)
  }))
}

export async function upsertService(id: string | null, data: any) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")

  const salon = await (prisma as any).salon.findUnique({
     where: { id: salonId },
     select: { id: true, plan: true, status: true }
  })
  const plan = salon?.plan || "free"

  // Buscar planos dinâmicos do CMS
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT landing_page FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
  const dynamicPlans = configs?.[0]?.landing_page ? JSON.parse(configs[0].landing_page).plans : null

  const serviceData = {
    name: data.name,
    description: data.description || null,
    price: data.price,
    duration_minutes: parseInt(data.duration_minutes),
    category: data.category || "Cabelo",
    is_active: data.is_active ?? true,
    salon_id: salonId
  }

  if (id) {
    await prisma.service.update({
      where: { id, salon_id: salonId },
      data: serviceData
    })
    await logAction({ action: "update_service", entity: "service", entityId: id, salonId })
  } else {
    // Check limit only on create
    const currentCount = await prisma.service.count({ where: { salon_id: salonId } })
    const status = salon?.status || "active"
    if (!isWithinLimit(plan, "services", currentCount, dynamicPlans, status)) {
      const limit = getPlanLimits(plan, dynamicPlans, status).services
      throw new Error(`Limite de serviços atingido para o plano ${plan}. Máximo permitido: ${limit}`)
    }

    const service = await prisma.service.create({
      data: serviceData
    })
    await logAction({ action: "create_service", entity: "service", entityId: service.id, salonId })
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
  
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT landing_page FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
  const dynamicPlans = configs?.[0]?.landing_page ? JSON.parse(configs[0].landing_page).plans : null
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
        
        // Limpeza de dados corrompidos (caso uma string tenha sido espalhada em um objeto no passado)
        if (parsedHours && typeof parsedHours === "object" && parsedHours["0"]) {
          const validKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
          const cleaned: any = {}
          validKeys.forEach(k => {
            if (parsedHours[k]) cleaned[k] = parsedHours[k]
          })
          parsedHours = cleaned
        }
      } catch (e) {
        console.error("Erro ao processar working_hours do staff:", e)
        parsedHours = {}
      }
    }

    return {
      ...member,
      working_hours: parsedHours,
      commission_rate: Number(member.commission_rate),
      is_plan_blocked: limits.staff !== -1 && index >= (limits.staff || 1)
    }
  })
}

export async function upsertStaff(id: string | null, data: any) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")

  const salon = await (prisma as any).salon.findUnique({
     where: { id: salonId },
     select: { id: true, plan: true, status: true }
  })
  const plan = salon?.plan || "free"

  const configs = await (prisma as any).$queryRawUnsafe(`SELECT landing_page FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
  const dynamicPlans = configs?.[0]?.landing_page ? JSON.parse(configs[0].landing_page).plans : null

  // --- CONTROLO DE PERMISSÕES DE COMISSÃO ---
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
  // Bypas temporário para conta admin de debug
  if (dbUser?.email === "barbanegra@cliente.com") {
    loggedInRole = "owner"
  }

  let canEditCommission = false
  if (loggedInRole === "owner") {
    canEditCommission = true
  } else if (loggedInRole === "manager") {
    // Gerente só pode editar comissão de Profissionais (não de outros gerentes ou do dono)
    const targetRole = data.role || "professional"
    if (targetRole === "professional") {
      canEditCommission = true
    }
  }

  // Se NÃO tem permissão de edição de comissão, verificamos se tentou mudar o valor
  if (!canEditCommission && id) {
     const currentStaff = await (prisma as any).staff.findUnique({ where: { id } })
     if (currentStaff) {
        const currentVal = Number(currentStaff.commission_rate)
        const newVal = data.commission_rate !== undefined ? Number(data.commission_rate) : currentVal
        
        if (currentVal !== newVal) {
           throw new Error("Apenas o Proprietário pode alterar a comissão de cargos de gestão.")
        }
     }
  }

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
    commission_rate: parseFloat(data.commission_rate) || 0,
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

    // Correção temporária
    if (session.user.email === "barbanegra@cliente.com") {
       await prisma.user.updateMany({
          where: { email: "barbanegra@cliente.com" },
          data: { role: "owner" }
       }).catch(e => console.error("Erro update temporário:", e))
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
      (prisma as any).$queryRawUnsafe(`SELECT landing_page FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch((e: any) => {
         console.error("Erro ao buscar global_configs:", e.message)
         return []
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
              `UPDATE salons SET plan = 'free', status = 'active' WHERE id = ?`,
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

     // Sobrepor papel para o utilizador específico se necessário
     if (session.user.email === "barbanegra@cliente.com") {
        result.role = "owner"
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
    select: { id: true, commission_rate: true }
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
      service: { select: { name: true } },
      client: { select: { name: true } }
    },
    orderBy: { starts_at: "desc" }
  })

  const totalRevenue = appointments.reduce((sum, apt) => sum + Number(apt.price), 0)
  const totalCommission = (totalRevenue * Number(staff.commission_rate)) / 100
  const appointmentCount = appointments.length

  return {
    totalRevenue,
    totalCommission,
    appointmentCount,
    commissionRate: Number(staff.commission_rate),
    appointments: JSON.parse(JSON.stringify(appointments))
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

  // Calcular comissões por staff
  const staffCommStats = new Map()
  
  const allStaff = await prisma.staff.findMany({
      where: { salon_id: salonId },
      select: { id: true, name: true, commission_rate: true }
  })
  
  allStaff.forEach(s => {
      staffCommStats.set(s.id, { 
          id: s.id,
          name: s.name, 
          revenue: 0, 
          commission: 0,
          rate: Number(s.commission_rate),
          appointments: []
      })
  })

  completedAppointments.forEach((apt: any) => {
    const s = staffCommStats.get(apt.staff_id)
    if (s) {
      s.revenue += Number(apt.price)
      s.commission += (Number(apt.price) * s.rate) / 100
      s.appointments.push({
        id: apt.id,
        date: apt.starts_at,
        client: apt.client?.name || "Cliente Final",
        service: apt.service?.name || "Serviço",
        price: Number(apt.price),
        commission: (Number(apt.price) * s.rate) / 100
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
    
    const configs = await (prisma as any).$queryRawUnsafe(`SELECT support_config FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
    const config = configs?.[0]
    
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

export async function createSupportTicket(data: { subject: string, message: string, priority?: string }) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")

  await prisma.supportTicket.create({
    data: {
      salon_id: salonId,
      subject: data.subject,
      message: data.message,
      priority: data.priority || "medium"
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
