import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://agendar.napp.pt'
  const reservedSlugs = ['admin', 'dashboard', 'auth', 'api', 'login', 'register', 'oferta-exclusiva', 'contacto', 'termos', 'privacidade']

  // Busca todos os salões ativos para gerar URLs dinâmicas
  const salons = await prisma.salon.findMany({
    where: {
      status: 'active',
      NOT: {
        slug: {
          in: reservedSlugs
        }
      }
    },
    select: {
      slug: true,
      updated_at: true,
    },
  })

  const salonEntries: MetadataRoute.Sitemap = salons.map((salon) => ({
    url: `${baseUrl}/${salon.slug}`,
    lastModified: salon.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...salonEntries,
  ]
}
