// <title> <meta name="description" content="SEO" /> <Head>
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

import prisma from '@/lib/prisma'
import Script from 'next/script'

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: 'swap',
  preload: false,
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: 'swap',
  preload: false,
});

import { Toaster } from 'sonner'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> | { locale: string } }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale || routing.defaultLocale;
  
  // Fetch SEO Config from Global Config (Singleton)
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT seo_config FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
  const config = configs?.[0]
  const seo = config?.seo_config ? JSON.parse(config.seo_config) : {}

  return {
    title: seo.metaTitle || 'agendar.pro - Sistema de Agendamento para Salões',
    description: seo.metaDescription || 'Plataforma completa de gestão e agendamento para salões de beleza e barbearias. Calendário inteligente, gestão de equipa e clientes.',
    keywords: seo.metaKeywords || 'agenda, salão, barbearia, gestão, marcações',
    generator: 'v0.app',
    openGraph: {
      title: seo.metaTitle || 'agendar.pro',
      description: seo.metaDescription,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : [],
    },
    icons: {
      icon: [
        { url: '/favicon.png?v=1' },
      ],
      apple: '/favicon.png?v=1',
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}) {
  // Await the params in case it's a promise (Next.js 15+ behavior)
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale || routing.defaultLocale;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // Fetch SEO/Pixels for Scripts
  const configs = await (prisma as any).$queryRawUnsafe(`SELECT seo_config FROM global_configs WHERE id = 'singleton' LIMIT 1`).catch(() => [])
  const seo = configs?.[0]?.seo_config ? JSON.parse(configs[0].seo_config) : {}

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <head>
        <title>AgendarPro</title>

        {seo.fbPixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${seo.fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
        {seo.googleAnalyticsId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${seo.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}

