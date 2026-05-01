"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrialButton } from "@/components/trial-button"
import {
  CheckCircle,
  Sparkles,
  Zap,
  ArrowRight,
  Timer,
  Star,
  Crown,
  MessageCircle,
  TrendingUp,
  Percent,
  X,
  Check,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

// COMPONENTE DE CONTAGEM DECRESCENTE
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 47,
    seconds: 52
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const format = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="flex gap-2 font-mono text-2xl md:text-4xl font-black">
      <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 min-w-[60px] md:min-w-[80px]">
        {format(timeLeft.hours)}<span className="text-[10px] block font-sans text-white/40 uppercase tracking-tighter">Horas</span>
      </div>
      <div className="flex items-center text-primary">:</div>
      <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 min-w-[60px] md:min-w-[80px]">
        {format(timeLeft.minutes)}<span className="text-[10px] block font-sans text-white/40 uppercase tracking-tighter">Minutos</span>
      </div>
      <div className="flex items-center text-primary">:</div>
      <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 min-w-[60px] md:min-w-[80px]">
        {format(timeLeft.seconds)}<span className="text-[10px] block font-sans text-white/40 uppercase tracking-tighter">Segundos</span>
      </div>
    </div>
  )
}

export default function SalesPage() {
  const t = useTranslations("Home")

  const planConfigs = {
    minimo: { 
      price: 19, 
      appointments_per_month: 50, staff: 1, clients: 100, services: 3, qr_code: false, logo: false, cover: false, reports: false, commissions: false, professional_export: false
    },
    basic: { 
      price: 29, 
      appointments_per_month: -1, staff: 5, clients: 500, services: 20, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true
    },
    premium: { 
      price: 39, 
      appointments_per_month: -1, staff: -1, clients: -1, services: -1, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true
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

  const headline = "QUER TER O DOBRO DOS RESULTADOS PAGANDO METADE DO PREÇO?"
  const subheadline = "Aproveite a nossa maior oferta de sempre. 50% de DESCONTO no primeiro mês do Plano Premium para os próximos subscritores. A sua agenda merece o melhor."

  const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ" // Exemplo de VSL

  return (
    <div className="theme-magenta min-h-screen bg-[#050505] text-white selection:bg-primary/30 overflow-x-hidden font-sans">
      {/* HEADER */}
      <header className="py-6 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-[100]">
         <div className="container mx-auto px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
               <div className="h-10 w-10 rounded-lg overflow-hidden shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                  <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
               </div>
               <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">AgendarPro</span>
            </Link>
            <div className="hidden sm:flex items-center gap-6">
               <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-primary" /> Oferta de Lançamento Ativa
               </div>
               <a 
                 href="https://wa.me/351910664744?text=Olá! Estou na página de Oferta Exclusiva e tenho uma dúvida."
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20 hover:scale-110 transition-transform relative group"
               >
                 <MessageCircle className="h-6 w-6" />
                 <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>
               </a>
            </div>
         </div>
      </header>

      {/* URGENCY BAR */}
      <div className="bg-primary/20 border-b border-primary/40 py-4 text-center overflow-hidden relative">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-6 text-sm font-black uppercase tracking-widest">
          <div className="flex items-center gap-2 text-primary">
            <Timer className="h-5 w-5" />
            <span>ESTA OFERTA EXPIRA EM:</span>
          </div>
          <CountdownTimer />
        </div>
      </div>

      <main className="relative">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10"></div>
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-6 py-2 rounded-full border border-primary/30 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
               <Percent className="h-4 w-4 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">50% DESCONTO NO 1º MÊS</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 italic animate-in fade-in slide-in-from-bottom-8 duration-1000 transform-gpu backface-hidden">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary bg-[length:200%_auto] animate-gradient-x transform-gpu inline-block pr-[0.1em]">
                {headline}
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-16 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 transform-gpu backface-hidden">
              {subheadline}
            </p>

            {/* VSL VIDEO */}
            <div className="relative group w-full max-w-4xl mx-auto mb-20">
               <div className="w-full animate-in fade-in duration-1000">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative w-full h-0 pb-[56.25%] rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-black">
                    <iframe 
                      src={videoUrl} 
                      className="absolute top-0 left-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
               </div>
            </div>

            <a href="#planos">
              <Button className="h-20 px-12 text-xl font-black uppercase tracking-tighter rounded-2xl bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl shadow-white/10 hover:shadow-primary/40">
                Garantir 50% de Desconto Agora <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </a>
          </div>
        </section>

        {/* PRICING */}
        <section id="planos" className="py-32 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-8 border border-primary/30 backdrop-blur-md">
                <Zap className="h-4 w-4" /> OFERTA LIMITADA
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic">ESCOLHA O SEU PLANO</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">Economize 50% no primeiro mês do Plano Premium usando o código LIMITADO50.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
              {/* MINIMO */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-slate-800 flex flex-col h-full hover:bg-slate-900 transition-all duration-500 group">
                <div className="mb-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">INICIAL</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{planConfigs.minimo.price}€</span>
                    <span className="text-slate-500 font-bold">/mês</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-4 font-medium">Para profissionais que estão a começar.</p>
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
                    <span className="text-5xl font-black">{planConfigs.basic.price}€</span>
                    <span className="text-slate-500 font-bold">/mês</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-4 font-medium">O essencial para o seu salão crescer.</p>
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

              {/* PREMIUM - WITH 50% DISCOUNT */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border-2 border-primary flex flex-col h-full hover:bg-slate-900 transition-all duration-500 relative group scale-105 shadow-2xl shadow-primary/40">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl text-black">CUPÃO LIMITADO50 ATIVO</div>
                <div className="mb-10">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-4">💎 PREMIUM (ILIMITADO)</p>
                  <div className="flex flex-col">
                    <span className="text-slate-500 line-through text-2xl font-bold">39€</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-black text-white">19</span>
                      <span className="text-3xl font-black text-white">,50€</span>
                      <span className="text-slate-500 font-bold ml-1">/1º mês</span>
                    </div>
                  </div>
                  <p className="text-cyan-400/80 text-xs mt-4 font-black uppercase tracking-widest animate-pulse">Pague metade agora e tenha tudo ilimitado!</p>
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
                <TrialButton 
                  plan="premium" 
                  customRedirectUrl="https://buy.stripe.com/bJe4gy3ZY1gxfy66G6bwk05?prefilled_promo_code=LIMITADO50"
                  className="w-full h-20 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-r from-cyan-600 to-primary hover:from-cyan-500 hover:to-primary/80 text-white shadow-xl shadow-cyan-500/40 transition-all scale-110"
                >
                  <Sparkles className="mr-2 h-6 w-6" />
                  Garantir 50% de Desconto
                </TrialButton>
                <div className="mt-8 flex flex-col items-center gap-2">
                   <p className="text-[10px] text-center text-white/40 font-bold uppercase tracking-widest">Preço normal de 39€ após o primeiro mês.</p>
                   <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                      <ShieldCheck className="h-3 w-3 text-green-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-400">SEM FIDELIZAÇÃO • CANCELE QUANDO QUISER</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NO FIDELITY / GUARANTEE SECTION */}
        <section className="py-20 bg-black/40 border-y border-white/5">
           <div className="max-w-4xl mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center gap-10 bg-gradient-to-r from-primary/10 to-transparent p-10 rounded-[3rem] border border-primary/20">
                 <div className="h-24 w-24 shrink-0 rounded-3xl bg-primary/20 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-12 w-12" />
                 </div>
                 <div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 italic">ZERO RISCO. LIBERDADE TOTAL.</h3>
                    <p className="text-white/60 leading-relaxed font-medium">
                       Ao contrário de outros sistemas, no AgendarPro **não acreditamos em contratos de fidelização**. Queremos que fique connosco porque o sistema traz resultados, não porque está preso a um contrato.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-6">
                       <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                          <Check className="h-3 w-3 text-primary" /> Sem Taxas de Cancelamento
                       </span>
                       <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                          <Check className="h-3 w-3 text-primary" /> Sem Fidelização
                       </span>
                       <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                          <Check className="h-3 w-3 text-primary" /> Sem Letras Pequenas
                       </span>
                    </div>
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
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">ÚLTIMA OPORTUNIDADE DE <br/><span className="text-primary italic">POUPAR 50%</span></h2>
            <p className="text-white/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
              Clique abaixo, preencha os seus dados e garanta o Plano Premium pelo preço de um almoço. Oferta válida apenas para hoje.
            </p>
            <TrialButton 
              plan="premium" 
              customRedirectUrl="https://buy.stripe.com/bJe4gy3ZY1gxfy66G6bwk05?prefilled_promo_code=LIMITADO50"
              className="rounded-2xl h-24 px-16 text-2xl shadow-[0_20px_50px_rgba(13,148,136,0.3)] hover:shadow-primary/50 hover:-translate-y-2 transition-all font-black uppercase tracking-tighter bg-primary text-white"
            >
              Quero os meus 50% de Desconto
              <Sparkles className="ml-4 h-8 w-8" />
            </TrialButton>
            <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">
              Sem Contratos de Fidelização • Sem Taxas de Saída • Liberdade Total
            </p>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black">
         <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-6 opacity-30">
               <div className="h-4 w-4 rounded-sm overflow-hidden">
                  <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
               </div>
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
