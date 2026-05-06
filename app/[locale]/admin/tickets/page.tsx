// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { getSupportTicketsAdmin, respondToTicket } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, Clock, CheckCircle2, AlertCircle, 
  Search, Filter, Send, Building2, User, Zap
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [response, setResponse] = useState("")
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      const data = await getSupportTicketsAdmin()
      setTickets(data)
    } catch (error) {
       toast.error("Erro ao carregar tickets")
    } finally {
      setLoading(false)
    }
  }

  async function handleRespond(e: React.FormEvent) {
    e.preventDefault()
    if (!response) return
    try {
      await respondToTicket(selectedTicket.id, response)
      toast.success("Resposta enviada e ticket resolvido!")
      setResponse("")
      setSelectedTicket(null)
      fetchTickets()
    } catch (error: any) {
      toast.error("Erro ao responder: " + error.message)
    }
  }

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.salon.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' ? true : t.status === filter
    return matchesSearch && matchesFilter
  })

  // Stats calculation
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    high: tickets.filter(t => t.priority === 'high' && t.status === 'open').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  }

  if (loading) {
     return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Central de Tickets</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 opacity-50" />
            Gestão de suporte e pedidos dos parceiros AgendarPro.
          </p>
        </div>
        <div className="flex gap-2">
           <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            className="rounded-xl font-bold text-xs uppercase tracking-widest h-9"
           >
            Todos
           </Button>
           <Button 
            variant={filter === 'open' ? 'default' : 'outline'} 
            onClick={() => setFilter('open')}
            className="rounded-xl font-bold text-xs uppercase tracking-widest h-9"
           >
            Abertos ({stats.open})
           </Button>
           <Button 
            variant={filter === 'resolved' ? 'default' : 'outline'} 
            onClick={() => setFilter('resolved')}
            className="rounded-xl font-bold text-xs uppercase tracking-widest h-9"
           >
            Resolvidos
           </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <TicketStatCard title="Tickets Abertos" value={stats.open} color="amber" icon={<AlertCircle />} />
        <TicketStatCard title="Prioridade Alta" value={stats.high} color="red" icon={<Zap />} />
        <TicketStatCard title="Resolvidos" value={stats.resolved} color="green" icon={<CheckCircle2 />} />
        <TicketStatCard title="Total de Pedidos" value={stats.total} color="primary" icon={<MessageSquare />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-350px)] min-h-[600px]">
        
        {/* Inbox Sidebar - Compact Version */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Pesquisar por assunto ou salão..." 
                className="pl-11 rounded-2xl border-none shadow-xl bg-background/50 backdrop-blur-sm h-12 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>

           <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-thin">
              {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:bg-muted/10 group relative",
                    selectedTicket?.id === ticket.id ? "bg-primary/5 ring-1 ring-primary/20" : "bg-background/40"
                  )}
                  onClick={() => {
                    setSelectedTicket(ticket)
                    setResponse(ticket.response || "")
                  }}
                >
                  {/* Status Indicator Dot - Left Bar Style */}
                  {ticket.status === 'open' && (
                    <div className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full",
                      ticket.priority === 'high' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    )} />
                  )}

                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shrink-0 group-hover:scale-105 transition-transform">
                    {ticket.salon.name[0].toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <h4 className="font-bold text-xs truncate uppercase tracking-tight">{ticket.salon.name}</h4>
                       <span className="text-[9px] font-mono opacity-30 shrink-0">#{ticket.id.slice(0, 6)}</span>
                    </div>
                    {/* Subject in small text for context */}
                    <p className="text-[10px] text-muted-foreground truncate opacity-60 italic">{ticket.subject}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] text-muted-foreground font-medium opacity-40">
                       {format(new Date(ticket.created_at), "dd MMM", { locale: pt })}
                    </span>
                    <Badge className={cn(
                      "rounded-lg py-0 px-2 text-[8px] uppercase font-black tracking-widest",
                      ticket.status === 'open' ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    )}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              )) : (
                 <div className="py-20 text-center opacity-30 italic font-medium">Nenhum ticket encontrado...</div>
              )}
           </div>
        </div>

        {/* Conversation View */}
        <div className="lg:col-span-8 overflow-hidden h-full">
           {selectedTicket ? (
             <div className="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/50 backdrop-blur-xl flex-1 flex flex-col overflow-hidden">
                   <div className="p-6 border-b border-muted/10 flex justify-between items-center bg-muted/5">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Building2 className="h-6 w-6" />
                         </div>
                         <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">{selectedTicket.subject}</h2>
                            <p className="text-xs text-muted-foreground font-medium">Ticket de {selectedTicket.salon.name}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <Badge className={cn(
                           "rounded-xl py-1.5 px-4 text-[10px] uppercase font-black tracking-widest shadow-md",
                           selectedTicket.priority === 'high' ? "bg-red-500 text-white" : "bg-amber-400 text-black"
                         )}>
                           Prioridade {selectedTicket.priority}
                         </Badge>
                         <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="rounded-full">
                           <Clock className="h-4 w-4 opacity-50" />
                         </Button>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
                      {/* Customer Message */}
                      <div className="flex flex-col items-start max-w-[85%]">
                         <div className="flex items-center gap-2 mb-2 ml-1">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{selectedTicket.salon.name}</span>
                            <span className="text-[10px] opacity-30">•</span>
                            <span className="text-[10px] opacity-30">{format(new Date(selectedTicket.created_at), "dd MMM, HH:mm", { locale: pt })}</span>
                         </div>
                         <div className="bg-muted/30 p-6 rounded-3xl rounded-tl-none shadow-sm text-sm leading-relaxed relative border border-muted/10">
                            {selectedTicket.message}
                         </div>
                      </div>

                      {/* Admin Response (if exists) */}
                      {selectedTicket.response && (
                         <div className="flex flex-col items-end max-w-[85%] ml-auto">
                            <div className="flex items-center gap-2 mb-2 mr-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-primary">Suporte AgendarPro</span>
                               <span className="text-[10px] opacity-30">•</span>
                               <span className="text-[10px] opacity-30">{format(new Date(selectedTicket.updated_at || selectedTicket.created_at), "dd MMM, HH:mm", { locale: pt })}</span>
                            </div>
                            <div className="bg-primary text-primary-foreground p-6 rounded-3xl rounded-tr-none shadow-xl shadow-primary/10 text-sm leading-relaxed border border-primary/20">
                               {selectedTicket.response}
                            </div>
                            <div className="flex items-center gap-1.5 mt-3 text-green-500">
                               <CheckCircle2 className="h-3.5 w-3.5" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Resolvido</span>
                            </div>
                         </div>
                      )}

                      {/* Prompt to respond if open */}
                      {selectedTicket.status === 'open' && (
                         <div className="mt-12 pt-8 border-t border-muted/10">
                            <div className="flex items-center gap-3 mb-6">
                               <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                  <Send className="h-4 w-4" />
                               </div>
                               <span className="text-xs font-black uppercase tracking-widest italic">Enviar Resolução</span>
                            </div>
                            <form onSubmit={handleRespond} className="space-y-4">
                               <div className="relative">
                                  <Textarea 
                                   value={response}
                                   onChange={(e) => setResponse(e.target.value)}
                                   placeholder="Descreva a solution ou responda ao parceiro..."
                                   className="rounded-3xl min-h-[160px] bg-background/50 border-muted/30 shadow-inner p-6 focus:ring-primary/20 resize-none text-sm"
                                  />
                               </div>
                               <div className="flex justify-end gap-3">
                                  <Button 
                                   type="submit" 
                                   className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                                  >
                                     Resolver Ticket Agora
                                  </Button>
                               </div>
                            </form>
                         </div>
                      )}
                   </div>
                </Card>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-background/30 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-muted/20">
                <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-8 relative">
                   <MessageSquare className="h-10 w-10 text-primary opacity-20" />
                   <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping opacity-20" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic opacity-50">Central de Atendimento</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-3 font-medium">
                   Selecione um pedido de suporte à esquerda para iniciar o atendimento e resolver pendências dos parceiros.
                </p>
             </div>
           )}
        </div>

      </div>
    </div>
  )
}

function TicketStatCard({ title, value, color, icon }: { title: string, value: number, color: string, icon: any }) {
   const colorClasses: any = {
      amber: "bg-amber-100 text-amber-700 border-amber-200",
      red: "bg-red-100 text-red-700 border-red-200",
      green: "bg-green-100 text-green-700 border-green-200",
      primary: "bg-primary/10 text-primary border-primary/20",
   }

   return (
      <Card className="border-none shadow-xl rounded-3xl bg-background/50 backdrop-blur-sm overflow-hidden group hover:scale-[1.02] transition-all">
         <CardContent className="p-6">
            <div className="flex justify-between items-start">
               <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:rotate-6", colorClasses[color])}>
                  {icon}
               </div>
            </div>
            <div className="mt-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{title}</p>
               <p className="text-3xl font-black tracking-tighter mt-1">{value}</p>
            </div>
         </CardContent>
      </Card>
   )
}
