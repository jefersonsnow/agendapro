import { cache } from "react"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

/**
 * Retorna as configurações globais do sistema de forma segura e cacheada por pedido.
 * Evita múltiplas queries `global_configs` no mesmo render pass.
 */
export const getGlobalConfigCache = cache(async function getGlobalConfigCache() {
  try {
    const config = await prisma.globalConfig.findUnique({
      where: { id: 'singleton' }
    })
    
    if (!config) return null
    return config
  } catch (err) {
    console.error("Erro ao obter GlobalConfig via DAL:", err)
    return null
  }
})

/**
 * Determina o ID do salão a que o utilizador autenticado pertence.
 * Pesquisa primeiro se o utilizador é dono (owner) e depois se é membro (staff).
 * Cacheado por pedido para evitar re-queries de permissão.
 */
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
