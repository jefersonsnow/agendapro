"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function checkClientAccount(salonId: string, phone: string) {
  const client = await prisma.client.findFirst({
    where: { salon_id: salonId, phone: phone }
  })
  if (!client) return { exists: false }
  if ((client as any).password) return { exists: true, requiresPassword: true, name: client.name }
  return { exists: true, requiresPassword: false, name: client.name }
}

export async function loginClient(salonId: string, phone: string, passwordHashAttempt: string) {
  if (!phone || !passwordHashAttempt) throw new Error("Preencha todos os campos")
  
  const client = await prisma.client.findFirst({
    where: {
      salon_id: salonId,
      phone: phone
    }
  })

  if (!client) {
    throw new Error("Nenhuma conta encontrada com este número neste salão.")
  }

  if (!(client as any).password) {
     throw new Error("Esta conta não possui senha registada. Realize os seus agendamentos normalmente como convidado.")
  }

  const isValid = await bcrypt.compare(passwordHashAttempt, (client as any).password)
  if (!isValid) {
    throw new Error("Senha incorreta.")
  }

  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email
  }
}

export async function registerClient(salonId: string, data: { name: string, phone: string, email?: string, password: string }) {
  if (!data.name || !data.phone || !data.password) throw new Error("Preencha todos os campos obrigatórios")

  const existingClient = await prisma.client.findFirst({
    where: {
      salon_id: salonId,
      phone: data.phone
    }
  })

  const hashedPassword = await bcrypt.hash(data.password, 10)

  if (existingClient) {
    if ((existingClient as any).password) {
      throw new Error("Este número já se encontra registado e possui uma palavra-passe.")
    } else {
      // Cliente já fez marcações como convidado no passado, vamos "promovê-lo" a conta
      const updatedClient = await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          name: data.name,
          email: data.email || null,
          password: hashedPassword
        } as any
      })
      
      return {
        id: updatedClient.id,
         name: updatedClient.name,
         phone: updatedClient.phone,
         email: updatedClient.email
      }
    }
  }

  // Novo cliente
  const newClient = await prisma.client.create({
    data: {
      salon_id: salonId,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      password: hashedPassword
    } as any
  })

  return {
     id: newClient.id,
     name: newClient.name,
     phone: newClient.phone,
     email: newClient.email
  }
}
