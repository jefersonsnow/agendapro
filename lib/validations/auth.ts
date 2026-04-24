import { z } from "zod"

export const signUpSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  salonName: z.string().min(2, "Nome do salão deve ter pelo menos 2 caracteres"),
})

export const signUpFreeTrialSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "Nome é obrigatório"),
  salonName: z.string().min(2, "Nome do salão é obrigatório"),
  address: z.string().optional(),
  phone: z.string().optional(),
  nif: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
  slug: z.string().optional(),
  redirectTo: z.string().optional(),
})
