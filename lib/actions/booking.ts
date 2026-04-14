"use server"

import prisma from "@/lib/prisma"
import { translateText } from "@/lib/translator"
import { getPlanLimits } from "@/lib/plan-limits"

export async function getSalonBySlug(slug: string, requestedLocale?: string) {
  const salon = await prisma.salon.findUnique({
    where: { slug },
    include: {
      services: { where: { is_active: true } },
      staff: { where: { is_active: true, role: { not: "receptionist" } } }
    }
  })

  if (!salon) return null

  // --- AUTO-TRANSLATION LOGIC ---
  const sourceLocale = (salon as any).locale || "pt";
  const targetLocale = requestedLocale || sourceLocale;
  
  if (targetLocale !== sourceLocale) {
    // 1. Traduzir metadados do Salão
    let salonTrans: any = {};
    try { salonTrans = JSON.parse((salon as any).translations || "{}") } catch(e) {}
    
    if (!salonTrans[targetLocale]) {
        salonTrans[targetLocale] = {
            name: await translateText(salon.name, targetLocale, sourceLocale),
            description: await translateText(salon.description || "", targetLocale, sourceLocale)
        };
        await prisma.salon.update({
            where: { id: salon.id },
            data: { translations: JSON.stringify(salonTrans) } as any
        });
    }
    
    // Aplicar tradução ao objeto de saída
    if (salonTrans[targetLocale]) {
        salon.name = salonTrans[targetLocale].name || salon.name;
        salon.description = salonTrans[targetLocale].description || salon.description;
    }

    // 2. Traduzir cada Serviço
    if (salon.services) {
        for (const service of salon.services) {
            let sTrans: any = {};
            try { sTrans = JSON.parse((service as any).translations || "{}") } catch(e) {}
            
            if (!sTrans[targetLocale]) {
                sTrans[targetLocale] = {
                    name: await translateText(service.name, targetLocale, sourceLocale),
                    description: await translateText(service.description || "", targetLocale, sourceLocale)
                };
                await prisma.service.update({
                    where: { id: service.id },
                    data: { translations: JSON.stringify(sTrans) } as any
                });
            }
            
            if (sTrans[targetLocale]) {
                service.name = sTrans[targetLocale].name || service.name;
                service.description = sTrans[targetLocale].description || service.description;
            }
        }
    }
  }
  // --- END AUTO-TRANSLATION ---

  // Parse JSON fields
  if (salon.settings && typeof salon.settings === "string") {
    try { (salon as any).settings = JSON.parse(salon.settings) } catch(e) {}
  }
  if (salon.working_hours && typeof salon.working_hours === "string") {
    try { (salon as any).working_hours = JSON.parse(salon.working_hours) } catch(e) {}
  }

  // Converter Decimal para número para o cliente
  const serialized = JSON.parse(JSON.stringify(salon))
  if (serialized.services) {
    serialized.services = serialized.services.map((s: any) => ({
      ...s,
      price: Number(s.price)
    }))
  }
  return serialized
}

export async function getBusySlots(staffId: string, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const appointments = await prisma.appointment.findMany({
    where: {
      staff_id: staffId,
      status: { not: "cancelled" },
      starts_at: { gte: startOfDay, lte: endOfDay }
    },
    select: { starts_at: true, ends_at: true }
  })

  return appointments.map((app: any) => ({
    start: app.starts_at,
    end: app.ends_at
  }))
}

export async function createBooking(data: any) {
  try {
    const { salonId, serviceId, staffId, startsAt, endsAt, clientInfo } = data
    if (!salonId || !serviceId || !staffId) return { error: "Erro: Dados incompletos." }
    
    const startsAtDateRaw = new Date(startsAt)
    const endsAtDateRaw = new Date(endsAt)

    // 1. Validar Salon e Quota
    const salon = await prisma.salon.findUnique({ 
      where: { id: salonId }, 
      select: { plan: true, working_hours: true, timezone: true } 
    })
    
    if (!salon) return { error: "Salão não encontrado." }

    // Técnica Wall Clock: Forçamos a data a ser guardada com os dígitos da hora local
    // para que o Dashboard (getUTCHours) mostre exatamente o que o cliente viu.
    const toWallClock = (date: Date, tz: string) => {
      const s = date.toLocaleString('sv-SE', { timeZone: tz }).replace(' ', 'T')
      return new Date(s + 'Z')
    }

    const salonTimezone = salon.timezone || 'Europe/Lisbon'
    const startsAtDate = toWallClock(startsAtDateRaw, salonTimezone)
    const endsAtDate = toWallClock(endsAtDateRaw, salonTimezone)

    if (isNaN(startsAtDate.getTime())) return { error: "Erro: Data de início inválida." }

    // --- SEC-002: Validação de Horas de Funcionamento ---
    const wh = typeof salon.working_hours === 'string' ? JSON.parse(salon.working_hours) : salon.working_hours
    
    // Determinar o dia da semana local do salão
    const localizedDayString = startsAtDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: salonTimezone }).toLowerCase()
    const dayConfig = (wh as any)?.[localizedDayString]

    if (!dayConfig || !dayConfig.open || !dayConfig.close) {
      return { error: "O salão não abre neste dia." }
    }

    const timeString = startsAtDate.toLocaleTimeString('pt-PT', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: salonTimezone 
    })
    
    if (timeString < dayConfig.open || timeString >= dayConfig.close) {
      return { error: `O salão está fechado às ${timeString}. Horário permitido: ${dayConfig.open} - ${dayConfig.close}.` }
    }

    // Verificar pausa de almoço
    if (dayConfig.breakStart && dayConfig.breakEnd) {
      if (timeString >= dayConfig.breakStart && timeString < dayConfig.breakEnd) {
        return { error: "O salão está em pausa de almoço neste horário." }
      }
    }
    let maxApts = (salon.plan === "premium") ? -1 : 50

    try {
        const globalConfig = await prisma.globalConfig.findUnique({ where: { id: "singleton" } })
        if (globalConfig?.landing_page) {
            const dynamicPlans = JSON.parse(globalConfig.landing_page).plans
            const limits = getPlanLimits(salon.plan || "free", dynamicPlans)
            maxApts = limits.appointments_per_month as number
        }
    } catch(e) {
        console.error("Config load error:", e)
    }

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
            return { error: "Limite de agendamentos online atingido para este mês." }
        }
    }

    // --- SEC-003: Rate Limiting por Telefone (Prevenção de Spam) ---
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentBookingsCount = await prisma.appointment.count({
      where: {
        salon_id: salonId,
        status: { not: "cancelled" },
        created_at: { gte: oneHourAgo },
        client: {
          phone: clientInfo.phone
        }
      }
    })

    if (recentBookingsCount >= 5) {
      return { error: "Muitas tentativas de agendamento num curto período. Por favor aguarde uma hora." }
    }

    // 2. Cliente
    let client = await prisma.client.findFirst({
      where: { salon_id: salonId, phone: clientInfo.phone }
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          salon_id: salonId,
          name: clientInfo.name,
          phone: clientInfo.phone,
          email: clientInfo.email || null,
        }
      })
    }

    // 3. Validação de Isolamento (SEC-001) e Colisão
    // Garantir que Staff e Serviço pertencem ao mesmo salão
    const [targetStaff, targetService] = await Promise.all([
      prisma.staff.findUnique({ where: { id: staffId } }),
      prisma.service.findUnique({ where: { id: serviceId } })
    ])

    if (!targetStaff || targetStaff.salon_id !== salonId) {
      return { error: "O profissional selecionado não pertence a este salão." }
    }
    if (!targetService || targetService.salon_id !== salonId) {
      return { error: "O serviço selecionado não pertence a este salão." }
    }

    const collision = await prisma.appointment.findFirst({
      where: {
        staff_id: staffId,
        status: { not: "cancelled" },
        starts_at: { lt: endsAtDate },
        ends_at: { gt: startsAtDate }
      }
    })

    if (collision) return { error: "Horário ocupado. Por favor tente outro momento." }

    // 4. Gravar Agendamento
    // targetService já foi validado acima

    const appointment = await prisma.appointment.create({
      data: {
        salon_id: salonId,
        client_id: client.id,
        staff_id: staffId,
        service_id: serviceId,
        starts_at: startsAtDate,
        ends_at: endsAtDate,
        price: targetService.price,
        status: "pending",
        source: "online"
      }
    })

    return { 
      success: true, 
      appointmentId: appointment.id 
    }
  } catch (err: any) {
    console.error("BOOKING CRASH:", err)
    return { error: "Erro interno no servidor. Por favor contacte o suporte." }
  }
}
