// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Calendar, Plus, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getAllSalons } from "@/lib/actions/admin"

export default function AdminDashboardPage() {
  const [salons, setSalons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllSalons()
      console.log("Dashboard Admin Data:", data)
      setSalons(data)
    } catch (err: any) {
      console.error("Dashboard Error:", err)
      setError(err.message || "Erro desconhecido ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: "Salões Ativos",
      value: salons.length,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-100/50",
    },
    {
      title: "Utilizadores (Donos)",
      value: salons.filter(s => s.role !== 'admin').length,
      icon: Users,
      color: "text-teal-600",
      bg: "bg-teal-100/50",
    },
    {
      title: "Total Processado",
      value: new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
        salons.reduce((acc, s) => acc + (s.total_revenue || 0), 0)
      ),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100/50",
    },
    {
      title: "Agendamentos Globais",
      value: salons.reduce((acc, s) => acc + s._count.appointments, 0),
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-100/50",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic">
            Command Center <span className="text-primary">Admin</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Gestão global da infraestrutura agendar.pro
          </p>
        </div>
        <div className="flex gap-2">
           <Link href="/admin/salons/new">
            <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
              <Plus className="h-5 w-5 mr-3" />
              Novo Salão
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-xl bg-background/60 backdrop-blur-xl rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform">
            <CardContent className="p-8">
              <div className="flex flex-col gap-4">
                <div className={`rounded-2xl p-4 w-fit ${stat.bg}`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Lista de Salões Detalhada */}
        <Card className="lg:col-span-2 border-none shadow-2xl rounded-3xl bg-background/40 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b px-8 py-6">
            <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Salões Registados</CardTitle>
            <Button variant="ghost" size="sm" className="font-bold uppercase tracking-widest text-[10px]">Ver Todos</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plano</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volume</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</th>
                    <th className="px-8 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/10">
                  {salons.map((salon) => (
                    <tr key={salon.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                               {salon.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                               <p className="font-bold text-sm">{salon.name}</p>
                               <p className="text-[10px] text-muted-foreground font-mono">{salon.slug}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <Badge variant="outline" className={`rounded-lg py-0 px-2 text-[9px] uppercase font-black tracking-widest ${
                            salon.plan === 'premium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                            salon.plan === 'basic' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                            'bg-muted text-muted-foreground'
                         }`}>
                            {salon.plan}
                         </Badge>
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-sm font-bold">{new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(salon.total_revenue || 0)}</p>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${salon.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-destructive'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{salon.status}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                            <Plus className="h-4 w-4" />
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Global Distribution */}
        <Card className="border-none shadow-2xl rounded-3xl bg-primary text-primary-foreground italic py-4 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <TrendingUp className="h-40 w-40" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Insights Globais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                   <span>Taxa de Conversão</span>
                   <span>85%</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full bg-white w-[85%]" />
                </div>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                   <span>Novos Clientes (Mês)</span>
                   <span>+12.5%</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full bg-white w-[65%]" />
                </div>
             </div>
             <p className="text-[11px] leading-relaxed opacity-80 mt-10">
                O AgendarPro está a processar mais de 4,500€ em transações por dia através de toda a rede de parceiros em Portugal.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
