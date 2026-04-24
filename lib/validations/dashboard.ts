import { z } from "zod"

export const clientSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  nif: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  loyalty_points: z.coerce.number().int().default(0),
  password: z.string().optional().or(z.literal("")),
})

export const serviceSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  description: z.string().optional().or(z.literal("")),
  duration_minutes: z.coerce.number().int().min(1, "Duração mínima 1 min"),
  price: z.coerce.number().min(0, "Preço inválido"),
  category: z.string().default("Geral"),
  image_url: z.string().nullable().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  display_order: z.number().int().default(0),
  staff_ids: z.array(z.string()).optional(),
  commissions: z.record(z.string(), z.number()).optional(), // staffId -> fixed commission
})

export const staffSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional().or(z.literal("")),
  role: z.string().default("professional"),
  avatar_url: z.string().nullable().optional().or(z.literal("")),
  bio: z.string().nullable().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  color: z.string().default("#0D9488"),
  working_hours: z.any().optional(), // Handled by the action (string or object)


})
