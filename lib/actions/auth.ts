"use server"

import { signIn, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { sendMail } from "@/lib/mail"
import crypto from "crypto"

export async function signUp(formData: any) {
  const { email, password, salonName } = formData

  if (!email || !password || !salonName) {
    throw new Error("Dados incompletos")
  }

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("Este email já está registado")
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10)

  // Criar usuário e salão em uma transação
  const result = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name: salonName,
      }
    })

    const slug = salonName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-0]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    const salon = await tx.salon.create({
      data: {
        name: salonName,
        slug: `${slug}-${Math.random().toString(36).substring(2, 5)}`,
        owner_id: user.id,
      }
    })

    return { user, salon }
  })

  return { success: true }
}

export async function signUpFreeTrial(formData: any) {
  const { email, password, name, salonName, address, nif, phone } = formData

  if (!email || !password || !salonName || !name) {
    throw new Error("Dados obrigatórios em falta")
  }

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("Este email já está registado")
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10)

  // Calcular data de expiração (30 dias a partir de hoje)
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 30)

  // Criar usuário e salão em uma transação
  const result = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name, // Usar o Nome + Apelido do formulário
      }
    })

    const slug = salonName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-0]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    const salon = await tx.salon.create({
      data: {
        name: salonName,
        slug: `${slug}-${Math.random().toString(36).substring(2, 5)}`,
        owner_id: user.id,
        address: address,
        phone: phone,
        nif: nif,
        plan: "free",
        status: "trial",
        trial_ends_at: trialEndsAt
      }
    })

    return { user, salon }
  })

  return { success: true }
}

export async function login(formData: any) {
  try {
    const { email, password } = formData
    
    // Buscar o usuário para saber o papel (role) sem expor senhas a este nível
    const user = await prisma.user.findUnique({
       where: { email },
       select: { id: true, role: true }
    })

    const targetUrl = user?.role === "admin" ? "/admin" : "/dashboard"

    await signIn("credentials", {
      email,
      password,
      redirectTo: targetUrl,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais inválidas" }
        default:
          return { error: "Erro na autenticação" }
      }
    }
    
    // IMPORTANTE: Permitir que o redireccionamento do Next.js funcione
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    console.error("ERRO REAL NO LOGIN:", error);
    throw error
  }
}
export async function logout() {
  await signOut({ redirectTo: "/auth/login" })
}

export async function logoutAdmin() {
  await signOut({ redirectTo: "/admin/login" })
}

export async function recoverPassword(email: string) {
  try {
    if (!email) {
      return { error: "O e-mail é obrigatório." }
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: "Não encontrámos uma conta com este e-mail." }
    }

    // Gerar senha aleatória (8 caracteres com letras e números)
    const tempPassword = crypto.randomBytes(4).toString("hex")
    
    // Fazer Hash da senha temporária
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Atualizar no banco de dados
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Enviar a senha por e-mail
    const emailResult = await sendMail({
      to: email,
      subject: "A sua nova Palavra-passe - AgendarPro",
      html: `
        <div style="font-family: sans-serif; max-w-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0D9488;">Recuperação de Palavra-passe</h2>
          <p>Olá,</p>
          <p>Foi solicitada uma nova senha para a sua conta corporativa.</p>
          <p>A sua nova senha de acesso temporária é: <strong>${tempPassword}</strong></p>
          <p>Aceda ao seu painel com esta senha e não se esqueça de alterá-la imediatamente nas definições da sua conta de login.</p>
          <br/>
          <p>Com os melhores cumprimentos,<br/>Equipa AgendarPro</p>
        </div>
      `,
    })

    if (emailResult.error) {
      return { error: "Erro ao enviar e-mail. A sua senha não foi alterada." }
    }

    return { success: true }
  } catch (error) {
    console.error("Recover password error:", error)
    return { error: "Ocorreu um erro inesperado." }
  }
}
