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

    // A regra de email único agora é POR SALÃO. No cadastro inicial, 
    // verificamos se o email já existe sem salon_id (admin) ou se o salão já existe.
    
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Gerar o slug primeiro para ter o ID do salão ou criar o salão antes
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

      // 2. Criar o Usuário Dono (temporariamente sem salon_id para criar o salão)
      // Ou melhor: Criar o salão com um owner_id temporário e depois atualizar
      // Mas o Prisma exige owner_id. Vamos criar o User PRIMEIRO com um salon_id nulo??
      // Não, vamos criar o Salão primeiro com um owner_id vindo de um User que criamos sem salon_id.
      
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: salonName,
          role: "owner"
        }
      })

      const salon = await tx.salon.create({
        data: {
          name: salonName,
          slug: finalSlug,
          owner_id: user.id,
        }
      })

      // 3. AGORA vinculamos o usuário ao seu salão (Isolamento Total)
      await tx.user.update({
        where: { id: user.id },
        data: { salon_id: salon.id }
      })

      return { user, salon }
    })

  // === INÍCIO DO ENVIO DE E-MAIL ===
  try {
    const configs = await (prisma as any).$queryRawUnsafe(`SELECT * FROM global_configs WHERE id = 'singleton' LIMIT 1`);
    const config = configs?.[0];
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
        <p>Olá,</p>
        <p>O salão <strong>${salonName}</strong> foi registado com sucesso!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111827;">Os seus dados de acesso:</h3>
          <p><strong>Link do Painel:</strong> <a href="${loginLink}" style="color: #0D9488;">${loginLink}</a></p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Palavra-passe:</strong> ${password}</p>
        </div>
        
        <p style="font-size: 12px; color: #6b7280;">Recomendamos que guarde esta palavra-passe num local seguro ou a altere assim que entrar no sistema.</p>
        
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
  // === FIM DO ENVIO DE E-MAIL ===

  return { success: true }
}

export async function signUpFreeTrial(formData: any) {
  const { email, password, name, salonName, address, nif, phone } = formData

  if (!email || !password || !salonName || !name) {
    throw new Error("Dados obrigatórios em falta")
  }

  // Verificar se o usuário já existe como conta principal (global)
  const existingUser = await prisma.user.findFirst({
    where: { 
      email,
      salon_id: null
    }
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

    // 3. VINCULAR O UTILIZADOR AO SALÃO (NAPP Deep Isolation)
    await tx.user.update({
      where: { id: user.id },
      data: { salon_id: salon.id }
    })

    return { user, salon }
  })

  // === INÍCIO DO ENVIO DE E-MAIL ===
  try {
    const configs = await (prisma as any).$queryRawUnsafe(`SELECT * FROM global_configs WHERE id = 'singleton' LIMIT 1`);
    const config = configs?.[0];
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
          <p><strong>Palavra-passe:</strong> ${password}</p>
        </div>
        
        <p style="font-size: 12px; color: #6b7280;">Recomendamos que guarde esta palavra-passe num local seguro ou a altere assim que entrar no sistema.</p>
        
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
  // === FIM DO ENVIO DE E-MAIL ===

  return { success: true }
}

export async function login(formData: any) {
  try {
    const { email, password, slug } = formData
    
    let user;
    let targetUrl = "/dashboard";

    if (slug) {
      // Login em salão específico (/[slug]/login)
      const salon = await prisma.salon.findUnique({ where: { slug } })
      if (!salon) throw new Error("Salão não encontrado")
      
      user = await prisma.user.findFirst({
        where: { 
          email,
          salon_id: salon.id
        },
        select: { id: true, role: true }
      })
    } else {
      // Login Global (Admin)
      user = await prisma.user.findFirst({
        where: { 
          email,
          salon_id: null // Admins globais não têm salon_id
        },
        select: { id: true, role: true }
      })
      if (user?.role === "admin") targetUrl = "/admin"
    }

    if (!user) {
      return { error: "Credenciais inválidas para este acesso." }
    }

    await signIn("credentials", {
      email,
      password,
      slug: slug || "", // Passamos o slug para o authorize no auth.ts
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

    // Gerar senha aleatória (8 caracteres com letras e números)
    const tempPassword = crypto.randomBytes(4).toString("hex")
    
    // Fazer Hash da senha temporária
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Atualizar no banco de dados
    await prisma.user.update({
      where: { id: user.id },
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

