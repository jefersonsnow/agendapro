"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, LayoutDashboard } from 'lucide-react'
import { useTranslations } from "next-intl"

function SuccessContent() {
  const searchParams = useSearchParams()
  const t = useTranslations("Common")
  
  const value = parseFloat(searchParams.get("valor") || "19.50")
  const currency = "EUR"

  useEffect(() => {
    // 1. Facebook Pixel Purchase Event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        currency: currency,
        value: value
      });
    }

    // 2. Google Ads Conversion Tracking (se configurado)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-CONVERSION_ID', // O utilizador deve substituir isto se tiver Google Ads
        'value': value,
        'currency': currency
      });
    }
  }, [value])

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[#050505] text-white p-6 md:p-10 font-sans">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-center gap-2 text-primary animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="h-10 w-10 rounded-lg overflow-hidden shadow-lg shadow-primary/20">
               <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-tighter">AgendarPro</span>
          </div>
          
          <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-200">
            <CardHeader className="text-center pt-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tighter italic uppercase">Assinatura Ativa!</CardTitle>
              <CardDescription className="text-slate-400 text-lg mt-2">
                Parabéns! O seu pagamento foi processado com sucesso e a sua conta está pronta.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-10">
              <p className="mb-10 text-sm text-slate-500 leading-relaxed">
                Já pode começar a configurar o seu salão e automatizar a sua agenda. Os dados de acesso também foram enviados para o seu e-mail.
              </p>
              
              <div className="flex flex-col gap-4">
                <Button asChild className="h-14 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    Aceder ao Dashboard <LayoutDashboard className="h-5 w-5" />
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="h-12 rounded-xl text-slate-400 hover:text-white">
                  <Link href="/">Voltar à Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center text-[10px] uppercase font-black tracking-[0.4em] text-white/20">
            tecnologia agendarpro &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
