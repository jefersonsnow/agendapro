"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Stripe from "stripe"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function createCheckoutSession(planId: "basic" | "premium") {
  try {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.email) {
      return { error: "Não autorizado. Faça login para continuar." }
    }

    // 1. Obter configurações da Stripe
    const configs = await (prisma as any).$queryRawUnsafe(`SELECT stripe_configs FROM global_configs WHERE id = 'singleton' LIMIT 1`)
    const globalConfig = configs?.[0]
    
    if (!globalConfig?.stripe_configs) {
      return { error: "Configurações da Stripe não encontradas no banco de dados." }
    }

    const stripeConfigs = typeof globalConfig.stripe_configs === 'string' 
      ? JSON.parse(globalConfig.stripe_configs) 
      : globalConfig.stripe_configs

    const secretKey = stripeConfigs.secretKey || process.env.STRIPE_SECRET_KEY
    const priceId = planId === "basic" ? stripeConfigs.productBasicId : stripeConfigs.productPremiumId

    if (!secretKey) {
      return { error: "Secret Key da Stripe não encontrada no painel administrativo." }
    }

    if (!priceId) {
      return { error: `ID de Preço (${planId}) não encontrado no painel administrativo.` }
    }

    const stripe = new Stripe(secretKey)

    // 2. Determinar a URL base
    const headersList = await headers()
    const host = headersList.get("host")
    const protocol = host?.includes("localhost") ? "http" : "https"
    const baseUrl = `${protocol}://${host}`

    // 3. Criar a sessão
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/dashboard/configuracoes/planos?success=true`,
      cancel_url: `${baseUrl}/dashboard/configuracoes/planos?canceled=true`,
      metadata: {
        userId: session.user.id,
        planId: planId,
      },
    })

    if (!checkoutSession.url) {
      return { error: "A Stripe não retornou uma URL válida." }
    }

    return { url: checkoutSession.url }
  } catch (error: any) {
    console.error("ERRO NO CHECKOUT STRIPE:", error)
    return { error: error.message || "Erro interno no checkout" }
  }
}

export async function generateStripePaymentLink(priceId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || session?.user?.role !== "admin") {
      return { error: "Não autorizado." }
    }

    const configs = await (prisma as any).$queryRawUnsafe(`SELECT stripe_configs FROM global_configs WHERE id = 'singleton' LIMIT 1`)
    const globalConfig = configs?.[0]
    
    if (!globalConfig?.stripe_configs) {
      return { error: "Configurações da Stripe não encontradas no banco de dados." }
    }

    const stripeConfigs = typeof globalConfig.stripe_configs === 'string' 
      ? JSON.parse(globalConfig.stripe_configs) 
      : globalConfig.stripe_configs

    const secretKey = stripeConfigs.secretKey || process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      return { error: "Secret Key da Stripe não configurada." }
    }

    if (!priceId.startsWith('price_')) {
      return { error: "O ID deve começar com 'price_' para gerar um link de pagamento." }
    }

    const stripe = new Stripe(secretKey)

    // Procurar se já existe um link de pagamento ativo para este preço
    const existingLinks = await stripe.paymentLinks.list({ active: true })
    
    // Precisamos de obter os line_items de cada link para verificar o preço
    // O list() não expande line_items por defeito em todas as versões da API, 
    // mas na Stripe Payment Links o price pode estar diretamente ligado ou precisa de expansão.
    // Para simplificar e evitar chamadas excessivas, vamos tentar criar um novo ou assumir o risco
    // Mas a Stripe permite expandir:
    const linksWithItems = await stripe.paymentLinks.list({ 
       active: true,
       expand: ['data.line_items']
    })

    const existingLink = linksWithItems.data.find(link => 
       link.line_items?.data.some(item => item.price?.id === priceId)
    )

    if (existingLink) {
       return { url: existingLink.url }
    }

    // Se não existir, criar um novo
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    })

    return { url: paymentLink.url }

  } catch (error: any) {
    console.error("ERRO AO GERAR PAYMENT LINK:", error)
    return { error: error.message || "Erro interno ao gerar o link." }
  }
}
