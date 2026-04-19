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
      throw new Error("Não autorizado. Faça login para continuar.")
    }

    // 1. Obter configurações da Stripe via Prisma
    const globalConfig = await (prisma as any).globalConfig.findUnique({
      where: { id: 'singleton' },
      select: { stripe_configs: true }
    })
    
    if (!globalConfig?.stripe_configs) {
      throw new Error("Configurações da Stripe não encontradas.")
    }

    const stripeConfigs = typeof globalConfig.stripe_configs === 'string' 
      ? JSON.parse(globalConfig.stripe_configs) 
      : globalConfig.stripe_configs

    const secretKey = stripeConfigs.secretKey || process.env.STRIPE_SECRET_KEY
    const priceId = planId === "basic" ? stripeConfigs.productBasicId : stripeConfigs.productPremiumId

    if (!secretKey) {
      throw new Error("Secret Key da Stripe não configurada.")
    }

    if (!priceId) {
      throw new Error(`Price ID para o plano ${planId} não configurado.`)
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
      throw new Error("A Stripe não retornou uma URL.")
    }

    return { url: checkoutSession.url }
  } catch (error: any) {
    console.error("ERRO NO CHECKOUT:", error)
    throw new Error(error.message || "Erro no checkout")
  }
}
