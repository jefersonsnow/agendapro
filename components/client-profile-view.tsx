"use client"

import { useState, useEffect } from "react"
import { getClientProfile } from "@/lib/actions/dashboard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Phone, 
  Mail, 
  Star, 
  Euro, 
  Clock, 
  Scissors, 
  MessageCircle, 
  TrendingUp,
  History
} from "lucide-react"
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ClientProfileViewProps {
  clientId: string
}

export default function ClientProfileView({ clientId }: ClientProfileViewProps) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      if (!clientId) return
      setLoading(true)
      try {
        const data = await getClientProfile(clientId)
        setProfile(data)
      } catch (error) {
        console.error("Error fetching client profile:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [clientId])

  const getChartData = () => {
    if (!profile?.appointments) return []
    const grouped: Record<string, number> = {}
    profile.appointments.forEach((app: any) => {
      const date = new Date(app.starts_at)
      const monthYear = format(date, "MMM yy", { locale: ptBR })
      if (!grouped[monthYear]) grouped[monthYear] = 0
      grouped[monthYear] += Number(app.price || 0)
    })
    return Object.entries(grouped)
        .map(([name, total]) => ({ name, total }))
        .reverse()
        .slice(0, 6)
        .reverse()
  }

  const getInitials = (name: string) => {
    return name?.split(" ")?.map((n) => n[0])?.join("")?.toUpperCase()?.slice(0, 2) || "??"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">A carregar CRM...</p>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Profile */}
      <div className="bg-gradient-to-t from-muted/50 to-muted/10 p-6 border-b relative rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/10 to-violet-500/10 -z-10"></div>
        <div className="flex gap-4">
          <Avatar className="h-14 w-14 border-2 border-background shadow-md">
            <AvatarFallback className="bg-gradient-to-br from-primary to-violet-600 text-white text-lg font-bold">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="pt-0.5">
            <h2 className="text-lg font-extrabold tracking-tight">{profile.name}</h2>
            <div className="flex flex-col gap-1 text-[11px] text-muted-foreground mt-0.5 font-medium">
              {profile.phone && (
                <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {profile.phone}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100 flex gap-1 items-center px-1.5 py-0">
            <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" /> {profile.loyalty_points} Pts
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 flex gap-1 items-center px-1.5 py-0">
            <Euro className="h-2.5 w-2.5" /> {Number(profile.total_spent).toFixed(2)}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 max-h-[60vh]">
        <div className="p-4 space-y-6">
          {/* CRM Notes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-100 p-1 rounded-md">
                <MessageCircle className="h-3 w-3 text-amber-700" />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ANOTAÇÕES</h3>
            </div>
            {profile.notes ? (
              <div className="bg-amber-50/50 border border-amber-200/60 text-amber-900 p-3 rounded-xl text-[11px] leading-relaxed shadow-inner">
                {profile.notes}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground p-3 border border-dashed rounded-xl text-center">Sem notas.</p>
            )}
          </div>

          {/* Spend Chart */}
          {getChartData().length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary/10 p-1 rounded-md">
                  <TrendingUp className="h-3 w-3 text-primary" />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">GASTOS</h3>
              </div>
              <div className="h-[100px] w-full bg-card border rounded-xl p-2 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <XAxis dataKey="name" fontSize={8} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{ fontSize: '9px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        formatter={(val: any) => [`${Number(val).toFixed(2)}€`, ""]}
                    />
                    <Bar dataKey="total" fill="var(--tw-colors-primary-DEFAULT)" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* History */}
          <div className="pb-2">
             <div className="flex items-center gap-2 mb-3">
              <div className="bg-violet-100 p-1 rounded-md">
                <History className="h-3 w-3 text-violet-700" />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                HISTÓRICO ({profile.appointments?.length || 0})
              </h3>
            </div>
            
            {profile.appointments && profile.appointments.length > 0 ? (
              <div className="relative border-l-2 border-primary/10 ml-1.5 pl-3 space-y-3">
                {profile.appointments.slice(0, 3).map((app: any) => (
                  <div key={app.id} className="relative">
                    <div className={`absolute -left-[19px] top-1 h-2 w-2 rounded-full border border-background ring-1 ring-background ${app.status === 'completed' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                    <div className="bg-card border border-border/50 rounded-lg p-2 shadow-sm text-[10px]">
                      <div className="flex justify-between font-bold">
                        <span className="truncate pr-2">{app.service?.name}</span>
                        <span className="shrink-0">{Number(app.price).toFixed(2)}€</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {format(new Date(app.starts_at), "d MMM, yy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
