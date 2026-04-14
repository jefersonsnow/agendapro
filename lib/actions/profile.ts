"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { logAction } from "@/lib/audit"

export async function getProfile() {
  const session = await auth()
  if (!session?.user?.id && !session?.user?.email) return null

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id || undefined },
        { email: (session.user.email as string) || undefined }
      ]
    }
  })

  if (!user) return null

  // Dados básicos do User
  const profile: any = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image
  }

  // Se for staff (profissional/manager/receptionist), buscar dados extra
  const staff = await prisma.staff.findFirst({
    where: { 
      OR: [
        { user_id: user.id },
        { email: user.email || undefined }
      ]
    }
  })

  if (staff) {
    profile.staffId = staff.id
    profile.phone = staff.phone
    profile.bio = staff.bio
    profile.avatar_url = staff.avatar_url
    profile.commission_rate = Number(staff.commission_rate)
  }

  return profile
}

export async function updateProfile(data: any) {
  const session = await auth()
  if (!session?.user?.id && !session?.user?.email) throw new Error("Não autorizado")

  const currentProfile = await getProfile()
  if (!currentProfile) throw new Error("Perfil não encontrado")

  const userId = currentProfile.id

  const userUpdatePayload: any = {
    name: data.name,
    email: data.email
  }

  if (data.password) {
    userUpdatePayload.password = await bcrypt.hash(data.password, 10)
  }

  if (data.image) {
    userUpdatePayload.image = data.image
  }

  // 1. Atualizar tabela User
  await prisma.user.update({
    where: { id: userId },
    data: userUpdatePayload
  })

  // 2. Atualizar tabela Staff se existir vínculo
  const staff = await prisma.staff.findFirst({
    where: { 
       OR: [
         { user_id: userId },
         { email: currentProfile.email || undefined }
       ]
    }
  })

  if (staff) {
    const staffPayload: any = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      avatar_url: data.image || staff.avatar_url
    }

    // Regras de Comissão:
    // "a comissão de todos pode ser alterado somente pelo proprietario"
    // Aqui estamos editando o PRÓPRIO perfil. 
    // Portanto, só o OWNER pode mudar sua própria comissão no perfil.
    if (data.commission_rate !== undefined) {
      if (currentProfile.role === "owner") {
        staffPayload.commission_rate = data.commission_rate
      } else {
        // Bloqueio silencioso no backend para prevenir manipulação via DevTools
        console.warn(`User ${userId} tentou alterar sua própria comissão sem permissão.`)
      }
    }

    await prisma.staff.update({
      where: { id: staff.id },
      data: staffPayload
    })
  }

  // Log da ação
  await logAction({ 
    action: "update_profile", 
    entity: "user", 
    entityId: userId,
    salonId: staff?.salon_id || undefined
  })

  revalidatePath("/dashboard")
  return { success: true }
}
