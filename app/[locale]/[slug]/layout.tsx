import type { Metadata } from 'next'
import prisma from "@/lib/prisma"
import { routing } from '@/i18n/routing'
import { redirect } from 'next/navigation'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string, locale: string }> | { slug: string, locale: string } 
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  const locale = resolvedParams?.locale || routing.defaultLocale;

  if (!slug) return {};

  // Lista de rotas reservadas (segurança extra para o build)
  const reservedSlugs = ['admin', 'dashboard', 'auth', 'api', 'login', 'register', 'oferta-exclusiva', 'contacto', 'termos', 'privacidade', 'ajuda']
  if (reservedSlugs.includes(slug)) {
     return {}
  }

  try {
    const salon = await prisma.salon.findUnique({
      where: { slug },
      select: { name: true, description: true, logo_url: true, cover_url: true, translations: true, status: true }
    })

    if (!salon) return { title: 'Salão não encontrado | AgendarPro' };

    if (salon.status === 'cancelled') {
      redirect('https://agendar.napp.pt/parceiros')
    }

    let name = salon.name
    let description = salon.description || `Agende o seu horário no ${salon.name}.`

    if (salon.translations) {
      try {
        const trans = JSON.parse(salon.translations as string)
        if (trans[locale]) {
          name = trans[locale].name || name
          description = trans[locale].description || description
        }
      } catch (e) {}
    }

    return {
      title: `${name} | Agendamento Online - AgendarPro`,
      description: `${description.slice(0, 150)}${description.length > 150 ? '...' : ''} | AgendarPro: Sistema de agendamento online para salões e barbearias.`,
      openGraph: {
        title: `${name} | Agendamento Online - AgendarPro`,
        description: description,
        images: salon.cover_url ? [salon.cover_url] : (salon.logo_url ? [salon.logo_url] : []),
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} | Agendamento Online - AgendarPro`,
        description: description,
      }
    }
  } catch (error) {
    return { title: 'Agendamento Online | AgendarPro' };
  }
}

export default async function SalonLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ slug: string, locale: string }> | { slug: string, locale: string }
}) {
  // Apenas aguardamos para garantir conformidade com o Next.js 15+
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  
  if (slug) {
     const reservedSlugs = ['admin', 'dashboard', 'auth', 'api', 'login', 'register', 'oferta-exclusiva', 'contacto', 'termos', 'privacidade', 'ajuda']
     if (!reservedSlugs.includes(slug)) {
       const salon = await prisma.salon.findUnique({
         where: { slug },
         select: { status: true }
       })
       if (salon?.status === 'cancelled') {
         redirect('https://agendar.napp.pt/parceiros')
       }
     }
  }

  return <>{children}</>
}
