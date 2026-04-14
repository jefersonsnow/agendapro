import prisma from "@/lib/prisma"
import { auth } from "@/auth"

interface AuditAction {
  action: string
  entity: string
  entityId?: string
  details?: any
  salonId?: string
}

/**
 * Registra uma ação na tabela de auditoria.
 * Útil para rastrear quem fez o quê e quando.
 */
export async function logAction({
  action,
  entity,
  entityId,
  details,
  salonId
}: AuditAction) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      console.warn("Tentativa de log sem sessão ativa.")
      return
    }

    // Se o salonId não for passado, tentamos descobrir via sessão ou via entidade se necessário
    // Mas por simplicidade no MVP, quem chama o logAction deve passar o salonId se souber.

    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entity_id: entityId,
        details: details ? JSON.stringify(details) : null,
        salon_id: salonId,
        user_id: session.user.id
      }
    })
  } catch (error) {
    // Falha no log não deve derrubar a aplicação
    console.error("Erro ao registrar log de auditoria:", error)
  }
}
