"use client"

import { Clock, Zap, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { differenceInDays, isAfter } from "date-fns"

interface TrialStatusBannerProps {
  trialEndsAt: string | Date | null
  plan: string
}

export default function TrialStatusBanner({ trialEndsAt, plan }: TrialStatusBannerProps) {
  if (!trialEndsAt) return null

  const endDate = new Date(trialEndsAt)
  const today = new Date()
  const isExpired = isAfter(today, endDate)
  const daysRemaining = differenceInDays(endDate, today)

  // Só mostrar se o plano for "free" (ou se for um plano pago em trial se suportado no futuro)
  // No caso atual, o usuário quer controlar os 30 dias grátis.
  // Mesmo que o plano efetivo seja 'premium' (regra de ouro), queremos mostrar o banner se houver trialEndsAt.
  // if (plan !== "free") return null

  if (isExpired) {
    return (
      <div className="mb-6 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 p-1 opacity-10">
          <AlertTriangle className="h-24 w-24 -rotate-12" />
        </div>
        <div className="h-14 w-14 rounded-2xl bg-destructive/20 flex items-center justify-center shrink-0 border border-destructive/30">
          <Clock className="h-8 w-8 text-destructive animate-pulse" />
        </div>
        <div className="flex-1 text-center md:text-left z-10">
          <h3 className="text-xl font-black text-destructive uppercase tracking-tight">O seu período de teste expirou! ⚡</h3>
          <p className="text-muted-foreground font-medium mt-1">
            Os seus 30 dias grátis chegaram ao fim. Escolha um plano para continuar a usar todas as funcionalidades sem interrupções.
          </p>
        </div>
        <Link href="/dashboard/configuracoes/planos" className="z-10 w-full md:w-auto">

          <Button size="lg" className="w-full h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black uppercase tracking-widest shadow-lg shadow-destructive/30">
            Fazer Upgrade Agora
          </Button>
        </Link>
      </div>
    )
  }

  // Mostrar aviso se faltar menos de 8 dias
  if (daysRemaining <= 7) {
    return (
      <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm border-dashed">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <Zap className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-bold text-amber-700">
            A sua conta gratuita expira em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}. 
            <span className="font-normal text-muted-foreground ml-2">Não perca o acesso à sua agenda automática!</span>
          </p>
        </div>
        <Link href="/dashboard/configuracoes/planos" className="w-full sm:w-auto">

          <Button size="sm" variant="outline" className="w-full h-9 rounded-xl border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500 hover:text-white font-bold transition-all">
            Ver Planos
          </Button>
        </Link>
      </div>
    )
  }

  // Mostrar aviso de trial sempre
  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm border-dashed group transition-all hover:bg-primary/[0.08]">
      <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 relative">
        <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-primary opacity-20"></span>
        <Clock className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h4 className="text-sm font-black text-primary uppercase tracking-tighter italic">Napp — Trial Ativo</h4>
        <p className="text-sm font-bold text-muted-foreground">
          O seu período de teste grátis termina em <span className="text-primary font-black">{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</span>. 
          <span className="hidden md:inline ml-2 opacity-60 font-medium italic">Aproveite para explorar todas as funcionalidades exclusivas.</span>
        </p>
      </div>
      <Link href="/dashboard/configuracoes/planos" className="w-full sm:w-auto">
        <Button size="sm" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] px-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
          Upgrade de Plano <Zap className="ml-2 h-3 w-3" />
        </Button>
      </Link>
    </div>
  )
}
