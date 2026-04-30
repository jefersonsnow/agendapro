"use server"

import { createClient } from "@supabase/supabase-js"
import { auth } from "@/auth"
import sharp from "sharp"

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

    // --- Configurações de Limites e Otimização ---
    const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"]
    const MAX_INPUT_SIZE = 5 * 1024 * 1024 // Aceitamos até 5MB para processar

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return { error: "Extensão de ficheiro não permitida. Use apenas imagens (JPG, PNG, WEBP)." }
    }

    if (file.size > MAX_INPUT_SIZE) {
      return { error: "O ficheiro original é demasiado grande. Limite máximo: 5MB." }
    }

    // 1. Converter File para Buffer para o Sharp processar
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // 2. Processamento com SHARP
    // - Redimensionar (máximo 1200px de largura/altura mantendo proporção)
    // - Converter para WebP (formato mais eficiente da web)
    // - Comprimir qualidade para 80% (equilíbrio perfeito entre peso e visual)
    const optimizedBuffer = await sharp(inputBuffer)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true // Não aumenta se a imagem for pequena
      })
      .webp({ quality: 80 })
      .toBuffer()

    // 3. Nome do ficheiro (sempre .webp agora)
    const filename = `salon-media/${session.user.id}-${Date.now()}.webp`

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filename, optimizedBuffer, {
        contentType: "image/webp",
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
    console.error("[UPLOAD_ERROR]", err)
    return { error: "Erro ao processar imagem: " + (err.message || "Erro interno") }
  }
}
