import { ShoppingBag, MessageCircle, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Params {
  locale: string
}

export default async function ShopPage({
  params,
}: {
  params: Promise<Params> | Params
}) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams?.locale || "pt"

  return (
    <div className="theme-magenta min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg overflow-hidden shadow-lg transition-transform group-hover:scale-105">
              <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 uppercase">
              AgendarPro
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href={`/${locale}#planos`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
              Planos
            </Link>
            <Link href={`/${locale}/parceiros`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
              Parceiros
            </Link>
            <Link href={`/${locale}/loja`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity underline decoration-2 underline-offset-4">
              Loja
            </Link>
            <Link href={`/${locale}/contacto`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* WhatsApp Link */}
            <a 
              href="https://wa.me/351910664744?text=Olá! Gostaria de saber mais sobre os produtos da loja do AgendarPro."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20 hover:scale-110 transition-transform relative group"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </a>
          </div>
        </div>
      </header>

      <main className="relative pt-12 pb-24">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        <div className="absolute top-[-10%] left-[-10%] -z-10 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] opacity-40"></div>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Heading */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary mb-6 backdrop-blur-sm uppercase tracking-widest animate-in fade-in slide-in-from-bottom-3 duration-700">
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span>AgendarPro Store</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 max-w-3xl leading-[0.9] italic">
              Produtos Profissionais. <span className="text-primary italic">Brevemente</span>.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl font-medium">
              Estamos a preparar uma loja online exclusiva com consumíveis, mobiliário, máquinas e produtos capilares das melhores marcas com descontos exclusivos para parceiros.
            </p>
          </div>



          {/* Shop Newsletter / Notification Section */}
          <div className="bg-slate-950 text-white rounded-[3rem] p-10 md:p-16 border-2 border-white/5 relative overflow-hidden shadow-2xl max-w-4xl mx-auto">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[150px] -mr-48 -mt-48"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-4 max-w-lg">
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-primary/30">
                  <Zap className="h-3.5 w-3.5" /> Lançamento Exclusivo
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-none italic">
                  Queres ser <span className="text-primary italic">avisado</span> primeiro?
                </h2>
                <p className="text-slate-400 text-sm md:text-base font-medium">
                  Subscreve para receberes uma notificação assim que a loja online estiver ativa e ganha um cupão de **10% de desconto** na tua primeira compra.
                </p>
              </div>

              <div className="w-full md:w-auto shrink-0 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <input
                    type="email"
                    placeholder="O teu melhor email..."
                    className="h-14 px-5 rounded-2xl bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium w-full sm:w-64"
                  />
                  <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                    Avisar-me <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-500 font-medium text-center sm:text-left">Prometemos não enviar spam. Podes cancelar a qualquer momento.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg overflow-hidden shadow-lg">
                <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight uppercase">AgendarPro</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
              <Link href={`/${locale}/termos`} className="hover:text-primary transition-colors">Termos</Link>
              <Link href={`/${locale}/privacidade`} className="hover:text-primary transition-colors">Privacidade</Link>
              <Link href={`/${locale}/contacto`} className="hover:text-primary transition-colors">Contacto</Link>
            </div>

            <p className="text-sm text-muted-foreground text-center md:text-right">
              &copy; {new Date().getFullYear()} AgendarPro — Desenvolvido por <a href="https://napp.pt" target="_blank" className="hover:text-primary underline transition-all font-bold">Napp Sistemas</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
