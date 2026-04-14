"use client"

import { Zap, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"
import { PLAN_LIMITS, PlanKey } from "@/lib/plan-limits"

interface PlanLimitBannerProps {
  plan: string
  feature: string
  current: number
  limit: number
  resourceName: string // ex: "profissionais", "clientes", "serviços"
}

export default function PlanLimitBanner({ plan, feature, current, limit, resourceName }: PlanLimitBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const planInfo = PLAN_LIMITS[plan as PlanKey]
  const isAtLimit = limit !== -1 && current >= limit

  if (!isAtLimit) return null

  const nextPlan = plan === "free" ? "Basic" : "Premium"
  const nextPrice = plan === "free" ? "19€" : "49€"

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 p-5 flex items-start gap-4 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 pointer-events-none" />
      <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
        <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base text-foreground">
          Limite do plano {planInfo?.name || plan} atingido
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Já tem {current} {resourceName} (máximo: {limit} no plano atual). 
          Faça upgrade para <strong className="text-foreground">{nextPlan}</strong> a partir de <strong className="text-primary">{nextPrice}/mês</strong> para continuar a crescer.
        </p>
        <Link href="/dashboard/configuracoes/planos">
          <Button size="sm" className="mt-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/30">
            <Zap className="h-4 w-4 mr-2 fill-white" />
            Ver Planos & Fazer Upgrade
          </Button>
        </Link>

      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
