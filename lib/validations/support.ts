import { z } from "zod"

export const supportTicketSchema = z.object({
  subject: z.string().min(5, "Assunto muito curto"),
  message: z.string().min(10, "Mensagem muito curta"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
})
