"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ChevronLeft,
  ArrowRight,
  Sparkles,
  PieChart as PieChartIcon,
  CheckCircle2,
  FileSpreadsheet,
  Target,
  Maximize2
} from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function FaturacaoTutorial() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header Fixo */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" asChild className="rounded-full">
                <Link href="/ajuda/gestao-agenda"><ChevronLeft className="h-5 w-5" /></Link>
             </Button>
             <div>
                <h1 className="text-lg font-black tracking-tighter uppercase italic">
                   AgendarPro <span className="text-primary tracking-normal font-normal text-xs lowercase ml-1">tutorial finanças</span>
                </h1>
             </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-xs font-bold bg-primary text-white hover:bg-primary/90" asChild>
             <Link href="/dashboard">Concluir Tutorial <CheckCircle2 className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-2 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp className="h-3 w-3" /> Gestão de Lucros
           </div>
           <h2 className="text-4xl font-black tracking-tighter italic">Faturação e Comissões</h2>
           <p className="text-muted-foreground max-w-2xl">
              Tome decisões baseadas em dados. Aprenda a analisar o desempenho do seu salão e a monitorizar as comissões da sua equipa em tempo real.
           </p>
        </div>

        <div className="space-y-16">
          {/* PASSO 1: DASHBOARD FINANCEIRO */}
          <section className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
             <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-500/20 rounded-full group-hover:bg-blue-600 transition-colors" />
             <div className="space-y-6 pl-6">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">1</div>
                   <h3 className="text-2xl font-bold tracking-tight">Análise de Volume e Lucro</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                   Na aba <strong>Relatórios</strong>, tem uma visão 360º do seu negócio. O sistema separa automaticamente o que é faturação bruta, despesas e lucro real.
                </p>
                
                <Dialog>
                   <DialogTrigger asChild>
                      <div className="relative rounded-[2rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl bg-white cursor-zoom-in group/img">
                         <Image 
                           src="/tutorial/faturacao.png" 
                           alt="Ecrã de Relatórios Financeiros" 
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
                        <DialogTitle>Zoom Faturação</DialogTitle>
                        <DialogDescription>Visualização expandida dos relatórios financeiros</DialogDescription>
                      </VisuallyHidden>
                      <div className="relative w-full h-full flex items-center justify-center">
                         <Image 
                           src="/tutorial/faturacao.png" 
                           alt="Zoom Ecrã de Relatórios Financeiros" 
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
                         <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <Target className="h-5 w-5 text-blue-600" />
                         </div>
                         <div>
                            <h4 className="font-bold text-sm">Ticket Médio</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Descubra quanto cada cliente gasta, em média, no seu salão para ajustar as suas estratégias de marketing.</p>
                         </div>
                      </CardContent>
                   </Card>
                   <Card className="border-none bg-white dark:bg-slate-900 shadow-xl rounded-3xl">
                      <CardContent className="p-6 flex gap-4 items-start">
                         <div className="h-10 w-10 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                            <PieChartIcon className="h-5 w-5 text-teal-600" />
                         </div>
                         <div>
                            <h4 className="font-bold text-sm">Serviços Mais Rentáveis</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Veja quais os serviços que trazem mais lucro e quais profissionais estão a performar melhor.</p>
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </div>
          </section>

          {/* PASSO 2: COMISSÕES E EXPORTAÇÃO */}
          <section className="relative group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
             <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-200 dark:border-slate-800 rounded-full group-hover:bg-blue-600 transition-colors" />
             <div className="space-y-6 pl-6">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">2</div>
                   <h3 className="text-2xl font-bold tracking-tight">Comissões Automáticas</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                   Esqueça a calculadora. O AgendarPro calcula a comissão de cada colaborador com base no valor de cada serviço concluído.
                </p>
                <div className="bg-slate-900 text-white p-10 rounded-[3rem] space-y-8">
                   <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="space-y-2 text-center md:text-left">
                         <h4 className="text-xl font-bold italic">Exportação de Dados</h4>
                         <p className="text-sm text-slate-400">Pode exportar todos os relatórios financeiros para Excel para entregar ao seu contabilista com um clique.</p>
                      </div>
                      <div className="shrink-0">
                         <Button variant="outline" className="h-16 px-8 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold">
                            <FileSpreadsheet className="mr-2 h-5 w-5" /> Exportar Relatório .XLSX
                         </Button>
                      </div>
                   </div>
                   <div className="pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                         <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Dica Pro</div>
                         <p className="text-xs text-slate-300">Defina a taxa de comissão individual no perfil de cada membro da equipa em <strong>Configurações &gt; Equipa</strong>.</p>
                      </div>
                      <div className="space-y-2">
                         <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Transparência</div>
                         <p className="text-xs text-slate-300">Os profissionais podem ver as suas próprias comissões diárias, mas nunca o volume total do salão.</p>
                      </div>
                      <div className="space-y-2">
                         <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Segurança</div>
                         <p className="text-xs text-slate-300">Os dados financeiros são criptografados e apenas visíveis para o Proprietário e Gerentes autorizados.</p>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* CTA FINAL DE CONCLUSÃO */}
          <div className="pt-20 text-center space-y-8">
             <div className="relative inline-block">
                <div className="h-24 w-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-teal-600 text-white flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                   <CheckCircle2 className="h-12 w-12" />
                </div>
                <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-slate-900 border-4 border-slate-50 flex items-center justify-center animate-pulse">
                   <Sparkles className="h-6 w-6 text-yellow-400" />
                </div>
             </div>
             <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tighter italic">Tutorial Concluído!</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">Está agora pronto para gerir o seu salão com total controlo e eficiência.</p>
             </div>
             <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="rounded-2xl px-12 h-16 font-black uppercase text-xs tracking-widest bg-primary hover:bg-primary/90 text-white shadow-2xl group w-full md:w-auto" asChild>
                   <Link href="/dashboard">
                      Começar Agora <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </Button>
                <Button variant="ghost" className="rounded-2xl h-16 px-8 text-xs font-bold uppercase tracking-widest" asChild>
                   <Link href="/ajuda/primeiros-passos">Rever Tutorial</Link>
                </Button>
             </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 text-center">
         <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-30">AgendarPro Inteligência de Gestão © 2026</p>
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
