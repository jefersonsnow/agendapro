import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AgendarPro - Sistema de Agendamento',
    short_name: 'AgendarPro',
    description: 'Sistema profissional de agendamento online para salões e barbearias.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0D9488',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
