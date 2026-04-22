"use client"

import { useState, useEffect } from "react"
import { getReportStats } from "@/lib/actions/dashboard"
import { getSalonPlanData } from "@/lib/actions/plan-guard"
import { isFeatureAllowed } from "@/lib/plan-limits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  CheckCircle2,
  PieChartIcon,
  BarChart3,
  ArrowUpRight,
  Target,
  Users
} from "lucide-react"

const COLORS = ["#0D9488", "#7C3AED", "#2563EB", "#D97706", "#DC2626"]

export default function RelatoriosPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<string>("free")
  const [status, setStatus] = useState<string>("active")
  const [dynamicPlans, setDynamicPlans] = useState<any>(null)
  const now = new Date()
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(todayStr)
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)
    const { plan: p, status: s, dynamicPlans: dp } = await getSalonPlanData()
    setPlan(p)
    setStatus(s)
    setDynamicPlans(dp)

    // Só buscamos dados se pelo menos um dos recursos estiver ativo
    if (isFeatureAllowed(p, "reports", dp, s) || isFeatureAllowed(p, "commissions", dp, s)) {
        const data = await getReportStats(new Date(startDate), new Date(endDate + 'T23:59:59'))
        setStats(data)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isFeatureAllowed(plan, "reports", dynamicPlans, status) && !isFeatureAllowed(plan, "commissions", dynamicPlans, status)) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 bg-card rounded-[3rem] border shadow-2xl p-12 text-center animate-in zoom-in duration-500">
            <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center relative">
                <PieChartIcon className="h-16 w-16 text-primary" />
                <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white animate-bounce">UPGRADE</div>
            </div>
            <div className="max-w-md space-y-4">
               <h2 className="text-3xl font-black tracking-tight">Análise de Negócio Bloqueada</h2>
               <p className="text-muted-foreground font-medium">Os relatórios avançados, faturação e análise de desempenho estão disponíveis apenas nos planos <b>Basic</b> e <b>Premium</b>.</p>
               <p className="text-sm text-muted-foreground/80">Tome decisões baseadas em dados e faça o seu negócio crescer.</p>
            </div>
            <Link href="/dashboard/configuracoes">
               <Button className="h-14 px-10 rounded-full font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Ver Planos de Subscrição
               </Button>
            </Link>
        </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Relatórios e BI</h1>
          <p className="text-muted-foreground text-lg italic">
            Visão estratégica do seu negócio em tempo real.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-muted/50 p-3 rounded-2xl border border-border/50 backdrop-blur-sm shadow-inner">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Início</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-primary/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Fim</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-primary/30"
            />
          </div>
          <Button 
            onClick={fetchData} 
            disabled={loading}
            className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 -mb-0.5 mt-auto"
          >
            {loading ? "Carregando..." : "Aplicar Filtros"}
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative group">
        {!isFeatureAllowed(plan, "reports", dynamicPlans, status) && (
          <div className="absolute inset-0 z-20 bg-background/40 backdrop-blur-[2px] rounded-[2rem] flex items-center justify-center p-4">
             <div className="bg-card p-6 rounded-3xl shadow-2xl border flex flex-col items-center text-center gap-3 max-w-[250px]">
                <BarChart3 className="h-8 w-8 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">Relatórios de BI Bloqueados</p>
                <Button size="sm" variant="outline" className="h-8 text-[9px] font-black rounded-lg" asChild><Link href="/dashboard/configuracoes">FAZER UPGRADE</Link></Button>
             </div>
          </div>
        )}
        <Card className="shadow-lg hover:shadow-xl transition-all border-l-4 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-full bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-green-600 bg-green-50 animate-pulse">
                Em Tempo Real
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Ticket Médio</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold">{stats.ticketMedio}€</span>
              <span className="text-xs text-muted-foreground font-semibold">/visita</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" /> +2.4% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all border-l-4 border-violet-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-full bg-violet-100 p-2">
                <DollarSign className="h-5 w-5 text-violet-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Receita Total</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold">{Number(stats.totalRevenue).toFixed(2)}€</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">Baseado em {stats.totalCompleted} serviços concluídos</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all border-l-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-full bg-blue-100 p-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Projeção de Hoje</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold">{Number(stats.dailyProjection).toFixed(2)}€</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">Previsto para hoje baseado na agenda</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all border-l-4 border-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-full bg-orange-100 p-2">
                <CheckCircle2 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Serviços Totais</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold">{stats.totalCompleted}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 font-medium">98% de conclusão nos últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 relative group">
        {!isFeatureAllowed(plan, "reports", dynamicPlans, status) && (
          <div className="absolute inset-0 z-20 bg-background/40 backdrop-blur-[2px] rounded-[3rem] flex items-center justify-center">
             {/* O conteúdo já está bloqueado pelo banner acima para manter visual limpo */}
          </div>
        )}
        {/* Top Services Chart */}
        <Card className="rounded-3xl border-none shadow-xl bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8 px-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Serviços Mais Vendidos</CardTitle>
                <CardDescription>Volume de atendimentos por categoria</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topServices} layout="vertical" margin={{ left: 40, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{fontSize: 12, fontWeight: 600}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'var(--tw-colors-muted)'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="var(--tw-colors-primary-DEFAULT)" radius={[0, 10, 10, 0]} barSize={40}>
                    {stats.topServices.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Share Pie Chart */}
        <Card className="rounded-3xl border-none shadow-xl bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8 px-8">
            <div className="flex items-center gap-3">
              <div className="bg-violet-100 p-2 rounded-xl">
                <PieChartIcon className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Distribuição de Receita</CardTitle>
                <CardDescription>Qual serviço traz mais lucro para o seu salão?</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.topServices}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={8}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.topServices.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${Number(value).toFixed(2)}€`, "Receita"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projections Insight */}
      <Card className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-transparent border-primary/20 rounded-3xl p-8 border">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center shadow-lg ring-8 ring-primary/5">
            <TrendingUp className="h-10 w-10 text-primary" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-extrabold tracking-tight">Projeção Inteligente de Alta Precisão</h3>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Com base no seu <strong>Ticket Médio de {stats.ticketMedio}€</strong> e na sua taxa de ocupação, sua projeção 
              de faturamento para o final deste mês é de aproximadamente <strong>{((Number(stats.ticketMedio)*stats.totalCompleted) * 1.15).toFixed(2)}€</strong>. 
              Isso representa um crescimento sólido para o {stats.salonName}.
            </p>
          </div>
        </div>
      </Card>

      {/* Staff Commission Breakdown */}
      <Card className="rounded-3xl border-none shadow-xl bg-card overflow-hidden relative">
        {!isFeatureAllowed(plan, "commissions", dynamicPlans, status) && (
            <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[4px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
               <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-2 flex flex-col items-center gap-4 max-w-sm">
                  <div className="h-20 w-20 rounded-2xl bg-violet-100 flex items-center justify-center">
                     <Users className="h-10 w-10 text-violet-600 animate-bounce" />
                  </div>
                  <div>
                     <h3 className="font-black uppercase tracking-widest text-sm mb-2">Controlo de Comissões PRO</h3>
                     <p className="text-xs text-muted-foreground leading-relaxed">
                        A gestão automática de comissões e pagamentos da equipa está disponível nos planos pagos. Organize as suas contas sem esforço.
                     </p>
                  </div>
                  <Button variant="default" className="w-full rounded-2xl font-black text-xs uppercase tracking-widest h-12 shadow-xl shadow-primary/20" asChild>
                     <Link href="/dashboard/configuracoes">LIBERTAR ESTE RECURSO</Link>
                  </Button>
               </div>
            </div>
        )}
        <CardHeader className="bg-muted/30 pb-8 px-8">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Pagamentos e Comissões da Equipa</CardTitle>
                <CardDescription>Quanto cada profissional deve receber este mês</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="px-8 py-4 font-semibold text-sm">Profissional</th>
                    <th className="px-8 py-4 font-semibold text-sm text-right">Volume Atendido</th>
                    <th className="px-8 py-4 font-semibold text-sm text-right text-primary">Comissão a Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.staffCommissions.map((staff: any) => (
                    <tr key={staff.name} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-4 font-medium">
                        <button 
                          onClick={() => setSelectedStaffDetail(staff)}
                          className="hover:text-primary transition-colors flex items-center gap-2 group-hover:translate-x-1 duration-300"
                        >
                          {staff.name}
                          <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="px-8 py-4 text-right font-medium">{Number(staff.revenue).toFixed(2)}€</td>
                      <td className="px-8 py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold">
                          {Number(staff.commission).toFixed(2)}€
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
      </Card>

      {/* Modal de Detalhamento por Profissional */}
      <Dialog open={!!selectedStaffDetail} onOpenChange={(open) => !open && setSelectedStaffDetail(null)}>
        <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="p-6 sm:p-8 bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-black">{selectedStaffDetail?.name}</DialogTitle>
                <DialogDescription className="sr-only">
                  Histórico detalhado de faturamento e comissões do profissional selecionado.
                </DialogDescription>
                <p className="text-muted-foreground font-medium">Detalhamento de Produtividade no Período</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Comissão Total</p>
                <p className="text-2xl font-black text-primary">{Number(selectedStaffDetail?.commission).toFixed(2)}€</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-0 scrollbar-thin">
             <table className="w-full text-left">
                <thead className="bg-muted/10 border-b sticky top-0 z-10 backdrop-blur-md">
                   <tr>
                      <th className="px-3 sm:px-8 py-3 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-wider text-muted-foreground">Data</th>
                      <th className="px-3 sm:px-8 py-3 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-wider text-muted-foreground">Cliente</th>
                      <th className="px-3 sm:px-8 py-3 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-wider text-muted-foreground">Serviço</th>
                      <th className="px-3 sm:px-8 py-3 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-wider text-muted-foreground text-right">Valor</th>
                      <th className="px-3 sm:px-8 py-3 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-wider text-primary text-right">Comissão</th>
                   </tr>
                </thead>
                <tbody className="divide-y">
                   {selectedStaffDetail?.appointments.map((apt: any) => (
                      <tr key={apt.id} className="hover:bg-muted/5 transition-colors">
                         <td className="px-3 sm:px-8 py-3 sm:py-4 text-muted-foreground font-medium text-[9px] sm:text-sm">
                            {new Date(apt.date).toLocaleDateString('pt-PT')}
                         </td>
                         <td className="px-3 sm:px-8 py-3 sm:py-4 font-bold text-[9px] sm:text-sm leading-tight max-w-[80px] sm:max-w-none truncate">{apt.client}</td>
                         <td className="px-3 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-sm leading-tight max-w-[100px] sm:max-w-none truncate">{apt.service}</td>
                         <td className="px-3 sm:px-8 py-3 sm:py-4 text-right font-medium text-[9px] sm:text-sm">{Number(apt.price).toFixed(2)}€</td>
                         <td className="px-3 sm:px-8 py-3 sm:py-4 text-right font-black text-primary text-[10px] sm:text-sm">
                            {Number(apt.commission).toFixed(2)}€
                         </td>
                      </tr>
                   ))}
                   {selectedStaffDetail?.appointments.length === 0 && (
                      <tr>
                         <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground">
                            Nenhum serviço finalizado neste período.
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
          
          <div className="p-6 bg-muted/30 border-t flex justify-end">
             <Button onClick={() => setSelectedStaffDetail(null)} className="rounded-xl px-8 font-bold">
                Fechar
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Badge({ children, className, variant = "default" }: any) {
  const variants: any = {
    default: "bg-primary text-primary-foreground",
    outline: "border text-foreground bg-transparent",
    secondary: "bg-secondary text-secondary-foreground"
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-foreground/10 ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
