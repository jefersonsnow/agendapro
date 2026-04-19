"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Stripe from "stripe"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function createCheckoutSession(planId: "basic" | "premium") {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.email) {
    throw new Error("Não autorizado. Faça login para continuar.")
  }

  // 1. Obter configurações da Stripe da base de dados
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT stripe_configs FROM global_configs WHERE id = 'singleton' LIMIT 1`)
  const stripeConfigs = configs?.[0]?.stripe_configs ? JSON.parse(configs[0].stripe_configs) : {}

  const secretKey = stripeConfigs.secretKey || process.env.STRIPE_SECRET_KEY
  const priceId = planId === "basic" ? stripeConfigs.productBasicId : stripeConfigs.productPremiumId

  if (!secretKey) {
    throw new Error("Configuração da Stripe em falta (Secret Key).")
  }

  if (!priceId) {
    throw new Error(`ID de preço para o plano ${planId} não configurado.`)
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-03-25.dahlia" as any,
  })

  // 2. Determinar a URL base para o redirecionamento de retorno
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = host?.includes("localhost") ? "http" : "https"
  const baseUrl = `${protocol}://${host}`

  // 3. Criar a sessão de Checkout
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
    throw new Error("Falha ao criar sessão de checkout da Stripe.")
  }

  // 4. Retornar a URL para o cliente redirecionar
  return { url: checkoutSession.url }
}
