// <title> <meta name="description" content="SEO" /> <Head>
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
  MessageCircle,
  Scissors,
  Percent,
  Globe
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"
import prisma from "@/lib/prisma"

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
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams?.locale || routing.defaultLocale

  const t = await getTranslations({ locale, namespace: "Home" })

  // FETCH GLOBAL CONFIG FOR DYNAMIC CONTENT (Safe Raw Query)
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT * FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
  const globalConfig = configs?.[0]
  const landingPageData = globalConfig?.landing_page ? JSON.parse(globalConfig.landing_page) : {}
  const promotionConfig = globalConfig?.promotion_config ? JSON.parse(globalConfig.promotion_config) : { enabled: false, trial_days: 30, promo_text: "" }

  const isPromoActive = promotionConfig.enabled
  const promoText = promotionConfig.promo_text || "30 Dias de Premium GRÁTIS - Promoção de Lançamento!"
  const promoDays = promotionConfig.trial_days || 30

  const dynamicHeroTitle1 = landingPageData.heroTitle1 || t("heroTitle1")
  const dynamicHeroTitle2 = landingPageData.heroTitle2 || t("heroTitle2")
  const dynamicHeroDesc = landingPageData.heroDesc || t("heroDesc")
  const dynamicFeaturesTitle = landingPageData.featuresTitle || t("featuresTitle")
  const dynamicPlansTitle = landingPageData.plansTitle || t("plansTitle")
  const dynamicPriceBasic = landingPageData.priceBasic || "19"
  const dynamicPricePremium = landingPageData.pricePremium || "49"

  const planConfigs = landingPageData.plans || {
    free: { price: 0, appointments_per_month: 50, staff: 1, clients: 100, services: 3, qr_code: false, logo: false, cover: false, reports: false, commissions: false, professional_export: false },
    basic: { price: dynamicPriceBasic, appointments_per_month: -1, staff: 5, clients: 500, services: 20, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true },
    premium: { price: dynamicPricePremium, appointments_per_month: -1, staff: -1, clients: -1, services: -1, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true }
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
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Navbar com Banner Promocional */}
      <div className="flex flex-col">
        {isPromoActive && (
          <div className="bg-gradient-to-r from-primary via-cyan-600 to-primary bg-[length:200%_auto] animate-gradient-x text-white py-2 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-lg relative z-[60]">
            <div className="container mx-auto px-4 flex items-center justify-center gap-3">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>{promoText}</span>
              <Sparkles className="h-4 w-4 animate-pulse ml-1" />
            </div>
          </div>
        )}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                AgendarPro
              </span>
            </div>

            <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
              <a href="#recursos" className="hover:text-primary transition-colors">{t("navFeatures")}</a>
              <a href="#como-funciona" className="hover:text-primary transition-colors">{t("navHowItWorks")}</a>
              <a href="#planos" className="hover:text-primary transition-colors">{t("navPlans")}</a>
            </nav>

            <div className="flex items-center gap-3">
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

              <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">
                {t("navLogin")}
              </Link>
              <TrialButton className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                {isPromoActive ? `Teste ${promoDays} Dias Grátis` : t("navCta")}
              </TrialButton>
            </div>
          </div>
        </header>
      </div>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          <div className="absolute top-1/4 left-1/4 -z-10 w-96 h-96 bg-primary/20 rounded-full blur-[128px] opacity-70 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 -z-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-[96px] opacity-50"></div>

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>{t("badge")}</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 text-balance mx-auto max-w-5xl leading-[1.1]">
              {dynamicHeroTitle1} <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-500 to-primary animate-gradient-x">
                {dynamicHeroTitle2}
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 text-pretty leading-relaxed">
              {dynamicHeroDesc} <strong className="text-foreground">{t("heroDescStrong")}</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <TrialButton size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-primary/25 hover:shadow-primary/50 hover:-translate-y-1 transition-all">
                {t("heroCta")}
                <ChevronRight className="ml-2 h-5 w-5" />
              </TrialButton>
              <p className="text-sm border border-border bg-background/50 backdrop-blur rounded-full px-6 h-14 flex items-center justify-center text-muted-foreground">
                <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                {t("heroNoCc")}
              </p>
            </div>

            <div className="mt-16 pt-8 border-t border-border/50 max-w-4xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-semibold text-lg"><Users className="h-6 w-6" /> {t("statSalons")}</div>
              <div className="flex items-center gap-2 font-semibold text-lg"><Calendar className="h-6 w-6" /> {t("statBookings")}</div>
              <div className="flex items-center gap-2 font-semibold text-lg"><MessageCircle className="h-6 w-6" /> {t("statWhatsapp")}</div>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section id="como-funciona" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{t("painTitle")}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("painDesc")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {benefits.map((item, i) => (
                <div key={i} className="bg-background rounded-2xl p-8 shadow-lg shadow-black/5 border border-border/50 hover:-translate-y-1 transition-transform group">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="recursos" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{dynamicFeaturesTitle}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("featuresDesc")}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, i) => (
                <div key={i} className="group relative overflow-hidden bg-card rounded-2xl p-8 border hover:border-primary/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <feature.icon className="h-8 w-8 text-primary mb-5" />
                  <h3 className="font-bold text-lg mb-2 relative z-10">{feature.title}</h3>
                  <p className="text-muted-foreground relative z-10">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="planos" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                <Zap className="h-4 w-4" /> {t("plansTag")}
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">{dynamicPlansTitle}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("plansDesc")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
              {/* FREE */}
              <div className="bg-background rounded-3xl p-8 border shadow-sm flex flex-col h-full hover:border-primary/30 transition-all hover:-translate-y-1 duration-300">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{t("planFreeLabel")}</p>
                  <h3 className="text-3xl font-extrabold mb-1">0€<span className="text-lg text-muted-foreground font-medium">/mês</span></h3>
                  <p className="text-muted-foreground text-sm mt-2">{t("planFreeDesc")}</p>
                </div>
                <div className="h-px bg-border mb-6" />
                <ul className="space-y-3 mb-8 flex-1">
                  {getPlanItems(planConfigs.free).map(([item, ok], i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm ${ok ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>
                      <CheckCircle className={`h-4 w-4 shrink-0 ${ok ? "text-primary" : "text-muted-foreground/30"}`} />
                      {item as string}
                    </li>
                  ))}
                </ul>
                <div className="w-full mt-auto">
                  <TrialButton variant="outline" className="w-full h-12 rounded-xl font-bold border-2">{t("planFreeBtn")}</TrialButton>
                </div>
              </div>

              {/* BASIC */}
              <div className="bg-background rounded-3xl p-8 border-2 border-primary/20 shadow-xl shadow-primary/10 flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">⚡ Basic</p>
                  <h3 className="text-3xl font-extrabold mb-1">{planConfigs.basic.price}€<span className="text-lg text-muted-foreground font-medium">/mês</span></h3>
                  <p className="text-muted-foreground text-sm mt-2">{t("planBasicDesc")}</p>
                </div>
                <div className="h-px bg-border mb-6" />
                <ul className="space-y-3 mb-8 flex-1">
                  {getPlanItems(planConfigs.basic).map(([item, ok], i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm ${ok ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>
                      <CheckCircle className={`h-4 w-4 shrink-0 ${ok ? "text-primary" : "text-muted-foreground/30"}`} />
                      {item as string}
                    </li>
                  ))}
                </ul>
                <div className="w-full mt-auto">
                  <TrialButton variant="outline" className="w-full h-12 rounded-xl font-bold border-2 border-primary/40 hover:bg-primary/5">{t("planBasicBtn")}</TrialButton>
                </div>
              </div>

              {/* PREMIUM */}
              <div className="relative rounded-3xl p-px bg-gradient-to-br from-primary via-cyan-500 to-primary shadow-2xl shadow-primary/30 flex flex-col h-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-cyan-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/40">
                    {t("planPremiumBadge")}
                  </div>
                </div>
                <div className="bg-background rounded-[23px] p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">💎 Premium</p>
                  <h3 className="text-3xl font-extrabold mb-1">{planConfigs.premium.price}€<span className="text-lg text-muted-foreground font-medium">/mês</span></h3>
                    <p className="text-muted-foreground text-sm mt-2">{t("planPremiumDesc")}</p>
                  </div>
                  <div className="h-px bg-border mb-6" />
                  <ul className="space-y-3 mb-8 flex-1">
                    {getPlanItems(planConfigs.premium).map(([item, ok], i) => (
                      <li key={i} className={`flex items-center gap-3 text-sm ${ok ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>
                        <CheckCircle className={`h-4 w-4 shrink-0 ${ok ? "text-primary" : "text-muted-foreground/30"}`} />
                        {item as string}
                      </li>
                    ))}
                  </ul>
                  <div className="w-full mt-auto">
                    <TrialButton className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all text-base">
                      <Sparkles className="mr-2 h-5 w-5" />
                      {t("planPremiumBtn")}
                    </TrialButton>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-10">{t("plansNote")}</p>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">{t("ctaTitle")}</h2>
            <p className="text-xl text-muted-foreground mb-10">
              {t("ctaDesc")} <strong>{t("ctaDescStrong")}</strong>
            </p>
            <TrialButton size="lg" className="rounded-full h-16 px-10 text-xl shadow-2xl shadow-primary/30 hover:shadow-primary/60 hover:-translate-y-1 transition-all">
              {t("ctaBtn")}
              <Sparkles className="ml-3 h-6 w-6" />
            </TrialButton>
            <p className="mt-6 text-sm text-muted-foreground">{t("ctaNote")}</p>
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
              <Link href="/admin" className="hover:text-primary transition-colors">Administrador</Link>
              <Link href="/auth/login" className="hover:text-primary transition-colors">Cliente</Link>
              <Link href="/dashboard" className="hover:text-primary transition-colors">Painel de Gestão</Link>
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
}
