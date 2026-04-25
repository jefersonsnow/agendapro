"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"

import { getSalonId } from "@/lib/dal"

export async function exportSalonData(startDate?: string, endDate?: string) {
  const salonIdStr = await getSalonId()
  if (!salonIdStr) throw new Error("Não autorizado")
  
  const salonRec = await prisma.salon.findUnique({
    where: { id: salonIdStr },
    select: { id: true, name: true }
  })
  if (!salonRec) throw new Error("Salão não encontrado")
  
  const salonId = salonRec.id
  const salonName = salonRec.name
  
  const filterStart = startDate ? new Date(startDate) : undefined
  const filterEnd = endDate ? new Date(endDate + 'T23:59:59') : undefined

  // Parallel fetch for speed
  const [clients, services, appointments, transactions] = await Promise.all([
    // 1. Clientes
    prisma.client.findMany({
      where: { salon_id: salonId },
      orderBy: { name: "asc" }
    }),
    // 2. Serviços
    prisma.service.findMany({
      where: { salon_id: salonId },
      orderBy: { category: "asc" }
    }),
    // 3. Agendamentos
    prisma.appointment.findMany({
      where: { 
        salon_id: salonId,
        ...(filterStart || filterEnd ? {
          starts_at: {
            ...(filterStart ? { gte: filterStart } : {}),
            ...(filterEnd ? { lte: filterEnd } : {})
          }
        } : {})
       },
      include: {
        client: { select: { name: true, phone: true } },
        service: { select: { name: true } },
        staff: { select: { name: true } }
      },
      orderBy: { starts_at: "desc" }
    }),
    // 4. Fluxo de Caixa (Transações)
    prisma.transaction.findMany({
      where: {
        salon_id: salonId,
        ...(filterStart || filterEnd ? {
          created_at: {
            ...(filterStart ? { gte: filterStart } : {}),
            ...(filterEnd ? { lte: filterEnd } : {})
          }
        } : {})
      },
      include: {
        staff: { select: { name: true } }
      },
      orderBy: { created_at: "desc" }
    })
  ])

  // Serializar dados para o formato Excel (Plain Objects)
  const clientsData = clients.map(c => ({
    "Nome": c.name,
    "Email": c.email || "N/A",
    "Telemóvel": c.phone || "N/A",
    "Fidelidade (Pontos)": c.loyalty_points,
    "Total Gasto (€)": Number(c.total_spent),
    "Total Visitas": c.visit_count,
    "Data de Registo": c.created_at.toLocaleDateString('pt-PT'),
    "Notas": c.notes || ""
  }))

  const servicesData = services.map(s => ({
    "Categoria": s.category,
    "Serviço": s.name,
    "Duração (Min)": s.duration_minutes,
    "Preço (€)": Number(s.price),
    "Descrição": s.description || "",
    "Ativo?": s.is_active ? "Sim" : "Não"
  }))

  const appointmentsData = appointments.map(a => ({
    "Data": a.starts_at.toLocaleDateString('pt-PT'),
    "Hora": a.starts_at.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    "Cliente": a.client?.name || "PAUSA",
    "Telemóvel Cliente": a.client?.phone || "N/A",
    "Serviço": a.service?.name || "PAUSA",
    "Profissional": a.staff.name,
    "Status": a.status.toUpperCase(),
    "Valor (€)": Number(a.price),
    "Canal": a.source.toUpperCase(),
    "Notas": a.notes || ""
  }))

  const transactionsData = transactions.map(t => ({
    "Data": t.created_at.toLocaleDateString('pt-PT'),
    "Tipo": t.type === 'income' ? 'Entrada' : 'Saída',
    "Valor (€)": Number(t.amount),
    "Método": t.payment_method.toUpperCase(),
    "Profissional": t.staff?.name || "Geral",
    "Descrição": t.description || ""
  }))

  // Dados do Dashboard (Top Services, Staff Stats etc.)
  const serviceStats = new Map()
  appointments.forEach((apt: any) => {
    const serviceName = apt.service?.name || "Outros"
    const current = serviceStats.get(serviceName) || { name: serviceName, count: 0, revenue: 0 }
    current.count++
    current.revenue += Number(apt.price)
    serviceStats.set(serviceName, current)
  })
  const topServices = Array.from(serviceStats.values()).sort((a, b) => b.revenue - a.revenue)

  const staffStats = new Map()
  appointments.forEach((apt: any) => {
    const name = apt.staff?.name || "Geral"
    const current = staffStats.get(name) || { name, services: 0, revenue: 0 }
    current.services++
    current.revenue += Number(apt.price)
    staffStats.set(name, current)
  })
  const topStaff = Array.from(staffStats.values()).sort((a, b) => b.revenue - a.revenue)

  // Resumo de BI (Primeira Aba)
  const totalRev = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);

  const summaryData = {
    salon: salonName,
    period: { start: startDate || "Início", end: endDate || "Hoje" },
    metrics: [
      { kpi: "Faturação Bruta", value: totalRev, unit: "€" },
      { kpi: "Despesas Totais", value: totalExp, unit: "€" },
      { kpi: "Lucro Operacional", value: totalRev - totalExp, unit: "€" },
      { kpi: "Total Agendamentos", value: appointments.length, unit: "Qtd" },
      { kpi: "Ticket Médio", value: appointments.length > 0 ? totalRev / appointments.length : 0, unit: "€" },
      { kpi: "Novos Clientes", value: clients.filter(c => filterStart ? c.created_at >= filterStart : true).length, unit: "Qtd" },
    ],
    topServices,
    topStaff
  }

  return {
    salonName: salonName,
    data: {
      "Dashboard": summaryData,
      "Base de Clientes": clientsData,
      "Serviços e Preçário": servicesData,
      "Historial de Agendamentos": appointmentsData,
      "Fluxo de Caixa": transactionsData
    }
  }
}
