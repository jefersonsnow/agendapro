// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect, use } from "react"
import { toast } from "sonner"
import { getSalonBySlug, getBusySlots, createBooking } from "@/lib/actions/booking"
import { checkClientAccount, loginClient } from "@/lib/actions/client-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Check, ChevronLeft, User, Phone, Mail, MapPin, MessageCircle } from "lucide-react"


import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface Salon {
  id: string
  name: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  cover_url: string | null
  working_hours: any
  settings: any
  timezone: string | null
  requires_email_confirmation: boolean
}

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  category: string
}

interface Staff {
  id: string
  name: string
  avatar_url: string | null
  color: string
  working_hours: any
  serviceIds: string[]  // IDs dos serviços que este profissional realiza
}

type BookingStep = "service" | "staff" | "datetime" | "info" | "confirm"

export default function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const t = useTranslations("Booking")
  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState<BookingStep>("service")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientInfo, setClientInfo] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [infoStepMode, setInfoStepMode] = useState<"guest"|"password">("guest")
  const [authError, setAuthError] = useState("")
  const [checkLoading, setCheckLoading] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [fetchingSlots, setFetchingSlots] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [requiresConfirmation, setRequiresConfirmation] = useState(false)
  const [busySlots, setBusySlots] = useState<{ start: Date; end: Date }[]>([])

  useEffect(() => {
    fetchSalonData()
    const saved = localStorage.getItem(`agendarpro_client_${slug}`)
    if (saved) {
       try { setClientInfo(JSON.parse(saved)) } catch(e) {}
    }
  }, [slug])

  async function fetchSalonData() {
    setLoading(true)
    const salonData = await getSalonBySlug(slug)

    if (!salonData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setSalon(salonData)
    setServices(salonData.services || [])
    setStaff(salonData.staff || [])
    setFilteredStaff(salonData.staff || [])
    setLoading(false)
  }

  useEffect(() => {
    if (selectedDate && selectedStaff && step === "datetime") {
      fetchBusySlots()
    }
  }, [selectedDate, selectedStaff, step])

  async function fetchBusySlots() {
    if (!selectedDate || !selectedStaff) return
    
    setFetchingSlots(true)
    try {
      const rawSlots = await getBusySlots(selectedStaff.id, selectedDate)
      const parsedSlots = (rawSlots || []).map((slotItem: any) => {
        const processDateMethod = (d: any) => {
          if (!d) return new Date();
          const dateObj = new Date(d);
          if (isNaN(dateObj.getTime())) return new Date();
          return new Date(
            dateObj.getUTCFullYear(),
            dateObj.getUTCMonth(),
            dateObj.getUTCDate(),
            dateObj.getUTCHours(),
            dateObj.getUTCMinutes()
          );
        };
        return {
          start: processDateMethod(slotItem.start),
          end: processDateMethod(slotItem.end)
        };
      })
      setBusySlots(parsedSlots)
    } catch (error) {
      console.error("Erro crítico na agenda:", error)
    } finally {
      setFetchingSlots(false)
    }
  }

  const weekDaysMap: Record<number, string> = { 0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday", 4: "thursday", 5: "friday", 6: "saturday" }

  function getAvailableDates() {
    if (!salon) return []
    const dates: Date[] = []
    const today = new Date()
    
    // Debug: console.log("Calculando datas para salão:", salon.name, "Horários:", salon.working_hours);

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const dayKey = weekDaysMap[date.getDay()]
      
      const salonHours = (salon.working_hours as any)?.[dayKey]
      
      // Verificação de segurança: Se for null ou não tiver horário de abertura, pulamos
      if (!salonHours || !salonHours.open || salonHours.enabled === false) {
         continue 
      }

      let dayHours = salonHours
      if (selectedStaff && selectedStaff.working_hours && Object.keys(selectedStaff.working_hours).length > 2) {
        dayHours = (selectedStaff.working_hours as any)[dayKey]
      }
      
      if (dayHours && dayHours.open && dayHours.close && dayHours.enabled !== false) {
        dates.push(date)
      }
    }
    return dates
  }

  async function handleInfoNext() {
    setAuthError("")
    setCheckLoading(true)
    
    if (infoStepMode === "guest") {
       try {
          const acc = await checkClientAccount(salon!.id, clientInfo.phone)
          if (acc.exists && acc.requiresPassword) {
             setInfoStepMode("password")
             setClientInfo(prev => ({ ...prev, name: acc.name || prev.name }))
             setCheckLoading(false)
             return
          }
       } catch(e) {}
       
       setStep("confirm")
    } else {
       try {
          const user = await loginClient(salon!.id, clientInfo.phone, passwordInput)
          setClientInfo({ ...clientInfo, name: user.name || "", phone: user.phone || "", email: user.email || "" })
          localStorage.setItem(`agendarpro_client_${slug}`, JSON.stringify({ name: user.name || "", phone: user.phone || "" }))
          setStep("confirm")
       } catch(e: any) {
          setAuthError(e.message || "Senha incorreta.")
       }
    }
    setCheckLoading(false)
  }

  function getAvailableTimes() {
    if (!selectedDate || !selectedService || !salon) return []
    
    const times: string[] = []
    const now = new Date()
    const salonNowStr = now.toLocaleTimeString('pt-PT', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false, 
      timeZone: salon.timezone || 'Europe/Lisbon' 
    })
    const [nowH, nowM] = salonNowStr.split(':').map(Number)
    
    // Identificar se a data selecionada (do navegador) corresponde ao dia de hoje no salão
    const salonDateStr = now.toLocaleDateString('sv-SE', { timeZone: salon.timezone || 'Europe/Lisbon' })
    const selectedDateStr = selectedDate.toLocaleDateString('sv-SE')
    const isToday = selectedDateStr === salonDateStr

    const dayKey = weekDaysMap[selectedDate.getDay()]
    const salonHours = salon.working_hours?.[dayKey]
    if (!salonHours || salonHours.enabled === false) return [] // O Salão está fechado

    let dayHours = salonHours
    if (selectedStaff && selectedStaff.working_hours && Object.keys(selectedStaff.working_hours).length > 2) {
       dayHours = selectedStaff.working_hours[dayKey]
    }

    if (!dayHours || dayHours.enabled === false) return [] // Staff fechado
    
    let [openH, openM] = dayHours.open.split(":").map(Number)
    let [closeH, closeM] = dayHours.close.split(":").map(Number)

    // Clamp ao horário do Salão (Para nunca sobrepor quando o salão está fisicamente fechado)
    const [salonOpenH, salonOpenM] = salonHours.open.split(":").map(Number)
    const [salonCloseH, salonCloseM] = salonHours.close.split(":").map(Number)

    if (openH < salonOpenH || (openH === salonOpenH && openM < salonOpenM)) {
       openH = salonOpenH
       openM = salonOpenM
    }
    if (closeH > salonCloseH || (closeH === salonCloseH && closeM > salonCloseM)) {
       closeH = salonCloseH
       closeM = salonCloseM
    }

    if (openH > closeH || (openH === closeH && openM >= closeM)) return []

    const slotInterval = salon.settings?.slot_interval || 15
    const serviceDuration = selectedService.duration_minutes

    let breakStartH = -1, breakStartM = -1
    let breakEndH = -1, breakEndM = -1
    if (dayHours.hasBreak && dayHours.breakStart && dayHours.breakEnd) {
      const partsStart = dayHours.breakStart.split(":")
      const partsEnd = dayHours.breakEnd.split(":")
      breakStartH = Number(partsStart[0]); breakStartM = Number(partsStart[1])
      breakEndH = Number(partsEnd[0]); breakEndM = Number(partsEnd[1])
    } else if (!dayHours.hasBreak && dayHours.breakStart !== undefined && typeof dayHours.hasBreak === 'undefined' && dayHours.breakEnd) {
       // Support for old salon format where hasBreak didn't exist
       const partsStart = dayHours.breakStart.split(":")
       const partsEnd = dayHours.breakEnd.split(":")
       breakStartH = Number(partsStart[0]); breakStartM = Number(partsStart[1])
       breakEndH = Number(partsEnd[0]); breakEndM = Number(partsEnd[1])
    }

    for (let hour = openH; hour <= closeH; hour++) {
      for (let min = 0; min < 60; min += slotInterval) {
        if (hour === closeH && min >= closeM) continue
        
        const slotStart = new Date(selectedDate)
        slotStart.setHours(hour, min, 0, 0)
        
        const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)
        
        // 1. Horários no passado (hoje)
        const salonNow = new Date(now.toLocaleString('en-US', { timeZone: salon.timezone || 'Europe/Lisbon' }))
        if (isToday && slotStart <= salonNow) continue

        // 2. Além do fecho
        const closingTime = new Date(selectedDate)
        closingTime.setHours(closeH, closeM, 0, 0)
        if (slotEnd > closingTime) continue

        // 3. Pausa de Almoço / Break Time
        let inBreak = false
        if (breakStartH !== -1 && breakEndH !== -1) {
            const bStart = new Date(selectedDate)
            bStart.setHours(breakStartH, breakStartM, 0, 0)
            const bEnd = new Date(selectedDate)
            bEnd.setHours(breakEndH, breakEndM, 0, 0)

            // Intersection con a pausa
            if (slotStart < bEnd && slotEnd > bStart) {
                inBreak = true
            }
        }
        if (inBreak) continue

        // 4. Reservas Ocupadas
        const hasCollision = busySlots.some((busy: { start: Date; end: Date }) => {
          return (slotStart < busy.end && slotEnd > busy.start)
        })

        if (!hasCollision) {
          times.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`)
        }
      }
    }
    return times
  }

  async function handleSubmit() {
    if (
      !salon ||
      !selectedService ||
      !selectedStaff ||
      !selectedDate ||
      !selectedTime
    )
      return

    setSubmitting(true)

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const startsAt = new Date(selectedDate)
      startsAt.setHours(hours, minutes, 0, 0)
      const endsAt = new Date(
        startsAt.getTime() + selectedService.duration_minutes * 60000
      )

      const res = await createBooking({
        salonId: salon.id,
        serviceId: selectedService.id,
        staffId: selectedStaff.id,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        clientInfo
      })
      if (res?.error) {
        alert("Erro no Agendamento: " + res.error)
        return
      }

      if (res?.success) {
        setBookingComplete(true)
        if (res.requiresConfirmation) {
           setRequiresConfirmation(true)
        }
        toast.success("Reserva realizada com sucesso!")
      } else {
        alert("Ocorreu um problema inesperado ao finalizar a reserva.")
      }

    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error)
      const errorMsg = error.message || "Ocorreu um erro ao fazer a reserva. Tente novamente."
      alert(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  function goBack() {
    const steps: BookingStep[] = ["service", "staff", "datetime", "info", "confirm"]
    const currentIndex = steps.indexOf(step)
    
    if (step === "confirm") {
       const saved = localStorage.getItem(`agendarpro_client_${slug}`)
       if (saved) {
          try {
             const parsed = JSON.parse(saved)
             if (parsed.name && parsed.phone) {
                setStep("datetime")
                return
             }
          } catch(e){}
       }
    }

    // Smart Skip: Se só houver 1 profissional elegivel, voltar de 'datetime' envia direto para 'service'
    if (step === "datetime" && filteredStaff.length === 1) {
       setStep("service")
       return
    }
    
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    } else {
       window.location.href = `/${slug}`
    }
  }

  const groupedServices = services.reduce(
    (acc: Record<string, Service[]>, service: Service) => {
      const cat = service.category || "Outros"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(service)
      return acc
    },
    {} as Record<string, Service[]>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
        <h2 className="text-2xl font-bold mb-2">{t("salonNotFound")}</h2>

        <p className="opacity-60">
          {t("salonNotFoundDesc")}
        </p>
      </div>
    )
  }

  const themes: Record<string, any> = {
    default: { bg: "bg-background", primary: "bg-primary text-white", text: "text-foreground", card: "bg-card border-muted/20", accent: "text-primary", badge: "bg-primary/10 text-primary", button: "rounded-full" },
    dark: { bg: "bg-black text-white", primary: "bg-orange-500 text-black", text: "text-white", card: "bg-[#111111] border-neutral-800", accent: "text-orange-500", badge: "bg-orange-500/10 text-orange-500", button: "rounded-xl" },
    minimal: { bg: "bg-white text-black", primary: "bg-black text-white", text: "text-black", card: "bg-white border-gray-100", accent: "text-black", badge: "bg-gray-100 text-black", button: "rounded-none" },
    retro: { bg: "bg-[#fdf8f4] text-[#4a3427]", primary: "bg-[#8b4513] text-white", text: "text-[#4a3427]", card: "bg-white/60 border-[#8b4513]/20", accent: "text-[#8b4513]", badge: "bg-[#8b4513]/10 text-[#8b4513]", button: "rounded-none font-serif italic" },
    "feminine-modern": { bg: "bg-[#fffafa] text-[#5d4037]", primary: "bg-rose-400 text-white", text: "text-[#5d4037]", card: "bg-white border-rose-50", accent: "text-rose-500", badge: "bg-rose-50 text-rose-600", button: "rounded-3xl" },
    luxury: { bg: "bg-[#050505] text-white", primary: "bg-gradient-to-r from-stone-400 to-stone-100 text-black", text: "text-white", card: "bg-[#0f0f0f] border-stone-800", accent: "text-stone-200", badge: "bg-stone-900 text-stone-100 border border-stone-800", button: "rounded-none uppercase tracking-[0.3em] font-black" },
    safira: { bg: "bg-[#f0f4f8] text-[#102a43]", primary: "bg-[#243b53] text-white", text: "text-[#102a43]", card: "bg-white border-blue-100", accent: "text-[#334e68]", badge: "bg-blue-100 text-blue-900", button: "rounded-2xl" },
    imperial: { bg: "bg-[#f5f3f7] text-[#2d1b3d]", primary: "bg-[#4a1a4c] text-white", text: "text-[#2d1b3d]", card: "bg-white border-purple-100", accent: "text-[#702459]", badge: "bg-purple-100 text-purple-900", button: "rounded-xl border-b-4 border-[#2d1b3d] active:border-b-0" },
    oceano: { bg: "bg-[#f0fdfa] text-[#134e4a]", primary: "bg-[#0d9488] text-white", text: "text-[#134e4a]", card: "bg-white border-teal-100", accent: "text-[#0f766e]", badge: "bg-teal-100 text-teal-900", button: "rounded-full" },
    cyber: { bg: "bg-[#0a0a0f] text-white", primary: "bg-[#00f2ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.5)]", text: "text-white", card: "bg-[#15151e] border-[#00f2ff]/20", accent: "text-[#ff00ea]", badge: "bg-[#ff00ea]/10 text-[#ff00ea] border border-[#ff00ea]/30", button: "rounded-none uppercase italic font-black" },
    forest: { bg: "bg-[#f7fcf5] text-[#1a2e1a]", primary: "bg-[#2d4d2d] text-white", text: "text-[#1a2e1a]", card: "bg-white border-green-100", accent: "text-[#1a2e1a]", badge: "bg-green-100 text-green-900", button: "rounded-lg" },
    sunset: { bg: "bg-[#fff7ed] text-[#7c2d12]", primary: "bg-gradient-to-r from-orange-500 to-rose-500 text-white", text: "text-[#7c2d12]", card: "bg-white/80 backdrop-blur border-orange-100 shadow-xl", accent: "text-rose-600", badge: "bg-orange-100 text-orange-900", button: "rounded-[2rem]" },
    arctic: { bg: "bg-slate-50 text-slate-900", primary: "bg-slate-900 text-white", text: "text-slate-900", card: "bg-white border-slate-200", accent: "text-blue-600", badge: "bg-blue-50 text-blue-700", button: "rounded-sm" },
    onyx: { bg: "bg-[#121212] text-[#e0e0e0]", primary: "bg-[#e0e0e0] text-black", text: "text-[#e0e0e0]", card: "bg-[#1e1e1e] border-neutral-800 shadow-2xl", accent: "text-white", badge: "bg-neutral-800 text-white", button: "rounded-none font-bold tracking-tighter" },
    lavender: { bg: "bg-[#f9f5ff] text-[#42307d]", primary: "bg-[#7f56d9] text-white", text: "text-[#42307d]", card: "bg-white border-purple-100 shadow-lg shadow-purple-500/5", accent: "text-[#6941c6]", badge: "bg-[#f4ebff] text-[#6941c6]", button: "rounded-xl" },
    emerald: { bg: "bg-[#f0fdf4] text-[#064e3b]", primary: "bg-[#059669] text-white", text: "text-[#064e3b]", card: "bg-white border-emerald-100 shadow-[0_10px_25px_rgba(5,150,105,0.1)]", accent: "text-[#047857]", badge: "bg-emerald-100 text-emerald-900", button: "rounded-2xl" }
  }

  const salonTheme = salon?.settings?.theme || "default"
  const themeStyles = themes[salonTheme] || themes.default

  if (bookingComplete) {
    return (
      <div className={cn("min-h-screen flex flex-col items-center justify-center p-4", themeStyles.bg)}>
        <div className={cn("rounded-2xl p-8 max-w-md w-full text-center shadow-lg border", themeStyles.card)}>
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", themeStyles.badge)}>
            <Check className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {requiresConfirmation ? "Agendamento pré-confirmado!" : "Agendamento Realizado!"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {requiresConfirmation 
              ? "Enviamos um e-mail para você. Por favor, clique no link de confirmação para garantir sua reserva."
              : "Sua reserva foi confirmada e já está na agenda do profissional."}
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="opacity-60">Serviço:</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Data:</span>
              <span className="font-medium">
                {selectedDate?.toLocaleDateString("pt-PT", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Hora:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Profissional:</span>
              <span className="font-medium">{selectedStaff?.name}</span>
            </div>
          </div>
          {salon?.settings?.social_whatsapp && (
            <Button
              variant="outline"
              className="w-full mb-3 bg-[#25D366]/5 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] border-[#25D366] font-bold"
              onClick={() => {
                  const phone = salon.settings.social_whatsapp.replace(/\D/g, '')
                  const msg = encodeURIComponent(`Olá! Acabei de agendar através do vosso site.\n\nServiço: ${selectedService?.name}\nData: ${selectedDate?.toLocaleDateString("pt-PT")} às ${selectedTime}\nNome: ${clientInfo.name}`)
                  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Notificar Salão via WhatsApp
            </Button>
          )}
          <Button
            className={cn("w-full h-12 font-bold", themeStyles.primary, themeStyles.button)}
            onClick={() => {
              window.location.href = `/${slug}`
            }}
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen", themeStyles.bg, themeStyles.text)}>
      <header className={cn("border-b sticky top-0 z-10", themeStyles.card, "bg-inherit/90 backdrop-blur-xl")}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className={cn("h-10 w-10 flex items-center justify-center font-bold uppercase overflow-hidden", themeStyles.primary, themeStyles.button)}>
                {salon?.logo_url ? (
                  <img src={salon.logo_url} alt={salon?.name} className="h-full w-full object-cover" />
                ) : (
                  salon?.name.charAt(0)
                )}
              </div>
              <div>
                <h2 className="font-semibold">{salon?.name}</h2>

                <p className="text-sm opacity-60">{t("newBooking")}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          {["service", "staff", "datetime", "info", "confirm"].map(
            (s, index) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    ["service", "staff", "datetime", "info", "confirm"].indexOf(
                      step
                    ) >= index
                      ? themeStyles.primary.split(" ")[0]
                      : "bg-muted"
                  )}
                />
              </div>
            )
          )}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pb-8">
        {step === "service" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-semibold mb-1">{t("stepServiceTitle")}</h2>
              <p className="opacity-70">{t("stepServiceDesc")}</p>
            </div>

            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category}>
                <h3 className="font-medium opacity-60 mb-3 text-sm uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryServices.map((service) => (
                    <Card
                      key={service.id}
                      className={cn(
                        "cursor-pointer transition-all overflow-hidden",
                        themeStyles.card,
                        themeStyles.text,
                        selectedService?.id === service.id ? themeStyles.primary : "hover:opacity-80"
                      )}
                      onClick={() => {
                        setSelectedService(service)
                        // Filtrar profissionais que realizam este serviço
                        const eligible = staff.filter(s => 
                          s.serviceIds && s.serviceIds.includes(service.id)
                        )
                        const staffForService = eligible.length > 0 ? eligible : staff
                        setFilteredStaff(staffForService)


                        if (staffForService.length === 1) {
                           setSelectedStaff(staffForService[0])
                           setStep("datetime")
                        } else {
                           setStep("staff")
                        }
                      }}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm opacity-70 line-clamp-1">{service.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs opacity-60">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {service.duration_minutes} min
                            </span>
                          </div>
                        </div>
                        <p className={cn("text-lg font-bold ml-4", selectedService?.id === service.id ? "text-inherit" : themeStyles.accent)}>
                          {Number(service.price).toFixed(2)}€
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === "staff" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div>
              <h2 className="text-xl font-semibold mb-1">{t("stepStaffTitle")}</h2>
              <p className="opacity-70">{t("stepStaffDesc")}</p>
            </div>

            <div className="grid gap-3">
              {filteredStaff.map((member) => (
                <Card
                  key={member.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    themeStyles.card,
                    themeStyles.text,
                    selectedStaff?.id === member.id ? themeStyles.primary : "hover:opacity-80"
                  )}
                  onClick={() => {
                    setSelectedStaff(member)
                    setStep("datetime")
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={cn("h-14 w-14 flex items-center justify-center text-white text-lg font-bold shadow-inner overflow-hidden", themeStyles.button)}
                      style={{ backgroundColor: !member.avatar_url ? (member.color || "#ccc") : undefined }}
                    >
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{member.name}</h4>
                      <p className="text-sm opacity-70">{t("team")} {salon?.name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === "datetime" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div>
              <h2 className="text-xl font-semibold mb-1">{t("stepDateTitle")}</h2>
              <p className="opacity-70">{t("stepDateDesc")}</p>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className={cn("h-4 w-4", themeStyles.accent)} /> {t("selectDay")}
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {getAvailableDates().map((date) => {
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  return (
                    <button
                      key={date.toISOString()}
                      className={cn(
                        "flex-shrink-0 w-16 py-3 border text-center transition-all shadow-sm",
                        themeStyles.button,
                        isSelected ? themeStyles.primary : cn(themeStyles.card, "hover:opacity-80")
                      )}
                      onClick={() => setSelectedDate(date)}
                    >
                      <p className="text-[10px] uppercase font-bold opacity-80">
                        {date.toLocaleDateString("pt-PT", { weekday: "short" })}
                      </p>
                      <p className="text-xl font-black">{date.getDate()}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="animate-in fade-in duration-500">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className={cn("h-4 w-4", themeStyles.accent)} /> {t("availableTimes")}
                </h3>
                {fetchingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <span className="text-sm opacity-70">{t("checkingAgenda")}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {getAvailableTimes().map((time) => (
                      <button
                        key={time}
                        className={cn(
                          "py-3 border text-sm font-semibold transition-all shadow-sm",
                          themeStyles.button,
                          selectedTime === time ? themeStyles.primary : cn(themeStyles.card, "hover:opacity-80")
                        )}
                        onClick={() => {
                          setSelectedTime(time)
                          const saved = localStorage.getItem(`agendarpro_client_${slug}`)
                          if (saved) {
                             try {
                                const parsed = JSON.parse(saved)
                                if (parsed.name && parsed.phone) {
                                   setStep("confirm")
                                   return
                                }
                             } catch(e){}
                          }
                          setStep("info")
                        }}
                      >
                        {time}
                      </button>
                    ))}
                    {getAvailableTimes().length === 0 && (
                      <div className="col-span-full py-12 text-center bg-muted/50 rounded-2xl border-2 border-dashed">
                        <p className="opacity-70 text-sm">{t("noTimes")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === "info" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div>
              <h2 className="text-xl font-semibold mb-1">
                 {infoStepMode === "guest" ? t("yourDetails") : t("welcomeBack")}
              </h2>
              <p className="opacity-70">
                 {infoStepMode === "guest" ? t("identifyBooking") : t("enterPassword")}
              </p>
            </div>

            <Card className={cn("border-2", themeStyles.card, themeStyles.text)}>
              <CardContent className="p-6 space-y-5">
                {infoStepMode === "guest" ? (
                   <>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs uppercase font-bold opacity-60">{t("fullName")}</Label>
                        <Input
                          id="name"
                          value={clientInfo.name}
                          onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                          placeholder="Ex: João Silva"
                          className={cn("h-12 border-2", themeStyles.card)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs uppercase font-bold opacity-60">{t("phone")}</Label>
                        <Input
                          id="phone"
                          value={clientInfo.phone}
                          onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                          placeholder="9xx xxx xxx"
                          className={cn("h-12 border-2", themeStyles.card)}
                        />
                      </div>
                      {salon?.requires_email_confirmation && (
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs uppercase font-bold opacity-60">{t("email")}</Label>
                          <Input
                            id="email"
                            type="email"
                            value={clientInfo.email}
                            onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                            placeholder="exemplo@email.com"
                            className={cn("h-12 border-2", themeStyles.card)}
                          />
                        </div>
                      )}
                   </>
                ) : (
                   <div className="space-y-3">
                      <div className={cn("p-4 border flex flex-col items-center", themeStyles.badge, themeStyles.button)}>
                         <p className="font-medium text-lg">{clientInfo.name}</p>
                         <p className="text-sm opacity-60 opacity-60">{clientInfo.phone}</p>
                      </div>
                      <div className="space-y-2 pt-2">
                         <Label htmlFor="password" className="text-xs uppercase font-bold opacity-60">{t("password")}</Label>
                         <Input
                           id="password"
                           type="password"
                           value={passwordInput}
                           onChange={(e) => setPasswordInput(e.target.value)}
                           className={cn("h-12 border-2", themeStyles.card)}
                           autoFocus
                         />
                         {authError && <p className="text-red-500 text-sm font-medium pt-1">{authError}</p>}
                      </div>
                      <Button variant="link" className="px-0 pt-0 opacity-60" onClick={() => { setInfoStepMode("guest"); setPasswordInput(""); setAuthError("") }}>
                         {t("useOtherContact")}
                      </Button>
                   </div>
                )}
              </CardContent>
            </Card>

            <Button
              className={cn("w-full h-14 text-lg font-bold shadow-lg", themeStyles.primary, themeStyles.button)}
              disabled={infoStepMode === "guest" ? (!clientInfo.name || !clientInfo.phone || (salon?.requires_email_confirmation && !clientInfo.email)) : (!passwordInput)}
              onClick={handleInfoNext}
            >
              {checkLoading ? t("verify") : (infoStepMode === "guest" ? t("viewSummary") : t("authAndContinue"))}
            </Button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div>
              <h2 className="text-xl font-semibold mb-1">{t("confirmBooking")}</h2>
              <p className="opacity-70">{t("allSet")}</p>
            </div>

            <Card className={cn("border-2 overflow-hidden", themeStyles.card, themeStyles.text)}>
               <div className={cn("p-4 text-white text-center", themeStyles.primary)}>
                  <p className="text-xs uppercase font-bold opacity-80">{t("totalToPay")}</p>
                  <p className="text-3xl font-black">{Number(selectedService?.price).toFixed(2)}€</p>
               </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b pb-2 border-dashed border-primary/20">
                    <span className="opacity-60 font-medium">{t("service")}</span>
                    <span className={cn("font-bold text-right", themeStyles.accent)}>{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2 border-dashed border-primary/20">
                    <span className="opacity-60 font-medium">{t("date")}</span>
                    <span className="font-bold text-right">
                      {selectedDate?.toLocaleDateString("pt-PT", { day: "numeric", month: "long" })} às {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-60 font-medium">{t("team")}</span>
                    <span className="font-bold text-right">{selectedStaff?.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className={cn("w-full h-16 text-xl font-black shadow-xl hover:scale-[1.02] transition-transform", themeStyles.primary, themeStyles.button)}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? t("confirming") : t("saveBooking")}
            </Button>
          </div>
        )}
      </main>

      <footer className="py-8 text-center bg-transparent border-t mt-auto">
          <p className="text-xs opacity-60 font-medium flex items-center justify-center gap-1 opacity-60">
            {t("techProvider")} <Check className="h-3 w-3" />
          </p>
      </footer>
    </div>
  )
}
