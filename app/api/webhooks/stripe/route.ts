import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import Stripe from "stripe"

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

    const stripe = new Stripe(secretKey, {
      apiVersion: "2026-03-25.dahlia" as any, 
    })

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
        
        if (email) {
          // Encontrar Salão pelo email do dono
          const salon = await prisma.salon.findFirst({
            where: { email: email }
          })

          if (salon) {
            // Obter os itens da sessão para saber qual preço foi comprado
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
            const priceId = lineItems.data[0]?.price?.id

            let newPlan = "premium"
            if (priceId && priceId === stripeConfigs.productBasicId) {
                newPlan = "basic"
            }

            await prisma.salon.update({
              where: { id: salon.id },
              data: {
                plan: newPlan,
                status: "active",
                trial_ends_at: null // Remover trial pois ativou plano pago
              }
            })

            console.log(`Stripe Webhook: Salão ${salon.name} atualizado para plano ${newPlan} via Stripe!`)
          } else {
            console.warn(`Stripe Webhook: Salão não encontrado para o email ${email}`)
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
             // Downgrade automático para o plano Free (ou pode marcar status como 'expired')
             await prisma.salon.update({
                where: { id: salon.id },
                data: {
                  plan: "free"
                }
             })
             console.log(`Stripe Webhook: Assinatura cancelada! Salão ${salon.name} alterado para plano free.`)
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
