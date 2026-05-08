"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath, unstable_noStore as noStore } from "next/cache"

import { logAction } from "@/lib/audit"
import { getPlanLimits } from "@/lib/plan-limits"

import { getSalonId, getGlobalConfigCache } from "@/lib/dal"

export async function getAgendaInitialData() {
  noStore()
  const salonId = await getSalonId()
  if (!salonId) return null

  const session = await auth()
  const isProfessional = session?.user?.role === "professional"

  const [staff, services, clients] = await Promise.all([
    prisma.staff.findMany({
      where: { 
        salon_id: salonId, 
        is_active: true,
        role: { not: "receptionist" }, // Removemos a rececionista da lista de quem atende
        user_id: isProfessional ? session?.user?.id : undefined
      },
      select: { id: true, name: true, color: true, is_active: true, role: true },
      orderBy: { name: "asc" }
    }),
    prisma.service.findMany({
      where: { salon_id: salonId, is_active: true },
      select: { 
        id: true, name: true, duration_minutes: true, price: true,
        staff: { select: { staff_id: true } }  // IDs de quem realiza este serviço
      },
      orderBy: { name: "asc" }
    }),
    prisma.client.findMany({
      where: { salon_id: salonId },
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" }
    })
  ])

  try {
    const salon = await prisma.salon.findUnique({
       where: { id: salonId },
       select: { working_hours: true, color_palette: true }
    })

    return {
      salonId,
      workingHours: salon?.working_hours ? (typeof salon.working_hours === 'string' ? JSON.parse(salon.working_hours) : salon.working_hours) : null,
      colorPalette: salon?.color_palette || "default",
      staff,
      services: services.map((s: any) => ({
        ...s,
        price: Number(s.price),
        staffIds: (s.staff || []).map((ss: any) => ss.staff_id),
        staff: undefined
      })),
      clients,
      isProfessional,
      userRole: session?.user?.role || "owner"
    }
  } catch (err) {
    console.error("Erro ao carregar dados iniciais da agenda:", err)
    return {
      salonId,
      workingHours: null,
      staff,
      services: services.map((s: any) => ({
        ...s,
        price: Number(s.price)
      })),
      clients,
      isProfessional,
      userRole: session?.user?.role || "owner"
    }
  }
}

export async function getAppointments(startDate: Date, endDate: Date, filterStaffId?: string) {
  noStore()
  const salonId = await getSalonId()
  if (!salonId) return []

  const session = await auth()
  const isProfessional = session?.user?.role === 'professional'

  let staffId = undefined
  if (isProfessional) {
     const staffMember = await prisma.staff.findFirst({ 
        where: { user_id: session?.user?.id },
        select: { id: true }
     })
     staffId = staffMember?.id || "none"
  } else if (filterStaffId && filterStaffId !== "all") {
     staffId = filterStaffId
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      salon_id: salonId,
      starts_at: { gte: startDate, lt: endDate },
      staff_id: staffId,
      status: { not: "unconfirmed" },
    },
    include: {
      staff: { select: { id: true, name: true, color: true } },
      client: { select: { id: true, name: true, phone: true } },
      service: { select: { id: true, name: true, duration_minutes: true, price: true } }
    },
    orderBy: { starts_at: "asc" }
  })

  return appointments.map((apt: any) => ({
    ...apt,
    price: Number(apt.price),
    service: apt.service ? { ...apt.service, price: Number(apt.service.price) } : null
  }))
}

export async function upsertAppointment(id: string | null, data: any) {
  const salonId = await getSalonId()
  if (!salonId) return { success: false, error: "Não autorizado" }

  const salon = await prisma.salon.findUnique({ where: { id: salonId }, select: { plan: true, working_hours: true, timezone: true } })
  const salonTimezone = salon?.timezone || 'Europe/Lisbon'

  const toWallClock = (date: Date, tz: string) => {
    const s = date.toLocaleString('sv-SE', { timeZone: tz }).replace(' ', 'T')
    return new Date(s + 'Z')
  }

  // Se recebermos uma string sem fuso (literal), assumimos que os dígitos já são o "Wall Clock" pretendido em UTC
  const parseWallClock = (input: string | Date, tz: string) => {
    if (typeof input === 'string' && !input.includes('Z') && !input.includes('+')) {
      return new Date(input + 'Z')
    }
    return toWallClock(new Date(input), tz)
  }

  const startsAtDate = parseWallClock(data.starts_at, salonTimezone)
  const endsAtDate = parseWallClock(data.ends_at, salonTimezone)

  // Validar quota mensal (apenas na criação de agendamentos reais, não pausas)
  if (!id && data.status !== "cancelled" && !data.is_break) {
      const plan = salon?.plan || "free"
      
      const config = await getGlobalConfigCache()
      const dynamicPlans = config?.landing_page ? JSON.parse(config.landing_page).plans : null
      
      const limits = getPlanLimits(plan, dynamicPlans)
      const maxApts = limits.appointments_per_month as number

      if (maxApts !== -1) {
          const startOfMonth = new Date(startsAtDate.getFullYear(), startsAtDate.getMonth(), 1)
          const endOfMonth = new Date(startsAtDate.getFullYear(), startsAtDate.getMonth() + 1, 0, 23, 59, 59)
          
          const currentMonthCount = await prisma.appointment.count({
              where: {
                  salon_id: salonId,
                  status: { not: "cancelled" },
                  starts_at: { gte: startOfMonth, lte: endOfMonth }
              }
          })

          if (currentMonthCount >= maxApts) {
              return { success: false, error: `Limite mensal atingido (${maxApts} agendamentos). Faça upgrade para continuar.` }
          }
      }
  }

  // Validar colisão (excluindo o próprio agendamento se for edição)
  if (data.status !== "cancelled") {
    const collision = await prisma.appointment.findFirst({
      where: {
        salon_id: salonId,
        staff_id: data.staff_id,
        status: { not: "cancelled" },
        id: id ? { not: id } : undefined,
        OR: [
          {
            starts_at: { lt: endsAtDate },
            ends_at: { gt: startsAtDate }
          }
        ]
      }
    })

    if (collision) {
      return { success: false, error: "Colisão de horários: Este profissional já possui outro agendamento neste período." }
    }

    if (salon && salon.working_hours) {
      const wh = typeof salon.working_hours === 'string' ? JSON.parse(salon.working_hours) : salon.working_hours

      // IMPORTANT: startsAtDate/endsAtDate are "wall clock" dates (UTC digits = local time digits).
      // We MUST use UTC methods — do NOT apply timezone conversion again via toLocaleTimeString/toLocaleDateString
      // (they would add the UTC offset a second time, turning 17:30 into 18:30).
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const localizedDayString = daysOfWeek[startsAtDate.getUTCDay()]
      const dayHours = (wh as any)?.[localizedDayString]
      const pad = (n: number) => n.toString().padStart(2, '0')
      const timeStr = `${pad(startsAtDate.getUTCHours())}:${pad(startsAtDate.getUTCMinutes())}`
      const endTimeStr = `${pad(endsAtDate.getUTCHours())}:${pad(endsAtDate.getUTCMinutes())}`
      
      if (!dayHours || !dayHours.open || timeStr < dayHours.open || endTimeStr > dayHours.close) {
        return { success: false, error: `Horário fora do funcionamento (${timeStr}). Permitido: ${dayHours?.open || 'N/A'} - ${dayHours?.close || 'N/A'}` }
      }

      // Normalizar para comparação apenas de horas/minutos (usando wall-clock já extraído acima)
      const hourToMinutes = (time: string) => {
          const [h, m] = time.split(":").map(Number)
          return h * 60 + m
      }
      
      const appointmentsStartM = hourToMinutes(timeStr)
      const appointmentsEndM = hourToMinutes(endTimeStr)

      const [oH, oM] = dayHours.open.split(":").map(Number)
      const [cH, cM] = dayHours.close.split(":").map(Number)
      const openMinutes = oH * 60 + oM
      const closeMinutes = cH * 60 + cM

      if (appointmentsStartM < openMinutes || appointmentsEndM > closeMinutes) {
        return { success: false, error: "Este horário está fora do período de funcionamento do salão (" + dayHours.open + " - " + dayHours.close + ")." }
      }

      if (dayHours.breakStart && dayHours.breakEnd) {
        const [bsH, bsM] = dayHours.breakStart.split(":").map(Number)
        const [beH, beM] = dayHours.breakEnd.split(":").map(Number)
        const breakStartM = bsH * 60 + bsM
        const breakEndM = beH * 60 + beM

        // Se o agendamento intersecta a pausa
        if (appointmentsStartM < breakEndM && appointmentsEndM > breakStartM) {
          return { success: false, error: "O horário selecionado coincide com a pausa de almoço (" + dayHours.breakStart + " - " + dayHours.breakEnd + ")." }
        }
      }

      // --- SEC-002.1: Validação de Horários do Profissional (Staff) ---
      const staffMember = await prisma.staff.findUnique({ where: { id: data.staff_id } })
      if (staffMember && staffMember.working_hours && typeof staffMember.working_hours === 'string' && staffMember.working_hours.length > 2) {
          const swh = JSON.parse(staffMember.working_hours)
          const staffDayConfig = swh[localizedDayString]

          if (!staffDayConfig || staffDayConfig.enabled === false) {
              return { success: false, error: `O profissional ${staffMember.name} não trabalha neste dia (${localizedDayString}).` }
          }

          if (staffDayConfig.open && staffDayConfig.close) {
              const staffOpenM = hourToMinutes(staffDayConfig.open)
              const staffCloseM = hourToMinutes(staffDayConfig.close)

              if (appointmentsStartM < staffOpenM || appointmentsEndM > staffCloseM) {
                  return { success: false, error: `O profissional ${staffMember.name} não está disponível neste horário. Expediente: ${staffDayConfig.open} - ${staffDayConfig.close}.` }
              }
          }

          if (staffDayConfig.hasBreak && staffDayConfig.breakStart && staffDayConfig.breakEnd) {
              const bStartM = hourToMinutes(staffDayConfig.breakStart)
              const bEndM = hourToMinutes(staffDayConfig.breakEnd)

              if (appointmentsStartM < bEndM && appointmentsEndM > bStartM) {
                  return { success: false, error: `O profissional ${staffMember.name} está em pausa neste horário (${staffDayConfig.breakStart} - ${staffDayConfig.breakEnd}).` }
              }
          }
      }
    }
  }

  // --- SEC-001: Validação de Isolamento (Hardening) ---
  const targetStaff = await prisma.staff.findFirst({ where: { id: data.staff_id, salon_id: salonId } })
  if (!targetStaff) return { success: false, error: "Profissional inválido para este salão." }

  let targetService = null
  if (!data.is_break) {
    targetService = await prisma.service.findFirst({ where: { id: data.service_id, salon_id: salonId } })
    if (!targetService) return { success: false, error: "Serviço inválido para este salão." }
  }

  let clientId = data.client_id

  // Lógica de "Cliente Rápido": Se não houver ID mas houver nome, criar o cliente agora
  if (!clientId && data.quick_name) {
    const newClient = await prisma.client.create({
      data: {
        salon_id: salonId,
        name: data.quick_name.trim(),
        phone: data.quick_phone || null,
      }
    })
    clientId = newClient.id
    await logAction({ action: "create_client_quick", entity: "client", entityId: clientId, salonId })
  }

  const appointmentData: any = {
    salon_id: salonId,
    staff_id: data.staff_id,
    service_id: data.is_break ? null : data.service_id,
    client_id: data.is_break ? null : clientId,
    starts_at: startsAtDate,
    ends_at: endsAtDate,
    price: data.is_break ? 0 : data.price,
    notes: data.notes || null,
    status: data.is_break ? "confirmed" : data.status,
    is_break: data.is_break || false,
  }

  try {
    let clientPointChange = 0

    if (id) {
      const oldApt = await prisma.appointment.findFirst({
        where: { id, salon_id: salonId },
        select: { status: true }
      })
      if (!oldApt) return { success: false, error: "Agendamento não encontrado ou sem permissão." }

      if (oldApt?.status !== "completed" && appointmentData.status === "completed") {
        clientPointChange = 1
      } else if (oldApt?.status === "completed" && appointmentData.status !== "completed") {
        clientPointChange = -1
      }

      await prisma.appointment.update({
        where: { id, salon_id: salonId },
        data: appointmentData
      })
      await logAction({ action: "update_appointment", entity: "appointment", entityId: id, salonId })
    } else {
      if (appointmentData.status === "completed") {
        clientPointChange = 1
      }
      const apt = await prisma.appointment.create({
        data: appointmentData
      })
      await logAction({ action: "create_appointment", entity: "appointment", entityId: apt.id, salonId })
    }
    
    // Sync client stats (only if it's not a break)
    if (!appointmentData.is_break && clientId) {
      await syncClientStats(clientId, clientPointChange)
    }
    
    revalidatePath("/dashboard/agenda")
    return { success: true }
  } catch (error) {
    console.error("Erro ao guardar agendamento:", error)
    return { success: false, error: "Erro ao guardar o agendamento." }
  }
}

export async function deleteAppointment(id: string) {
  const session = await auth()
  const role = session?.user?.role

  if (role === "professional" || role === "receptionist") {
     return { success: false, error: "Apenas gerentes e proprietários podem excluir agendamentos." }
  }

  const salonId = await getSalonId()
  if (!salonId) return { success: false, error: "Não autorizado" }

  try {
    const appointment = await prisma.appointment.findUnique({
       where: { id },
       select: { client_id: true, status: true }
    })

    await prisma.appointment.delete({
      where: { id, salon_id: salonId }
    })
    
    await logAction({ action: "delete_appointment", entity: "appointment", entityId: id, salonId })
    
    // Sync client stats
    if (appointment?.client_id) {
       const pointChange = appointment.status === "completed" ? -1 : 0
       await syncClientStats(appointment.client_id, pointChange)
    }

    revalidatePath("/dashboard/agenda")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error)
    return { success: false, error: "Erro ao excluir o agendamento." }
  }
}

async function syncClientStats(clientId: string, pointChange: number = 0) {
  if (!clientId) return;
  
  const stats = await prisma.appointment.aggregate({
    where: { 
      client_id: clientId, 
      status: "completed" 
    },
    _count: { id: true },
    _sum: { price: true },
    _max: { starts_at: true }
  })

  // We increment/decrement loyalty_points instead of recalculating from scratch to preserve manual adjustments
  await prisma.client.update({
    where: { id: clientId },
    data: {
      visit_count: stats._count.id || 0,
      total_spent: stats._sum.price || 0,
      last_visit: stats._max.starts_at || null,
      loyalty_points: { increment: pointChange }
    }
  })
}
