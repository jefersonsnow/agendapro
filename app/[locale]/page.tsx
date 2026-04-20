import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  Clock, 
  Scissors, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Zap, 
  Star, 
  Menu, 
  Instagram, 
  Facebook, 
  Globe, 
  MessageCircle,
  Smartphone,
  Percent
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { TrialRegistrationModal } from "@/components/trial-registration-modal"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Home" })

  // FETCH GLOBAL CONFIG FOR DYNAMIC CONTENT (Safe Raw Query)
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT * FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
  const globalConfig = configs?.[0]
  
  let landingPageData: any = {}
  let promotionConfig: any = { enabled: false, trial_days: 30, promo_text: "" }

  try {
    if (globalConfig?.landing_page) landingPageData = JSON.parse(globalConfig.landing_page)
  } catch (e) {
    console.error("Error parsing landingPageData:", e)
  }

  try {
    if (globalConfig?.promotion_config) promotionConfig = JSON.parse(globalConfig.promotion_config)
  } catch (e) {
    console.error("Error parsing promotionConfig:", e)
  }

  const isPromoActive = promotionConfig.enabled
  const promoText = promotionConfig.promo_text || "30 Dias de Premium GRÁTIS - Promoção de Lançamento!"

  // Substituir textos por dados dinâmicos se existirem
  const dynamicHeroTitle1 = landingPageData.heroTitle1 || t("heroTitle1")
  const dynamicHeroTitle2 = landingPageData.heroTitle2 || t("heroTitle2")
  const dynamicHeroDesc = landingPageData.heroDesc || t("heroDesc")

  const LOCALES = [
    { code: "pt", label: "Português", flag: "pt" },
    { code: "en", label: "English", flag: "gb" },
    { code: "es", label: "Español", flag: "es" },
    { code: "fr", label: "Français", flag: "fr" },
    { code: "it", label: "Italiano", flag: "it" },
    { code: "de", label: "Deutsch", flag: "de" },
  ]

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
               <Scissors className="h-5 w-5" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">AgendarPro</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="#features" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest">{t("navFeatures")}</Link>
            <Link href="#como-funciona" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest">{t("navHowItWorks")}</Link>
            <Link href="#planos" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest">{t("navPlans")}</Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative group hidden sm:block">
               <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-primary/5">
                  <div className="flex items-center gap-1.5 grayscale opacity-60">
                     <img src={`https://flagcdn.com/w40/${locale === 'en' ? 'gb' : locale}.png`} className="w-3.5 h-2.5 object-cover rounded-[1px]" alt="" />
                  </div>
                  <span className="hidden sm:inline">{locale}</span>
               </button>
               <div className="absolute right-0 top-full mt-2 w-44 bg-background/95 backdrop-blur border border-border/60 rounded-2xl shadow-xl shadow-black/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-[1000]">
                  {LOCALES.map((l) => (
                     <Link
                        key={l.code}
                        href={`/${l.code}`}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:text-primary hover:bg-primary/5 ${locale === l.code ? "text-primary bg-primary/5 font-extrabold" : "text-muted-foreground"}`}
                     >
                        <img 
                          src={`https://flagcdn.com/w40/${l.flag}.png`} 
                          alt="" 
                          className="w-4 h-3 object-cover rounded-[1px] shadow-sm"
                        />
                        {l.label}
                     </Link>
                  ))}
               </div>
            </div>

            <Link href="/auth/login" className="hidden sm:block">
              <Button variant="ghost" className="font-bold text-sm">
                {t("navLogin")}
              </Button>
            </Link>
            <TrialRegistrationModal>
               <Button className="font-black px-6 shadow-xl shadow-primary/20 h-11 rounded-xl active:scale-95 transition-all">
                 {t("navCta")}
               </Button>
            </TrialRegistrationModal>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full -z-10 animate-pulse" />
        
        <div className="container mx-auto px-4 text-center">
          {/* Promo Badge */}
          {isPromoActive && (
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-8 animate-bounce">
                <Zap className="h-4 w-4 fill-primary" /> {promoText}
             </div>
          )}
          
          <div className="inline-block px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
             ✨ {t("badge")}
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-balance uppercase">
            <span className="text-foreground">{dynamicHeroTitle1}</span><br />
            <span className="text-primary italic">{dynamicHeroTitle2}</span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            {dynamicHeroDesc} <strong className="text-foreground">{t("heroDescStrong")}</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <TrialRegistrationModal>
               <Button size="lg" className="h-16 px-12 text-lg font-black uppercase tracking-tight rounded-2xl shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 w-full sm:w-auto">
                 {t("heroCta")} <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
            </TrialRegistrationModal>
            <div className="flex flex-col items-center sm:items-start gap-1">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ))}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">{t("statSalons")}</span>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-4 text-xs font-bold text-muted-foreground opacity-60">
             <div className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> {t("heroNoCc")}</div>
             <div className="h-4 w-[1px] bg-border" />
             <div className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-green-500" /> GDPRO Compliance</div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 bg-muted/30">
         <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div className="relative group">
                  <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-card border rounded-[2rem] overflow-hidden shadow-2xl">
                     <img 
                       src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2000&auto=format&fit=crop" 
                       alt="Salon Interior" 
                       className="w-full aspect-[4/3] object-cover"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                              <Clock className="h-6 w-6 text-white" />
                           </div>
                           <span className="text-white font-black uppercase tracking-widest text-sm">{t("statBookings")}</span>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="space-y-8">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] uppercase italic">{t("painTitle")}</h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">{t("painDesc")}</p>
                  
                  <div className="grid gap-6">
                     {[
                        { title: t("benefit1Title"), desc: t("benefit1Desc"), icon: Zap, color: "text-amber-500 bg-amber-500/10" },
                        { title: t("benefit2Title"), desc: t("benefit2Desc"), icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10" },
                        { title: t("benefit3Title"), desc: t("benefit3Desc"), icon: ShieldCheck, color: "text-blue-500 bg-blue-500/10" }
                     ].map((b, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-background transition-colors group">
                           <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12 ${b.color}`}>
                              <b.icon className="h-6 w-6" />
                           </div>
                           <div>
                              <h3 className="font-black uppercase tracking-tight text-lg mb-1">{b.title}</h3>
                              <p className="text-muted-foreground leading-snug">{b.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 container mx-auto px-4">
         <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 uppercase leading-none">{t("featuresTitle")}</h2>
            <div className="h-2 w-24 bg-primary mx-auto mb-8 rounded-full" />
            <p className="text-xl text-muted-foreground">{t("featuresDesc")}</p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
               { t: t("feat1Title"), d: t("feat1Desc"), i: Globe, c: "blue" },
               { t: t("feat2Title"), d: t("feat2Desc"), i: Clock, c: "rose" },
               { t: t("feat3Title"), d: t("feat3Desc"), i: Users, c: "amber" },
               { t: t("feat4Title"), d: t("feat4Desc"), i: TrendingUp, c: "emerald" },
               { t: t("feat5Title"), d: t("feat5Desc"), i: Zap, c: "violet" },
               { t: t("feat6Title"), d: t("feat6Desc"), i: ShieldCheck, c: "orange" }
            ].map((f, i) => (
               <div key={i} className="group p-8 rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className={`absolute -top-10 -right-10 h-32 w-32 bg-primary/5 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000`} />
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                     <f.i className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-primary transition-colors">{f.t}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{f.d}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-32 bg-background relative overflow-hidden">
         <div className="absolute top-1/2 left-0 w-full h-[600px] bg-primary/5 -skew-y-6 -z-10" />
         <div className="container mx-auto px-4">
            <div className="text-center mb-20">
               <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">{t("plansTag")}</div>
               <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 uppercase">{t("plansTitle")}</h2>
               <p className="text-xl text-muted-foreground">{t("plansDesc")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
               {/* Free */}
               <div className="bg-card border p-10 rounded-[3rem] flex flex-col hover:border-primary/20 transition-all group">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{t("planFreeLabel")}</h3>
                  <p className="text-muted-foreground mb-8 text-sm">{t("planFreeDesc")}</p>
                  <div className="mb-8 flex items-baseline gap-1">
                     <span className="text-5xl font-black tracking-tighter">0€</span>
                     <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/mês</span>
                  </div>
                  <div className="space-y-4 mb-10 flex-1">
                     {["Página Online", "Agenda Básica", "Base de Clientes"].map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm font-semibold opacity-70 group-hover:opacity-100">
                           <CheckCircle className="h-4 w-4 text-green-500" /> {f}
                        </div>
                     ))}
                  </div>
                  <TrialRegistrationModal>
                     <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">{t("planFreeBtn")}</Button>
                  </TrialRegistrationModal>
               </div>

               {/* Basic */}
               <div className="bg-card border p-10 rounded-[3rem] flex flex-col hover:border-primary/20 transition-all relative group scale-105 shadow-2xl z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary/20">POPULAR</div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Basic</h3>
                  <p className="text-muted-foreground mb-8 text-sm">{t("planBasicDesc")}</p>
                  <div className="mb-8 flex items-baseline gap-1">
                     <span className="text-5xl font-black tracking-tighter">19€</span>
                     <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/mês</span>
                  </div>
                  <div className="space-y-4 mb-10 flex-1">
                     {["Até 3 Profissionais", "Cálculo de Comissões", "Relatórios Financeiros", "Suporte Prioritário"].map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm font-semibold group-hover:scale-105 transition-transform origin-left">
                           <CheckCircle className="h-4 w-4 text-primary" /> {f}
                        </div>
                     ))}
                  </div>
                  <TrialRegistrationModal>
                     <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">{t("planBasicBtn")}</Button>
                  </TrialRegistrationModal>
               </div>

               {/* Premium */}
               <div className="bg-card border p-10 rounded-[3rem] flex flex-col hover:border-primary/20 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                     <h3 className="text-2xl font-black uppercase tracking-tighter">{t("planPremiumBadge")}</h3>
                  </div>
                  <p className="text-muted-foreground mb-8 text-sm">{t("planPremiumDesc")}</p>
                  <div className="mb-8 flex items-baseline gap-1">
                     <span className="text-5xl font-black tracking-tighter">49€</span>
                     <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">/mês</span>
                  </div>
                  <div className="space-y-4 mb-10 flex-1">
                     {["Tudo Ilimitado", "IA para Agendamentos", "Marketing Automatizado", "Gestão Multi-Salão"].map(f => (
                        <div key={f} className="flex items-center gap-3 text-sm font-semibold opacity-70 group-hover:opacity-100">
                           <CheckCircle className="h-4 w-4 text-primary" /> {f}
                        </div>
                     ))}
                  </div>
                  <TrialRegistrationModal>
                     <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest">{t("planPremiumBtn")}</Button>
                  </TrialRegistrationModal>
               </div>
            </div>
            
            <p className="text-center mt-16 text-sm text-muted-foreground font-medium italic">{t("plansNote")}</p>
         </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 container mx-auto px-4">
         <div className="bg-primary rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(var(--primary),0.5)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8 uppercase relative z-10">{t("ctaTitle")}</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed relative z-10">
               {t("ctaDesc")} <strong className="text-white">{t("ctaDescStrong")}</strong>
            </p>
            
            <TrialRegistrationModal>
               <Button size="lg" variant="secondary" className="h-20 px-16 text-xl font-black uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95 transition-all relative z-10">
                  {t("ctaBtn")}
               </Button>
            </TrialRegistrationModal>
            
            <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] opacity-60 relative z-10">{t("ctaNote")}</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t bg-muted/20">
         <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
               <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-black">A</div>
                     <span className="font-black text-xl uppercase tracking-tighter">AgendarPro</span>
                  </div>
                  <p className="text-sm font-bold opacity-40 uppercase tracking-widest">© {new Date().getFullYear()} Napp Sistemas. All Rights Reserved.</p>
               </div>
               
               <div className="flex gap-8">
                  <Link href="/privacidade" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">Privacy</Link>
                  <Link href="/termos" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">Terms</Link>
                  <Link href="/ajuda" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity">Support</Link>
               </div>

               <div className="flex gap-4">
                  {[Instagram, Facebook, MessageCircle].map((Icon, i) => (
                    <div key={i} className="h-10 w-10 rounded-full border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer">
                       <Icon className="h-5 w-5" />
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </footer>
    </div>
  )
}
