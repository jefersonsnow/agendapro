"use client"

import { useState, useEffect } from "react"
import { getSalon, getSupportConfig } from "@/lib/actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles, Zap, ShieldCheck, Crown, ChevronRight, MessageSquare, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { createCheckoutSession } from "@/lib/actions/stripe"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function PlansPage() {
  const t = useTranslations("Dashboard")
  const [salon, setSalon] = useState<any>(null)
  const [support, setSupport] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")

  useEffect(() => {
    if (success) {
      toast.success("Pagamento confirmado! O seu plano será atualizado em instantes.", { duration: 8000 })
    }
    if (canceled) {
      toast.error("O processo de checkout foi cancelado.")
    }
  }, [success, canceled])

  useEffect(() => {
    async function fetchData() {
      const [salonData, supportData] = await Promise.all([
         getSalon(),
         getSupportConfig()
      ])
      setSalon(salonData)
      setSupport(supportData)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  const currentPlan = salon?.plan || "free"
  const isTrial = salon?.status === "trial"

  // Sincronizar com a Home Page (Dados dinâmicos do CMS)
  const planConfigs = salon?.dynamicPlans || {
    free: { price: 0, appointments_per_month: 50, staff: 1, clients: 100, services: 3, qr_code: false, logo: false, cover: false, reports: false, commissions: false, professional_export: false },
    basic: { price: "9.90", appointments_per_month: -1, staff: 5, clients: 500, services: 20, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true },
    premium: { price: "24.90", appointments_per_month: -1, staff: -1, clients: -1, services: -1, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true }
  }

  const getPlanItems = (p: any) => [
    [p.appointments_per_month === -1 ? "Agendamentos ilimitados" : `${p.appointments_per_month} agendamentos/mês`, true],
    [p.staff === -1 ? "Profissionais ilimitados" : p.staff === 1 ? "1 Profissional" : `Até ${p.staff} Profissionais`, true],
    [p.clients === -1 ? "Clientes ilimitados" : `Até ${p.clients} Clientes`, true],
    [p.services === -1 ? "Serviços ilimitados" : `Até ${p.services} Serviços`, true],
    ["Página de reservas online", true],
    ["QR Code de reserva", p.qr_code],
    ["Logótipo + Capa", p.logo || p.cover],
    ["Relatórios de BI", p.reports],
    ["Controlo de comissões", p.commissions],
    ["Backup & Exportação Profissional", p.professional_export],
  ]

  const PLANS = [
    {
      id: "free",
      name: "Free",
      price: "0€",
      desc: "Ideal para quem está a começar sozinho.",
      color: "bg-slate-500",
      features: getPlanItems(planConfigs.free),
    },
    {
      id: "basic",
      name: "Basic",
      price: `${planConfigs.basic.price}€`,
      desc: "Para pequenos salões e estúdios em crescimento.",
      color: "bg-primary",
      features: getPlanItems(planConfigs.basic),
    },
    {
       id: "premium",
       name: "Premium",
       price: `${planConfigs.premium.price}€`,
       desc: "A solução total para dominar o seu mercado local.",
       featured: true,
       color: "bg-slate-950",
       features: getPlanItems(planConfigs.premium),
    }
  ]

  // Regra do Usuário: Não mostrar o FREE se ele já estiver no FREE (ou qualquer plano)
  // Mostramos apenas as opções de UPGRADE.
  const upgradeOptions = PLANS.filter(p => {
    if (currentPlan === "free") return p.id !== "free"
    if (currentPlan === "basic") return p.id === "premium"
    if (currentPlan === "premium" && !isTrial) return false // Já é premium real
    if (currentPlan === "premium" && isTrial) return p.id === "premium" // Permitir comprar premium se for trial
    return false
  })

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <div className="text-center space-y-4 mb-16 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="h-4 w-4" /> Evolução de Negócio
         </div>
         <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-[0.9] italic">Planos de <span className="text-primary italic">Assinatura</span></h1>
         <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha o nível de automação e lucro que o seu salão merece. Desenvolvido para máxima performance pela <strong>Napp Sistemas</strong>.
         </p>
      </div>

      <div className={cn(
         "grid grid-cols-1 gap-8 items-stretch max-w-4xl mx-auto",
         upgradeOptions.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1 max-w-md"
      )}>
         {upgradeOptions.map((plan) => (
            <Card 
               key={plan.id} 
               className={cn(
                  "relative flex flex-col overflow-hidden transition-all duration-500 border-2 rounded-[2.5rem]",
                  plan.featured ? "border-amber-400 bg-slate-950 text-white shadow-2xl scale-105 z-10" : "border-primary/10 hover:border-primary/30",
                  currentPlan === plan.id && "bg-primary/5 ring-4 ring-primary/20"
               )}
            >
               {plan.featured && (
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Crown className="h-24 w-24 -rotate-12" />
                  </div>
               )}

               {currentPlan === plan.id && (
                  <div className="absolute top-4 right-4 animate-bounce">
                     <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Plano Atual</span>
                  </div>
               )}

               <CardHeader className="p-8">
                  <div className="space-y-1">
                     <CardTitle className={cn("text-2xl font-black uppercase tracking-widest", plan.featured ? "text-amber-400" : "text-foreground")}>
                        {plan.name}
                     </CardTitle>
                     <CardDescription className={plan.featured ? "text-slate-400" : "text-muted-foreground"}>{plan.desc}</CardDescription>
                  </div>
                  <div className="mt-8">
                     <span className={cn("text-5xl font-black tracking-tight italic italic", plan.featured ? "text-white" : "text-foreground")}>{plan.price}</span>
                     <span className={cn("text-sm ml-1", plan.featured ? "text-slate-400" : "text-muted-foreground")}>/mês</span>
                  </div>
               </CardHeader>

               <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                     <p className={cn("text-xs font-black uppercase tracking-widest", plan.featured ? "text-slate-500" : "text-muted-foreground/60")}>O que inclui:</p>
                      <ul className="space-y-3">
                        {plan.features.map(([feature, ok]: any, i: number) => (
                           <li key={i} className={cn("flex items-center gap-3 text-sm font-medium", !ok && "opacity-30 line-through")}>
                              <CheckCircle2 className={cn("h-4 w-4 shrink-0", plan.featured ? "text-amber-400" : "text-primary")} />
                              <span className={plan.featured ? "text-slate-200" : "text-muted-foreground"}>{feature}</span>
                           </li>
                        ))}
                      </ul>
                  </div>

                  <div className="mt-12">
                     {plan.id === currentPlan ? (
                        <Button disabled variant="outline" className="w-full h-14 rounded-2xl border-2 font-bold text-muted-foreground opacity-50">
                           Aproveite o seu plano
                        </Button>
                     ) : (
                        <Button 
                           disabled={upgradingPlan !== null}
                           onClick={async () => {
                              if (plan.id === "free") return
                              
                              // Se não houver Price ID configurado, caímos no suporte via WhatsApp/Email
                               try {
                                  setUpgradingPlan(plan.id)
                                  const result = await createCheckoutSession(plan.id as any)
                                  
                                  if (result?.error) {
                                     throw new Error(result.error)
                                  }

                                  if (result?.url) {
                                     window.location.assign(result.url)
                                  }
                               } catch (err: any) {
                                  console.error("Erro ao iniciar checkout:", err)
                                  
                                  const errorMessage = err?.message || "Erro desconhecido"
                                  
                                  const text = encodeURIComponent(`Olá Napp! Tentei fazer o upgrade para o plano ${plan.name} mas ocorreu um erro: ${errorMessage}. Pode ajudar-me? (Salão: ${salon?.name})`)
                                  const url = support?.whatsappNumber 
                                     ? `https://wa.me/${support.whatsappNumber.replace(/\D/g, '')}?text=${text}`
                                     : `mailto:contato@napp.pt?subject=Erro no Upgrade ${plan.name}&body=${text}`
                                  
                                  window.open(url, "_blank")
                                  toast.error(`Falha no checkout: ${errorMessage}. Abrindo suporte...`, { duration: 7000 })
                               } finally {
                                  setUpgradingPlan(null)
                               }
                           }}
                           className={cn(
                              "w-full h-14 rounded-2xl transition-all text-xs font-black uppercase tracking-wider shadow-xl group",
                              plan.id === "premium" 
                                 ? "bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-amber-400/20" 
                                 : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                           )}
                        >
                           {upgradingPlan === plan.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                           ) : (
                              <>
                                 {plan.id === "premium" ? "Assinar Premium" : `Assinar ${plan.name}`} 
                                 <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              </>
                           )}
                        </Button>
                     )}
                  </div>

               </CardContent>
            </Card>
         ))}
      </div>

      {/* Footer / FAQ Secção Expressa */}
      <div className="mt-32 p-12 rounded-[3.5rem] bg-gradient-to-br from-slate-900 to-black text-white relative overflow-hidden border-4 border-amber-400/20 group animate-in slide-in-from-bottom-10 duration-1000">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
         <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
               <div className="flex items-center gap-3 text-amber-400">
                  <Star className="h-6 w-6 fill-amber-400" />
                  <span className="font-black uppercase tracking-[0.3em] text-xs">Exclusivo NAPP</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">Precisa de um plano <br/> <span className="text-amber-400">Personalizado?</span></h2>
               <p className="text-slate-400 font-medium leading-relaxed max-w-md">
                  Se gere uma rede de salões ou franchisings, a <strong>Napp Sistemas</strong> desenvolve soluções à medida com infraestrutura dedicada e dashboards multi-unidade.
               </p>
               <Button asChild className="rounded-full bg-white text-black hover:bg-amber-400 font-black uppercase tracking-widest text-[10px] h-12 px-8">
                  <a href="https://napp.pt" target="_blank">Conhecer a Napp</a>
               </Button>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6">
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 shrink-0"> <ShieldCheck className="h-6 w-6" /> </div>
                  <div>
                     <h4 className="font-bold mb-1">Pagamentos Seguros</h4>
                     <p className="text-sm text-slate-500">Transação direta através de faturação oficial da Napp Sistemas.</p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 shrink-0"> <Zap className="h-6 w-6" /> </div>
                  <div>
                     <h4 className="font-bold mb-1">Ativação Imediata</h4>
                     <p className="text-sm text-slate-500">Após a confirmação, os seus novos limites são libertados em minutos.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
