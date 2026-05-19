// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { getAgendaInitialData, getAppointments, upsertAppointment, deleteAppointment } from "@/lib/actions/agenda"
import ClientProfileView from "@/components/client-profile-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Scissors,
  X,
  Check,
  AlertTriangle,
  BellRing,
  Coffee,
  ChevronsUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations, useLocale } from "next-intl"

interface Staff {
  id: string
  name: string
  color: string
  is_active: boolean
}

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
  staffIds?: string[]  // IDs dos profissionais que realizam este serviço
}

interface Client {
  id: string
  name: string
  phone: string | null
}

interface Appointment {
  id: string
  starts_at: string
  ends_at: string
  status: string
  price: number
  notes: string | null
  staff_id: string
  client_id: string | null
  service_id: string | null
  staff: Staff
  client: Client | null
  service: Service | null
  is_break?: boolean
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 border-yellow-500/30 text-slate-800 dark:text-slate-200",
  confirmed: "bg-emerald-500/20 border-emerald-500/30 text-slate-800 dark:text-slate-200",
  completed: "bg-[#70a063] text-white shadow-md",
  cancelled: "bg-red-500/20 border-red-500/30 text-slate-800 dark:text-slate-200",
  break: "bg-slate-500/20 border-slate-500/30 text-slate-800 dark:text-slate-200",
}

function MonthlyView({ currentDate, appointments, onDayClick, customStatusColors }: { 
  currentDate: Date, 
  appointments: Appointment[],
  onDayClick: (date: Date) => void,
  customStatusColors: any
}) {
  const t = useTranslations("Agenda")
  const locale = useLocale()
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Segunda como primeiro dia
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - adjustedFirstDay + 1
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return date
  })
  
  const weekdayNames = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, i + 1) // Jan 1st 2024 is a Monday
    return date.toLocaleDateString(locale === 'pt' ? 'pt-PT' : locale, { weekday: 'short' })
  })

  return (
    <div className="bg-background">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekdayNames.map(name => (
          <div key={name} className="p-3 text-center text-[10px] font-black uppercase tracking-widest opacity-50 border-r last:border-r-0">
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const isToday = date.toDateString() === new Date().toDateString()
          const dayAppointments = appointments.filter(apt => new Date(apt.starts_at).toDateString() === date.toDateString())
          
          return (
            <div 
              key={i} 
              onClick={() => isCurrentMonth && onDayClick(date)}
              className={cn(
                "min-h-[100px] p-2 border-r border-b last:border-r-0 relative transition-colors group",
                !isCurrentMonth ? "opacity-20 pointer-events-none bg-muted/20" : "cursor-pointer hover:bg-primary/[0.03]",
                isToday && "bg-primary/[0.05]"
              )}
            >
              <div className="flex justify-between items-start">
                 <span className={cn(
                   "text-sm font-black",
                   isToday ? "text-primary" : "text-muted-foreground/50",
                   !isCurrentMonth && "text-muted-foreground/20"
                 )}>
                   {date.getDate()}
                 </span>
                 
                 {dayAppointments.length > 0 && isCurrentMonth && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                 )}
              </div>
              
              <div className="mt-1 space-y-1">
                  {isCurrentMonth && dayAppointments.slice(0, 2).map(apt => (
                    <div 
                      key={apt.id} 
                      className="text-[9px] font-bold uppercase truncate px-1 py-0.5 rounded border-l-2"
                      style={{
                        backgroundColor: apt.is_break ? customStatusColors.break.bg : (customStatusColors[apt.status]?.bg || customStatusColors.pending.bg),
                        borderColor: apt.is_break ? customStatusColors.break.border : (customStatusColors[apt.status]?.border || customStatusColors.pending.border),
                        color: apt.is_break ? customStatusColors.break.text : (customStatusColors[apt.status]?.text || customStatusColors.pending.text),
                        borderLeftColor: apt.is_break ? "#929292" : (apt.staff?.color || "#0D9488")
                      }}
                    >
                       {apt.is_break ? `PAUSA - ${apt.staff?.name || '?'}` : apt.client?.name}
                    </div>
                  ))}
                 {isCurrentMonth && dayAppointments.length > 2 && (
                    <div className="text-[8px] font-black text-muted-foreground uppercase pl-1">
                       + {dayAppointments.length - 2}
                    </div>
                 )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const t = useTranslations("Agenda")
  const locale = useLocale()
  const fetchCount = useRef(0)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2024, 0, 1)) // Data dummy para hidratação
  const [selectedMobileDate, setSelectedMobileDate] = useState<Date>(new Date(2024, 0, 1))
  const [view, setView] = useState<"day" | "week" | "month">("week")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isProfessional, setIsProfessional] = useState(false)
  const [userRole, setUserRole] = useState<string>("owner")
  const [salonId, setSalonId] = useState<string | null>(null)
  const [workingHours, setWorkingHours] = useState<any>(null)
  const [colorPalette, setColorPalette] = useState<string>("default")
  const [customStatusColors, setCustomStatusColors] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("agenda_status_colors")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error(e)
        }
      }
    }
    return {
      pending: { bg: "rgba(234, 179, 8, 0.15)", border: "rgba(234, 179, 8, 0.4)", text: "#78350f" },
      confirmed: { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.4)", text: "#065f46" },
      completed: { bg: "#70a063", border: "#5a824e", text: "#ffffff" },
      cancelled: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", text: "#7f1d1d" },
      break: { bg: "rgba(107, 114, 128, 0.15)", border: "rgba(107, 114, 128, 0.4)", text: "#374151" }
    }
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all")
  const [filteredStaffForModal, setFilteredStaffForModal] = useState<Staff[]>([])
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  const [isClientComboboxOpen, setIsClientComboboxOpen] = useState(false)
  const [clientSearchQuery, setClientSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    staff_id: "",
    service_id: "",
    client_id: "",
    date: "",
    time: "09:00",
    notes: "",
    status: "pending",
    quick_name: "", // Campo para novo cliente
    is_break: false,
  })
  const [now, setNow] = useState(new Date())

  // const supabase = createClient() // Removido

  useEffect(() => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedMobileDate(today)
    fetchInitialData()

    const timer = setInterval(() => setNow(new Date()), 60000)

    // Ouvinte para o AutoRefresh global
    const handleRefresh = () => {
      fetchAppointments()
    }
    window.addEventListener("next-refresh", handleRefresh)

    return () => {
      clearInterval(timer)
      window.removeEventListener("next-refresh", handleRefresh)
    }
  }, []) // Removida dependência salonId para evitar loop e re-execução desnecessária

  useEffect(() => {
    if (salonId) {
      fetchAppointments()
    }
  }, [currentDate, salonId, view, selectedStaffFilter])

  async function fetchInitialData() {
    try {
      const data = await getAgendaInitialData()
      if (data) {
        setSalonId(data.salonId)
        setWorkingHours(data.workingHours)
        setColorPalette(data.colorPalette || "default")
        setStaff(data.staff || [])
        setFilteredStaffForModal(data.staff || [])
        setServices(data.services || [])
        setClients(data.clients || [])
        setIsProfessional(data.isProfessional || false)
        setUserRole(data.userRole || "owner")
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais da agenda:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAppointments() {
    if (!salonId) return
    
    const currentFetchId = ++fetchCount.current

    try {
      let startDate: Date;
      let endDate: Date;

      if (view === "month") {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        endDate.setHours(23, 59, 59, 999)
      } else {
        startDate = getStartOfWeek(currentDate)
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 7)
      }

      const data = await getAppointments(startDate, endDate, selectedStaffFilter)
      
      if (currentFetchId !== fetchCount.current) return
      
      // APENAS atualiza se recebermos um array válido. 
      // Se data for null ou undefined (erro no servidor), preservamos os dados atuais.
      if (Array.isArray(data)) {
        setAppointments(data)
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
      // No caso de erro (ex: 500 do servidor), NÃO limpamos o estado.
      // Isso evita que a agenda fique vazia do nada.
    }
  }

  // Algoritmo de Layout para Agendamentos Sobrepostos
  const appointmentsWithLayout = useMemo(() => {
    if (!appointments.length) return []

    // 1. Agrupar por data literal (YYYY-MM-DD)
    const appointmentsByDay: Record<string, Appointment[]> = {}
    appointments.forEach(apt => {
        const d = new Date(apt.starts_at)
        const dayStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
        if (!appointmentsByDay[dayStr]) appointmentsByDay[dayStr] = []
        appointmentsByDay[dayStr].push(apt)
    })

    const result: any[] = []

    Object.values(appointmentsByDay).forEach(dayApts => {
        // Ordenar por hora de início
        const sorted = [...dayApts].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
        
        // 2. Agrupar em "ilhas" de colisão
        const islands: Appointment[][] = []
        let currentIsland: Appointment[] = []
        let islandEnd: number = 0

        sorted.forEach(apt => {
            const start = new Date(apt.starts_at).getTime()
            const end = new Date(apt.ends_at).getTime()

            if (currentIsland.length > 0 && start >= islandEnd) {
                islands.push(currentIsland)
                currentIsland = []
            }

            currentIsland.push(apt)
            islandEnd = Math.max(islandEnd, end)
        })
        if (currentIsland.length > 0) islands.push(currentIsland)

        // 3. Processar cada ilha para determinar colunas
        islands.forEach(island => {
            const columns: Appointment[][] = []
            
            island.forEach(apt => {
                const start = new Date(apt.starts_at).getTime()
                let placed = false
                
                for (let i = 0; i < columns.length; i++) {
                    const lastInCol = columns[i][columns[i].length - 1]
                    if (new Date(lastInCol.ends_at).getTime() <= start) {
                        columns[i].push(apt)
                        placed = true
                        break
                    }
                }

                if (!placed) {
                    columns.push([apt])
                }
            })

            const numCols = columns.length
            columns.forEach((col, colIdx) => {
                col.forEach(apt => {
                    result.push({
                        ...apt,
                        width: 100 / numCols,
                        left: (colIdx * 100) / numCols
                    })
                })
            })
        })
    })

    return result
  }, [appointments])

  const hours = useMemo(() => {
    if (!workingHours || typeof workingHours !== 'object') return Array.from({ length: 12 }, (_, i) => i + 8)
    
    let min = 24
    let max = 0
    let commonBreakStart = -1
    let commonBreakEnd = -1

    try {
      Object.values(workingHours).forEach((day: any) => {
        if (day && typeof day === 'object' && day.open) {
          const hOpen = parseInt(day.open.split(':')[0])
          const hClose = parseInt(day.close.split(':')[0])
          if (!isNaN(hOpen) && hOpen < min) min = hOpen
          if (!isNaN(hClose) && hClose > max) max = hClose

          if (day.breakStart && day.breakEnd) {
             commonBreakStart = parseInt(day.breakStart.split(':')[0])
             commonBreakEnd = parseInt(day.breakEnd.split(':')[0])
          }
        }
      })
    } catch (e) {
      console.error("Erro ao iterar workingHours:", e)
    }

    if (min >= max) return Array.from({ length: 12 }, (_, i) => i + 8)

    // Identificar horas que têm agendamentos (para não esconder dados existentes)
    const hoursWithAppointments = new Set<number>()
    appointments.forEach(apt => {
       const start = new Date(apt.starts_at)
       hoursWithAppointments.add(start.getUTCHours())
    })

    // Gerar lista de horas filtrando a pausa se ela existir em todos os dias (ou for significativa)
    // MAS mantém a hora se houver um agendamento lá
    const result = []
    for (let h = min; h < max; h++) {
       const isBreakHour = h === commonBreakStart && commonBreakStart !== -1
       const hasAppointment = hoursWithAppointments.has(h)

       if (isBreakHour && !hasAppointment) {
          continue // Pula apenas se for pausa E não houver agendamento
       }
       result.push(h)
    }
    return result
  }, [workingHours, appointments])

  function getStartOfWeek(date: Date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  function getWeekDays() {
    const startOfWeek = getStartOfWeek(currentDate)
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(date.getDate() + i)
      return date
    })
  }

  function navigateWeek(direction: number) {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + direction)
    } else {
      newDate.setDate(newDate.getDate() + direction * 7)
    }
    setCurrentDate(newDate)
    
    const newMobileDate = new Date(selectedMobileDate)
    newMobileDate.setDate(newMobileDate.getDate() + direction * 7)
    setSelectedMobileDate(newMobileDate)
  }

  function navigateDay(direction: number) {
    const newDate = new Date(selectedMobileDate)
    newDate.setDate(newDate.getDate() + direction)
    setSelectedMobileDate(newDate)
    
    const currentStartOfWeek = getStartOfWeek(currentDate)
    const newStartOfWeek = getStartOfWeek(newDate)
    if (currentStartOfWeek.getTime() !== newStartOfWeek.getTime()) {
      setCurrentDate(newDate)
    }
  }

  function openCreateDialog(date?: Date, hour?: number, minute: number = 0) {
    setSelectedAppointment(null)
    const selectedDate = date || new Date()
    
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const localDateStr = `${year}-${month}-${day}`

    const minuteStr = minute.toString().padStart(2, "0")

    // Reset sem pré-selecção de serviço ou profissional
    setFilteredStaffForModal(staff)
    setFormData({
      staff_id: "",
      service_id: "",
      client_id: "",
      date: localDateStr,
      time: hour 
        ? `${hour.toString().padStart(2, "0")}:${minuteStr}` 
        : "09:00",
      notes: "",
      status: "pending",
      quick_name: "",
      is_break: false,
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(appointment: Appointment) {
    setSelectedAppointment(appointment)
    const date = new Date(appointment.starts_at)
    
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const localDateStr = `${year}-${month}-${day}`

    setFormData({
      staff_id: appointment.staff_id,
      service_id: appointment.service_id || "",
      client_id: appointment.client_id || "",
      date: localDateStr,
      time: date.toISOString().slice(11, 16),
      notes: appointment.notes || "",
      status: appointment.status,
      quick_name: "", 
      is_break: appointment.is_break || false,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!salonId) return

    const startsAt = new Date(`${formData.date}T${formData.time}`)
    let endsAtTime = ""

    if (formData.is_break) {
      // Para pausas, a duração é o que estiver no "service_id" (que abusamos para guardar a duração em minutos)
      const duration = parseInt(formData.service_id) || 15
      const endsAtDateObj = new Date(startsAt.getTime() + duration * 60000)
      endsAtTime = `${String(endsAtDateObj.getHours()).padStart(2, '0')}:${String(endsAtDateObj.getMinutes()).padStart(2, '0')}`
    } else {
      const service = services.find((s: any) => s.id === formData.service_id)
      if (!service) return
      const endsAtDateObj = new Date(startsAt.getTime() + service.duration_minutes * 60000)
      endsAtTime = `${String(endsAtDateObj.getHours()).padStart(2, '0')}:${String(endsAtDateObj.getMinutes()).padStart(2, '0')}`
    }

    try {
      const result = await upsertAppointment(selectedAppointment?.id || null, {
        staff_id: formData.staff_id,
        service_id: formData.service_id,
        client_id: formData.client_id,
        starts_at: `${formData.date}T${formData.time}:00`,
        ends_at: `${formData.date}T${endsAtTime}:00`, 
        price: formData.is_break ? 0 : (services.find(s => s.id === formData.service_id)?.price || 0),
        notes: formData.notes,
        status: formData.is_break ? "confirmed" : formData.status,
        is_break: formData.is_break,
        quick_name: formData.quick_name,
        local_time: formData.time // Campo extra para segurança na validação
      })

      if (result?.success) {
        setIsDialogOpen(false)
        fetchAppointments()
      } else {
        alert(result?.error || t("errorSaving"))
      }
    } catch (error: any) {
      console.error("Erro ao salvar agendamento:", error)
      alert(t("errorCritical"))
    }
  }

  const handleQuickBreak = async (duration: number) => {
    if (!salonId) return
    
    const targetStaffId = formData.staff_id || (filteredStaffForModal[0]?.id || "")
    if (!targetStaffId) {
      alert("Selecione um profissional primeiro.")
      return
    }

    const startsAt = new Date(`${formData.date}T${formData.time}`)
    const endsAtDateObj = new Date(startsAt.getTime() + duration * 60000)
    const endsAtTime = `${String(endsAtDateObj.getHours()).padStart(2, '0')}:${String(endsAtDateObj.getMinutes()).padStart(2, '0')}`

    try {
      const result = await upsertAppointment(null, {
        staff_id: targetStaffId,
        service_id: duration.toString(),
        client_id: "",
        starts_at: `${formData.date}T${formData.time}:00`,
        ends_at: `${formData.date}T${endsAtTime}:00`, 
        price: 0,
        notes: "Pausa rápida",
        status: "confirmed",
        is_break: true,
        local_time: formData.time
      })

      if (result?.success) {
        setIsDialogOpen(false)
        fetchAppointments()
      } else {
        alert(result?.error || t("errorSaving"))
      }
    } catch (error: any) {
      console.error("Erro ao salvar pausa:", error)
    }
  }

  async function handleDelete() {
    if (!selectedAppointment) return
    if (!confirm(t("deleteConfirm"))) return

    const result = await deleteAppointment(selectedAppointment.id)
    if (result && !result.success) {
      alert(result.error)
      return
    }
    
    setIsDialogOpen(false)
    fetchAppointments()
  }

  const weekDays = useMemo(() => getWeekDays(), [currentDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-2 flex flex-col min-h-[calc(100vh-90px)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden sm:block">
           <div className="flex items-center gap-4">
              <div>
                 <h1 className="text-lg font-bold tracking-tight leading-none">{t("title")}</h1>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{t("subtitle")}</p>
              </div>
              
              <div className="flex bg-muted/80 p-1 rounded-2xl border border-muted-foreground/10 shadow-inner">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                       "h-8 text-[10px] uppercase font-black px-4 rounded-xl transition-all duration-300",
                       view === 'week' ? "bg-card text-primary shadow-md scale-[1.02]" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setView('week')}
                 >
                    {t("week")}
                 </Button>
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                       "h-8 text-[10px] uppercase font-black px-4 rounded-xl transition-all duration-300",
                       view === 'month' ? "bg-card text-primary shadow-md scale-[1.02]" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setView('month')}
                 >
                    {t("month")}
                 </Button>
              </div>
           </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {salonId && !isProfessional && staff.length > 1 && (
               <div className="mr-2">
                  <Select value={selectedStaffFilter} onValueChange={setSelectedStaffFilter}>
                     <SelectTrigger className="h-9 w-[130px] sm:w-[180px] rounded-xl border-muted-foreground/20 text-[10px] sm:text-xs font-bold uppercase">
                        <User className="mr-2 h-3 w-3 opacity-50" />
                        <SelectValue placeholder="Profissional" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all" className="text-xs uppercase font-bold">{t("allProfessionals") || "Todos"}</SelectItem>
                        {staff.map((s) => (
                           <SelectItem key={s.id} value={s.id} className="text-xs uppercase font-bold">
                              {s.name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
            )}
            <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)} className="hidden sm:flex">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date()
                setCurrentDate(today)
                setSelectedMobileDate(today)
              }}
              className="px-2 sm:px-4"
            >
              {t("today")}
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateWeek(1)} className="hidden sm:flex">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" onClick={() => openCreateDialog()}>
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">{t("newAppointment")}</span>
            <span className="xs:hidden">{t("new")}</span>
          </Button>
        </div>
      </div>

      <div className="sm:hidden flex flex-col gap-3">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tighter">
              {selectedMobileDate.toLocaleDateString(locale === 'pt' ? 'pt-PT' : locale, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-1">
               <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}>
                 <ChevronLeft className="h-5 w-5" />
               </Button>
               <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}>
                  <ChevronRight className="h-5 w-5" />
               </Button>
            </div>
         </div>
         <div className="flex justify-between items-center bg-muted/30 p-1 rounded-2xl border border-muted-foreground/10 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => {
               const d = new Date(selectedMobileDate)
               d.setDate(d.getDate() + (i - 2))
               const isSelected = d.toDateString() === selectedMobileDate.toDateString()
               const isToday = d.toDateString() === new Date().toDateString()
               
               return (
                  <button
                    key={i}
                    onClick={() => {
                       setSelectedMobileDate(d)
                       // Garantir que carregamos a semana se o dia clicado for de outra semana
                       const currentWS = getStartOfWeek(currentDate).getTime()
                       const nextWS = getStartOfWeek(d).getTime()
                       if (currentWS !== nextWS) {
                          setCurrentDate(d)
                       }
                    }}
                    className={cn(
                       "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all grow",
                       isSelected ? "bg-primary text-primary-foreground shadow-md scale-105" : "hover:bg-muted/50",
                       !isSelected && isToday && "text-primary font-bold"
                    )}
                  >
                    <span className="text-[10px] uppercase font-bold opacity-70">
                       {d.toLocaleDateString(locale === 'pt' ? 'pt-PT' : locale, { weekday: 'short' }).slice(0, 3)}
                    </span>
                    <span className="text-base font-black leading-none mt-1">
                       {d.getDate()}
                    </span>
                  </button>
               )
            })}
         </div>
      </div>

      <Card className={cn(
        "hidden sm:flex flex-col flex-1 overflow-hidden",
        (colorPalette !== "default" && colorPalette !== "esmeralda") 
          ? "relative border-none shadow-sm bg-primary/[0.03] rounded-3xl" 
          : "shadow-sm border bg-card"
      )}>
        <CardContent className={cn(
          "p-0 overflow-x-auto flex-1",
          (colorPalette !== "default" && colorPalette !== "esmeralda") ? "relative z-10" : ""
        )}>
          <div className="min-w-[800px]">
            {view === 'week' ? (
              <div className={cn("grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b", (colorPalette !== "default" && colorPalette !== "esmeralda") ? "border-primary/10" : "")}>
                <div className={cn("p-3 border-r", (colorPalette !== "default" && colorPalette !== "esmeralda") ? "border-primary/10 bg-transparent" : "bg-muted/50")}></div>
                {weekDays.map((date, i) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isGlass = colorPalette !== "default" && colorPalette !== "esmeralda"
                  return (
                    <div
                      key={i}
                      className={cn(
                        "p-3 text-center border-r last:border-r-0 transition-colors",
                        isGlass ? "border-primary/10 backdrop-blur-sm" : "",
                        isToday ? (isGlass ? "bg-primary/20" : "bg-primary/5") : (isGlass ? "bg-transparent hover:bg-primary/5" : "")
                      )}
                    >
                      <p className={cn(
                        "text-sm", 
                        isGlass ? "font-bold uppercase tracking-widest" : "text-muted-foreground",
                        isToday && isGlass ? "text-primary" : (isGlass ? "text-muted-foreground/70" : "")
                      )}>
                        {date.toLocaleDateString(locale === 'pt' ? 'pt-PT' : locale, { weekday: "short" })}
                      </p>
                      <p
                        className={cn(
                          isGlass ? "text-2xl font-black mt-1" : "text-lg font-semibold",
                          isToday ? (isGlass ? "text-primary drop-shadow-md" : "text-primary") : "text-foreground"
                        )}
                      >
                        {date.getDate()}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <MonthlyView 
                currentDate={currentDate} 
                appointments={appointments} 
                onDayClick={(date) => {
                  setCurrentDate(date)
                  setView('week')
                }}
                customStatusColors={customStatusColors}
              />
            )}
            
            {view === 'week' && (
              <div className="relative flex flex-col h-full min-h-max flex-1">
                {/* Background Time Slots */}
                <div className="flex flex-col flex-1">
                  {hours.map((hour) => (
                    <div key={hour} className={cn("grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b last:border-b-0 h-[110px]", (colorPalette !== "default" && colorPalette !== "esmeralda") ? "border-primary/5" : "")}>
                      <div className={cn(
                        "p-2 text-sm border-r flex items-start justify-center",
                        (colorPalette !== "default" && colorPalette !== "esmeralda") 
                          ? "font-bold text-muted-foreground/60 border-primary/10 bg-transparent" 
                          : "text-muted-foreground bg-muted/50"
                      )}>
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                      {weekDays.map((date, dayIndex) => {
                      const isPastHour = new Date(date).setHours(hour, 0, 0, 0) < new Date().getTime()
                      const isGlass = colorPalette !== "default" && colorPalette !== "esmeralda"
                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            "relative border-r last:border-r-0 group",
                            isGlass ? "border-primary/5 backdrop-blur-sm" : "",
                            date.toDateString() === new Date().toDateString() ? (isGlass ? "bg-primary/[0.08]" : "bg-primary/[0.05]") : (isGlass ? "bg-transparent" : "bg-primary/[0.02]"),
                            isPastHour 
                              ? (isGlass ? "bg-muted/10 cursor-not-allowed grayscale opacity-60" : "bg-muted/40 cursor-not-allowed grayscale opacity-60 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0tMjAgMjBsNDAgLTQweiIvPjxwYXRoIGQ9Ik0wIDQwbDQwIC00MHoiLz48cGF0aCBkPSJNMjAgNjBsNDAgLTQweiIvPjwvZz48L3N2Zz4=')]") 
                              : (isGlass ? "cursor-pointer hover:bg-primary/10 transition-colors" : "cursor-pointer hover:bg-primary/10 transition-colors")
                          )}
                          onClick={() => !isPastHour && openCreateDialog(date, hour, 0)}
                        >
                          {!isPastHour && (
                            <div className="absolute inset-x-1.5 inset-y-1 flex flex-col gap-0.5 pointer-events-none group-hover:pointer-events-auto">
                              {[0, 15, 30, 45].map((m) => (
                                <button
                                  key={m}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openCreateDialog(date, hour, m)
                                  }}
                                  className="flex-1 rounded-full border border-primary/5 bg-primary/[0.01] hover:bg-primary/10 transition-all flex items-center justify-center pointer-events-auto group/pill"
                                >
                                  <span className="text-[9px] font-bold text-muted-foreground/30 group-hover/pill:text-primary/60 transition-colors">
                                    {hour.toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
                </div>

                {/* Overlapping Appointments Layer */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-[60px_repeat(7,minmax(0,1fr))] h-full">
                  <div className="col-start-1" />
                  {weekDays.map((date, dayIdx) => (
                    <div key={dayIdx} className="relative h-full" style={{ gridColumnStart: dayIdx + 2 }}>
                      {appointmentsWithLayout
                        .filter(apt => {
                          const d = new Date(apt.starts_at)
                          return d.getUTCFullYear() === date.getFullYear() &&
                                 d.getUTCMonth() === date.getMonth() &&
                                 d.getUTCDate() === date.getDate()
                        })
                        .map((apt: any) => {
                          const start = new Date(apt.starts_at)
                          const end = new Date(apt.ends_at)
                          const startHour = start.getUTCHours()
                          const hourIndex = hours.indexOf(startHour)
                          if (hourIndex === -1) return null

                          const startMinutes = (hourIndex * 60) + start.getUTCMinutes()
                          const durationMinutes = (end.getTime() - start.getTime()) / 60000
                          
                          const percentPerMinute = 100 / (hours.length * 60)
                          const top = startMinutes * percentPerMinute
                          const height = durationMinutes * percentPerMinute

                          return (
                            <div
                              key={apt.id}
                              className={cn(
                                "absolute z-20 rounded-md border border-border/40 overflow-hidden shadow-sm backdrop-blur-[2px] transition-all cursor-pointer group hover:scale-[1.02] pointer-events-auto",
                                durationMinutes <= 15 ? "p-0.5 pt-0.5" : "pt-1 px-1.5 pb-1.5"
                              )}
                              style={{
                                top: `${top}%`,
                                height: `${height}%`,
                                left: `${apt.left}%`,
                                width: `${apt.width - 1}%`,
                                borderLeftWidth: '6px',
                                borderLeftColor: apt.is_break ? "#929292" : (apt.staff?.color || "#0D9488"),
                                backgroundColor: apt.is_break ? customStatusColors.break.bg : (customStatusColors[apt.status]?.bg || customStatusColors.pending.bg),
                                borderTopColor: apt.is_break ? customStatusColors.break.border : (customStatusColors[apt.status]?.border || customStatusColors.pending.border),
                                borderRightColor: apt.is_break ? customStatusColors.break.border : (customStatusColors[apt.status]?.border || customStatusColors.pending.border),
                                borderBottomColor: apt.is_break ? customStatusColors.break.border : (customStatusColors[apt.status]?.border || customStatusColors.pending.border),
                                color: apt.is_break ? customStatusColors.break.text : (customStatusColors[apt.status]?.text || customStatusColors.pending.text),
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditDialog(apt)
                              }}
                            >
                              <div className="flex flex-col h-full gap-1">
                                <span className={cn(
                                  "font-black opacity-90 truncate uppercase leading-none",
                                  durationMinutes <= 15 ? "text-[7px]" : "text-[9px] xl:text-[11px]"
                                )}>
                                  {apt.is_break ? `PAUSA - ${apt.staff?.name || '?'}` : (apt.client?.name || "CLIENTE")}
                                </span>
                                
                                {(() => {
                                  const isOverdue = !apt.is_break && (apt.status !== 'completed' && apt.status !== 'cancelled') && end < now
                                  const isUnconfirmedSoon = !apt.is_break && apt.status === 'pending' && start > now && start < new Date(now.getTime() + 60 * 60 * 1000)
                                  
                                  if (isOverdue) return (
                                    <div className={cn(
                                      "flex items-center gap-1 font-black uppercase text-red-600 animate-pulse mt-auto bg-red-100/50 rounded px-1 py-0.5",
                                      durationMinutes <= 15 ? "text-[6px]" : "text-[8px]"
                                    )}>
                                      <AlertTriangle className={cn(durationMinutes <= 15 ? "h-1.5 w-1.5" : "h-2 w-2")} />
                                      <span>Pendente</span>
                                    </div>
                                  )
                                  
                                  if (isUnconfirmedSoon) return (
                                    <div className={cn(
                                      "flex items-center gap-1 font-black uppercase text-orange-600 animate-bounce mt-auto bg-orange-100/50 rounded px-1 py-0.5",
                                      durationMinutes <= 15 ? "text-[6px]" : "text-[8px]"
                                    )}>
                                      <BellRing className={cn(durationMinutes <= 15 ? "h-1.5 w-1.5" : "h-2 w-2")} />
                                      <span>Confirmar?</span>
                                    </div>
                                  )
                                  
                                  return null
                                })()}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="sm:hidden relative mt-6">
         {/* Background Grid (30-min Slots) */}
         <div className="space-y-0">
            {hours.flatMap(h => [0, 30]).map((minute, idx) => {
               const hour = hours[Math.floor(idx / 2)]
               const isPast = new Date(selectedMobileDate).setHours(hour, minute, 0, 0) < new Date().getTime()
               
               return (
                  <div key={`${hour}-${minute}`} className={cn(
                     "flex gap-4 h-[45px] relative",
                     minute === 30 && "border-b border-muted-foreground/5"
                  )}>
                     {/* Hour Label (Only on the hour) */}
                     <div className="w-10 shrink-0 flex flex-col items-center">
                        <span className="text-[10px] font-black text-muted-foreground/40 leading-none mt-1">
                           {minute === 0 ? `${hour.toString().padStart(2, "0")}:00` : ""}
                        </span>
                        <div className="w-[1px] grow bg-muted-foreground/5 my-1" />
                     </div>
                     
                     {/* Empty Slot (30-min precision) */}
                     <div className="grow relative flex items-center">
                        <button
                           disabled={isPast}
                           onClick={() => openCreateDialog(selectedMobileDate, hour, minute)}
                           className={cn(
                              "w-full h-[32px] rounded-xl border border-dashed border-primary/10 bg-primary/[0.03] flex items-center justify-center text-primary/30 hover:bg-primary/10 hover:text-primary/60 transition-all",
                              isPast && "opacity-0 pointer-events-none"
                           )}
                        >
                           <Plus className="h-3 w-3" />
                           <span className="ml-1 text-[9px] font-bold opacity-0 hover:opacity-100 transition-opacity">
                              {hour.toString().padStart(2, "0")}:{minute.toString().padStart(2, "0")}
                           </span>
                        </button>
                     </div>
                  </div>
               )
            })}
         </div>

         {/* Appointments Overlay */}
         <div className="absolute top-0 right-2 bottom-0 left-[56px] pointer-events-none">
            {appointmentsWithLayout
               .filter(apt => {
                  const d = new Date(apt.starts_at)
                  return d.getUTCFullYear() === selectedMobileDate.getFullYear() &&
                         d.getUTCMonth() === selectedMobileDate.getMonth() &&
                         d.getUTCDate() === selectedMobileDate.getDate()
               })
               .map((apt: any) => {
                   const start = new Date(apt.starts_at)
                   const end = new Date(apt.ends_at)
                   const startHour = start.getUTCHours()
                   const hourIndex = hours.indexOf(startHour)
                   
                   if (hourIndex === -1) return null

                  const startMinutes = (hourIndex * 60) + start.getUTCMinutes()
                   const durationMinutes = (end.getTime() - start.getTime()) / 60000
                   
                   const top = (startMinutes / 60) * 90
                   const height = (durationMinutes / 60) * 90
                   const aptClass = apt.is_break ? statusColors.break : (statusColors[apt.status] || statusColors.pending)

                   return (
                      <div
                         key={apt.id}
                         onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(apt)
                         }}
                         className={cn(
                            "absolute z-20 rounded-xl border-l-[4px] shadow-sm transition-all active:scale-[0.98] group overflow-hidden bg-opacity-95 backdrop-blur-[1px] pointer-events-auto cursor-pointer",
                             durationMinutes <= 15 ? "p-0.5 pt-0.5" : "pt-1 px-1.5 pb-1.5"
                         )}
                         style={{ 
                            left: `${apt.left}%`,
                            width: `${apt.width}%`,
                            top: `${top + 4}px`, 
                            height: `${height - 8}px`, 
                            borderLeftColor: apt.is_break ? "#929292" : (apt.staff?.color || "#0D9488"),
                            backgroundColor: apt.is_break ? customStatusColors.break.bg : (customStatusColors[apt.status]?.bg || customStatusColors.pending.bg),
                            borderTopColor: apt.is_break ? customStatusColors.break.border : (customStatusColors[apt.status]?.border || customStatusColors.pending.border),
                            borderRightColor: apt.is_break ? customStatusColors.break.border : (customStatusColors[apt.status]?.border || customStatusColors.pending.border),
                            borderBottomColor: apt.is_break ? customStatusColors.break.border : (customStatusColors[apt.status]?.border || customStatusColors.pending.border),
                            color: apt.is_break ? customStatusColors.break.text : (customStatusColors[apt.status]?.text || customStatusColors.pending.text),
                         }}
                     >
                        <div className={cn(
                           "flex gap-1.5 min-w-0 flex-1 overflow-hidden px-1",
                           durationMinutes <= 15 ? "items-start" : "items-center"
                        )}>
                           <span className={cn(
                              "font-black opacity-90 truncate uppercase leading-none",
                              durationMinutes <= 15 ? "text-[7.5px]" : (apt.width < 100 ? "text-[9px]" : "text-[14px]")
                           )}>
                               {apt.is_break ? `PAUSA - ${apt.staff?.name || '?'}` : apt.client?.name}
                           </span>
                           <div className={cn("w-1 h-1 rounded-full shrink-0", apt.is_break ? "bg-white/20" : "bg-black/10")} />
                           <span className={cn(
                              "font-bold uppercase tracking-tighter shrink-0 opacity-70",
                              durationMinutes <= 15 ? "text-[6.5px]" : (apt.width < 100 ? "text-[8px]" : "text-[10px]")
                           )}>
                              {start.getUTCHours().toString().padStart(2, "0")}:{start.getUTCMinutes().toString().padStart(2, "0")} {t("to")} {end.getUTCHours().toString().padStart(2, "0")}:{end.getUTCMinutes().toString().padStart(2, "0")}
                           </span>
                           
                           {(() => {
                                 const isOverdue = !apt.is_break && (apt.status !== 'completed' && apt.status !== 'cancelled') && end < now
                                 const isUnconfirmedSoon = !apt.is_break && apt.status === 'pending' && start > now && start < new Date(now.getTime() + 60 * 60 * 1000)
                                
                                if (isOverdue) return (
                                  <div className="flex items-center bg-red-500 rounded-full p-1 animate-pulse shadow-lg ml-auto shrink-0 z-30">
                                    <AlertTriangle className="h-3 w-3 text-white" />
                                  </div>
                                )
                                
                                if (isUnconfirmedSoon) return (
                                  <div className="flex items-center bg-orange-500 rounded-full p-1 animate-bounce shadow-lg ml-auto shrink-0 z-30">
                                    <BellRing className="h-3 w-3 text-white" />
                                  </div>
                                )
                                
                                return null
                           })()}
                        </div>
                        
                        {/* Linha Indicadora de Duração */}
                        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-black/5" />
                     </div>
                  )
               })}
         </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-sm mt-4 items-center bg-muted/20 px-4 py-2.5 rounded-2xl border w-fit">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mr-2">Cores da Agenda:</span>
        {Object.entries(customStatusColors).map(([statusKey, config]: [string, any]) => (
          <Popover key={statusKey}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform bg-background/50 hover:bg-background border px-3 py-1.5 rounded-xl shadow-sm">
                <div 
                  className="w-3.5 h-3.5 rounded-md border shadow-sm transition-all"
                  style={{ 
                    backgroundColor: config.bg, 
                    borderColor: config.border 
                  }} 
                />
                <span className="hover:text-primary transition-colors">{statusKey === 'completed' ? t('legendCompleted') : (statusKey === 'break' ? 'Pausa' : t(statusKey))}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 rounded-2xl shadow-xl z-50 border bg-card">
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider mb-2">Alterar Cor - {statusKey === 'completed' ? t('legendCompleted') : (statusKey === 'break' ? 'Pausa' : t(statusKey))}</div>
                
                {/* Predefined Beautiful Color Palettes */}
                <div className="grid grid-cols-5 gap-2">
                  {[
                    // Emerald / Slate
                    { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.4)", text: "#065f46" },
                    // Amber / Yellow
                    { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", text: "#78350f" },
                    // Red / Rose
                    { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", text: "#7f1d1d" },
                    // Blue / Cyan
                    { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)", text: "#1e3a8a" },
                    // Sky Blue / Cyan (Compliance with Purple Ban)
                    { bg: "rgba(14, 165, 233, 0.15)", border: "rgba(14, 165, 233, 0.4)", text: "#0369a1" },
                    // Pink / Fuchsia
                    { bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.4)", text: "#701a75" },
                    // Teal
                    { bg: "rgba(20, 184, 166, 0.15)", border: "rgba(20, 184, 166, 0.4)", text: "#115e59" },
                    // Orange
                    { bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.4)", text: "#7c2d12" },
                    // Gray / Slate
                    { bg: "rgba(107, 114, 128, 0.15)", border: "rgba(107, 114, 128, 0.4)", text: "#374151" },
                    // Green solid
                    { bg: "#70a063", border: "#5a824e", text: "#ffffff" },

                    // --- NEW 10 COLORS ---
                    // Indigo Blue
                    { bg: "rgba(79, 70, 229, 0.15)", border: "rgba(79, 70, 229, 0.4)", text: "#312e81" },
                    // Lime Green
                    { bg: "rgba(132, 204, 22, 0.15)", border: "rgba(132, 204, 22, 0.4)", text: "#3f6212" },
                    // Rose / Ruby Red
                    { bg: "rgba(225, 29, 72, 0.15)", border: "rgba(225, 29, 72, 0.4)", text: "#9f1239" },
                    // Cyan / Ocean
                    { bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.4)", text: "#155e75" },
                    // Bronze / Coffee Brown
                    { bg: "rgba(120, 53, 4, 0.12)", border: "rgba(120, 53, 4, 0.35)", text: "#78350f" },
                    // Muted Forest Green
                    { bg: "rgba(21, 128, 61, 0.15)", border: "rgba(21, 128, 61, 0.4)", text: "#14532d" },
                    // Gold / Warm Yellow
                    { bg: "rgba(202, 138, 4, 0.15)", border: "rgba(202, 138, 4, 0.4)", text: "#713f12" },
                    // Cool Gray / Silver
                    { bg: "rgba(148, 163, 184, 0.15)", border: "rgba(148, 163, 184, 0.4)", text: "#1e293b" },
                    // Solid Crimson Red
                    { bg: "#d93838", border: "#b82828", text: "#ffffff" },
                    // Solid Deep Teal
                    { bg: "#0d9488", border: "#0f766e", text: "#ffffff" }
                  ].map((colorOpt, i) => (
                    <button
                      key={i}
                      className="w-8 h-8 rounded-lg border hover:scale-110 active:scale-95 transition-transform"
                      style={{ backgroundColor: colorOpt.bg, borderColor: colorOpt.border }}
                      onClick={() => {
                        const newColors = {
                          ...customStatusColors,
                          [statusKey]: colorOpt
                        }
                        setCustomStatusColors(newColors)
                        localStorage.setItem("agenda_status_colors", JSON.stringify(newColors))
                      }}
                    />
                  ))}
                </div>



                {/* Reset button */}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-[10px] uppercase font-black tracking-widest h-8"
                  onClick={() => {
                    const defaults: any = {
                      pending: { bg: "rgba(234, 179, 8, 0.15)", border: "rgba(234, 179, 8, 0.4)", text: "#78350f" },
                      confirmed: { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.4)", text: "#065f46" },
                      completed: { bg: "#70a063", border: "#5a824e", text: "#ffffff" },
                      cancelled: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", text: "#7f1d1d" },
                      break: { bg: "rgba(107, 114, 128, 0.15)", border: "rgba(107, 114, 128, 0.4)", text: "#374151" }
                    }
                    const newColors = {
                      ...customStatusColors,
                      [statusKey]: defaults[statusKey]
                    }
                    setCustomStatusColors(newColors)
                    localStorage.setItem("agenda_status_colors", JSON.stringify(newColors))
                  }}
                >
                  Restaurar Padrão
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>


      {/* Appointment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          "max-w-[95vw] sm:max-w-md transition-all duration-500 rounded-3xl overflow-hidden p-0 border-none shadow-2xl",
          formData.client_id && !selectedAppointment?.is_break && "max-w-[95vw] md:max-w-5xl sm:max-w-2xl"
        )}>
          {selectedAppointment?.is_break ? (
            <div className="w-full bg-background p-6 md:p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Coffee className="h-6 w-6 text-muted-foreground" /> Pausa Programada
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Este horário está bloqueado para <span className="font-bold text-foreground">{selectedAppointment.staff?.name}</span>.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3 pt-6">
                {(userRole === "owner" || userRole === "manager") && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-12 rounded-xl w-full shadow-lg shadow-destructive/20 font-bold"
                    onClick={handleDelete}
                  >
                    Remover Pausa
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-xl w-full font-bold"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[85vh] w-full overflow-y-auto md:overflow-hidden">
            {/* Perfil do Cliente (CRM) - Visível apenas se houver um cliente selecionado */}
            {formData.client_id ? (
              <div className="w-full md:flex-1 min-w-0 order-2 md:order-1 animate-in slide-in-from-left duration-500 bg-muted/5 border-b md:border-b-0 md:border-r">
                 <div className="p-5 md:p-8 h-full">
                    <ClientProfileView clientId={formData.client_id} />
                 </div>
              </div>
            ) : null}

            {/* Formulário de Edição */}
            <div className={cn(
              "w-full md:w-[480px] order-1 md:order-2 bg-background p-6 md:p-8",
              !formData.client_id && "w-full"
            )}>
              <DialogHeader className="mb-8 md:mb-10 pr-10">
                <DialogTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">
                  {selectedAppointment ? "Editar Agendamento" : "Novo Agendamento"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Crie ou edite agendamentos, visualize o perfil do cliente e controle o status do serviço.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                {!selectedAppointment && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Adicionar Pausa Rápida</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 30, 60].map((mins) => (
                        <Button
                          key={mins}
                          type="button"
                          variant="outline"
                          className="h-12 text-xs font-black uppercase border-2 border-slate-200 hover:border-primary hover:bg-primary/5 rounded-xl transition-all"
                          onClick={() => handleQuickBreak(mins)}
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {mins} min
                        </Button>
                      ))}
                    </div>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted-foreground/10" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted-foreground/40 bg-background px-2">
                        ou agendamento normal
                      </div>
                    </div>
                  </div>
                )}
                {!selectedAppointment && (
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2 flex flex-col">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("client")} / Nome</Label>
                      <Popover open={isClientComboboxOpen} onOpenChange={setIsClientComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isClientComboboxOpen}
                            className="w-full justify-between h-12 rounded-xl text-left font-normal border-dashed shadow-none"
                          >
                            {formData.client_id
                              ? clients.find((c) => c.id === formData.client_id)?.name
                              : formData.quick_name
                                ? formData.quick_name
                                : "Pesquisar ou digitar novo..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-48px)] sm:w-[460px] p-0" align="start">
                          <Command filter={(value, search) => {
                             if (!search) return 1
                             const terms = search.toLowerCase().split(" ")
                             const content = value.toLowerCase()
                             return terms.every(term => content.includes(term)) ? 1 : 0
                          }}>
                            <CommandInput 
                              placeholder="Procurar nome ou telefone..." 
                              value={clientSearchQuery}
                              onValueChange={setClientSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty className="p-2 text-center text-sm">
                                <p className="text-muted-foreground mb-4 mt-2">Nenhum cliente encontrado.</p>
                                <Button
                                  type="button"
                                  className="w-full h-10 bg-primary/10 text-primary hover:bg-primary/20"
                                  onClick={() => {
                                    setFormData({ ...formData, quick_name: clientSearchQuery, client_id: "" })
                                    setIsClientComboboxOpen(false)
                                    setClientSearchQuery("")
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Adicionar "{clientSearchQuery}"
                                </Button>
                              </CommandEmpty>
                              <CommandGroup heading="Clientes Existentes">
                                {clients.map((client) => (
                                  <CommandItem
                                    key={client.id}
                                    value={`${client.name} ${client.phone || ""}`}
                                    onSelect={() => {
                                      setFormData({ ...formData, client_id: client.id, quick_name: "" })
                                      setIsClientComboboxOpen(false)
                                      setClientSearchQuery("")
                                    }}
                                    className="flex flex-col items-start py-3"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Check
                                        className={cn(
                                          "mr-1 h-4 w-4",
                                          formData.client_id === client.id ? "opacity-100 text-primary" : "opacity-0"
                                        )}
                                      />
                                      <span className="font-bold">{client.name}</span>
                                    </div>
                                    {client.phone && (
                                      <span className="text-[11px] text-muted-foreground ml-7 font-mono">📱 {client.phone}</span>
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="service-id" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("service")}</Label>
                  <Select
                    value={formData.service_id}
                    onValueChange={(value) => {
                      // Filtrar profissionais que realizam este serviço
                      const svc = services.find((s: any) => s.id === value)
                      const eligible = svc?.staffIds && (svc.staffIds as string[]).length > 0
                        ? staff.filter(s => (svc.staffIds as string[]).includes(s.id))
                        : staff
                      setFilteredStaffForModal(eligible)

                      // Limpar seleção de profissional se o atual não faz este serviço
                      const currentStillValid = eligible.some(s => s.id === formData.staff_id)
                      setFormData(prev => ({ 
                        ...prev, 
                        service_id: value,
                        staff_id: currentStillValid ? prev.staff_id : (eligible[0]?.id || "")
                      }))
                    }}
                  >
                    <SelectTrigger id="service-id" className="h-12 rounded-xl">
                      <SelectValue placeholder={t("selectService")} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center gap-2">
                            <Scissors className="h-4 w-4" />
                            {service.name} ({service.duration_minutes}min -{" "}
                            {service.price.toFixed(2)}€)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-id" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("professional")}</Label>
                  <Select
                    value={formData.staff_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, staff_id: value })
                    }
                  >
                    <SelectTrigger id="staff-id" className="h-12 rounded-xl">
                      <SelectValue placeholder={t("selectProfessional")} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStaffForModal.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: member.color }}
                            />
                            {member.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("date")}</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("time")}</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {selectedAppointment && (
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("status")}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger id="status" className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t("pending")}</SelectItem>
                        <SelectItem value="confirmed">{t("confirmed")}</SelectItem>
                        <SelectItem value="completed">{t("completed")}</SelectItem>
                        <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("notes")}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder={t("notesPlaceholder")}
                    className="rounded-xl"
                    rows={2}
                  />
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20"
                    >
                      {selectedAppointment ? t("save") : t("create")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-12 rounded-xl p-0"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  {selectedAppointment && (userRole === "owner" || userRole === "manager") && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/5 h-10 rounded-xl"
                      onClick={handleDelete}
                    >
                      {t("delete")}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

