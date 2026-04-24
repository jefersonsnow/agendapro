"use server"

import { signIn, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getGlobalConfigCache } from "@/lib/dal"
import { AuthError } from "next-auth"
import { sendMail } from "@/lib/mail"
import crypto from "crypto"
import { signUpSchema, signUpFreeTrialSchema, loginSchema } from "@/lib/validations/auth"

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

export async function signUpFreeTrial(formData: any) {
  const validatedFields = signUpFreeTrialSchema.safeParse(formData)
  
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors }
  }

  const { email: rawEmail, password, name, salonName, address, phone, nif } = validatedFields.data
  const email = rawEmail.toLowerCase()



  const hashedPassword = await bcrypt.hash(password, 10)
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 30)

  const result = await prisma.$transaction(async (tx: any) => {
    // 1. CRIAR O UTILIZADOR
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
      }
    })

    // 2. CRIAR O SALÃO (Trial)
    const slugBase = salonName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    const existingSlug = await tx.salon.findUnique({ where: { slug: slugBase } })
    const finalSlug = existingSlug 
      ? `${slugBase}-${Math.random().toString(36).substring(2, 5)}` 
      : slugBase

    const salon = await tx.salon.create({
      data: {
        name: salonName,
        slug: finalSlug,
        owner_id: user.id,
        address: address,
        phone: phone,
        nif: nif,
        plan: "free",
        status: "trial",
        trial_ends_at: trialEndsAt
      }
    })

    // 3. VINCULAR O UTILIZADOR AO SALÃO
    await tx.user.update({
      where: { id: user.id },
      data: { salon_id: salon.id }
    })

    return { user, salon }
  })

  // === ENVIO DE E-MAIL (MODO SÍNCRONO) ===
  try {
    const config = await getGlobalConfigCache();
    let extraHtml = "";
    
    if (config?.welcome_email_config) {
       try {
         const we = JSON.parse(config.welcome_email_config);
         if (we.enableExtraContent && we.extraHtmlContent) {
           extraHtml = we.extraHtmlContent;
         }
       } catch (e) {}
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agendar.napp.pt";
    const loginLink = `${appUrl}/pt/${result.salon.slug}/login`;

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0D9488;">Bem-vindo(a) ao AgendarPro!</h2>
        <p>Olá <strong>${name}</strong>,</p>
        <p>O salão <strong>${salonName}</strong> foi registado com sucesso e os seus 30 dias grátis já começaram!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111827;">Os seus dados de acesso:</h3>
          <p><strong>Link do Painel:</strong> <a href="${loginLink}" style="color: #0D9488;">${loginLink}</a></p>
          <p><strong>E-mail:</strong> ${email}</p>
        </div>
        
        <p style="font-size: 12px; color: #6b7280;">Utilize a palavra-passe que definiu durante o registo. Por segurança, nunca partilhamos nem armazenamos palavras-passe em texto legível.</p>
        
        ${extraHtml ? `<div style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">${extraHtml}</div>` : ""}
        
        <br/>
        <p>Com os melhores cumprimentos,<br/>Equipa AgendarPro</p>
      </div>
    `;

    await sendMail({
      to: email,
      subject: `Bem-vindo ao AgendarPro - ${salonName}`,
      html: emailHtml
    });
  } catch (err) {
    console.error("Erro ao enviar e-mail de boas-vindas:", err);
  }

  return { success: true }
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
