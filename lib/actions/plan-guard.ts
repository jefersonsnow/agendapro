"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { getPlanLimits, isWithinLimit } from "@/lib/plan-limits"

async function getSalonWithPlan() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Try as owner first
  let salon = await (prisma as any).salon.findFirst({
    where: { owner_id: session.user.id },
    select: { id: true, plan: true, status: true }
  })

  if (!salon) {
    const staff = await prisma.staff.findFirst({
      where: { user_id: session.user.id },
      select: { salon_id: true }
    })
    if (staff) {
      salon = await (prisma as any).salon.findUnique({
        where: { id: staff.salon_id },
        select: { id: true, plan: true, status: true }
      })
    }
  }

  return salon
}

async function getDynamicPlans() {
  try {
    const config = await (prisma as any).$queryRawUnsafe(`SELECT landing_page FROM global_configs WHERE id = 'singleton' LIMIT 1`)
    if (config?.[0]?.landing_page) {
       const lp = JSON.parse(config[0].landing_page)
       return lp.plans || null
    }
  } catch (e) {}
  return null
}

export async function checkStaffLimit(): Promise<{ allowed: boolean; limit: number; current: number; plan: string; status: string }> {
  const salon = await getSalonWithPlan()
  if (!salon) return { allowed: false, limit: 0, current: 0, plan: "free", status: "active" }

  const plan = salon.plan || "free"
  const status = salon.status || "active"
  const dynamicPlans = await getDynamicPlans()
  const limits = getPlanLimits(plan, dynamicPlans, status)
  const current = await prisma.staff.count({ where: { salon_id: salon.id } })
  const limit = limits.staff as number

  return {
    allowed: isWithinLimit(plan, "staff", current, dynamicPlans, status),
    limit,
    current,
    plan,
    status
  }
}

export async function checkClientLimit(): Promise<{ allowed: boolean; limit: number; current: number; plan: string; status: string }> {
  const salon = await getSalonWithPlan()
  if (!salon) return { allowed: false, limit: 0, current: 0, plan: "free", status: "active" }

  const plan = salon.plan || "free"
  const status = salon.status || "active"
  const dynamicPlans = await getDynamicPlans()
  const limits = getPlanLimits(plan, dynamicPlans, status)
  const current = await prisma.client.count({ where: { salon_id: salon.id } })
  const limit = limits.clients as number

  return {
    allowed: isWithinLimit(plan, "clients", current, dynamicPlans, status),
    limit,
    current,
    plan,
    status
  }
}

export async function checkServiceLimit(): Promise<{ allowed: boolean; limit: number; current: number; plan: string; status: string }> {
  const salon = await getSalonWithPlan()
  if (!salon) return { allowed: false, limit: 0, current: 0, plan: "free", status: "active" }

  const plan = salon.plan || "free"
  const status = salon.status || "active"
  const dynamicPlans = await getDynamicPlans()
  const limits = getPlanLimits(plan, dynamicPlans, status)
  const current = await prisma.service.count({ where: { salon_id: salon.id } })
  const limit = limits.services as number

  return {
    allowed: isWithinLimit(plan, "services", current, dynamicPlans, status),
    limit,
    current,
    plan,
    status
  }
}

export async function getSalonPlanData(): Promise<{ plan: string, status: string, dynamicPlans: any }> {
  const [salon, dynamicPlans] = await Promise.all([
    getSalonWithPlan(),
    getDynamicPlans()
  ])
  return {
    plan: salon?.plan || "free",
    status: salon?.status || "active",
    dynamicPlans
  }
}
