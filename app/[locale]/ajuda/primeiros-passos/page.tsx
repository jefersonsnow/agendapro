// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  CheckCircle2, 
  ArrowRight, 
  Settings, 
  Users, 
  Scissors, 
  ChevronLeft,
  Sparkles,
  MousePointer2,
  Maximize2
} from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function PrimeirosPassosTutorial() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header Fixo */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link href="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
             </Button>
             <div>
                <h1 className="text-lg font-black tracking-tighter uppercase italic">
                   Central de Ajuda <span className="text-primary tracking-normal font-normal text-xs lowercase ml-1">tutorial</span>
                </h1>
             </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-xs font-bold" asChild>
             <Link href="/ajuda/gestao-agenda">Próximo Tutorial <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-2 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="h-3 w-3" /> Configuração Inicial
           </div>
           <h2 className="text-4xl font-black tracking-tighter italic">Primeiros Passos no AgendarPro</h2>
           <p className="text-muted-foreground max-w-2xl">
              Aprenda a configurar a identidade do seu salão e a preparar o sistema para receber as primeiras marcações em menos de 5 minutos.
           </p>
        </div>

        <div className="space-y-16">
          {/* PASSO 1 */}
          <section className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
             <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
             <div className="space-y-6 pl-6">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs">1</div>
                   <h3 className="text-2xl font-bold tracking-tight">Identidade e Branding</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                   O primeiro passo para o sucesso é deixar o sistema com a "cara" do seu negócio. Aceda a <strong>Configurações &gt; Salão</strong> para carregar o seu logótipo e escolher as cores da marca.
                </p>
                <Dialog>
                   <DialogTrigger asChild>
                      <div className="relative rounded-[2rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl bg-white cursor-zoom-in group/img">
                         <Image 
                           src="/tutorial/primeiros-passos.png" 
                           alt="Ecrã de Configurações" 
                           width={1200} 
                           height={800} 
                           className="w-full h-auto transition-transform duration-500 group-hover/img:scale-105"
                         />
                         <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="h-10 w-10 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                         </div>
                      </div>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[95vw] h-fit md:h-[90vh] p-0 border-none bg-transparent shadow-none overflow-hidden flex items-center justify-center">
                      <VisuallyHidden>
                        <DialogTitle>Zoom Imagem Tutorial</DialogTitle>
                        <DialogDescription>Visualização expandida da configuração do salão</DialogDescription>
                      </VisuallyHidden>
                      <div className="relative w-full h-full flex items-center justify-center">
                         <Image 
                           src="/tutorial/primeiros-passos.png" 
                           alt="Zoom Ecrã de Configurações" 
                           width={2560} 
                           height={1440} 
                           className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                           priority
                         />
                      </div>
                   </DialogContent>
                </Dialog>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Card className="border-none bg-white dark:bg-slate-900 shadow-xl rounded-3xl">
                      <CardContent className="p-6 flex gap-4 items-start">
                         <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                            <Settings className="h-5 w-5 text-teal-600" />
                         </div>
                         <div>
                            <h4 className="font-bold text-sm">Dados do Negócio</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Preencha o NIF, telefone e morada corretamente para que apareçam nos lembretes dos clientes.</p>
                         </div>
                      </CardContent>
                   </Card>
                   <Card className="border-none bg-white dark:bg-slate-900 shadow-xl rounded-3xl">
                      <CardContent className="p-6 flex gap-4 items-start">
                         <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                            <MousePointer2 className="h-5 w-5 text-teal-600" />
                         </div>
                         <div>
                            <h4 className="font-bold text-sm">Slug Personalizado</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Defina o seu link único (ex: agendar.pro/oseu-salao) para partilhar nas redes sociais.</p>
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </section>

          {/* PASSO 2 */}
          <section className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
             <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-200 dark:border-slate-800 rounded-full group-hover:bg-primary transition-colors" />
             <div className="space-y-6 pl-6">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black text-xs group-hover:bg-primary group-hover:text-white transition-colors">2</div>
                   <h3 className="text-2xl font-bold tracking-tight">Equipa e Serviços</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                   Sem profissionais e serviços, o calendário fica vazio. Utilize as abas <strong>Equipa</strong> e <strong>Serviços</strong> para cadastrar quem trabalha no salão e quais tratamentos oferecem.
                </p>
                <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                         <CheckCircle2 className="h-5 w-5 text-teal-500" />
                         <span className="text-sm font-medium">Cadastre os Profissionais (Staff) com as suas fotos.</span>
                      </div>
                      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                         <CheckCircle2 className="h-5 w-5 text-teal-500" />
                         <span className="text-sm font-medium">Defina os Serviços, durações e preços correspondentes.</span>
                      </div>
                      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                         <CheckCircle2 className="h-5 w-5 text-teal-500" />
                         <span className="text-sm font-medium">Atribua quais profissionais fazem quais serviços.</span>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* CTA FINAL */}
          <div className="pt-12 border-t border-dashed border-slate-200 dark:border-slate-800 text-center space-y-6">
             <div className="h-16 w-16 rounded-3xl bg-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-teal-500/20 rotate-3">
                <CheckCircle2 className="h-8 w-8" />
             </div>
             <div>
                <h4 className="text-xl font-bold">Pronto para o próximo nível?</h4>
                <p className="text-sm text-muted-foreground mt-2">Agora que o seu salão está configurado, vamos aprender a gerir as marcações.</p>
             </div>
             <Button size="lg" className="rounded-2xl px-12 h-16 font-black uppercase text-xs tracking-widest bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black shadow-2xl group" asChild>
                <Link href="/ajuda/gestao-agenda">
                   Ir para Gestão de Agenda <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
             </Button>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
         <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50">Tecnologia AgendarPro © 2026</p>
      </footer>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
