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
    try {
      // 1. Criar Registo Pendente
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

      // 2. Enviar E-mail de Confirmação para ativação do Trial
      const headersList = await headers()
      const host = headersList.get("host")
      const protocol = host?.includes("localhost") ? "http" : "https"
      const baseUrl = `${protocol}://${host}`
      const confirmLink = `${baseUrl}/confirmar-registo?token=${pending.id}`

      await sendMail({
        to: email,
        subject: `Confirme o seu e-mail para ativar os 60 dias grátis no AgendarPro`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 10px;">
            <h1 style="color: #0d9488; text-align: center;">Ative a sua Conta Grátis!</h1>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Olá, <strong>${name}</strong>!<br/><br/>
              Obrigado por se registar no AgendarPro! Para ativar o seu período de teste gratuito de <strong>${promo.trial_days || 60} dias</strong> para o salão <strong>${salonName}</strong>, por favor clique no botão de ativação abaixo:
            </p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${confirmLink}" style="background: #0d9488; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);">ACTIVER CONTA AGORA</a>
            </div>
            <p style="font-size: 14px; color: #777; line-height: 1.6;">
              Se o botão acima não funcionar, copie e cole o seguinte link no seu browser:<br/>
              <a href="${confirmLink}" style="color: #0d9488; text-decoration: underline;">${confirmLink}</a>
            </p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              Se não iniciou esta inscrição, por favor ignore este e-mail. <br/>
              Equipa AgendarPro
            </p>
          </div>
        `
      })

      return { success: true, requiresVerification: true }
    } catch (err: any) {
      console.error("Erro ao gerar registo pendente para trial:", err)
      return { error: "Erro ao processar registo: " + err.message }
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

export async function confirmRegistrationByToken(token: string) {
  if (!token) return { error: "Token inválido." }

  try {
    const pending = await prisma.pendingRegistration.findUnique({
      where: { id: token }
    })

    if (!pending) {
      return { error: "Link de ativação expirado ou já utilizado." }
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: pending.email }
    })
    if (existingUser) {
      return { error: "Esta conta já foi ativada. Por favor, aceda ao painel de login." }
    }

    const config = await getGlobalConfigCache()
    const promo = config?.promotion_config ? JSON.parse(config.promotion_config) : { enabled: false, trial_days: 60 }
    const trialDays = promo.trial_days || 60
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)

    const baseSlug = pending.salon_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
    let slug = baseSlug
    const existingSalon = await prisma.salon.findUnique({ where: { slug } })
    if (existingSalon) {
      slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`
    }

    let user: any = null
    let salon: any = null

    await prisma.$transaction(async (tx) => {
      user = await tx.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          password: pending.password,
          role: "owner",
        }
      })

      salon = await tx.salon.create({
        data: {
          name: pending.salon_name,
          slug,
          email: pending.email,
          phone: pending.phone,
          address: pending.address,
          nif: pending.nif,
          owner_id: user.id,
          plan: pending.plan,
          status: "trial",
          trial_ends_at: trialEndsAt
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
          name: pending.name || "Proprietário",
          email: pending.email,
          phone: pending.phone,
          role: "owner",
          is_active: true
        }
      })
    })

    try {
      const welcomeConfig = config?.welcome_email_config ? JSON.parse(config.welcome_email_config) : {}
      const extraContent = welcomeConfig.enableExtraContent ? (welcomeConfig.extraHtmlContent || "") : ""

      await sendMail({
        to: pending.email,
        subject: `Bem-vindo ao AgendarPro! O seu período de teste grátis de ${trialDays} dias começou`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 10px;">
            <h1 style="color: #333;">Olá, ${pending.name}!</h1>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Parabéns! O seu salão <strong>${pending.salon_name}</strong> já está ativo na nossa plataforma no período de teste gratuito de <strong>${trialDays} dias</strong>.
            </p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; font-weight: bold; color: #333;">Seus dados de acesso:</p>
              <p style="margin: 10px 0 0 0; color: #666;">Painel de Gestão: <a href="https://agendar.napp.pt/${slug}/login" style="color: #0d9488; text-decoration: none; font-weight: bold;">Entrar no Painel</a></p>
              <p style="margin: 5px 0 0 0; color: #666;">E-mail: ${pending.email}</p>
            </div>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              O seu link público para agendamentos de clientes é: <br/>
              <a href="https://agendar.napp.pt/${slug}" style="font-weight: bold; color: #0d9488; text-decoration: none;">agendar.napp.pt/${slug}</a>
            </p>
            ${extraContent ? '<hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;"> ' + extraContent : ""}
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

    await prisma.pendingRegistration.delete({
      where: { id: token }
    })

    return { 
      success: true, 
      salonSlug: slug, 
      salonName: pending.salon_name 
    }
  } catch (err: any) {
    console.error("ACTIVATION ERROR:", err)
    return { error: "Erro ao ativar o registo: " + err.message }
  }
}
