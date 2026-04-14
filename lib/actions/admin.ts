"use server"

import { auth, signIn as authSignIn } from "@/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

async function checkAdmin() {
  const session = await auth()
  console.log("Admin Check Session:", session?.user?.email, "Role:", session?.user?.role)
  if (session?.user?.role !== "admin") {
    throw new Error("Não autorizado. Apenas administradores podem realizar esta ação.")
  }
}

export async function createSalonWithOwner(data: any) {
  await checkAdmin()

  const { name, email, password, salonName, slug } = data

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new Error("Este utilizador (email) já existe no sistema.")
  }

  // Check if slug already exists
  const existingSalon = await prisma.salon.findUnique({ where: { slug } })
  if (existingSalon) {
    throw new Error("Este link (slug) já está a ser utilizado por outro salão.")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await prisma.$transaction(async (tx: any) => {
    // 1. Create User
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "owner"
      }
    })

    // 2. Create Salon
    const salon = await tx.salon.create({
      data: {
        name: salonName,
        slug,
        owner_id: user.id,
      }
    })

    return { user, salon }
  })
  
  revalidatePath("/admin")
  revalidatePath("/admin/salons")
  
  return result
}

export async function getAllSalons() {
  await checkAdmin()
  
  // Use Raw SQL to ensure we get the latest 'plan' and 'status' fields
  const salons: any[] = await (prisma as any).$queryRawUnsafe(`
    SELECT s.*, u.name as owner_name, u.email as owner_email,
    (SELECT COUNT(*) FROM appointments WHERE salon_id = s.id) as app_count,
    (SELECT COUNT(*) FROM clients WHERE salon_id = s.id) as cli_count,
    (SELECT SUM(price) FROM appointments WHERE salon_id = s.id AND status = 'completed') as revenue
    FROM salons s
    JOIN users u ON s.owner_id = u.id
    ORDER BY s.created_at DESC
  `)

  const result = salons.map(({ app_count, cli_count, revenue, owner_name, owner_email, ...s }) => ({
    ...s,
    owner: { 
      id: s.owner_id, // Garantir que o ID do dono está aqui!
      name: owner_name, 
      email: owner_email 
    },
    _count: { appointments: Number(app_count), clients: Number(cli_count) },
    total_revenue: Number(revenue || 0),
    plan: s.plan || "free",
    status: s.status || "active"
  }))

  return JSON.parse(JSON.stringify(result))
}
export async function getAllUsers() {
  await checkAdmin()
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["admin", "owner"] }
    },
    include: {
      _count: {
        select: {
          ownedSalons: true
        }
      }
    },
    orderBy: { created_at: "desc" }
  })
  return JSON.parse(JSON.stringify(users))
}

export async function upsertUser(id: string | null, data: any) {
  await checkAdmin()
  
  const userData: any = {
    name: data.name,
    email: data.email,
    role: data.role,
  }

  if (data.password) {
    userData.password = await bcrypt.hash(data.password, 10)
  }

  if (id) {
    await prisma.user.update({
      where: { id },
      data: userData
    })
  } else {
    await prisma.user.create({
      data: userData
    })
  }

  revalidatePath("/admin/users")
}

export async function deleteUser(id: string) {
  await checkAdmin()
  const session = await auth()
  if (session?.user?.id === id) {
     throw new Error("Não pode eliminar a sua própria conta.")
  }
  await prisma.user.delete({ where: { id } })
  revalidatePath("/admin/users")
}

export async function deleteSalon(id: string) {
  await checkAdmin()
  // This will cascade delete if schema setup correctly, but let's be safe
  await prisma.salon.delete({ where: { id } })
  revalidatePath("/admin")
  revalidatePath("/admin/salons")
}

export async function updateSalonSaaS(id: string, data: any) {
  await checkAdmin()
  
  await prisma.salon.update({
    where: { id },
    data: {
      plan: data.plan,
      status: data.status
    }
  })

  revalidatePath("/admin")
  revalidatePath("/admin/salons")
}

export async function createAnnouncement(data: { title: string, content: string, type: string }) {
  await checkAdmin()
  
  await (prisma as any).announcement.create({
    data: {
      title: data.title,
      content: data.content,
      type: data.type,
      is_active: true
    }
  })
  
  revalidatePath("/admin")
  revalidatePath("/dashboard")
}

export async function getAnnouncements() {
  await checkAdmin()
  try {
    return await (prisma as any).$queryRawUnsafe(`SELECT * FROM announcements ORDER BY created_at DESC`)
  } catch (err) {
    return []
  }
}

export async function toggleAnnouncement(id: string, is_active: boolean) {
  await checkAdmin()
  await (prisma as any).announcement.update({
    where: { id },
    data: { 
      is_active,
      updated_at: new Date()
    }
  })
  revalidatePath("/admin")
  revalidatePath("/dashboard")
}

export async function getActiveAnnouncements() {
  try {
    return await (prisma as any).$queryRawUnsafe(`SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC`)
  } catch (err) {
    return []
  }
}

export async function getGlobalConfig() {
  await checkAdmin()
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT * FROM global_configs WHERE id = 'singleton' LIMIT 1`)
  let config = configs?.[0]
  
  if (!config) {
    await (prisma as any).$executeRawUnsafe(
      `INSERT INTO global_configs (id, landing_page, kiwify_configs, stripe_configs, support_config, promotion_config, updated_at) VALUES ('singleton', '{}', '{}', '{}', '{}', '{}', NOW())`
    )
    const newConfigs = await (prisma as any).$queryRawUnsafe(`SELECT * FROM global_configs WHERE id = 'singleton' LIMIT 1`)
    config = newConfigs?.[0]
  }
  return JSON.parse(JSON.stringify(config))
}

export async function updateGlobalConfig(data: { landing_page?: any, kiwify_configs?: any, stripe_configs?: any, support_config?: any, promotion_config?: any, seo_config?: any }) {
  await checkAdmin()
  
  const updateData: any = {
    updated_at: new Date()
  }
  if (data.landing_page) updateData.landing_page = JSON.stringify(data.landing_page)
  if (data.kiwify_configs) updateData.kiwify_configs = JSON.stringify(data.kiwify_configs)
  if (data.stripe_configs) updateData.stripe_configs = JSON.stringify(data.stripe_configs)
  if (data.support_config) updateData.support_config = JSON.stringify(data.support_config)
  if (data.promotion_config) updateData.promotion_config = JSON.stringify(data.promotion_config)
  if (data.seo_config) updateData.seo_config = JSON.stringify(data.seo_config)

  await (prisma as any).globalConfig.upsert({
    where: { id: 'singleton' },
    update: updateData,
    create: {
      id: 'singleton',
      ...updateData,
      landing_page: updateData.landing_page || '{}',
      kiwify_configs: updateData.kiwify_configs || '{}',
      stripe_configs: updateData.stripe_configs || '{}',
      support_config: updateData.support_config || '{}',
      promotion_config: updateData.promotion_config || '{}',
      seo_config: updateData.seo_config || '{}'
    }
  })

  revalidatePath("/admin/system")
  revalidatePath("/")
}


export async function impersonateUser(userId: string) {
  console.log("------------------------------------------")
  console.log("Server Action: Impersonate", userId)
  await checkAdmin()
  
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
     console.error("CRITICAL ERRO: Nem AUTH_SECRET nem NEXTAUTH_SECRET definidas")
     throw new Error("AUTH_SECRET not configured")
  }

  try {
     console.log("Tentando login com provedor 'impersonation'...")
     const result = await authSignIn("impersonation", {
        userId,
        secret,
        redirect: true,
        redirectTo: "/dashboard"
     })
     
     console.log("Resultado do signIn (se não redirecionou):", result)
     return result
  } catch (error: any) {
     const isRedirect = error.message === "NEXT_REDIRECT" || 
                       error.name === "NextRedirectError" || 
                       error.digest?.includes("NEXT_REDIRECT") ||
                       (typeof error === 'string' && error.includes('NEXT_REDIRECT'))

     if (isRedirect) {
        console.log("✅ Redirecionamento detetado. Sucesso!")
        throw error
     }
     
     console.error("❌ Erro Crítico no Impersonate:", error)
     throw new Error(`Falha no Login: ${error.message || "Erro interno"}`)
  }
}

export async function getSalonFullDetails(idOrSlug: string) {
  await checkAdmin()

  const salon = await prisma.salon.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug }
      ]
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          created_at: true
        }
      },
      staff: {
        orderBy: { name: "asc" }
      },
      _count: {
        select: {
          appointments: true,
          clients: true,
          services: true
        }
      }
    }
  })

  if (!salon) throw new Error("Salão não encontrado")

  // Fetch users who have this salon in their salons_usersalons relation
  // OR who are the owner of the salon
  const relatedUsers = await prisma.user.findMany({
    where: {
      OR: [
        { id: salon.owner_id },
        { salons_usersalons: { some: { id: salon.id } } }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true
    }
  })

  // Calculate revenue
  const revenueResult: any = await prisma.$queryRaw`
    SELECT SUM(price) as total FROM appointments 
    WHERE salon_id = ${salon.id} AND status = 'completed'
  `
  const total_revenue = Number(revenueResult[0]?.total || 0)

  return JSON.parse(JSON.stringify({
    ...salon,
    relatedUsers,
    total_revenue
  }))
}

export async function manageStaff(salonId: string, staffId: string | null, data: any) {
  await checkAdmin()

  if (staffId) {
    // Update
    await prisma.staff.update({
      where: { id: staffId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        is_active: data.is_active ?? true
      }
    })
  } else {
    // Create
    await prisma.staff.create({
      data: {
        salon_id: salonId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role || "professional",
      }
    })
  }

  revalidatePath(`/admin/salons/${salonId}`)
}

export async function deleteStaff(salonId: string, staffId: string) {
  await checkAdmin()
  await prisma.staff.delete({ where: { id: staffId } })
  revalidatePath(`/admin/salons/${salonId}`)
}

export async function manageSalonUser(salonId: string, userId: string | null, data: any) {
  await checkAdmin()

  const userData: any = {
    name: data.name,
    email: data.email,
    role: data.role || "owner",
  }

  if (data.password) {
    userData.password = await bcrypt.hash(data.password, 10)
  }

  if (userId) {
    // Update
    await prisma.user.update({
      where: { id: userId },
      data: userData
    })
  } else {
    // Create and associate
    await prisma.user.create({
      data: {
        ...userData,
        salons_usersalons: {
          connect: { id: salonId }
        }
      }
    })
  }

  revalidatePath(`/admin/salons/${salonId}`)
}

export async function getSalonBySlug(slug: string) {
  const salon = await prisma.salon.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logo_url: true,
    }
  })
  return JSON.parse(JSON.stringify(salon))
}

export async function updateSalonContact(id: string, data: any) {
  await checkAdmin()
  
  await prisma.salon.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      nif: data.nif
    }
  })

  revalidatePath(`/admin/salons/${id}`)
}

export async function getSupportTicketsAdmin() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') throw new Error("Não autorizado")

  return await prisma.supportTicket.findMany({
    include: {
      salon: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })
}

export async function respondToTicket(ticketId: string, response: string) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'admin') throw new Error("Não autorizado")

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      response,
      status: 'resolved',
      updated_at: new Date()
    }
  })
}




