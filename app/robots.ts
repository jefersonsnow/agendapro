import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/*/dashboard', '/*/admin', '/*/auth', '/*/api',
        '/dashboard', '/admin', '/auth', '/api'
      ],
    },
    sitemap: 'https://agendar.napp.pt/sitemap.xml',
  }
}
