import type { Metadata } from 'next'
import prisma from "@/lib/prisma"
import { routing } from '@/i18n/routing'

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
      select: { name: true, description: true, logo_url: true, cover_url: true, translations: true }
    })

    if (!salon) return { title: 'Salão não encontrado | AgendarPro' };

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
      title: `${name} | Agendamento Online`,
      description: description,
      openGraph: {
        title: `${name} | Agendamento Online`,
        description: description,
        images: salon.cover_url ? [salon.cover_url] : (salon.logo_url ? [salon.logo_url] : []),
      }
    }
  } catch (error) {
    return { title: 'AgendarPro' };
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
  await Promise.resolve(params);
  return <>{children}</>
}
