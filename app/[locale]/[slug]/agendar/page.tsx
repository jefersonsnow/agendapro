// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect, use } from "react"
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
  const [bookingComplete, setBookingComplete] = useState(false)
  const [busySlots, setBusySlots] = useState<{ start: Date; end: Date }[]>([])
  const [fetchingSlots, setFetchingSlots] = useState(false)

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
      console.log("Slots brutos recebidos:", rawSlots); // Debug
      
      const parsedSlots = (rawSlots || []).map((slotItem: any) => {
        const processDateMethod = (d: any) => {
          if (!d) return new Date();
          const dateObj = new Date(d);
          if (isNaN(dateObj.getTime())) return new Date();
          
          // Extraímos os componentes de tempo literal (UTC) para criar a data "Wall Clock" local
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

        <p className="text-muted-foreground">
          {t("salonNotFoundDesc")}
        </p>
      </div>
    )
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
        <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("bookingConfirmed")}</h2>

          <p className="text-muted-foreground mb-6">
            {t("bookingSuccessDesc")}
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serviço:</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">
                {selectedDate?.toLocaleDateString("pt-PT", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profissional:</span>
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
            className="w-full"
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
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold uppercase">
                {salon?.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold">{salon?.name}</h2>

                <p className="text-sm text-muted-foreground">{t("newBooking")}</p>
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
                      ? "bg-primary"
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
              <p className="text-muted-foreground">{t("stepServiceDesc")}</p>
            </div>

            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category}>
                <h3 className="font-medium text-muted-foreground mb-3 text-sm uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryServices.map((service) => (
                    <Card
                      key={service.id}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary/50 overflow-hidden",
                        selectedService?.id === service.id && "border-primary ring-2 ring-primary/20"
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
                            <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {service.duration_minutes} min
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-primary ml-4">
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
              <p className="text-muted-foreground">{t("stepStaffDesc")}</p>
            </div>

            <div className="grid gap-3">
              {filteredStaff.map((member) => (
                <Card
                  key={member.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    selectedStaff?.id === member.id && "border-primary ring-2 ring-primary/20"
                  )}
                  onClick={() => {
                    setSelectedStaff(member)
                    setStep("datetime")
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className="h-14 w-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-inner"
                      style={{ backgroundColor: member.color || "#ccc" }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{t("team")} {salon?.name}</p>
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
              <p className="text-muted-foreground">{t("stepDateDesc")}</p>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> {t("selectDay")}
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {getAvailableDates().map((date) => {
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  return (
                    <button
                      key={date.toISOString()}
                      className={cn(
                        "flex-shrink-0 w-16 py-3 rounded-xl border text-center transition-all shadow-sm",
                        isSelected ? "border-primary bg-primary text-white scale-105" : "border-border bg-card hover:border-primary/50"
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
                  <Clock className="h-4 w-4 text-primary" /> {t("availableTimes")}
                </h3>
                {fetchingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <span className="text-sm text-muted-foreground">{t("checkingAgenda")}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {getAvailableTimes().map((time) => (
                      <button
                        key={time}
                        className={cn(
                          "py-3 rounded-lg border text-sm font-semibold transition-all shadow-sm",
                          selectedTime === time ? "border-primary bg-primary text-white" : "border-border bg-card hover:border-primary/50"
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
                        <p className="text-muted-foreground text-sm">{t("noTimes")}</p>
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
              <p className="text-muted-foreground">
                 {infoStepMode === "guest" ? t("identifyBooking") : t("enterPassword")}
              </p>
            </div>

            <Card className="border-2">
              <CardContent className="p-6 space-y-5">
                {infoStepMode === "guest" ? (
                   <>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs uppercase font-bold text-muted-foreground">{t("fullName")}</Label>
                        <Input
                          id="name"
                          value={clientInfo.name}
                          onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                          placeholder="Ex: João Silva"
                          className="h-12 border-2 focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs uppercase font-bold text-muted-foreground">{t("phone")}</Label>
                        <Input
                          id="phone"
                          value={clientInfo.phone}
                          onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                          placeholder="9xx xxx xxx"
                          className="h-12 border-2 focus-visible:ring-primary"
                        />
                      </div>
                   </>
                ) : (
                   <div className="space-y-3">
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col items-center">
                         <p className="font-medium text-lg">{clientInfo.name}</p>
                         <p className="text-sm opacity-60 text-muted-foreground">{clientInfo.phone}</p>
                      </div>
                      <div className="space-y-2 pt-2">
                         <Label htmlFor="password" className="text-xs uppercase font-bold text-muted-foreground">{t("password")}</Label>
                         <Input
                           id="password"
                           type="password"
                           value={passwordInput}
                           onChange={(e) => setPasswordInput(e.target.value)}
                           className="h-12 border-2 focus-visible:ring-primary"
                           autoFocus
                         />
                         {authError && <p className="text-red-500 text-sm font-medium pt-1">{authError}</p>}
                      </div>
                      <Button variant="link" className="px-0 pt-0 text-muted-foreground" onClick={() => { setInfoStepMode("guest"); setPasswordInput(""); setAuthError("") }}>
                         {t("useOtherContact")}
                      </Button>
                   </div>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg"
              disabled={infoStepMode === "guest" ? (!clientInfo.name || !clientInfo.phone) : (!passwordInput)}
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
              <p className="text-muted-foreground">{t("allSet")}</p>
            </div>

            <Card className="border-2 border-primary/20 bg-primary/5 overflow-hidden">
               <div className="bg-primary p-4 text-white text-center">
                  <p className="text-xs uppercase font-bold opacity-80">{t("totalToPay")}</p>
                  <p className="text-3xl font-black">{Number(selectedService?.price).toFixed(2)}€</p>
               </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b pb-2 border-dashed border-primary/20">
                    <span className="text-muted-foreground font-medium">{t("service")}</span>
                    <span className="font-bold text-primary text-right">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2 border-dashed border-primary/20">
                    <span className="text-muted-foreground font-medium">{t("date")}</span>
                    <span className="font-bold text-right">
                      {selectedDate?.toLocaleDateString("pt-PT", { day: "numeric", month: "long" })} às {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">{t("team")}</span>
                    <span className="font-bold text-right">{selectedStaff?.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-16 text-xl font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-transform"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? t("confirming") : t("saveBooking")}
            </Button>
          </div>
        )}
      </main>

      <footer className="py-8 text-center bg-transparent border-t mt-auto">
          <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1 opacity-60">
            {t("techProvider")} <Check className="h-3 w-3" />
          </p>
      </footer>
    </div>
  )
}
