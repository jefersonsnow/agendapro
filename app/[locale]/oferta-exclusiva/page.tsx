import Link from "next/link"
import { OfertaExclusivaForm } from "@/components/oferta-exclusiva-form"
import { 
  Sparkles, 
  Youtube, 
  Instagram, 
  Video, 
  MessageSquare, 
  ArrowUpRight
} from "lucide-react"

export const metadata = {
  title: "Oferta Exclusiva - 60 Dias Grátis Plano Premium | AgendarPro",
  description: "Crie a sua conta de teste de 60 dias grátis no Plano Premium do AgendarPro. Sistema completo de agendamentos online para salões e profissionais da beleza.",
}

export default function OfertaExclusivaPage() {
  return (
    <div className="theme-magenta min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      
      {/* Background Glow Effects (Same as homepage) */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-10%] -z-10 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="fixed bottom-0 right-[-5%] -z-10 w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

      {/* Top Header (Same as homepage header) */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="h-9 w-9 rounded-lg overflow-hidden shadow-lg transition-transform group-hover:scale-105">
              <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              AgendarPro
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Oferta Exclusiva</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero & Signup Section */}
      <main className="relative">
        <section className="pt-8 pb-16 lg:pt-16 lg:pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <OfertaExclusivaForm />
            </div>
          </div>
        </section>

        {/* Social Media & Youtube Channel Section (Homepage Styled) */}
        <section className="py-16 lg:py-24 bg-muted/20 border-t border-border/40 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest backdrop-blur-sm">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Comunidade & Conteúdo Profissional</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
                Aprenda a Faturar Mais e Acompanhe as Novidades
              </h2>
              <p className="text-muted-foreground font-medium text-base">
                Siga os nossos canais oficiais para tutoriais passo a passo, dicas de gestão para salões de beleza e atendimento rápido via WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              
              {/* YouTube Card */}
              <a 
                href="https://www.youtube.com/@nappsistemas" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-6 rounded-3xl bg-card border border-border/50 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                    <Youtube className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 tracking-tight flex items-center gap-1.5">
                    Canal YouTube <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
                    Assista a vídeos explicativos, tutoriais de configuração rápida e estratégias de captação de clientes.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 group-hover:underline">
                  @nappsistemas no YouTube
                </span>
              </a>

              {/* Instagram Card */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-6 rounded-3xl bg-card border border-border/50 hover:border-pink-500/50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
                    <Instagram className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 tracking-tight flex items-center gap-1.5">
                    Instagram <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-pink-500 transition-colors" />
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
                    Dicas diárias de gestão, bastidores e atualizações do AgendarPro para impulsionar o seu negócio.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-pink-500 group-hover:underline">
                  Siga no Instagram
                </span>
              </a>

              {/* TikTok Card */}
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-6 rounded-3xl bg-card border border-border/50 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-110 transition-transform">
                    <Video className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 tracking-tight flex items-center gap-1.5">
                    TikTok <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-600 transition-colors" />
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
                    Vídeos curtos com hacks de produtividade e tendências para salões e profissionais da estética.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 group-hover:underline">
                  Acompanhe no TikTok
                </span>
              </a>

              {/* WhatsApp Support Card */}
              <a 
                href="https://wa.me/351910664744?text=Olá! Gostaria de saber mais sobre a Oferta Exclusiva." 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-6 rounded-3xl bg-card border border-border/50 hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 tracking-tight flex items-center gap-1.5">
                    WhatsApp Direto <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
                    Fale diretamente com a nossa equipa de apoio ao cliente para esclarecer dúvidas ou ajuda no arranque.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-500 group-hover:underline">
                  Falar no WhatsApp
                </span>
              </a>

            </div>
          </div>
        </section>
      </main>

      {/* Footer (Same as homepage footer) */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg overflow-hidden shadow-lg">
                <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight">AgendarPro</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
              <Link href="/" className="hover:text-primary transition-colors">Página Inicial</Link>
              <Link href="/auth/login" className="hover:text-primary transition-colors">Login</Link>
            </div>

            <p className="text-sm text-muted-foreground text-center md:text-right">
              &copy; {new Date().getFullYear()} AgendarPro — Desenvolvido por <a href="https://napp.pt" target="_blank" className="hover:text-primary underline transition-all font-bold">Napp Sistemas e Aplicativos Web e Mobile</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
