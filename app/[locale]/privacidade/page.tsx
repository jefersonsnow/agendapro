// <title> <meta name="description" content="SEO" /> <Head>
import { Scissors, ShieldCheck, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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

      <main className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="space-y-4 mb-12">
           <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 mb-6 font-bold uppercase tracking-widest text-xs">
              Segurança Total
           </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic italic">Política de <span className="text-primary">Privacidade</span></h1>
           <p className="text-muted-foreground text-lg">Última atualização: Abril de 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12 text-muted-foreground leading-relaxed">
           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white text-sm">01</span>
                 Compromisso com a Privacidade
              </h2>
              <p>
                 A <strong>Napp Sistemas e Aplicativos Web e Mobile</strong> (napp.pt) leva a privacidade dos seus utilizadores muito a sério. Esta política de privacidade explica como recolhemos, utilizamos, armazenamos e protegemos as informações fornecidas através do sistema em <strong>agendarpro.napp.pt</strong>.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white text-sm">02</span>
                 Informações Recolhidas
              </h2>
              <p>
                 Recolhemos dados essenciais para o funcionamento do serviço: nome, email, telefone, endereço comercial e dados de faturação. Adicionalmente, armazenamos os dados que os nossos utilizadores introduzem sobre os seus próprios clientes para fins de gestão de agendamentos.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white text-sm">03</span>
                 Como Utilizamos os Dados
              </h2>
              <p>
                 Os dados são utilizados exclusivamente para: processar agendamentos, enviar lembretes aos clientes, gerir a faturação, melhorar o serviço e garantir a segurança da conta. A Napp Sistemas não vende nem aluga dados de utilizadores a terceiros.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white text-sm">04</span>
                 Segurança e Armazenamento
              </h2>
              <p>
                 Utilizamos tecnologia de encriptação moderna para proteger os seus dados. Todas as comunicações entre o seu navegador e os nossos servidores são realizadas de forma segura (HTTPS). O sistema é baseado em infraestrutura de alta frequência para garantir redundância e disponibilidade.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white text-sm">05</span>
                 Controlo dos Seus Dados
              </h2>
              <p>
                 O utilizador tem o direito de aceder, corrigir ou apagar os seus dados a qualquer momento através do painel de administração ou contactando-nos diretamente através do email: <strong>contato@napp.pt</strong>.
              </p>
           </section>

           <section className="space-y-4 border-2 border-primary/10 bg-primary/5 p-8 rounded-3xl">
              <div className="flex items-center gap-4 text-primary mb-2">
                 <ShieldCheck className="h-6 w-6" />
                 <h3 className="text-xl font-black uppercase italic italic">Proteção Total</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                 O AgendarPro está desenhado para dar total autonomia aos donos de salão e profissionais sobre os seus dados. A Napp Sistemas atua apenas como processadora tecnológica das informações, garantindo a infraestrutura técnica e a segurança operacional do sistema.
              </p>
           </section>
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
