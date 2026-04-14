"use server"

import { createClient } from "@supabase/supabase-js"
import { auth } from "@/auth"

export async function uploadFile(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Não autorizado. Por favor faça login novamente." }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { error: "Chaves do Supabase não configuradas no Vercel. Verifica as Environment Variables." }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const file = formData.get("file") as File
    if (!file) return { error: "Nenhum ficheiro recebido." }

    // --- SEC-005 & SEC-006: Validação de Segurança ---
    const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"]
    const MAX_SIZE = 1 * 1024 * 1024 // 1MB

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return { error: "Extensão de ficheiro não permitida. Use apenas imagens (JPG, PNG, WEBP)." }
    }

    if (file.size > MAX_SIZE) {
      return { error: "O ficheiro excede o limite de 1MB permitido." }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `salon-media/${session.user.id}-${Date.now()}.${fileExtension}`

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
       return { error: `Erro no Supabase: ${uploadError.message}. Verifica se o bucket 'uploads' é público.` }
    }

    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(filename)

    return { url: publicUrl }
  } catch (err: any) {
    return { error: "Erro crítico: " + (err.message || "Erro interno") }
  }
}
