import prisma from "./prisma"
import { getPlanLimits } from "./plan-utils"

export * from "./plan-utils"

/**
 * Versão assíncrona que busca automaticamente do banco de dados (GlobalConfig)
 * EXCLUSIVO PARA SERVIDOR.
 */
export async function getPlanLimitsAsync(plan: string, status?: string) {
  try {
    const config = await prisma.globalConfig.findUnique({
      where: { id: "singleton" },
      select: { landing_page: true }
    })
    const lp = config?.landing_page ? JSON.parse(config.landing_page) : {}
    return getPlanLimits(plan, lp.plans, status)
  } catch (err) {
    return getPlanLimits(plan, null, status)
  }
}
