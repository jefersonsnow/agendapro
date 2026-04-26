import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import Stripe from "stripe"
import { sendMail } from "@/lib/mail"
import { getGlobalConfigCache } from "@/lib/dal"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("stripe-signature")
    
    // 1. Obter a configuração do banco de dados (GlobalConfig via Raw SQL)
    const configs = await (prisma as any).$queryRawUnsafe(`SELECT * FROM global_configs WHERE id = 'singleton' LIMIT 1`)
    const config = configs?.[0]
    const stripeConfigs = config?.stripe_configs ? JSON.parse(config.stripe_configs) : {}
    
    const secretKey = stripeConfigs.secretKey || process.env.STRIPE_SECRET_KEY
    const webhookSecret = stripeConfigs.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET

    // 2. Validar chaves e assinatura (OBRIGATÓRIO)
    if (!secretKey || !webhookSecret) {
      console.error("Stripe Webhook: Chaves não configuradas no sistema")
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 })
    }

    if (!signature) {
      console.error("Stripe Webhook: Assinatura ausente no header")
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const stripe = new Stripe(secretKey)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      console.error("Stripe Webhook: Assinatura inválida.", err.message)
      return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 })
    }

    // 3. Processar Eventos do Stripe
    switch (event.type) {
      
      // Ocorre quando um pagamento/subscrição é concluído com sucesso
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const email = session.customer_details?.email
        const pendingId = session.client_reference_id
        
        if (pendingId) {
          // 1. NOVO REGISTO APÓS PAGAMENTO
          const pending = await prisma.pendingRegistration.findUnique({
            where: { id: pendingId }
          })

          if (pending) {
            // A. Criar Usuário (Dono)
            const user = await prisma.user.create({
              data: {
                name: pending.name,
                email: pending.email,
                password: pending.password,
                role: "owner",
              }
            })

            // B. Criar Salão (Slug gerado do nome)
            const baseSlug = pending.salon_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
            let slug = baseSlug
            const existingSalon = await prisma.salon.findUnique({ where: { slug } })
            if (existingSalon) {
              slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`
            }

            const salon = await prisma.salon.create({
              data: {
                name: pending.salon_name,
                slug,
                email: pending.email,
                phone: pending.phone,
                address: pending.address,
                nif: pending.nif,
                owner_id: user.id,
                plan: pending.plan,
                status: "active",
                trial_ends_at: null
              }
            })

            // C. Vincular usuário ao salão
            await prisma.user.update({
              where: { id: user.id },
              data: { salon_id: salon.id }
            })

            // D. Enviar E-mail de Boas-vindas
            try {
               const config = await getGlobalConfigCache()
               const welcomeConfig = config?.welcome_email_config ? JSON.parse(config.welcome_email_config) : {}
               const extraContent = welcomeConfig.enableExtraContent ? (welcomeConfig.extraHtmlContent || "") : ""

               await sendMail({
                 to: pending.email,
                 subject: `Bem-vindo ao AgendarPro! Sua conta foi criada com sucesso`,
                 html: `
                   <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 10px;">
                     <h1 style="color: #333;">Olá, ${pending.name}!</h1>
                     <p style="font-size: 16px; color: #555; line-height: 1.6;">
                       Parabéns! O seu salão <strong>${pending.salon_name}</strong> já está configurado na nossa plataforma após o pagamento confirmado.
                     </p>
                     <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                       <p style="margin: 0; font-weight: bold; color: #333;">Seus dados de acesso:</p>
                       <p style="margin: 10px 0 0 0; color: #666;">Painel: <a href="https://agendar.napp.pt/${slug}/login" style="color: #007bff; text-decoration: none;">agendar.napp.pt/${slug}/login</a></p>
                       <p style="margin: 5px 0 0 0; color: #666;">E-mail: ${pending.email}</p>
                     </div>
                     <p style="font-size: 16px; color: #555; line-height: 1.6;">
                       O seu link público para agendamentos é: <br/>
                       <a href="https://agendar.napp.pt/${slug}" style="font-weight: bold; color: #007bff; text-decoration: none;">agendar.napp.pt/${slug}</a>
                     </p>
                     ${extraContent ? `<hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;"> ${extraContent}` : ""}
                     <p style="font-size: 14px; color: #888; margin-top: 40px;">
                       Se precisar de ajuda, responda a este e-mail ou entre em contacto com o suporte. <br/>
                       Equipa AgendarPro
                     </p>
                   </div>
                 `
               })
            } catch (err) {
               console.error("Stripe Webhook: Erro ao enviar email de boas-vindas:", err)
            }

            // E. Apagar o registo pendente
            await prisma.pendingRegistration.delete({
               where: { id: pendingId }
            })

            console.log(`Stripe Webhook: Novo salão ${salon.name} criado com sucesso após pagamento!`)
          }
        } else if (email) {
          // 2. UPGRADE DE PLANO PARA SALÃO EXISTENTE
          const salon = await prisma.salon.findFirst({
            where: { email: email }
          })

          if (salon) {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
            const priceId = lineItems.data[0]?.price?.id

            let newPlan = "premium"
            if (priceId && priceId === stripeConfigs.productBasicId) {
                newPlan = "basic"
            } else if (priceId && priceId === stripeConfigs.productMinimoId) {
                newPlan = "minimo"
            }

            await prisma.salon.update({
              where: { id: salon.id },
              data: {
                plan: newPlan,
                status: "active",
                trial_ends_at: null
              }
            })

            console.log(`Stripe Webhook: Salão ${salon.name} atualizado para plano ${newPlan} via Stripe!`)
          }
        }
        break
      }

      // Ocorre quando uma subscrição é cancelada ou falha renovação consecutivamente
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        const customer = await stripe.customers.retrieve(customerId)
        
        if (!customer.deleted && "email" in customer && customer.email) {
           const email = customer.email
           const salon = await prisma.salon.findFirst({
             where: { email: email }
           })
           
           if (salon) {
             // Downgrade automático para o plano Mínimo (ou pode marcar status como 'expired')
             await prisma.salon.update({
                where: { id: salon.id },
                data: {
                  plan: "minimo"
                }
             })
             console.log(`Stripe Webhook: Assinatura cancelada! Salão ${salon.name} alterado para plano minimo.`)
           }
        }
        break
      }
      
      // Pode mapear outros alertas (ex: 'invoice.payment_failed') para enviar emails se quiser
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Stripe Webhook Error:", error)
    return NextResponse.json({ error: "Webhook Server Error" }, { status: 500 })
  }
}
