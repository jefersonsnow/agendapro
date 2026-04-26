"use server"

import { signIn, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getGlobalConfigCache } from "@/lib/dal"
import { AuthError } from "next-auth"
import { sendMail } from "@/lib/mail"
import crypto from "crypto"
import { signUpSchema, signUpWithDetailsSchema, loginSchema } from "@/lib/validations/auth"
import Stripe from "stripe"

export async function signUp(formData: any) {
  const validatedFields = signUpSchema.safeParse(formData)
  
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { email: rawEmail, password, salonName } = validatedFields.data
  const email = rawEmail.toLowerCase()



  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        }
      })

      const slug = salonName.toLowerCase().replace(/ /g, "-")
      
      await tx.salon.create({
        data: {
          name: salonName,
          slug,
          owner_id: user.id,
        }
      })
    })

    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function signUpWithDetails(formData: any) {
  const validatedFields = signUpWithDetailsSchema.safeParse(formData)
  
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { email: rawEmail, password, name, salonName, address, phone, nif, plan } = validatedFields.data
  const email = rawEmail.toLowerCase()

  // 1. Verificar se usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: { email: ["Este e-mail já está em uso."] } }
  }

  // 2. Hash da password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Criar Registo Pendente
  const pending = await prisma.pendingRegistration.create({
    data: {
      email,
      password: hashedPassword,
      name,
      salon_name: salonName,
      address,
      phone,
      nif,
      plan
    }
  })

  // 4. Obter Configurações do Stripe
  const config = await getGlobalConfigCache()
  const stripeConfigs = config?.stripe_configs ? JSON.parse(config.stripe_configs) : {}
  const secretKey = stripeConfigs.secretKey || process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
     return { error: "Erro de configuração: Stripe não configurado." }
  }

  const stripe = new Stripe(secretKey)

  // 5. Determinar o Price ID
  let priceId = ""
  if (plan === "minimo") priceId = stripeConfigs.productMinimoId
  else if (plan === "basic") priceId = stripeConfigs.productBasicId
  else if (plan === "premium") priceId = stripeConfigs.productPremiumId

  if (!priceId) {
     return { error: "Erro de configuração: ID do produto Stripe não encontrado para este plano." }
  }

  // 6. Criar Sessão de Checkout
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/auth/login?success_registration=true`,
      cancel_url: `${baseUrl}/?canceled_registration=true`,
      client_reference_id: pending.id,
      customer_email: email,
      metadata: {
        pending_registration_id: pending.id
      }
    })

    return { success: true, url: session.url }
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error)
    return { error: "Erro ao criar sessão de pagamento: " + error.message }
  }
}


export async function login(formData: any) {
  const validatedFields = loginSchema.safeParse(formData)
  
  if (!validatedFields.success) {
    return { error: "Dados inválidos" }
  }

  try {
    const { email: rawEmail, password, slug, redirectTo } = validatedFields.data
    const email = rawEmail.toLowerCase()

    
    let user;
    if (slug) {
      const salon = await prisma.salon.findUnique({ where: { slug } })
      if (!salon) return { error: "Salão não encontrado" }
      
      user = await prisma.user.findFirst({
        where: { 
          email,
          salon_id: salon.id
        }
      })
    } else {
      user = await prisma.user.findFirst({
        where: { 
          email,
          role: "admin"
        }
      })
    }

    if (!user || !user.password) return { error: "Credenciais inválidas" }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return { error: "Credenciais inválidas" }

    let targetUrl = redirectTo || (user.role === "admin" ? "/admin" : "/dashboard")


    await signIn("credentials", {
      email,
      password,
      slug: slug || "",
      redirectTo: targetUrl,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais inválidas" }
        default:
          return { error: "Algo correu mal no login" }
      }
    }
    
    // IMPORTANTE: Permitir que o redirecionamento do Next.js funcione
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    throw error
  }
}

export async function logout(slug?: string, locale: string = "pt") {
  if (slug) {
    await signOut({ redirectTo: `/${locale}/${slug}/login` })
  } else {
    await signOut({ redirectTo: `/${locale}/auth/login` })
  }
}

export async function logoutAdmin(arg?: any) {
  const locale = typeof arg === "string" ? arg : "pt"
  await signOut({ redirectTo: `/${locale}/admin/login` })
}

export async function recoverPassword(email: string, slug?: string) {
  try {
    if (!email) {
      return { error: "O e-mail é obrigatório." }
    }

    let user;
    if (slug) {
      const salon = await prisma.salon.findUnique({ where: { slug } })
      if (!salon) return { error: "Salão não encontrado." }
      
      user = await prisma.user.findFirst({
        where: { email, salon_id: salon.id },
      })
    } else {
      user = await prisma.user.findFirst({
        where: { email, salon_id: null },
      })
    }

    if (!user) {
      return { error: "Não encontrámos uma conta com este e-mail." }
    }

    const tempPassword = crypto.randomBytes(4).toString("hex")
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    const emailResult = await sendMail({
      to: email,
      subject: "A sua nova Palavra-passe - AgendarPro",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
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

export async function impersonateUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { salon: true }
    })

    if (!user) throw new Error("Utilizador não encontrado")
    
    return { success: true, slug: user.salon?.slug }
  } catch (error) {
    console.error("Erro no impersonate:", error)
    return { error: "Falha ao assumir identidade" }
  }
}
