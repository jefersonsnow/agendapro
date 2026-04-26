"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  Zap, 
  Smartphone,
  ChevronRight,
  Scissors,
  Crown,
  ArrowRight,
  Sparkles,
  Timer
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Script from "next/script"
import { getGlobalConfig } from "@/lib/actions/admin"

export default function SalesPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    async function load() {
      try {
        const data = await getGlobalConfig()
        const salesConfig = JSON.parse(data.sales_page_config || "{}")
        setConfig({ sales: salesConfig })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()

    // Timer de escassez (reset a cada 24h ou fixo)
    const interval = setInterval(() => {
      const now = new Date()
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)
      const diff = endOfDay.getTime() - now.getTime()
      
      setTimeLeft({
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2" />
    </div>
  )

  const PLANS = [
    {
      id: "basic",
      name: "Basic",
      price: "9.90",
      desc: "Essencial para profissionais liberais.",
      features: [
        "Agendamentos Ilimitados",
        "Até 5 Profissionais",
        "Página de Reservas Online",
        "Gestão de Clientes",
        "Relatórios Básicos"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: "24.90",
      featured: true,
      desc: "O motor de crescimento para o seu salão.",
      features: [
        "Tudo do plano Basic",
        "Profissionais Ilimitados",
        "Controlo de Comissões",
        "Relatórios de BI Avançados",
        "QR Code de Reserva",
        "Exportação de Dados"
      ]
    },
    {
      id: "elite",
      name: "Elite",
      price: "49.90",
      desc: "Para redes e grandes unidades.",
      features: [
        "Tudo do plano Premium",
        "Multi-Unidades (Redes)",
        "Suporte Prioritário 24/7",
        "Treino de Equipa VIP",
        "Infraestrutura Dedicada"
      ]
    }
  ]

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
          <span>A oferta expira em: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
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
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 transform-gpu italic">
              PARE DE PERDER <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-400 to-primary bg-[length:200%_auto] animate-gradient-x">DINHEIRO</span> COM AGENDAS<br />
              MANUAIS NO WHATSAPP
            </h1>

            <p className="text-lg md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
              A solução definitiva para donos de salões que querem <strong>liberdade</strong>, 
              <strong> controlo total</strong> e uma agenda que trabalha sozinha 24/7.
            </p>

            {/* VSL PLACEHOLDER */}
            <div className="relative group max-w-4xl mx-auto mb-20 animate-in fade-in zoom-in duration-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-cyan-500/50 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 cursor-pointer group/play">
                  <div className="h-24 w-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center backdrop-blur-md transition-all duration-500 group-hover/play:scale-110 group-hover/play:bg-primary/40 group-hover/play:border-primary">
                    <Play className="h-10 w-10 text-white fill-current ml-1" />
                  </div>
                  <span className="font-black uppercase tracking-[0.4em] text-xs text-white/80 group-hover/play:text-white transition-colors">Assista e Descubra</span>
                </div>
              </div>
            </div>

            <a href="#pricing">
              <Button className="h-20 px-12 text-xl font-black uppercase tracking-tighter rounded-2xl bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl shadow-white/10 hover:shadow-primary/40">
                Garantir o Meu Acesso Agora <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </a>
            <div className="mt-6 flex items-center justify-center gap-6 opacity-40 grayscale">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Pagamento Seguro</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4" /> Ativação Instantânea</div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-32 bg-white/5 border-y border-white/5 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic mb-4">ESCOLHA O SEU <span className="text-primary">PLANO</span></h2>
               <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Investimento com retorno garantido</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
               {PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 group",
                      plan.featured 
                        ? "bg-slate-950 border-amber-400 scale-105 z-10 shadow-2xl shadow-amber-400/10" 
                        : "bg-black/40 border-white/10 hover:border-white/20"
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                        Mais Vendido
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className={cn("text-2xl font-black uppercase tracking-widest mb-2", plan.featured ? "text-amber-400" : "text-white")}>
                        {plan.name}
                      </h3>
                      <p className="text-white/40 text-sm font-medium">{plan.desc}</p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black italic">{plan.price}€</span>
                        <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">/mês</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-10 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-white/70">
                          <CheckCircle2 className={cn("h-5 w-5 shrink-0", plan.featured ? "text-amber-400" : "text-primary")} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link href={`/auth/register?plan=${plan.id}`}>
                      <Button className={cn(
                        "w-full h-16 rounded-2xl font-black uppercase tracking-widest transition-all text-xs",
                        plan.featured 
                          ? "bg-amber-400 text-slate-950 hover:bg-amber-500" 
                          : "bg-white/10 text-white hover:bg-white/20"
                      )}>
                        Assinar Agora <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
               ))}
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
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic">PRONTO PARA O <br/><span className="text-primary">PRÓXIMO NÍVEL?</span></h2>
            <p className="text-white/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
              Não deixe para amanhã a organização que o seu negócio precisa hoje. 
              Junte-se à elite dos salões de beleza.
            </p>
            <a href="#pricing">
              <Button className="h-24 px-16 text-2xl font-black uppercase tracking-tighter rounded-full bg-primary text-white hover:bg-white hover:text-black transition-all duration-500 shadow-[0_0_50px_rgba(var(--primary),0.3)]">
                Assinar e Começar Agora
              </Button>
            </a>
            <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
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
