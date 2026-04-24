// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect, use, useRef } from "react"
import { getSalonBySlug } from "@/lib/actions/booking"
import { loginClient, registerClient } from "@/lib/actions/client-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, MapPin, Phone, Mail, ChevronRight, Star, Instagram, Facebook, Check, MessageCircle, ExternalLink, Menu, X, Wifi, Coffee, Car, Wind, ShieldCheck, Users, Baby, Accessibility, Tv, Euro, Globe } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LOCALES = [
  { code: "pt", label: "Português", flag: "pt" },
  { code: "en", label: "English", flag: "gb" },
  { code: "es", label: "Español", flag: "es" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "de", label: "Deutsch", flag: "de" },
]

interface Salon {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  cover_url: string | null
  services: any[]
  settings: {
    theme?: string
    social_instagram?: string
    social_facebook?: string
    social_whatsapp?: string
    gallery_urls?: string[]
    about_link?: string
    amenities?: string[]
    amenities_layout?: string
    amenities_style?: string
    amenities_color?: string
    services_layout?: string
    services_style?: string
  } | null
}

const AMENITY_MAP = {
  wifi: { label: "Wi-Fi", icon: Wifi, color: "text-blue-500" },
  coffee: { label: "Café", icon: Coffee, color: "text-amber-800" },
  parking: { label: "Estacionamento", icon: Car, color: "text-blue-600" },
  ac: { label: "Ar Condicionado", icon: Wind, color: "text-sky-400" },
  hygiene: { label: "Higiene", icon: ShieldCheck, color: "text-emerald-600" },
  staff: { label: "Elite", icon: Users, color: "text-indigo-600" },
  drinks: { label: "Bebidas", icon: Coffee, color: "text-rose-500" },
  tv: { label: "TV/Media", icon: Tv, color: "text-slate-700" },
  kids: { label: "Kids", icon: Baby, color: "text-pink-500" },
  accessible: { label: "Acessível", icon: Accessibility, color: "text-blue-500" },
}

export default function SalonLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const locale = useLocale()
  const t = useTranslations("Landing")
  const tAmenities = useTranslations("Amenities")
  const pathname = usePathname()
  const i18nRouter = useRouter()
  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [clientProfile, setClientProfile] = useState<{name: string, phone: string, email: string} | null>(null)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [regForm, setRegForm] = useState({ name: "", phone: "", email: "", password: "" })
  const [authMode, setAuthMode] = useState<"login"|"register">("login")
  const [authLoading, setAuthLoading] = useState(false)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null)
  const [authError, setAuthError] = useState("")

  useEffect(() => {
    fetchSalonData()
    const saved = localStorage.getItem(`agendarpro_client_${slug}`)
    if (saved) {
       try { setClientProfile(JSON.parse(saved)) } catch(e) {}
    }
  }, [slug])

  async function fetchSalonData() {
    setLoading(true)
    const salonData = await getSalonBySlug(slug, locale)
    if (!salonData) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setSalon(salonData)
    setLoading(false)
  }

  const theme = salon?.settings?.theme || "default"
  const servLayout = salon?.settings?.services_layout || "grid"
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!salon || servLayout !== "carousel" || (salon.services?.length || 0) <= 1) return

    const intervalId = setInterval(() => {
      const el = carouselRef.current
      if (!el) return

      const { scrollLeft, scrollWidth, clientWidth } = el
      
      // Se estiver muito perto do fim, voltar ao início
      if (scrollLeft + clientWidth >= scrollWidth - 50) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        // Encontrar a largura de um item individual (o primeiro filho)
        const firstChild = el.firstElementChild as HTMLElement
        const itemWidth = firstChild?.offsetWidth || clientWidth
        const gap = 32 // gap-8 = 2rem = 32px
        
        el.scrollTo({ left: scrollLeft + itemWidth + gap, behavior: "smooth" })
      }
    }, 10000)

    return () => clearInterval(intervalId)
  }, [servLayout, salon?.services, salon])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  if (notFound || !salon) return <div className="min-h-screen flex flex-col items-center justify-center"><h2>Página não encontrada</h2><Link href="/"> <Button>Voltar</Button> </Link></div>


  const social = salon.settings || {}
  const gallery = salon.settings?.gallery_urls?.filter(url => url !== "") || []
  const selectedAmenities = salon.settings?.amenities || []
  
  // Theme & Layout Config
  const amenLayout = salon.settings?.amenities_layout || "grid"
  const amenStyle = salon.settings?.amenities_style || "card"
  const amenColor = salon.settings?.amenities_color || "theme"
  
  const servStyle = salon.settings?.services_style || "card" 

  const themes: Record<string, any> = {
    default: { bg: "bg-background", heroBg: "bg-primary/5", primary: "bg-primary text-white", card: "bg-card border-muted/20", accent: "text-primary", badge: "bg-primary/10 text-primary", button: "rounded-full", footer: "bg-muted/30 border-t" },
    dark: { bg: "bg-black text-white", heroBg: "bg-orange-600/10", primary: "bg-orange-500 text-black", card: "bg-[#111111] border-neutral-800 shadow-[0_0_40px_rgba(255,80,0,0.05)]", accent: "text-orange-500", badge: "bg-orange-500/10 text-orange-500", button: "rounded-xl", footer: "bg-black border-t-white/10" },
    minimal: { bg: "bg-white text-black", heroBg: "bg-gray-50", primary: "bg-black text-white", card: "bg-white border-gray-100", accent: "text-black", badge: "bg-gray-100 text-black", button: "rounded-none", footer: "bg-gray-50 border-t" },
    retro: { bg: "bg-[#fdf8f4] text-[#4a3427]", heroBg: "bg-[#8b4513]/5", primary: "bg-[#8b4513] text-white", card: "bg-white/60 border-[#8b4513]/20 shadow-[4px_4px_0px_#8b4513]", accent: "text-[#8b4513]", badge: "bg-[#8b4513]/10 text-[#8b4513]", button: "rounded-none font-serif italic", footer: "bg-[#f4ebe1] border-t-2 border-[#8b4513]/20" },
    "feminine-modern": { bg: "bg-[#fffafa] text-[#5d4037]", heroBg: "bg-rose-50", primary: "bg-rose-400 text-white", card: "bg-white border-rose-50", accent: "text-rose-500", badge: "bg-rose-50 text-rose-600", button: "rounded-3xl", footer: "bg-rose-50/30 border-t-rose-100" },
    luxury: { bg: "bg-[#050505] text-white", heroBg: "bg-black", primary: "bg-gradient-to-r from-stone-400 to-stone-100 text-black", card: "bg-[#0f0f0f] border-stone-800 shadow-[0_0_50px_rgba(255,255,255,0.02)]", accent: "text-stone-200", badge: "bg-stone-900 text-stone-100 border border-stone-800", button: "rounded-none uppercase tracking-[0.3em] font-black", footer: "bg-black border-t-stone-800" }
  }

  const themeStyles = themes[theme] || themes.default

  async function handleAuthSubmit(e: React.FormEvent) {
     e.preventDefault()
     setAuthLoading(true)
     setAuthError("")
     
     try {
       let client;
       if (authMode === "login") {
          client = await loginClient(salon!.id, regForm.phone, regForm.password)
       } else {
          client = await registerClient(salon!.id, {
             name: regForm.name,
             phone: regForm.phone,
             email: regForm.email,
             password: regForm.password
          })
       }
       localStorage.setItem(`agendarpro_client_${slug}`, JSON.stringify(client))
       setClientProfile(client as any)
       setIsRegisterOpen(false)
     } catch (err: any) {
       setAuthError(err.message || "Ocorreu um erro no servidor.")
     } finally {
       setAuthLoading(false)
     }
  }

  function handleLogout() {
     localStorage.removeItem(`agendarpro_client_${slug}`)
     setClientProfile(null)
     setRegForm({ name: "", phone: "", email: "", password: "" })
  }

  return (
    <div className={cn("min-h-screen w-full flex flex-col selection:bg-primary/20 overflow-x-hidden", themeStyles.bg)}>
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-inherit/90 backdrop-blur-xl border-b border-inherit px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
         <Link href={`/${slug}`} className="flex items-center gap-2 group">
            {salon.logo_url ? (
               <div className="h-10 w-10 rounded-xl overflow-hidden border shadow-sm">
                  <img src={salon.logo_url} alt={salon.name} className="w-full h-full object-cover" />
               </div>
            ) : (
               <div className={cn("h-10 w-10 flex items-center justify-center font-black rounded-xl", themeStyles.primary)}> {salon.name.charAt(0)} </div>
            )}
            <span className="font-black uppercase tracking-tighter text-base md:text-xl">{salon.name}</span>
         </Link>
         <div className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-widest opacity-60">
            <Link href="#servicos" className="hover:opacity-100 transition-opacity">{t("services")}</Link> 
            <Link href="#galeria" className="hover:opacity-100 transition-opacity">{t("gallery")}</Link> 
            <Link href="#onde-estamos" className="hover:opacity-100 transition-opacity">{t("contact")}</Link>
         </div>
         <div className="flex items-center gap-3">
            <div className="relative group">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-primary/5 bg-muted/20 border border-border/40">
                   <div className="flex items-center gap-1.5 grayscale opacity-60">
                      <img src={`https://flagcdn.com/w40/${locale === 'en' ? 'gb' : locale}.png`} className="w-3.5 h-2.5 object-cover rounded-[1px]" alt="" />
                   </div>
                   <span className="hidden sm:inline uppercase font-bold tracking-widest">{locale}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-44 bg-background/95 backdrop-blur border border-border/60 rounded-2xl shadow-xl shadow-black/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-[1000]">
                   {LOCALES.map((l) => (
                      <button
                         key={l.code}
                         onClick={() => { i18nRouter.replace(pathname, { locale: l.code }); }}
                         className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:text-primary hover:bg-primary/5 ${locale === l.code ? "text-primary bg-primary/5 font-extrabold" : "text-muted-foreground"}`}
                      >
                         <img 
                           src={`https://flagcdn.com/w40/${l.flag}.png`} 
                           alt="" 
                           className="w-4 h-3 object-cover rounded-[1px] shadow-sm"
                         />
                         {l.label}
                      </button>
                   ))}
                </div>
             </div>

            {clientProfile ? (
               <div className="hidden lg:flex items-center gap-4 text-xs">
                  <div>
                     <span className="font-bold opacity-70 block text-right">Olá, {clientProfile.name.split(' ')[0]}</span>
                     <button onClick={handleLogout} className="text-[10px] uppercase font-black opacity-50 hover:opacity-100 hover:text-red-500 transition-all">{t("logout")}</button>
                  </div>
               </div>
            ) : (
               <Button variant="ghost" className="hidden lg:flex text-xs font-black uppercase tracking-widest" onClick={() => setIsRegisterOpen(true)}>
                  {t("login")}
               </Button>
            )}
            <Link href={`/${slug}/agendar`} className="hidden sm:block"> 
               <Button size="sm" className={cn("font-black px-6 shadow-lg active:scale-95 transition-all", themeStyles.primary, themeStyles.button)}>{t("schedule")}</Button> 
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 active:scale-90 bg-inherit border rounded-xl"> <Menu className="h-6 w-6" /> </button>
         </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
         <div className={cn("fixed inset-0 z-[110] flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in-95 duration-200 lg:hidden", themeStyles.bg)}>
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 rounded-full border bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
               <X className="h-6 w-6" />
            </button>
            <div className="flex flex-col items-center gap-8 text-2xl font-black uppercase tracking-widest text-center">
               <Link href="#servicos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">{t("services")}</Link> 
               <Link href="#galeria" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">{t("gallery")}</Link> 
               <Link href="#onde-estamos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary transition-colors">{t("contact")}</Link>
               
               <div className="w-12 h-[2px] bg-border my-2" />
               
               {clientProfile ? (
                 <div className="flex flex-col items-center gap-4">
                   <div className="text-sm border px-6 py-2 rounded-full border-primary/50 text-primary">{t("account")}: {clientProfile.name.split(' ')[0]}</div>
                   <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-sm text-red-500 hover:text-red-400">{t("logout")}</button>
                 </div>
               ) : (
                 <button onClick={() => { setIsRegisterOpen(true); setIsMobileMenuOpen(false); }} className="text-xl font-black uppercase tracking-widest hover:text-primary transition-colors">
                    {t("login")}
                 </button>
               )}

               <div className="flex flex-col items-center gap-3">
                  <span className="text-[10px] opacity-40">{t("changeLanguage")}</span>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                     {["pt", "en", "es", "fr", "it", "de"].map(l => (
                        <button 
                          key={l} 
                          onClick={() => { i18nRouter.replace(pathname, { locale: l }); setIsMobileMenuOpen(false); }} 
                          className={cn(
                            "px-4 py-2 text-xs font-black border rounded-2xl flex items-center gap-2 transition-all active:scale-95", 
                            locale === l ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-background/50 opacity-70"
                          )}
                        >
                           <img src={`https://flagcdn.com/w40/${l === 'en' ? 'gb' : l}.png`} className="w-4 h-3 object-cover rounded-[1px]" alt={`Idioma ${l}`} />
                           {l.toUpperCase()}
                        </button>
                     ))}
                  </div>
               </div>
               
               <Link href={`/${slug}/agendar`} onClick={() => setIsMobileMenuOpen(false)}> 
                  <Button size="lg" className={cn("mt-4 font-black px-12 h-14 shadow-2xl active:scale-95 transition-all text-xl", themeStyles.primary, themeStyles.button)}>
                     {t("book")}
                  </Button> 
               </Link>
            </div>
         </div>
      )}

      {/* Hero */}
      <section className={cn(
        "relative py-16 md:py-40 2xl:py-60 flex items-center overflow-hidden min-h-[50vh] md:min-h-[60vh] 2xl:min-h-[75vh]", 
        themeStyles.heroBg
      )}>
        {salon.cover_url && (
           <div className="absolute inset-0 z-0">
              <img src={salon.cover_url} alt={`Capa de ${salon.name}`} className="w-full h-full object-cover" />

              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
           </div>
        )}
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center md:text-left">
           <div className={cn("mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700")}>
              <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-sm", themeStyles.badge)}>
                 <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" /> {t("excellence")} {salon.name}
              </div>
           </div>
           <h1 className={cn(
             "text-4xl sm:text-6xl md:text-8xl font-black mb-6 md:mb-8 uppercase leading-[0.9] md:leading-[0.8] tracking-tighter text-balance", 
             salon.cover_url ? "text-white" : ""
           )}>
              {salon.name}
           </h1>
           <p className={cn(
             "text-base md:text-2xl font-medium mb-10 md:mb-12 max-w-xl mx-auto md:mx-0 leading-relaxed italic text-pretty", 
             salon.cover_url ? "text-white/80" : "opacity-80"
           )}>
              {salon.description}
           </p>
           <Link href={`/${slug}/agendar`}> 
              <Button size="lg" className={cn("h-14 md:h-24 px-8 md:px-16 text-lg md:text-2xl font-black shadow-2xl transition-all active:scale-95 group w-full sm:w-auto", themeStyles.primary, themeStyles.button)}>
                 {t("bookNow")} <ChevronRight className="ml-2 h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:translate-x-2" />
              </Button> 
           </Link>
        </div>
        <div className="absolute right-[-15%] top-1/2 -translate-y-1/2 text-[35rem] font-black opacity-[0.03] select-none pointer-events-none hidden lg:block text-white">{salon.name}</div>
      </section>

      {/* Amenities Banner */}
      {selectedAmenities.length > 0 && (
        <section className="bg-inherit border-y border-inherit/10 py-12 md:py-20 overflow-hidden">
           <div className="max-w-7xl mx-auto px-0 sm:px-6">
              <div className={cn(
                  "transition-all",
                  amenLayout === "grid" && "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12",
                  amenLayout === "single-line" && "flex flex-wrap justify-center gap-10 md:gap-16",
                  amenLayout === "carousel" && "flex items-center space-x-12 overflow-x-auto no-scrollbar pb-6",
                  amenLayout === "ticker" && "flex items-center min-w-max gap-16 md:gap-24 animate-[ticker_40s_linear_infinite]"
              )}>
                 {(amenLayout === "ticker" ? [...selectedAmenities, ...selectedAmenities, ...selectedAmenities] : selectedAmenities).map((id, index) => {
                    const am = (AMENITY_MAP as any)[id]
                    if (!am) return null
                    const iconColor = amenColor === "original" ? am.color : (amenColor === "monochrome" ? "opacity-40" : "text-primary")
                    return (
                       <div key={`${id}-${index}`} className={cn(
                          "flex flex-col items-center group/item text-center",
                          amenStyle === "card" && "p-8 rounded-[2rem] border border-inherit/10 bg-inherit/10 hover:border-primary/40 transition-all",
                          amenStyle === "badge" && "px-6 py-3 rounded-full border border-inherit/20 flex-row gap-3 hover:border-primary shadow-sm",
                          amenStyle === "minimal" && "gap-3 hover:translate-y-[-4px] transition-all"
                       )}>
                          <div className={cn(
                             "flex items-center justify-center transition-transform group-hover/item:rotate-12",
                             amenStyle === "card" && "h-16 w-16 mb-4 rounded-2xl bg-white/5",
                             amenStyle === "minimal" && "h-10 w-10",
                             amenStyle === "badge" && "h-5 w-5"
                          )}>
                             <am.icon className={cn(amenStyle === "card" ? "h-8 w-8" : "h-6 w-6", iconColor)} />
                          </div>
                          <span className={cn("font-black uppercase tracking-[0.2em] whitespace-nowrap", amenStyle === "card" ? "text-[10px]" : "text-[9px] opacity-70")}>{(tAmenities as any)(id)}</span>
                       </div>
                    )
                 })}
              </div>
           </div>
        </section>
      )}

      {/* Services Section */}
      <section id="servicos" className="py-24 md:py-40 px-6 max-w-7xl w-full mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8 relative z-10">
             <div className="space-y-4 text-center md:text-left">
                <h2 className={cn(
                   "text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] italic",
                   (theme === "dark" || theme === "luxury") ? "text-white" : "text-foreground"
                )}>
                   {t("ourArtTitle")}
                </h2>
                <div className="h-2 md:h-3 w-24 md:w-32 bg-primary rounded-full shadow-lg shadow-primary/30 mx-auto md:mx-0" />
             </div>
             <p className={cn(
                  "max-w-md font-semibold text-center md:text-left uppercase text-[9px] md:text-xs tracking-[0.15em] leading-relaxed mx-auto md:mx-0",
                  (theme === "dark" || theme === "luxury") ? "text-white/90 font-bold" : "opacity-60"
              )}>
                {(salon.settings as any)?.services_subtitles?.[locale] || t("ourArtSubtitle")}
             </p>


          </div>

          <div 
            ref={carouselRef}
            className={cn(
              "transition-all duration-700 w-full",
              servLayout === "grid" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14",
              servLayout === "carousel" && "flex items-stretch gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-10 pb-24 px-6 md:px-0 md:mx-0 overscroll-behavior-x-contain cursor-grab active:cursor-grabbing relative",
              servLayout === "list" && "flex flex-col gap-8 max-w-4xl mx-auto"
            )}
          >
            {salon.services.map((service: any) => (
              <div key={service.id} className={cn(
                "shrink-0 snap-center self-stretch h-auto flex flex-col",
                servLayout === "carousel" && "w-[85vw] sm:w-[350px] lg:w-[380px]"
              )}>
                {servStyle === "compact" ? (
                  /* MODELO COMPACTO */
                  <Card className={cn(
                      "group transition-all duration-500 h-full flex flex-col relative border border-inherit/10 hover:border-primary/30 shadow-sm hover:shadow-md hover:-translate-y-1 overflow-hidden",
                      themeStyles.card,
                      "rounded-[1.5rem]"
                  )}>
                    <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 h-full">
                       <div className="flex-1 space-y-2 text-left">
                          <h3 className={cn(
                             "text-xl font-bold uppercase tracking-tight", 
                             (theme === "luxury" || theme === "dark") ? "text-white" : "text-inherit"
                          )}>
                             {service.name}
                          </h3>
                          <p className={cn(
                             "text-sm line-clamp-2 italic transition-colors",
                             (theme === "dark" || theme === "luxury") ? "text-white/80" : "opacity-60"
                          )}>
                             {service.description || "Técnica avançada para resultados extraordinários."}
                          </p>
                          <div className={cn(
                             "flex items-center gap-4 text-[10px] font-black uppercase tracking-widest pt-1",
                             (theme === "dark" || theme === "luxury") ? "text-white/60" : "opacity-40"
                          )}>
                             <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {service.duration_minutes}m</span>
                          </div>
                       </div>

                       <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-inherit/10">
                          <div className="flex items-start">
                             <span className={cn(
                                "text-3xl font-black tracking-tighter leading-none", 
                                (theme === "luxury" || theme === "dark") ? "text-white" : "text-inherit"
                             )}>
                                {Number(service.price).toFixed(2)}
                             </span>
                             <span className="text-sm font-black opacity-30 ml-0.5">€</span>
                          </div>
                          <Link href={`/${slug}/agendar`} className="flex-1 sm:flex-none">
                             <Button size="sm" className={cn(
                                "w-full font-black text-[10px] uppercase tracking-widest px-6 h-10 shadow-lg active:scale-95 transition-all",
                                themeStyles.primary,
                                themeStyles.button
                             )}>
                                {t("schedule")}
                             </Button>
                          </Link>
                       </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* MODELO DETALHADO (PADRÃO) */
                  <Card className={cn(
                      "group transition-all duration-1000 h-full flex flex-col flex-1 relative border border-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-3",
                      themeStyles.card,
                      "rounded-[3rem]"
                  )}>
                    <CardContent className="p-6 md:p-12 flex flex-col items-center text-center h-full">
                      {/* Title Section - Prominent top center */}
                      <div className="w-full mb-6 md:mb-10 overflow-hidden px-2">
                         <h3 className={cn(
                            "text-2xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9] break-words", 
                            (theme === "luxury" || theme === "dark") ? "text-white" : "text-inherit"
                         )}>
                            {service.name}
                         </h3>
                      </div>

                      {/* Price Section - Stacked center */}
                      <div className="flex flex-col items-center mb-6 md:mb-10 w-full animate-in fade-in zoom-in duration-1000">
                         <p className="text-[9px] md:text-[10px] font-black opacity-30 uppercase tracking-[0.5em] mb-2 md:mb-3">{t("price")}</p>
                         <div className="flex items-start justify-center">
                            <span className={cn(
                               "text-4xl md:text-7xl font-black tracking-tighter leading-none", 
                               (theme === "luxury" || theme === "dark") ? "text-white" : "text-inherit"
                            )}>
                               {Number(service.price).toFixed(2)}
                            </span>
                            <span className="text-xl md:text-2xl font-black opacity-30 ml-1 mt-1">€</span>
                         </div>
                      </div>
                      
                      {/* Description Section - Centered italic */}
                      <div className="flex-1 w-full flex flex-col justify-center mb-8 md:mb-10">
                         <p className={cn(
                            "leading-relaxed font-semibold text-base md:text-lg italic px-2 md:px-8 transition-colors",
                            theme === "luxury" ? "text-white" : (theme === "dark" ? "text-slate-100" : "opacity-60")
                         )}>
                            "{service.description || "Técnica avançada para resultados que transcendem o convencional."}"
                          </p>
                      </div>

                      {/* Footer - Integrated divider and actions */}
                      <div className="w-full pt-8 md:pt-10 border-t border-inherit/10 flex flex-col items-center gap-6 md:gap-8">
                         <div className={cn(
                             "flex items-center gap-10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]",
                             (theme === "dark" || theme === "luxury") ? "text-white/60" : "opacity-40"
                          )}>
                            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {service.duration_minutes}m</span>
                         </div>
                         
                         <Link href={`/${slug}/agendar`} className="w-full">
                            <Button className={cn(
                               "w-full h-16 text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.03] active:scale-95 transition-all group overflow-hidden relative",
                               themeStyles.primary,
                               themeStyles.button
                            )}>
                               <span className="relative z-10 flex items-center justify-center gap-3">
                                  {t("schedule")} <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                               </span>
                               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </Button>
                         </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
            {servLayout === "carousel" && <div className="shrink-0 w-20 md:hidden" />}
          </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="galeria" className="py-24 md:py-40 px-6 bg-inherit/40 overflow-hidden border-y border-inherit/10">
           <div className="max-w-7xl mx-auto">
              <div className="mb-20 text-center">
                 <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">Galeria</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
                 {gallery.map((url, i) => (
                    <div 
                       key={i} 
                       onClick={() => setSelectedGalleryImage(url)}
                       className={cn("aspect-[3/4] relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-all hover:scale-105 hover:rotate-3 group cursor-pointer", i % 2 === 1 ? "md:translate-y-16" : "")}
                    >
                       <img src={url} alt={`Imagem ${i + 1} da Galeria`} className="object-cover w-full h-full transition-transform duration-[2s] group-hover:scale-125" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="border-2 border-white px-6 py-2 rounded-full text-white font-black text-[10px] uppercase tracking-widest shadow-lg">{t("expandImage")}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* Footer */}
      <footer className={cn("py-24 md:py-40 px-8 border-t", themeStyles.footer)}>
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-20">
            <div className="space-y-10 max-w-sm">
               <div className="flex items-center gap-3">
                  {salon.logo_url ? (
                     <div className="h-14 w-14 rounded-2xl overflow-hidden border shadow-sm">
                        <img src={salon.logo_url} alt={`Logótipo de ${salon.name}`} className="w-full h-full object-cover" />
                     </div>
                  ) : (
                     <div className={cn("h-12 w-12 flex items-center justify-center font-black rounded-2xl text-xl", themeStyles.primary)}> {salon.name.charAt(0)} </div>
                  )}
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{salon.name}</h3>
               </div>
               <p className="opacity-60 leading-relaxed font-medium text-lg italic">{salon.description}</p>
               <div className="flex gap-4">
                  {social.social_instagram && <a href={social.social_instagram} target="_blank" className={cn("h-14 w-14 border border-inherit flex items-center justify-center rounded-2xl hover:scale-110 transition-transform shadow-lg", themeStyles.badge)}><Instagram className="h-7 w-7" /></a>}
                  {social.social_facebook && <a href={social.social_facebook} target="_blank" className={cn("h-14 w-14 border border-inherit flex items-center justify-center rounded-2xl hover:scale-110 transition-transform shadow-lg", themeStyles.badge)}><Facebook className="h-7 w-7" /></a>}
                  {social.social_whatsapp && <a href={`https://wa.me/${social.social_whatsapp}`} target="_blank" className="h-14 w-14 bg-green-600/10 border border-green-600/30 text-green-600 flex items-center justify-center rounded-2xl hover:scale-110 transition-transform shadow-lg"><MessageCircle className="h-8 w-8" /></a>}
               </div>
            </div>
            
            <div id="onde-estamos" className="grid grid-cols-1 sm:grid-cols-2 gap-20 w-full lg:w-auto pt-20 lg:pt-0">
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30">{t("locationTitle")}</h4>
                  <div className="space-y-2">
                     <p className="text-2xl font-black leading-none uppercase tracking-tighter">{salon.address?.split(',')[0]}</p>
                     <p className="opacity-50 font-bold uppercase text-[10px] tracking-widest italic">{salon.address}</p>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-primary group cursor-pointer"
                  >
                     <div className="h-12 w-12 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><MapPin className="h-6 w-6" /></div>
                     <span className="font-black text-xs uppercase tracking-widest underline">{t("openGps")}</span>
                  </a>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.5em] opacity-30">{t("quickContact")}</h4>
                  <p className="text-3xl font-black tracking-tighter leading-none">{salon.phone}</p>
                  <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">{t("workingHoursLabel")}</p>
               </div>
            </div>
         </div>
         <div className="mt-40 pt-12 border-t border-inherit/10 text-center flex flex-col md:flex-row justify-between items-center opacity-50 gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest">
               AgendarPro — Desenvolvido por <a href="https://napp.pt" target="_blank" className="hover:text-primary underline transition-all">Napp Sistemas e Aplicativos Web e Mobile</a>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.5em] opacity-40 hover:opacity-100 transition-opacity">
               <a href="https://napp.pt" target="_blank">NAPP.PT</a>
            </span>
         </div>
      </footer>
      
      <style jsx>{`
         @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
         .no-scrollbar::-webkit-scrollbar { display: none; }
         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Conta de Cliente</DialogTitle>
            <DialogDescription>
               Entre na sua conta ou registe-se para gerir as suas marcações.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex bg-muted p-1 rounded-xl mb-2">
             <button type="button" onClick={() => { setAuthMode("login"); setAuthError(""); }} className={cn("flex-1 text-sm font-bold py-2 rounded-lg transition-all", authMode === "login" ? "bg-background shadow-sm" : "opacity-60")}>Entrar</button>
             <button type="button" onClick={() => { setAuthMode("register"); setAuthError(""); }} className={cn("flex-1 text-sm font-bold py-2 rounded-lg transition-all", authMode === "register" ? "bg-background shadow-sm" : "opacity-60")}>Registar Novo</button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
            {authError && <div className="p-3 bg-red-100 text-red-600 text-xs font-bold rounded-lg text-center">{authError}</div>}
            
            {authMode === "register" && (
               <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold">Nome Completo</Label>
                  <Input 
                     required
                     placeholder="Seu nome"
                     value={regForm.name} 
                     onChange={e => setRegForm({...regForm, name: e.target.value})} 
                     className="rounded-xl border-2" 
                  />
               </div>
            )}
            
            <div className="space-y-2">
               <Label className="text-xs uppercase font-bold">Telemóvel</Label>
               <Input 
                  required
                  placeholder="Seu nº de telemóvel"
                  value={regForm.phone} 
                  onChange={e => setRegForm({...regForm, phone: e.target.value})} 
                  className="rounded-xl border-2" 
               />
            </div>
            
            {authMode === "register" && (
               <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold">E-mail (Opcional)</Label>
                  <Input 
                     type="email"
                     placeholder="Seu e-mail"
                     value={regForm.email} 
                     onChange={e => setRegForm({...regForm, email: e.target.value})} 
                     className="rounded-xl border-2" 
                  />
               </div>
            )}

            <div className="space-y-2">
               <Label className="text-xs uppercase font-bold">Palavra-passe</Label>
               <Input 
                  required
                  type="password"
                  placeholder="********"
                  value={regForm.password} 
                  onChange={e => setRegForm({...regForm, password: e.target.value})} 
                  className="rounded-xl border-2" 
               />
            </div>
            
            <div className="pt-4">
               <Button type="submit" className="w-full font-bold h-12 shadow-md" disabled={authLoading}>
                  {authLoading ? "A processar..." : (authMode === "login" ? "Entrar na Conta" : "Registar & Entrar")}
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lightbox Galeria */}
      <Dialog open={!!selectedGalleryImage} onOpenChange={(open) => !open && setSelectedGalleryImage(null)}>
         <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none md:rounded-[2.5rem] flex items-center justify-center">
            <DialogHeader className="sr-only">
               <DialogTitle>Visualização de Imagem - {salon?.name}</DialogTitle>
               <DialogDescription>
                  Vista expandida da imagem da galeria.
               </DialogDescription>
            </DialogHeader>
            <div className="relative w-full h-full flex flex-col items-center justify-center">
               {selectedGalleryImage && (
                 <img 
                    src={selectedGalleryImage} 
                    alt="Galeria Expandida" 
                    className="w-full h-auto max-h-[90vh] object-contain rounded-3xl shadow-2xl border"
                 />
               )}
               <Button 
                  onClick={() => setSelectedGalleryImage(null)}
                  variant="outline"
                  size="icon"
                  className="absolute -top-12 right-0 md:-right-12 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all hover:rotate-90"
               >
                  <X className="h-5 w-5" />
               </Button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  )
}
