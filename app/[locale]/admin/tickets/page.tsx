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
  Search, Filter, Send, Building2, User
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
      toast.success("Resposta enviada!")
      setResponse("")
      setSelectedTicket(null)
      fetchTickets()
    } catch (error: any) {
      toast.error("Erro ao responder: " + error.message)
    }
  }

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.salon.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
     return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Central de Tickets</h1>
        <p className="text-muted-foreground font-medium">Gestão de suporte e pedidos dos parceiros AgendarPro.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* List of Tickets */}
        <div className="lg:col-span-1 space-y-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar tickets..." 
                className="pl-9 rounded-xl border-none shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>

           <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin">
              {filteredTickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className={cn(
                    "border-none shadow-md rounded-2xl cursor-pointer transition-all hover:scale-[1.01]",
                    selectedTicket?.id === ticket.id ? "ring-2 ring-primary bg-primary/5" : "bg-background/60"
                  )}
                  onClick={() => {
                    setSelectedTicket(ticket)
                    setResponse(ticket.response || "")
                  }}
                >
                  <CardContent className="p-4 space-y-3">
                     <div className="flex justify-between items-start">
                        <Badge className={cn(
                          "rounded-lg py-0 px-2 text-[10px] uppercase font-black tracking-widest",
                          ticket.status === 'open' ? "bg-amber-100 text-amber-600" : 
                          ticket.status === 'resolved' ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                        )}>
                          {ticket.status}
                        </Badge>
                        <span className="text-[10px] opacity-40 font-mono">#{ticket.id.slice(0, 8)}</span>
                     </div>
                     <div>
                        <h4 className="font-bold text-sm truncate">{ticket.subject}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                           <Building2 className="h-3 w-3" /> {ticket.salon.name}
                        </p>
                     </div>
                     <p className="text-[10px] text-muted-foreground opacity-50 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {format(new Date(ticket.created_at), "dd MMM HH:mm", { locale: pt })}
                     </p>
                  </CardContent>
                </Card>
              ))}
           </div>
        </div>

        {/* Ticket Detail & Response */}
        <div className="lg:col-span-2">
           {selectedTicket ? (
             <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/50 backdrop-blur-xl h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <CardHeader className="border-b border-muted/20 pb-6 bg-muted/5">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <h2 className="text-2xl font-black uppercase tracking-tighter italic">{selectedTicket.subject}</h2>
                         <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1.5 font-bold text-primary">
                               <Building2 className="h-4 w-4" /> {selectedTicket.salon.name}
                            </span>
                            <span className="opacity-30">•</span>
                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                               <Clock className="h-3.5 w-3.5" /> {format(new Date(selectedTicket.created_at), "dd MMMM yyyy 'às' HH:mm", { locale: pt })}
                            </span>
                         </div>
                      </div>
                      <Badge className={cn(
                        "rounded-xl py-1 px-4 text-xs uppercase font-black tracking-widest shadow-lg",
                        selectedTicket.priority === 'high' ? "bg-red-500 text-white" : "bg-amber-400 text-black"
                      )}>
                        {selectedTicket.priority}
                      </Badge>
                   </div>
                </CardHeader>
                <CardContent className="flex-1 p-8 space-y-8 overflow-y-auto">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 opacity-50">
                         <MessageSquare className="h-4 w-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Mensagem do Cliente</span>
                      </div>
                      <div className="bg-muted/30 p-6 rounded-3xl text-sm leading-loose italic">
                         "{selectedTicket.message}"
                      </div>
                   </div>

                   <hr className="border-muted/20" />

                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                         <Send className="h-4 w-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Resposta Central Core</span>
                      </div>
                      <form onSubmit={handleRespond} className="space-y-4">
                         <Textarea 
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Escreva aqui a solução ou resposta ao parceiro..."
                          className="rounded-[2rem] min-h-[150px] bg-background border-muted shadow-inner p-6 focus:ring-primary/20"
                         />
                         <div className="flex gap-4">
                            <Button 
                              type="submit" 
                              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                            >
                               Enviar Resposta e Resolver
                            </Button>
                            <Button variant="outline" className="h-14 rounded-2xl px-6 font-bold" type="button" onClick={() => setSelectedTicket(null)}>
                               Fechar
                            </Button>
                         </div>
                      </form>
                   </div>
                </CardContent>
             </Card>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/5 rounded-[2.5rem] border border-dashed border-muted/30">
                <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                   <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold opacity-40">Selecione um ticket para responder</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto mt-2">Escolha um pedido de suporte na lista ao lado para ver os detalhes e enviar uma resposta.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  )
}
