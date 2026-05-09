import { Metadata } from 'next'
import prisma from "@/lib/prisma"

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string, locale: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Lista de rotas reservadas que não são salões (fallback de segurança)
  const reservedSlugs = ['admin', 'dashboard', 'auth', 'api', 'login', 'register', 'oferta-exclusiva', 'contacto', 'termos', 'privacidade', 'ajuda']
  if (reservedSlugs.includes(resolvedParams.slug)) {
     return {} // Deixa a root metadata atuar
  }

  const salon = await prisma.salon.findUnique({
    where: { slug: resolvedParams.slug },
    select: { name: true, description: true, logo_url: true, cover_url: true, translations: true }
  })

  if (!salon) {
    return {
      title: 'Salão não encontrado | AgendarPro',
    }
  }

  let name = salon.name
  let description = salon.description || `Agende o seu horário no ${salon.name} de forma rápida e fácil.`

  // Tentar usar tradução se existir para o locale pedido
  if (salon.translations) {
      try {
          const trans = JSON.parse(salon.translations as string)
          if (trans[resolvedParams.locale]) {
              name = trans[resolvedParams.locale].name || name
              description = trans[resolvedParams.locale].description || description
          }
      } catch (e) {}
  }

  return {
    title: `${name} | Agendamento Online`,
    description: description,
    openGraph: {
      title: `${name} | Agendamento Online`,
      description: description,
      images: salon.cover_url ? [salon.cover_url] : (salon.logo_url ? [salon.logo_url] : []),
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Agendamento Online`,
      description: description,
      images: salon.cover_url ? [salon.cover_url] : (salon.logo_url ? [salon.logo_url] : []),
    }
  }
}

export default function SalonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
