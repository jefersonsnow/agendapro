export const dynamic = "force-dynamic"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrialButton } from "@/components/trial-button"
import {
  Calendar,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  Smartphone,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronRight,
  Scissors,
  Percent,
  X,
  Play,
  ArrowRight,
  Timer,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"
import prisma from "@/lib/prisma"

export default async function SalesPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams?.locale || routing.defaultLocale

  let t: any
  try {
    t = await getTranslations({ locale, namespace: "Home" })
  } catch (e) {
    console.error("Translation error:", e)
    t = (key: string) => key
  }

  // FETCH GLOBAL CONFIG FOR DYNAMIC CONTENT
  let landingPageData: any = {}
  let salesPageConfig: any = {}
  
  try {
    const configs = await (prisma as any).$queryRawUnsafe(`SELECT * FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
    
    if (configs && configs.length > 0) {
      const globalConfig = configs[0]
      
      if (globalConfig.landing_page) {
        try {
          landingPageData = typeof globalConfig.landing_page === 'string' 
            ? JSON.parse(globalConfig.landing_page) 
            : globalConfig.landing_page
        } catch (e) {
          console.error("Error parsing landing_page JSON:", e)
        }
      }

      if (globalConfig.sales_page_config) {
        try {
          salesPageConfig = typeof globalConfig.sales_page_config === 'string'
            ? JSON.parse(globalConfig.sales_page_config)
            : globalConfig.sales_page_config
        } catch (e) {
          console.error("Error parsing sales_page_config JSON:", e)
        }
      }
    }
  } catch (error) {
    console.error("Error fetching global configs:", error)
  }

  const dynamicPlansTitle = landingPageData.plansTitle || t("plansTitle")
  const dynamicPriceMinimo = landingPageData.plans?.minimo?.price ?? 0
  const dynamicPriceBasic = landingPageData.plans?.basic?.price ?? (landingPageData.priceBasic || "19")
  const dynamicPricePremium = landingPageData.plans?.premium?.price ?? (landingPageData.pricePremium || "49")

  const planConfigs = {
    minimo: { 
      price: dynamicPriceMinimo ?? 0, 
      appointments_per_month: 50, staff: 1, clients: 100, services: 3, qr_code: false, logo: false, cover: false, reports: false, commissions: false, professional_export: false,
      ...(landingPageData.plans?.minimo || {}) 
    },
    basic: { 
      price: dynamicPriceBasic ?? 19, 
      appointments_per_month: -1, staff: 5, clients: 500, services: 20, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true,
      ...(landingPageData.plans?.basic || {}) 
    },
    premium: { 
      price: dynamicPricePremium ?? 49, 
      appointments_per_month: -1, staff: -1, clients: -1, services: -1, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true,
      ...(landingPageData.plans?.premium || {}) 
    }
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

  const headline = salesPageConfig.headline || "PARE DE PERDER DINHEIRO COM AGENDAS MANUAIS NO WHATSAPP"
  const subheadline = salesPageConfig.subheadline || "A solução definitiva para donos de salões que querem liberdade, controlo total e uma agenda que trabalha sozinha 24/7."
  const videoUrl = salesPageConfig.videoUrl

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 overflow-x-hidden font-sans">
      {/* HEADER */}
      <header className="py-6 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-[100]">
         <div className="container mx-auto px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
               <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <Scissors className="h-5 w-5 text-white" />
               </div>
               <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">AgendarPro</span>
            </Link>
            <div className="hidden sm:flex items-center gap-6">
               <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-primary" /> Oferta de Lançamento Ativa
               </div>
            </div>
         </div>
      </header>

      {/* URGENCY BAR */}
      <div className="bg-primary/10 border-b border-primary/20 py-3 text-center overflow-hidden relative">
        <div className="flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest text-primary transform-gpu">
          <Timer className="h-4 w-4" />
          <span>OFERTA EXCLUSIVA: AS VAGAS PARA ESTE PREÇO ESTÃO A TERMINAR</span>
        </div>
      </div>

      <main className="relative">
        {/* HERO SECTION */}
        <section className="pt-20 pb-32 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none opacity-50" />
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-3 w-3 text-primary" /> Mais de 500 Salões Ativos
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 transform-gpu italic uppercase">
              {headline}
            </h1>

            <p className="text-lg md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {subheadline}
            </p>

            {/* VSL VIDEO */}
            <div className="relative group max-w-4xl mx-auto mb-20 animate-in fade-in zoom-in duration-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-cyan-500/50 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/10 shadow-2xl">
                {videoUrl ? (
                  <iframe 
                    src={videoUrl} 
                    className="w-full h-full absolute inset-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 cursor-pointer group/play">
                      <div className="h-24 w-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center backdrop-blur-md transition-all duration-500 group-hover/play:scale-110 group-hover/play:bg-primary/40 group-hover/play:border-primary">
                        <Play className="h-10 w-10 text-white fill-current ml-1" />
                      </div>
                      <span className="font-black uppercase tracking-[0.4em] text-xs text-white/80 group-hover/play:text-white transition-colors">Assista e Descubra</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <a href="#planos">
              <Button className="h-20 px-12 text-xl font-black uppercase tracking-tighter rounded-2xl bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl shadow-white/10 hover:shadow-primary/40">
                Garantir o Meu Acesso Agora <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </a>
          </div>
        </section>

        {/* PRICING - EXACTLY LIKE HOME */}
        <section id="planos" className="py-32 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-8 border border-primary/30 backdrop-blur-md">
                <Zap className="h-4 w-4" /> {t("plansTag")}
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic">{dynamicPlansTitle}</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">{t("plansDesc")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
              {/* MINIMO */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-slate-800 flex flex-col h-full hover:bg-slate-900 transition-all duration-500 group">
                <div className="mb-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">{t("planFreeLabel")}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{planConfigs.minimo?.price ?? 0}€</span>
                    <span className="text-slate-500 font-bold">/mês</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-4 font-medium">{t("planFreeDesc")}</p>
                </div>
                <div className="h-px bg-slate-800 w-full mb-10" />
                <ul className="space-y-4 mb-12 flex-1">
                  {getPlanItems(planConfigs.minimo).map(([item, ok], i) => (
                    <li key={i} className={cn("flex items-center gap-4 text-sm font-medium", ok ? "text-slate-200" : "text-slate-600 line-through")}>
                      <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", ok ? "bg-primary/20 text-primary" : "bg-slate-800 text-slate-700")}>
                        {ok ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                      {item as string}
                    </li>
                  ))}
                </ul>
                <TrialButton plan="minimo" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/80 text-white shadow-xl shadow-primary/20 transition-all">
                  Assinar Agora
                </TrialButton>
              </div>

              {/* BASIC */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-slate-800 flex flex-col h-full hover:bg-slate-900 transition-all duration-500 group">
                <div className="mb-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">⚡ BASIC</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{planConfigs.basic?.price ?? 19}€</span>
                    <span className="text-slate-500 font-bold">/mês</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-4 font-medium">{t("planBasicDesc")}</p>
                </div>
                <div className="h-px bg-slate-800 w-full mb-10" />
                <ul className="space-y-4 mb-12 flex-1">
                  {getPlanItems(planConfigs.basic).map(([item, ok], i) => (
                    <li key={i} className={cn("flex items-center gap-4 text-sm font-medium", ok ? "text-slate-200" : "text-slate-600 line-through")}>
                      <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", ok ? "bg-primary/20 text-primary" : "bg-slate-800 text-slate-700")}>
                        {ok ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                      {item as string}
                    </li>
                  ))}
                </ul>
                <TrialButton plan="basic" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/80 text-white shadow-xl shadow-primary/20 transition-all">
                  Assinar Agora
                </TrialButton>
              </div>

              {/* PREMIUM */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border-2 border-primary/40 flex flex-col h-full hover:bg-slate-900 transition-all duration-500 relative group scale-105 shadow-2xl shadow-primary/20">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl text-white">RECOMENDADO</div>
                <div className="mb-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-4">💎 PREMIUM</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{planConfigs.premium?.price ?? 49}€</span>
                    <span className="text-slate-500 font-bold">/mês</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-4 font-medium">{t("planPremiumDesc")}</p>
                </div>
                <div className="h-px bg-slate-800 w-full mb-10" />
                <ul className="space-y-4 mb-12 flex-1">
                  {getPlanItems(planConfigs.premium).map(([item, ok], i) => (
                    <li key={i} className={cn("flex items-center gap-4 text-sm font-medium", ok ? "text-slate-200" : "text-slate-600 line-through")}>
                      <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", ok ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-700")}>
                        {ok ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                      {item as string}
                    </li>
                  ))}
                </ul>
                <TrialButton plan="premium" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-r from-cyan-600 to-primary hover:from-cyan-500 hover:to-primary/80 text-white shadow-xl shadow-cyan-500/20 transition-all">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Assinar Agora
                </TrialButton>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF SECTION */}
        <section className="py-32 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-20 items-center">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-6 italic">PORQUÊ O <br/><span className="text-primary">AGENDARPRO?</span></h2>
              <div className="space-y-8 mt-10">
                {[
                  { title: "Gestão Inteligente", desc: "Controle equipas, comissões e horários sem precisar de abrir uma folha de cálculo." },
                  { title: "Página de Reserva VIP", desc: "Ofereça aos seus clientes uma experiência de agendamento digna de um hotel 5 estrelas." },
                  { title: "BI e Relatórios", desc: "Saiba exatamente qual o serviço mais lucrativo e quem é o seu melhor profissional." }
                ].map((item, i) => (
                  <div key={i} className="group">
                    <h4 className="font-black uppercase tracking-widest text-primary mb-2 group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" /> {item.title}
                    </h4>
                    <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50" />
              <div className="relative bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-xl">
                 <div className="flex gap-1 text-amber-400 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                 </div>
                 <p className="text-xl font-medium leading-relaxed italic mb-8 text-white/90">
                    "Mudou completamente a dinâmica do meu estúdio. Antes eu perdia horas no WhatsApp, agora o sistema faz tudo e eu só me foco em cortar cabelo. O investimento pagou-se na primeira semana."
                 </p>
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-cyan-600" />
                    <div>
                       <p className="font-black uppercase tracking-widest text-xs">Ricardo Oliveira</p>
                       <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Dono do BarberShop Elite</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-40 bg-gradient-to-t from-primary/10 to-transparent border-t border-white/5 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <Crown className="h-16 w-16 text-amber-400 mx-auto mb-8 animate-bounce" />
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">PRONTO PARA O <br/><span className="text-primary italic">PRÓXIMO NÍVEL?</span></h2>
            <p className="text-white/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
              Não deixe para amanhã a organização que o seu negócio precisa hoje. 
              Junte-se à elite dos salões de beleza.
            </p>
            <TrialButton size="lg" className="rounded-2xl h-24 px-16 text-2xl shadow-[0_20px_50px_rgba(13,148,136,0.3)] hover:shadow-primary/50 hover:-translate-y-2 transition-all font-black uppercase tracking-tighter bg-primary text-white">
              Assinar Agora
              <Sparkles className="ml-4 h-8 w-8" />
            </TrialButton>
            <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">
              Garantia de Satisfação Total • Suporte Especializado • Ativação Imediata
            </p>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black">
         <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-6 opacity-30">
               <Scissors className="h-4 w-4" />
               <span className="font-bold text-sm tracking-tight">AgendarPro</span>
            </div>
            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">
               &copy; {new Date().getFullYear()} Napp Sistemas. Todos os direitos reservados.
            </p>
         </div>
      </footer>
    </div>
  )
}
