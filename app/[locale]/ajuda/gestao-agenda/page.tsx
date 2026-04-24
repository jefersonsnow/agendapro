// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Calendar, 
  Clock, 
  UserPlus, 
  ChevronLeft,
  ArrowRight,
  Sparkles,
  MousePointer2,
  CheckCircle2,
  AlertCircle,
  Maximize2
} from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function GestaoAgendaTutorial() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header Fixo */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link href="/ajuda/primeiros-passos"><ChevronLeft className="h-5 w-5" /></Link>
             </Button>
             <div>
                <h1 className="text-lg font-black tracking-tighter uppercase italic">
                   AgendarPro <span className="text-primary tracking-normal font-normal text-xs lowercase ml-1">tutorial agenda</span>
                </h1>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:flex rounded-full text-xs font-bold" asChild>
               <Link href="/ajuda/primeiros-passos">Anterior</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full text-xs font-bold" asChild>
               <Link href="/ajuda/faturacao-comissoes">Próximo: Finanças <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-2 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 text-[10px] font-black uppercase tracking-widest">
              <Calendar className="h-3 w-3" /> Operação Diária
           </div>
           <h2 className="text-4xl font-black tracking-tighter italic">Dominando a sua Agenda</h2>
           <p className="text-muted-foreground max-w-2xl">
              A agenda é o coração do seu salão. Aprenda a criar marcações, gerir imprevistos e manter o fluxo de clientes organizado.
           </p>
        </div>

        <div className="space-y-16">
          {/* PASSO 1: NOVO AGENDAMENTO */}
          <section className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
             <div className="absolute -left-4 top-0 bottom-0 w-1 bg-teal-500/20 rounded-full group-hover:bg-teal-500 transition-colors" />
             <div className="space-y-6 pl-6">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-black text-xs">1</div>
                   <h3 className="text-2xl font-bold tracking-tight">Como Criar uma Marcação</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                   Basta clicar no botão <strong>"Novo Agendamento"</strong> no canto superior direito ou clicar diretamente num horário vazio no calendário. Um formulário intuitivo irá aparecer.
                </p>
                
                <Dialog>
                   <DialogTrigger asChild>
                      <div className="relative rounded-[2rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl bg-white cursor-zoom-in group/img">
                         <Image 
                           src="/tutorial/gestao-agenda.png" 
                           alt="Modal de Novo Agendamento" 
                           width={1200} 
                           height={800} 
                           className="w-full h-auto transition-transform duration-500 group-hover/img:scale-105"
                         />
                         <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="h-10 w-10 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                         </div>
                         <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <MousePointer2 className="h-3 w-3" /> Clique para Expandir
                         </div>
                      </div>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[95vw] h-fit md:h-[90vh] p-0 border-none bg-transparent shadow-none overflow-hidden flex items-center justify-center">
                      <VisuallyHidden>
                        <DialogTitle>Zoom Agenda</DialogTitle>
                        <DialogDescription>Visualização expandida do modal de agendamento</DialogDescription>
                      </VisuallyHidden>
                      <div className="relative w-full h-full flex items-center justify-center">
                         <Image 
                           src="/tutorial/gestao-agenda.png" 
                           alt="Zoom Modal de Novo Agendamento" 
                           width={2560} 
                           height={1440} 
                           className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                           priority
                         />
                      </div>
                   </DialogContent>
                </Dialog>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                         <UserPlus className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-xs uppercase tracking-tight">O Cliente</h4>
                      <p className="text-[11px] text-muted-foreground mt-2">Se for um cliente novo, crie a ficha na hora apenas com o nome e telemóvel.</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="h-8 w-8 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                         <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <h4 className="font-bold text-xs uppercase tracking-tight">Conflitos de Horário</h4>
                      <p className="text-[11px] text-muted-foreground mt-2">O sistema avisa se estiver a tentar marcar dois serviços para o mesmo profissional ao mesmo tempo.</p>
                   </div>
                   <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                         <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      </div>
                      <h4 className="font-bold text-xs uppercase tracking-tight">Confirmação</h4>
                      <p className="text-[11px] text-muted-foreground mt-2">Assim que gravar, o cliente recebe os detalhes da marcação no telemóvel (se configurado).</p>
                   </div>
                </div>
             </div>
          </section>

          {/* PASSO 2: STATUS E EDIÇÃO */}
          <section className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
             <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-200 dark:border-slate-800 rounded-full group-hover:bg-teal-500 transition-colors" />
             <div className="space-y-6 pl-6">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black text-xs group-hover:bg-teal-500 group-hover:text-white transition-colors">2</div>
                   <h3 className="text-2xl font-bold tracking-tight">Cores e Status</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                   Visualize rapidamente o estado do seu dia através das cores na agenda.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border-l-4 border-yellow-400">
                         <div className="flex-1">
                            <span className="text-xs font-black uppercase tracking-widest opacity-50">Pendente</span>
                            <p className="text-sm font-bold">Aguardando chegada do cliente</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border-l-4 border-teal-500">
                         <div className="flex-1">
                            <span className="text-xs font-black uppercase tracking-widest opacity-50">Concluído</span>
                            <p className="text-sm font-bold">Serviço finalizado e pago</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border-l-4 border-red-500">
                         <div className="flex-1">
                            <span className="text-xs font-black uppercase tracking-widest opacity-50">Faltou</span>
                            <p className="text-sm font-bold">Cliente não compareceu</p>
                         </div>
                      </div>
                   </div>
                   <div className="bg-slate-900 text-white p-8 rounded-3xl flex flex-col justify-center">
                      <AlertCircle className="h-8 w-8 text-teal-400 mb-4" />
                      <h4 className="text-lg font-bold italic tracking-tight">Dica de Gestor:</h4>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                         Marque sempre os serviços como "Concluídos" para que o volume financeiro seja contabilizado automaticamente nos seus relatórios de faturação.
                      </p>
                   </div>
                </div>
             </div>
          </section>

          {/* CTA FINAL */}
          <div className="pt-12 border-t border-dashed border-slate-200 dark:border-slate-800 text-center space-y-6">
             <div className="h-16 w-16 rounded-3xl bg-blue-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 -rotate-3">
                <DollarSign className="h-8 w-8" />
             </div>
             <div>
                <h4 className="text-xl font-bold">Agenda em dia? Vamos faturar!</h4>
                <p className="text-sm text-muted-foreground mt-2">O próximo passo ensina a analisar os seus ganhos e calcular comissões.</p>
             </div>
             <Button size="lg" className="rounded-2xl px-12 h-16 font-black uppercase text-xs tracking-widest bg-blue-600 hover:bg-blue-700 text-white shadow-2xl group" asChild>
                <Link href="/ajuda/faturacao-comissoes">
                   Ver Tutorial de Faturação <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
             </Button>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
         <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50">Desenvolvido por Napp Sistemas © 2026</p>
      </footer>
    </div>
  )
}

function DollarSign({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
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
