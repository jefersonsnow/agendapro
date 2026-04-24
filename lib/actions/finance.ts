"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "@/lib/audit"

import { getSalonId } from "@/lib/dal"

export async function getFinanceData(period: string) {
  const salonId = await getSalonId()
  if (!salonId) return null

  const now = new Date()
  let startDate: Date

  switch (period) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const [transactions, appointments, staffList, staffServices] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        salon_id: salonId,
        created_at: { gte: startDate }
      },
      include: {
        staff: { select: { name: true } }
      },
      orderBy: { created_at: "desc" }
    }),
    prisma.appointment.findMany({
      where: {
        salon_id: salonId,
        status: "completed",
        starts_at: { gte: startDate }
      },
      select: { staff_id: true, service_id: true, price: true }
    }),
    prisma.staff.findMany({
      where: { salon_id: salonId, is_active: true },
      select: { id: true, name: true }
    }),
    (prisma as any).staffService.findMany({
      where: { staff: { salon_id: salonId } },
      select: { staff_id: true, service_id: true, commission_value: true }
    })
  ])

  const serializedTransactions = transactions.map((t: any) => ({
    ...t,
    amount: Number(t.amount),
    created_at: t.created_at.toISOString()
  }))

  const serializedAppointments = appointments.map((a: any) => ({
    ...a,
    price: Number(a.price)
  }))

  // Mapa: "staffId:serviceId" → commission_value
  const commissionMap = new Map<string, number>()
  staffServices.forEach((ss: any) => {
    commissionMap.set(`${ss.staff_id}:${ss.service_id}`, ss.commission_value !== null ? Number(ss.commission_value) : 0)
  })

  const serializedStaff = staffList.map((s: any) => ({
    id: s.id,
    name: s.name,
    commission: appointments
      .filter(a => a.staff_id === s.id)
      .reduce((sum: number, a: any) => sum + (commissionMap.get(`${a.staff_id}:${a.service_id}`) ?? 0), 0)
  }))

  return {
    transactions: serializedTransactions,
    appointments: serializedAppointments,
    staff: serializedStaff
  }
}

export async function addTransaction(data: any) {
  const salonId = await getSalonId()
  if (!salonId) throw new Error("Não autorizado")

  const transaction = await prisma.transaction.create({
    data: {
      salon_id: salonId,
      type: data.type, // "income" | "expense"
      amount: data.amount,
      description: data.description,
      payment_method: data.payment_method || "cash",
      staff_id: data.staff_id || null,
      appointment_id: data.appointment_id || null,
      product_id: data.product_id || null
    }
  })

  await logAction({
     action: "create_transaction",
     entity: "transaction",
     entityId: transaction.id,
     salonId,
     details: { type: data.type, amount: data.amount, description: data.description }
  })

  // Se houver um caixa aberto, poderíamos atualizar os totais aqui ou calcular no fecho
  revalidatePath("/dashboard/financeiro")
  return JSON.parse(JSON.stringify(transaction))
}


