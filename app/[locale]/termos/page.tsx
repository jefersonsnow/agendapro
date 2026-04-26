// <title> <meta name="description" content="SEO" /> <Head>
import { Scissors, FileText, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
           <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <FileText className="h-6 w-6" />
           </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic italic">Termos de <span className="text-primary">Uso</span></h1>
           <p className="text-muted-foreground text-lg">Última atualização: Abril de 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12 text-muted-foreground leading-relaxed">
           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">01</span>
                 Aceitação dos Termos
              </h2>
              <p>
                 O AgendarPro é um serviço operado pela <strong>Napp Sistemas e Aplicativos Web e Mobile</strong> (napp.pt). Ao aceder ou utilizar o sistema em <strong>agendarpro.napp.pt</strong>, concorda em ficar vinculado a estes Termos de Uso. Se não concordar com qualquer parte dos termos, não deve utilizar o serviço.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">02</span>
                 Descrição do Serviço
              </h2>
              <p>
                 O AgendarPro é uma plataforma SaaS (Software as a Service) destinada à gestão de agendamentos para salões de beleza, barbearias e profissionais independentes. O serviço inclui gestão de clientes, equipa, serviços e ferramentas de marketing.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">03</span>
                 Contas e Responsabilidades
              </h2>
              <p>
                 Para utilizar o sistema, deve criar uma conta. É responsável por manter a confidencialidade das suas credenciais de acesso e por todas as atividades que ocorrem sob a sua conta. A Napp Sistemas reserva-se o direito de suspender contas por falta de pagamento ou violação destes termos.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">04</span>
                 Planos e Pagamentos
              </h2>
              <p>
                 O AgendarPro opera sob um modelo de subscrição mensal ou anual. Os preços e limites de cada plano (Mínimo, Basic, Premium) estão descritos na página principal. O não pagamento da subscrição resultará na suspensão do acesso aos dados até que a situação seja regularizada.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">05</span>
                 Limites do Sistema
              </h2>
              <p>
                 O utilizador compromete-se a não utilizar o sistema para fins ilícitos, spam ou qualquer atividade que possa prejudicar a infraestrutura da Napp Sistemas. Reservamo-nos o direito de monitorizar o volume de dados e tráfego para garantir a estabilidade do serviço para todos os utilizadores.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                 <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm">06</span>
                 Contacto
              </h2>
              <p>
                 Para questões relacionadas com estes Termos de Uso, entre em contacto connosco através do email: <strong>contato@napp.pt</strong>.
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
