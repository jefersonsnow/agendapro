"use client"

import { useState, useEffect } from "react"
import { getStaffStats } from "@/lib/actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Scissors, 
  DollarSign, 
  Wallet, 
  TrendingUp,
  Search,
  CheckCircle2,
  Calendar
} from "lucide-react"

export default function ProfessionalStatsView() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const [startDate, setStartDate] = useState(firstDay)
  const [endDate, setEndDate] = useState(todayStr)

  const fetchData = async () => {
    setLoading(true)
    const data = await getStaffStats(new Date(startDate), new Date(endDate + 'T23:59:59'))
    setStats(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const profStats = [
    {
      name: "Serviços no Período",
      value: stats?.appointmentCount || 0,
      icon: Scissors,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      name: "Volume Atendido",
      value: new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Minha Comissão",
      value: new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(stats?.totalCommission || 0),
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Sua Taxa",
      value: `${stats?.commissionRate || 0}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 bg-muted/50 p-3 rounded-2xl border border-border/50 backdrop-blur-sm">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">De</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background border rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Até</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background border rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button 
            onClick={fetchData} 
            disabled={loading}
            size="sm"
            className="rounded-xl mt-auto"
          >
            <Search className="h-4 w-4 mr-2" />
            {loading ? "..." : "Filtrar"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {profStats.map((stat) => (
          <Card key={stat.name} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Breakdown Table */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Detalhamento de Serviços</CardTitle>
          <CardDescription>Lista dos serviços concluídos no período selecionado</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 font-semibold">Data</th>
                  <th className="px-6 py-3 font-semibold">Cliente</th>
                  <th className="px-6 py-3 font-semibold">Serviço</th>
                  <th className="px-6 py-3 font-semibold text-right">Valor</th>
                  <th className="px-6 py-3 font-semibold text-right text-primary">Comissão</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats?.appointments?.map((apt: any) => (
                  <tr key={apt.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(apt.starts_at).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 font-medium">{apt.client?.name}</td>
                    <td className="px-6 py-4">{apt.service?.name}</td>
                    <td className="px-6 py-4 text-right font-medium">{Number(apt.price).toFixed(2)}€</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-primary">
                        {(Number(apt.price) * (stats.commissionRate / 100)).toFixed(2)}€
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.appointments || stats.appointments.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-8 w-8 opacity-20" />
                        Nenhum serviço encontrado neste período.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
