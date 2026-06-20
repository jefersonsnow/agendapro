// <title> <meta name="description" content="SEO" /> <Head>
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
  MessageCircle,
  Timer
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"
import prisma from "@/lib/prisma"
import { getGlobalConfigCache } from "@/lib/dal"

const LOCALES = [
  { code: "pt", label: "Português", flag: "pt" },
  { code: "en", label: "English", flag: "gb" },
  { code: "es", label: "Español", flag: "es" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "de", label: "Deutsch", flag: "de" },
]

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string }
}) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const locale = resolvedParams?.locale || routing.defaultLocale

    let t: any
    try {
      t = await getTranslations({ locale, namespace: "Home" })
    } catch (e) {
      console.error("Translation error:", e)
      t = (key: string) => key
    }

    // FETCH GLOBAL CONFIG FOR DYNAMIC CONTENT (Safe Raw Query)
    const config = await getGlobalConfigCache().catch(() => null)
    const landingPageData = config?.landing_page ? JSON.parse(config.landing_page) : {}
    const promoConfig = config?.promotion_config ? JSON.parse(config.promotion_config) : { enabled: false, trial_days: 60, promo_text: "" }
    const dynamicHeroTitle1 = landingPageData.heroTitle1 || t("heroTitle1")
    const dynamicHeroTitle2 = landingPageData.heroTitle2 || t("heroTitle2")
    const dynamicHeroDesc = landingPageData.heroDesc || t("heroDesc")
    const dynamicFeaturesTitle = landingPageData.featuresTitle || t("featuresTitle")
    const dynamicPlansTitle = landingPageData.plansTitle || t("plansTitle")
    const dynamicPriceMinimo = landingPageData.plans?.minimo?.price ?? 19
    const dynamicPriceBasic = landingPageData.plans?.basic?.price ?? (landingPageData.priceBasic || "29")
    const dynamicPricePremium = landingPageData.plans?.premium?.price ?? (landingPageData.pricePremium || "39")

    const planConfigs = {
      minimo: { 
        price: dynamicPriceMinimo ?? 19, 
        appointments_per_month: 50, staff: 1, clients: 100, services: 3, qr_code: false, logo: false, cover: false, reports: false, commissions: false, professional_export: false,
        ...(landingPageData.plans?.minimo || {}) 
      },
      basic: { 
        price: dynamicPriceBasic ?? 29, 
        appointments_per_month: -1, staff: 5, clients: 500, services: 20, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true,
        ...(landingPageData.plans?.basic || {}) 
      },
      premium: { 
        price: dynamicPricePremium ?? 39, 
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

    const features = [
      { icon: Smartphone, title: t("feat1Title"), desc: t("feat1Desc") },
      { icon: Calendar, title: t("feat2Title"), desc: t("feat2Desc") },
      { icon: CheckCircle, title: t("feat3Title"), desc: t("feat3Desc") },
      { icon: BarChart3, title: t("feat4Title"), desc: t("feat4Desc") },
      { icon: Percent, title: t("feat5Title"), desc: t("feat5Desc") },
      { icon: Users, title: t("feat6Title"), desc: t("feat6Desc") },
    ]

    const benefits = [
      { icon: Clock, title: t("benefit1Title"), desc: t("benefit1Desc") },
      { icon: TrendingUp, title: t("benefit2Title"), desc: t("benefit2Desc") },
      { icon: Zap, title: t("benefit3Title"), desc: t("benefit3Desc") },
    ]

    return (
      <div className="theme-magenta min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
        {/* Navbar com Banner Promocional */}
        <div className="flex flex-col">
          {promoConfig.enabled && (
            <div className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x text-primary-foreground py-2.5 px-4 text-center text-xs font-black uppercase tracking-[0.2em] relative z-50 flex items-center justify-center gap-2 shadow-md">
              <Sparkles className="h-4 w-4 animate-pulse shrink-0" />
              <span>{promoConfig.promo_text || `Campanha Especial: ${promoConfig.trial_days || 60} Dias de Premium TOTALMENTE GRÁTIS!`}</span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest backdrop-blur-sm ml-2 animate-bounce">
                Ativo Hoje
              </span>
            </div>
          )}

          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="h-9 w-9 rounded-lg overflow-hidden shadow-lg transition-transform group-hover:scale-105">
                  <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  AgendarPro
                </span>
              </div>
              <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                <Link href="#planos" className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
                  {t("navPlans") || "Planos"}
                </Link>
                <Link href={`/${locale}/parceiros`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
                  Parceiros
                </Link>
                <Link href={`/${locale}/loja`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
                  Loja
                </Link>
                <Link href="./contacto" className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
                  {t("navContact") || "Contacto"}
                </Link>
              </nav>

              <div className="flex items-center gap-4">
                {/* WhatsApp Link */}
                <a 
                  href="https://wa.me/351910664744?text=Olá! Gostaria de saber mais sobre o AgendarPro."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20 hover:scale-110 transition-transform relative group"
                >
                  <MessageCircle className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full mt-3 right-0 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl">
                    Suporte WhatsApp
                  </div>
                </a>

                {/* Language Switcher */}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-primary/5 bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-1.5 grayscale opacity-60">
                      <img 
                        src={`https://flagcdn.com/w40/${locale === 'en' ? 'gb' : locale}.png`} 
                        className="w-4 h-3 object-cover rounded-[1px]" 
                        alt={locale} 
                      />
                    </div>
                    <span className="hidden sm:inline text-xs uppercase font-bold tracking-widest">{locale}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-44 bg-background/95 backdrop-blur border border-border/60 rounded-2xl shadow-xl shadow-black/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                    {LOCALES.map((l) => (
                      <a
                        key={l.code}
                        href={`/${l.code}`}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:text-primary hover:bg-primary/5 ${locale === l.code ? "text-primary bg-primary/5 font-bold" : "text-muted-foreground"}`}
                      >
                        <img 
                          src={`https://flagcdn.com/w40/${l.flag}.png`} 
                          alt={l.label} 
                          className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                        />
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>

        <main className="relative">
          <section id="inicio" className="relative pt-8 pb-8 lg:pt-12 lg:pb-32">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
            <div className="absolute top-[-10%] left-[-10%] -z-10 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] opacity-40"></div>
            <div className="absolute bottom-0 right-[-5%] -z-10 w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px] opacity-30"></div>

            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary mb-8 backdrop-blur-sm uppercase tracking-widest animate-in fade-in slide-in-from-bottom-3 duration-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>{t("badge")}</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 max-w-5xl leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-1000 transform-gpu backface-hidden">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x transform-gpu inline-block pr-[0.1em]">
                    {dynamicHeroTitle1}
                  </span> 
                  <br className="hidden md:block" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-x transform-gpu inline-block pr-[0.1em]">
                    {dynamicHeroTitle2}
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-5 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-5 duration-1000 transform-gpu">
                  {dynamicHeroDesc} <span className="text-foreground font-bold underline decoration-primary/30 underline-offset-4">{t("heroDescStrong")}</span>
                </p>

                {!promoConfig.enabled && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <a 
                      href="#planos"
                      className="inline-flex items-center justify-center rounded-2xl h-16 px-10 text-xl w-full sm:w-auto shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group font-black uppercase tracking-tighter cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {t("heroCta")}
                      <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <div className="flex items-center gap-2 px-6 h-16 rounded-2xl bg-muted/30 border border-border/50 text-muted-foreground font-bold text-sm">
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                      {t("heroNoCc")}
                    </div>
                  </div>
                )}
              </div>

              {/* Dashboard Mockup Display */}
              <div className="relative max-w-6xl mx-auto mt-6 animate-in fade-in zoom-in-95 duration-1000 delay-300">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[2.5rem] blur-2xl opacity-50"></div>
                <div className="relative bg-card border-[8px] border-card rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20">
                  <img 
                    src="/official_dashboard_mockup.png" 
                    alt="AgendarPro - O melhor sistema para salão de beleza e software de agendamento online" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
                 
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 lg:mt-0 lg:absolute lg:-bottom-10 lg:left-1/2 lg:-translate-x-1/2 w-full lg:max-w-4xl z-10">
                <div className="bg-background/80 backdrop-blur-xl p-6 rounded-3xl border shadow-xl flex items-center gap-4 transition-transform hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xl font-black leading-none">{t("statSalons")}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Status</p>
                  </div>
                </div>
                <div className="bg-background/80 backdrop-blur-xl p-6 rounded-3xl border shadow-xl flex items-center gap-4 transition-transform hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xl font-black leading-none">{t("statBookings")}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Disponibilidade</p>
                  </div>
                </div>
                <div className="bg-background/80 backdrop-blur-xl p-6 rounded-3xl border shadow-xl flex items-center gap-4 transition-transform hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xl font-black leading-none">{t("statWhatsapp")}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Precisão</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section id="como-funciona" className="py-16 lg:py-32 bg-muted/20 relative">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-20">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">{t("painTitle")}</h2>
                <p className="text-xl md:text-2xl text-muted-foreground font-medium">{t("painDesc")}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {benefits.map((item, i) => (
                  <div key={i} className="relative group p-10 rounded-[2.5rem] bg-background border border-border/50 hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed opacity-80">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section id="recursos" className="py-32 relative overflow-hidden">
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]"></div>
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mb-20 mx-auto text-center">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-none text-center mx-auto">{dynamicFeaturesTitle}</h2>
                <div className="h-2 w-24 bg-primary rounded-full mb-8 mx-auto"></div>
                <p className="text-xl text-muted-foreground font-medium text-center mx-auto">{t("featuresDesc")}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {features.map((feature, i) => (
                  <div key={i} className="group p-8 rounded-3xl bg-muted/30 border border-transparent hover:bg-background hover:border-primary/20 hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center">
                    <div className="mb-6 h-12 w-12 rounded-xl bg-background flex items-center justify-center border group-hover:border-primary/30 group-hover:text-primary transition-all">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="planos" className="py-32 bg-slate-950 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px]"></div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-24">
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-8 border border-primary/30 backdrop-blur-md">
                  <Zap className="h-4 w-4" /> {t("plansTag")}
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">{dynamicPlansTitle}</h2>
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
                  <TrialButton 
                    plan="minimo" 
                    isTrialActive={promoConfig.enabled}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/80 text-white shadow-xl shadow-primary/20 transition-all"
                  >
                    {promoConfig.enabled ? "Testar 60 Dias Grátis" : t("planFreeBtn")}
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
                  <TrialButton 
                    plan="basic" 
                    isTrialActive={promoConfig.enabled}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/80 text-white shadow-xl shadow-primary/20 transition-all"
                  >
                    {promoConfig.enabled ? "Testar 60 Dias Grátis" : t("planBasicBtn")}
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
                  <TrialButton 
                    plan="premium" 
                    isTrialActive={promoConfig.enabled}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-r from-cyan-600 to-primary hover:from-cyan-500 hover:to-primary/80 text-white shadow-xl shadow-cyan-500/20 transition-all"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {promoConfig.enabled ? "Testar 60 Dias Grátis" : t("planPremiumBtn")}
                  </TrialButton>
                </div>
              </div>

              <p className="text-center text-sm text-slate-500 mt-16 font-medium">{t("plansNote")}</p>
            </div>
          </section>

          {/* CTA Final */}
          <section className="py-40 relative overflow-hidden text-center">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50"></div>
             <div className="container mx-auto px-4 relative z-10">
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10 leading-none">{t("ctaTitle")}</h2>
                <p className="text-2xl md:text-3xl text-muted-foreground font-medium mb-12 max-w-4xl mx-auto">
                   {t("ctaDesc")} <span className="text-foreground font-black underline decoration-primary decoration-4 underline-offset-8">{t("ctaDescStrong")}</span>
                </p>
                <TrialButton size="lg" isTrialActive={promoConfig.enabled} className="rounded-2xl h-20 px-12 text-2xl shadow-[0_20px_50px_rgba(13,148,136,0.3)] hover:shadow-primary/50 hover:-translate-y-2 transition-all font-black uppercase tracking-tighter">
                  {t("ctaBtn")}
                  <Sparkles className="ml-4 h-8 w-8" />
                </TrialButton>
                <p className="mt-8 text-sm text-muted-foreground font-bold tracking-widest uppercase opacity-60 italic">{t("ctaNote")}</p>
             </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg overflow-hidden shadow-lg">
                  <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-xl tracking-tight">AgendarPro</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                <Link href="./termos" className="hover:text-primary transition-colors">{t("footerTerms")}</Link>
                <Link href="./privacidade" className="hover:text-primary transition-colors">{t("footerPrivacy")}</Link>
                <Link href="./contacto" className="hover:text-primary transition-colors">{t("footerContact")}</Link>
              </div>

              <p className="text-sm text-muted-foreground text-center md:text-right">
                &copy; {new Date().getFullYear()} AgendarPro — Desenvolvido por <a href="https://napp.pt" target="_blank" className="hover:text-primary underline transition-all font-bold">Napp Sistemas e Aplicativos Web e Mobile</a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  } catch (error) {
    console.error("TOTAL PAGE RENDER FAILURE:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="h-20 w-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto border border-primary/30">
             <Scissors className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">AgendarPro</h1>
          <p className="text-slate-400">Estamos a realizar uma manutenção rápida para melhorar a sua experiência. Por favor, tente novamente dentro de momentos.</p>
          <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold">
             <Link href="/">Recarregar Página</Link>
          </Button>
        </div>
      </div>
    )
  }
}
