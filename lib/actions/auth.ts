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
import { headers } from "next/headers"

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
      
      const salon = await tx.salon.create({
        data: {
          name: salonName,
          slug,
          owner_id: user.id,
        }
      })
      
      await tx.user.update({
        where: { id: user.id },
        data: { salon_id: salon.id }
      })

      await tx.staff.create({
        data: {
          salon_id: salon.id,
          user_id: user.id,
          name: "Proprietário",
          email: email,
          role: "owner",
          is_active: true
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

  const { email: rawEmail, password, name, salonName, address, phone, nif, plan } = formData
  const email = rawEmail.toLowerCase()

  // 1. Verificar se usuário já existe
  const existingUser = await prisma.user.findFirst({
    where: { email }
  })

  if (existingUser) {
    return { error: { email: ["Este e-mail já está em uso."] } }
  }

  // 2. Hash da password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Criar Registo Pendente (Apenas se o trial NÃO estiver ativo, para evitar registos fantasmas)
  const config = await getGlobalConfigCache()
  const promo = config?.promotion_config ? JSON.parse(config.promotion_config) : { enabled: false, trial_days: 30, promo_text: "" }

  if (promo.enabled) {
    // BYPASS STRIPE - CRIAÇÃO DIRETA EM MODO TRIAL
    try {
      const trialDays = promo.trial_days || 30
      const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)

      // Gerar slug limpo baseado no nome do salão
      const baseSlug = salonName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
      let slug = baseSlug
      const existingSalon = await prisma.salon.findUnique({ where: { slug } })
      if (existingSalon) {
        slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`
      }

      await prisma.$transaction(async (tx) => {
        // A. Criar Usuário (Dono)
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: "owner",
          }
        })

        // B. Criar Salão
        const salon = await tx.salon.create({
          data: {
            name: salonName,
            slug,
            email,
            phone,
            address,
            nif,
            owner_id: user.id,
            plan,
            status: "trial",
            trial_ends_at: trialEndsAt
          }
        })

        // C. Vincular usuário ao salão
        await tx.user.update({
          where: { id: user.id },
          data: { salon_id: salon.id }
        })

        // D. Criar Perfil de Staff para o Proprietário
        await tx.staff.create({
          data: {
            salon_id: salon.id,
            user_id: user.id,
            name: name || "Proprietário",
            email: email,
            phone: phone,
            role: "owner",
            is_active: true
          }
        })
      })

      // E. Enviar E-mail de Boas-vindas para o Trial
      try {
        const welcomeConfig = config?.welcome_email_config ? JSON.parse(config.welcome_email_config) : {}
        const extraContent = welcomeConfig.enableExtraContent ? (welcomeConfig.extraHtmlContent || "") : ""

        await sendMail({
          to: email,
          subject: `Bem-vindo ao AgendarPro! O seu período de teste grátis de ${trialDays} dias começou`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 10px;">
              <h1 style="color: #333;">Olá, ${name}!</h1>
              <p style="font-size: 16px; color: #555; line-height: 1.6;">
                Parabéns! O seu salão <strong>${salonName}</strong> já está configurado na nossa plataforma no período de teste gratuito de <strong>${trialDays} dias</strong>.
              </p>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-weight: bold; color: #333;">Seus dados de acesso:</p>
                <p style="margin: 10px 0 0 0; color: #666;">Painel de Gestão: <a href="https://agendar.napp.pt/${slug}/login" style="color: #0d9488; text-decoration: none; font-weight: bold;">Entrar no Painel</a></p>
                <p style="margin: 5px 0 0 0; color: #666;">E-mail: ${email}</p>
              </div>
              <p style="font-size: 16px; color: #555; line-height: 1.6;">
                O seu link público para agendamentos de clientes é: <br/>
                <a href="https://agendar.napp.pt/${slug}" style="font-weight: bold; color: #0d9488; text-decoration: none;">agendar.napp.pt/${slug}</a>
              </p>
              ${extraContent ? `<hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;"> ${extraContent}` : ""}
              <p style="font-size: 14px; color: #888; margin-top: 40px;">
                Se precisar de qualquer ajuda durante o seu período de teste, responda a este e-mail ou fale com o nosso suporte. <br/>
                Equipa AgendarPro
              </p>
            </div>
          `
        })
      } catch (err) {
        console.error("Erro ao enviar e-mail de boas-vindas do trial:", err)
      }

      // F. Login automático
      try {
        await signIn("credentials", {
          email,
          password,
          slug,
          redirectTo: "/dashboard",
        })
      } catch (error) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
          throw error;
        }
        return { success: true, url: `/auth/login?registered=true&email=${encodeURIComponent(email)}` }
      }

      return { success: true, url: "/dashboard" }
    } catch (dbError: any) {
      console.error("Erro ao criar salão em modo trial:", dbError)
      return { error: "Erro interno ao processar o registo: " + dbError.message }
    }
  }

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
  const stripeConfigs = config?.stripe_configs ? JSON.parse(config.stripe_configs) : {}
  const secretKey = stripeConfigs.secretKey || process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
     return { error: "Erro de configuração: Stripe não configurado." }
  }

  const stripe = new Stripe(secretKey)

  // 5. Determinar o Price ID (Apenas para planos que usam a API de Checkout direto)
  let priceId = ""
  if (plan === "minimo") priceId = stripeConfigs.productMinimoId
  else if (plan === "basic") priceId = stripeConfigs.productBasicId
  else if (plan === "premium" || plan === "premium_offer") {
     priceId = "manual_link" // Marcador para passar na validação
  }

  if (!priceId) {
     return { error: "Erro de configuração: ID do produto Stripe não encontrado para este plano." }
  }

  // 6. Criar Sessão de Checkout ou Redirecionar para Link Externo
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = host?.includes("localhost") ? "http" : "https"
  const baseUrl = `${protocol}://${host}`
  
  try {
    // SE FOR PLANO PREMIUM DA OFERTA (COM DESCONTO)
    if (plan === "premium_offer") {
      const stripePromoUrl = `https://buy.stripe.com/bJe4gy3ZY1gxfy66G6bwk05?prefilled_promo_code=LIMITADO50&client_reference_id=${pending.id}&prefilled_email=${encodeURIComponent(email)}`
      return { success: true, url: stripePromoUrl }
    }

    // SE FOR PLANO PREMIUM NORMAL DO SITE
    if (plan === "premium") {
      const stripeStandardUrl = `https://buy.stripe.com/6oUdR8gMK1gx3Po9Sibwk00?client_reference_id=${pending.id}&prefilled_email=${encodeURIComponent(email)}`
      return { success: true, url: stripeStandardUrl }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/pagamento-sucesso?valor=${plan === 'minimo' ? '19' : plan === 'basic' ? '29' : '39'}`,
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
