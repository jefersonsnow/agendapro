// <title> <meta name="description" content="SEO" /> <Head>
import { Scissors, Mail, Globe, MapPin, ChevronLeft, SendHorizontal, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSupportConfig } from "@/lib/actions/dashboard"

export default async function ContactPage() {
  const support = await getSupportConfig()
  const whatsapp = support?.whatsappNumber

  return (
    <div className="min-h-screen bg-background">
      {/* Header Simples */}
      <header className="border-b bg-card h-20 flex items-center">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-lg">
              <Scissors className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">AgendarPro</span>
          </Link>
          <Button variant="ghost" asChild className="rounded-xl">
            <Link href="/"> <ChevronLeft className="mr-2 h-4 w-4" /> Voltar à Home</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-20 items-center">
           <div className="space-y-10">
              <div className="space-y-4">
                 <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 font-bold uppercase tracking-widest text-xs">
                    Estamos Aqui
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8] italic">Fala <br /> connosco <span className="text-primary italic">agora</span>.</h1>
                 <p className="text-muted-foreground text-xl max-w-md">
                    Dúvidas técnicas ou comerciais sobre o AgendarPro? A equipa da <strong>Napp Sistemas</strong> está pronta para te ajudar.
                 </p>
              </div>

              <div className="grid gap-6">
                 {whatsapp && (
                    <a 
                      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent("Olá Napp! Gostaria de saber mais sobre o AgendarPro.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-6 group hover:translate-x-2 transition-all p-6 rounded-3xl border-2 border-green-500/10 hover:border-green-500/30 hover:bg-green-500/5 bg-green-500/[0.02]"
                    >
                       <div className="h-14 w-14 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-xl shadow-green-500/20 transition-transform group-hover:scale-110">
                          <MessageCircle className="h-6 w-6" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-green-600/60">WhatsApp Direct</p>
                          <p className="text-xl font-bold text-foreground">Suporte Instantâneo</p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2 font-medium"> <SendHorizontal className="h-3 w-3" /> Abrir conversa no WhatsApp</p>
                       </div>
                    </a>
                 )}

                 <a 
                   href="mailto:contato@napp.pt" 
                   className="flex items-start gap-6 group hover:translate-x-2 transition-all p-6 rounded-3xl border-2 border-primary/5 hover:border-primary/20 hover:bg-primary/5 bg-primary/[0.02]"
                 >
                    <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 transition-transform group-hover:scale-110">
                       <Mail className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-black uppercase tracking-widest opacity-40">Email Oficial</p>
                       <p className="text-xl font-bold text-foreground">contato@napp.pt</p>
                       <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2 font-medium"> <SendHorizontal className="h-3 w-3" /> Clica para enviar agora</p>
                    </div>
                 </a>
              </div>

              <div className="space-y-4 pt-4 border-t border-muted">
                 <div className="flex items-center gap-6">
                    <div className="h-10 w-10 rounded-xl bg-card border-2 flex items-center justify-center text-primary">
                       <Globe className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none">Site Institucional</p>
                       <a href="https://napp.pt" target="_blank" className="text-lg font-bold text-foreground hover:text-primary transition-colors italic">napp.pt</a>
                    </div>
                 </div>

                 <div className="flex items-center gap-6">
                    <div className="h-10 w-10 rounded-xl bg-card border-2 flex items-center justify-center text-slate-400">
                       <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40 leading-none">Localização</p>
                       <p className="text-lg font-medium text-muted-foreground italic">Napp Sistemas — Web e Mobile</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[3rem] p-12 border-2 border-white/5 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
              <div className="relative z-10 space-y-6">
                 <h2 className="text-3xl font-black uppercase tracking-tight italic text-white underline decoration-primary decoration-4 underline-offset-8">AgendarPro <span className="text-primary tracking-tighter">SaaS</span></h2>
                 <p className="text-slate-400 leading-relaxed font-medium">
                    O AgendarPro é uma solução desenvolvida para automatizar totalmente a gestão do teu negócio de beleza. Sendo um produto oficial da <strong>NAPP</strong> (napp.pt), beneficias de atualizações semanais, segurança avançada e uma infraestrutura robusta.
                 </p>
                 <div className="pt-6">
                    <Button asChild className="rounded-full h-14 px-8 font-bold text-lg bg-primary hover:bg-primary/90 text-white border-0">
                       <Link href="/auth/register">Começar agora de graça</Link>
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <footer className="py-12 border-t mt-20 bg-muted/20">
         <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
               &copy; {new Date().getFullYear()} AgendarPro — Desenvolvido por <a href="https://napp.pt" target="_blank" className="font-bold underline transition-all">Napp Sistemas</a>
            </p>
         </div>
      </footer>
    </div>
  )
}
