import prisma from "./prisma"

// Limites dos planos AgendarPro (Defaults)
export const PLAN_LIMITS = {
  free: {
    name: "Gratuito",
    price: 0,
    appointments_per_month: 50,
    staff: 1,
    clients: 100,
    services: 3,
    qr_code: false,
    logo: false,
    cover: false,
    reports: false,
    commissions: false,
    professional_export: false,
  },
  basic: {
    name: "Basic",
    price: 19,
    appointments_per_month: -1,
    staff: 5,
    clients: 500,
    services: 20,
    qr_code: true,
    logo: true,
    cover: true,
    reports: true,
    commissions: true,
    professional_export: true,
  },
  premium: {
    name: "Premium",
    price: 39,
    appointments_per_month: -1,
    staff: -1,
    clients: -1,
    services: -1,
    qr_code: true,
    logo: true,
    cover: true,
    reports: true,
    commissions: true,
    professional_export: true,
  },
}

export type PlanKey = keyof typeof PLAN_LIMITS

/**
 * Obtém os limites de um plano, opcionalmente mesclando com configurações dinâmicas do banco
 * Se o status for 'trial', ignoramos o plano base e entregamos limites 'premium'
 */
export function getPlanLimits(plan: string, dynamicPlans?: any, status?: string) {
  // Regra de Ouro da NAPP: Trial = Premium
  const actualPlan = status === "trial" ? "premium" : (plan?.toLowerCase() || "free")
  const key = actualPlan as PlanKey
  const base = PLAN_LIMITS[key] || PLAN_LIMITS.free
  
  if (dynamicPlans && dynamicPlans[key]) {
     return { ...base, ...dynamicPlans[key] }
  }
  return base
}

/**
 * Versão assíncrona que busca automaticamente do banco de dados (GlobalConfig)
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

export function isFeatureAllowed(plan: string, feature: keyof typeof PLAN_LIMITS.free, dynamicPlans?: any, status?: string): boolean {
  const limits = getPlanLimits(plan, dynamicPlans, status)
  const val = (limits as any)[feature]
  if (typeof val === "boolean") return val
  if (typeof val === "number") return val !== 0
  return false
}

export function isWithinLimit(plan: string, feature: "staff" | "clients" | "services" | "appointments_per_month", currentCount: number, dynamicPlans?: any, status?: string): boolean {
  const limits = getPlanLimits(plan, dynamicPlans, status)
  const limit = (limits as any)[feature] as number
  if (limit === -1) return true // ilimitado
  return currentCount < limit
}

