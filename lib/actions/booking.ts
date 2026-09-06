"use server"

import prisma from "@/lib/prisma"
import { translateText } from "@/lib/translator"
import { getPlanLimits } from "@/lib/plan-limits"
import crypto from "crypto"
import { sendMail } from "@/lib/mail"

export async function getSalonBySlug(slug: string, requestedLocale?: string) {
  const salon = await prisma.salon.findUnique({
    where: { slug },
    include: {
      services: { where: { is_active: true } },
      staff: {
        where: { is_active: true, role: { not: "receptionist" } },
        include: {
          services: { select: { service_id: true } }
        }
      }
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

  // Converter Decimal para número para o cliente e parsear horários do staff
  const serialized = JSON.parse(JSON.stringify(salon))
  if (serialized.services) {
    serialized.services = serialized.services.map((s: any) => ({
      ...s,
      price: Number(s.price)
    }))
  }
  if (serialized.staff) {
    serialized.staff = serialized.staff.map((s: any) => {
      if (s.working_hours && typeof s.working_hours === "string") {
        try { s.working_hours = JSON.parse(s.working_hours) } catch(e) {}
      }
      // Flatten StaffService → array of service IDs for client-side filtering
      s.serviceIds = (s.services || []).map((ss: any) => ss.service_id)
      delete s.services
      return s
    })
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
      status: { notIn: ["cancelled", "unconfirmed"] },
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
    const { serviceId, staffId, startsAt, endsAt, clientInfo } = data
    const salonId = data.salonId // keeping it if used later, but wait, it is used!
    if (!salonId || !serviceId || !staffId) return { error: "Erro: Dados incompletos." }
    
    const startsAtDateRaw = new Date(startsAt)
    const endsAtDateRaw = new Date(endsAt)

    // 1. Validar Salon e Quota
    const salon = await prisma.salon.findUnique({ 
      where: { id: salonId }, 
      select: { name: true, plan: true, working_hours: true, timezone: true, requires_email_confirmation: true, status: true } 
    })
    
    if (!salon) return { error: "Salão não encontrado." }

    if (salon.status === 'cancelled') {
      return { error: "Este salão não está a aceitar novos agendamentos." }
    }

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
    
    // IMPORTANT: startsAtDate/endsAtDate are "wall clock" dates (UTC digits = local time digits).
    // We MUST use UTC methods to extract the time — do NOT apply timezone conversion again
    // (toLocaleTimeString with a timezone would add the UTC offset a second time, causing bugs).
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const localizedDayString = daysOfWeek[startsAtDate.getUTCDay()]
    const dayConfig = (wh as any)?.[localizedDayString]

    if (!dayConfig || !dayConfig.open || !dayConfig.close) {
      return { error: "O salão não abre neste dia." }
    }

    const pad = (n: number) => n.toString().padStart(2, '0')
    const timeString = `${pad(startsAtDate.getUTCHours())}:${pad(startsAtDate.getUTCMinutes())}`
    const endTimeString = `${pad(endsAtDate.getUTCHours())}:${pad(endsAtDate.getUTCMinutes())}`
    
    // Start must be >= open AND end must be <= close (finishing exactly at close is OK)
    if (timeString < dayConfig.open || endTimeString > dayConfig.close) {
      return { error: `O salão está fechado às ${timeString}. Horário permitido: ${dayConfig.open} - ${dayConfig.close}.` }
    }

    // Verificar pausa de almoço
    if (dayConfig.breakStart && dayConfig.breakEnd) {
      if (timeString >= dayConfig.breakStart && timeString < dayConfig.breakEnd) {
        return { error: "O salão está em pausa de almoço neste horário." }
      }
    }

    // --- SEC-002.1: Validação de Horários do Profissional (Staff) ---
    const targetStaff = await prisma.staff.findUnique({ where: { id: staffId } })
    if (!targetStaff || targetStaff.salon_id !== salonId) {
       return { error: "Profissional não encontrado ou não pertence a este salão." }
    }

    if (targetStaff.working_hours && typeof targetStaff.working_hours === 'string' && targetStaff.working_hours.length > 2) {
       const swh = JSON.parse(targetStaff.working_hours)
       const staffDayConfig = swh[localizedDayString]

       if (!staffDayConfig || staffDayConfig.enabled === false) {
          return { error: `O profissional ${targetStaff.name} não trabalha neste dia.` }
       }

       if (staffDayConfig.open && staffDayConfig.close) {
          // Check that appointment end time does not exceed staff closing time
          if (timeString < staffDayConfig.open || endTimeString > staffDayConfig.close) {
             return { error: `O profissional ${targetStaff.name} não está disponível às ${timeString}. Horário: ${staffDayConfig.open} - ${staffDayConfig.close}.` }
          }
       }

       if (staffDayConfig.hasBreak && staffDayConfig.breakStart && staffDayConfig.breakEnd) {
          if (timeString >= staffDayConfig.breakStart && timeString < staffDayConfig.breakEnd) {
             return { error: `O profissional ${targetStaff.name} está em pausa neste horário.` }
          }
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

    // 2. Cliente - Normalização e Vínculo Inteligente
    const normalizedPhone = clientInfo.phone.replace(/\D/g, '')
    
    let client = await prisma.client.findFirst({
      where: { 
        salon_id: salonId, 
        phone: {
          contains: normalizedPhone
        }
      }
    })

    if (client) {
      // Se o novo nome for maior (mais completo), atualizamos o cadastro
      const currentName = client.name || ""
      const newName = clientInfo.name || ""
      
      if (newName.length > currentName.length) {
        await prisma.client.update({
          where: { id: client.id },
          data: { 
            name: newName,
            email: clientInfo.email || client.email // Atualiza email se fornecido
          }
        })
      }
    } else {
      client = await prisma.client.create({
        data: {
          salon_id: salonId,
          name: clientInfo.name,
          phone: normalizedPhone, // Guardamos já normalizado
          email: clientInfo.email || null,
        }
      })
    }

    // 3. Validação de Isolamento (SEC-001) e Colisão
    // Garantir que Staff e Serviço pertencem ao mesmo salão
    const targetService = await prisma.service.findUnique({ where: { id: serviceId } })

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
    const requiresConfirmation = salon.requires_email_confirmation || false
    const confirmationToken = requiresConfirmation ? crypto.randomUUID() : null
    const initialStatus = requiresConfirmation ? "unconfirmed" : "pending"

    const appointment = await prisma.appointment.create({
      data: {
        salon_id: salonId,
        client_id: client.id,
        staff_id: staffId,
        service_id: serviceId,
        starts_at: startsAtDate,
        ends_at: endsAtDate,
        price: targetService.price,
        status: initialStatus,
        source: "online",
        confirmation_token: confirmationToken
      }
    })

    // 5. Enviar E-mail de Confirmação se necessário
    if (requiresConfirmation && client.email) {
      const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/confirmar-agendamento?token=${confirmationToken}`
      await sendMail({
        to: client.email,
        subject: `Confirme o seu agendamento em ${salon.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0D9488;">Olá ${client.name}!</h2>
            <p>Recebemos o seu pedido de agendamento para <strong>${targetService.name}</strong> no salão <strong>${salon.name}</strong>.</p>
            <p>Para garantir a sua reserva, por favor clique no botão abaixo para confirmar o seu e-mail:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" style="background-color: #0D9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">CONFIRMAR AGENDAMENTO</a>
            </div>
            <p style="font-size: 12px; color: #666;">Se não realizou este pedido, pode ignorar este e-mail.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 10px; color: #999; text-align: center;">Powered by AgendarPro</p>
          </div>
        `
      })
    }

    return { 
      success: true, 
      appointmentId: appointment.id,
      requiresConfirmation
    }
  } catch (err: any) {
    console.error("BOOKING CRASH:", err)
    return { error: "Erro interno no servidor. Por favor contacte o suporte." }
  }
}

export async function confirmAppointmentByToken(token: string) {
  if (!token) return { error: "Token inválido." }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { confirmation_token: token },
      include: { salon: { select: { name: true, slug: true } } }
    })

    if (!appointment) return { error: "Agendamento não encontrado ou link expirado." }
    if (appointment.status !== "unconfirmed") return { success: true, salonSlug: appointment.salon.slug }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { 
        status: "pending", // Move para pendente para o salão ver
        confirmation_token: null // Limpa o token após uso
      }
    })

    return { 
      success: true, 
      salonName: appointment.salon.name,
      salonSlug: appointment.salon.slug
    }
  } catch (err) {
    console.error("CONFIRMATION ERROR:", err)
    return { error: "Erro ao confirmar agendamento." }
  }
}
