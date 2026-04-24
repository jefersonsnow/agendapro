// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TrialButton } from "@/components/trial-button"
import { 
  CheckCircle, 
  Play, 
  Clock, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  Zap, 
  Calendar,
  Smartphone,
  ChevronRight,
  Scissors
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Script from "next/script"
import { getGlobalConfig } from "@/lib/actions/admin"

export default function SalesPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    async function load() {
      try {
        const data = await getGlobalConfig()
        const salesConfig = JSON.parse(data.sales_page_config || "{}")
        const landingConfig = JSON.parse(data.landing_page || "{}")
        setConfig({
           sales: salesConfig,
           landing: landingConfig
        })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!config?.sales?.timerDate) return
    const targetDate = new Date(config.sales.timerDate).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      } else {
        clearInterval(interval)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [config?.sales?.timerDate])

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  const headline = config?.sales?.headline || "Pare de perder clientes porque não conseguiu atender o telemóvel."
  const subheadline = config?.sales?.subheadline || "Descubra como os salões de elite estão a faturar até 3x mais usando um sistema automático de agendamentos online."
  const videoUrl = config?.sales?.videoUrl
  
  const isTimerActive = config?.sales?.timerDate && new Date(config.sales.timerDate).getTime() > new Date().getTime()

  // Track pageview on load if pixel is present (simple implementation)
  // In production, Next.js generic script strategy is better, but this works for client-side injection.

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 overflow-x-hidden font-sans">
      {/* INJECT PIXELS IF EXIST */}
      {config?.sales?.fbPixel && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${config.sales.fbPixel}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
      {config?.sales?.googlePixel && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.sales.googlePixel.split('/')[0]}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.sales.googlePixel.split('/')[0]}');
              `,
            }}
          />
        </>
      )}


      {/* HEADER (Clean, no distractions) */}
      <header className="py-6 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
         <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                  <Scissors className="h-4 w-4 text-white" />
               </div>
               <span className="font-black text-xl tracking-tight">AgendarPro</span>
            </div>
         </div>
      </header>

      {/* URGENCY BANNER */}
      {isTimerActive && (
         <div className="bg-red-600 text-white text-center py-3 px-4 font-bold text-sm sm:text-base animate-in slide-in-from-top flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 shadow-lg shadow-red-600/20">
            <span className="uppercase tracking-widest text-[10px] sm:text-xs">⚠️ Oferta de Lançamento termina em:</span>
            <div className="flex items-center gap-2 tabular-nums">
               <div className="bg-black/20 px-2 py-1 rounded">{String(timeLeft.days).padStart(2, '0')}d</div>
               <span>:</span>
               <div className="bg-black/20 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</div>
               <span>:</span>
               <div className="bg-black/20 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</div>
               <span>:</span>
               <div className="bg-black/20 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</div>
            </div>
         </div>
      )}

      {/* HERO SECTION / VSL */}
      <section className="pt-16 pb-20 px-4 relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-6 text-balance">
               <span className="text-red-500">Atenção:</span> {headline}
            </h1>
            <p className="text-lg sm:text-xl text-white/70 mb-10 text-pretty max-w-3xl mx-auto font-medium leading-relaxed">
               {subheadline}
            </p>

            {/* VSL VIDEO IF CONFIGURED */}
            {videoUrl ? (
               <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 mb-10 group">
                  <iframe 
                    src={videoUrl} 
                    className="w-full h-full absolute inset-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
               </div>
            ) : (
               <div className="w-full max-w-4xl mx-auto aspect-video rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center mb-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale" />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="h-20 w-20 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center relative z-10 cursor-pointer hover:scale-110 transition-transform">
                     <Play className="h-8 w-8 text-primary ml-1" />
                  </div>
               </div>
            )}

            <Link href="/auth/register">
               <Button className="w-full sm:w-auto h-20 px-12 text-xl sm:text-2xl font-black uppercase tracking-tight rounded-2xl shadow-[0_0_40px_rgba(var(--primary),0.4)] hover:shadow-[0_0_60px_rgba(var(--primary),0.6)] hover:-translate-y-1 transition-all animate-pulse-slow">
                  Quero Lotar a Minha Agenda Agora <ChevronRight className="ml-2 h-6 w-6" />
               </Button>
            </Link>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-white/50">
               <ShieldCheck className="h-4 w-4 text-green-500" /> Risco Zero - Teste Grátis de 30 Dias
            </div>
         </div>
      </section>

      {/* SOCIAL PROOF (FAKE/PLACEHOLDER FOR VSL) */}
      <section className="py-20 border-y border-white/5 bg-white/5 relative overflow-hidden">
         <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-center text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-12">O Que Dizem Os Nossos Clientes</h2>
            <div className="grid sm:grid-cols-3 gap-6">
               {[
                  { n: "Marta S.", r: "Aumentei o meu lucro em 40% só no primeiro mês. O sistema trabalha por mim enquanto eu corto cabelo." },
                  { n: "João P.", r: "Já não preciso responder a mensagens à meia-noite. Os clientes marcam sozinhos. Libertador!" },
                  { n: "Sara C.", r: "A melhor decisão para a minha clínica. Passámos a ter lista de espera automática e zero faltas." }
               ].map((t, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                     <div className="flex text-yellow-500 mb-4">
                        {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                     </div>
                     <p className="text-white/80 italic mb-4">"{t.r}"</p>
                     <p className="font-bold text-sm uppercase tracking-widest">{t.n}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* PAIN & SOLUTION */}
      <section className="py-24 px-4 max-w-4xl mx-auto">
         <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
               <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.1]">Você Trabalha Demais e Ganha de Menos?</h2>
               <div className="space-y-4">
                  {[
                     "Perde horas a tentar gerir mensagens de clientes e horários?",
                     "Clientes esquecem-se das marcações e você perde dinheiro?",
                     "Sente que não tem controlo real sobre o lucro do seu salão?"
                  ].map((p, i) => (
                     <div key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 mt-0.5">✕</div>
                        <p className="text-white/70 font-medium leading-relaxed">{p}</p>
                     </div>
                  ))}
               </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/20 to-cyan-600/20 p-8 rounded-3xl border border-primary/30 relative">
               <div className="absolute -top-4 -right-4 h-12 w-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/50">
                  <CheckCircle className="h-6 w-6 text-white" />
               </div>
               <h3 className="text-2xl font-black mb-6">A Solução AgendarPro</h3>
               <div className="space-y-4">
                  {[
                     "Página de reservas online a funcionar 24h por dia, 7 dias por semana.",
                     "Gestão de Múltiplos Profissionais com cálculo de Comissões totalmente automatizado.",
                     "Área de cliente exclusiva, preparada para que eles próprios divulguem o seu salão nas suas redes sociais."
                  ].map((p, i) => (
                     <div key={i} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle className="h-4 w-4" /></div>
                        <p className="text-white/90 font-bold leading-relaxed">{p}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* FINAL CTA & GUARANTEE */}
      <section className="py-24 bg-gradient-to-t from-black to-white/5 border-t border-white/5 px-4 text-center">
         <div className="max-w-3xl mx-auto">
            <ShieldCheck className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-4xl font-black tracking-tighter mb-4">Garantia Risco Zero</h2>
            <p className="text-lg text-white/70 mb-10 leading-relaxed text-balance">
               Temos tanta confiança que o nosso sistema vai mudar a sua vida, que lhe damos <strong className="text-white">30 Dias de Teste Grátis no Plano Premium</strong>. Se não gostar, pode cancelar com um clique. Não pedimos cartão de crédito agora.
            </p>
            <Link href="/auth/register">
               <Button className="w-full sm:w-auto h-20 px-12 text-xl font-black uppercase tracking-tight rounded-2xl bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                  Começar os Meus 30 Dias Grátis Agora
               </Button>
            </Link>
         </div>
      </section>
      
      {/* MINIMAL FOOTER */}
      <footer className="py-6 border-t border-white/5 text-center text-[10px] uppercase font-bold tracking-widest text-white/30">
         &copy; {new Date().getFullYear()} AgendarPro. Todos os direitos reservados.
      </footer>
    </div>
  )
}
