// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { createSupportTicket, getSupportTickets, getUserRole } from "@/lib/actions/dashboard"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  HelpCircle, MessageSquare, LifeBuoy, BookOpen, 
  ChevronRight, PlayCircle, Star, Send, Clock,
  CheckCircle2, AlertCircle, Phone
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export default function HelpSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userPlan, setUserPlan] = useState("minimo")
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium"
  })

  useEffect(() => {
    async function init() {
      const { plan, role } = await getUserRole()
      
      if (role !== 'owner' && role !== 'manager' && role !== 'admin') {
        router.push("/dashboard")
        return
      }

      setUserPlan(plan)
      fetchTickets()
    }
    init()
  }, [])

  async function fetchTickets() {
    try {
      const data = await getSupportTickets()
      setTickets(data)
    } catch (error) {
      console.error("Erro ao carregar tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createSupportTicket(formData)
      toast.success("Ticket enviado com sucesso! A nossa equipa irá responder em breve.")
      setFormData({ subject: "", message: "", priority: "medium" })
      fetchTickets()
    } catch (error: any) {
      toast.error("Erro ao enviar ticket: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const tutorials = [
    { title: "Primeiros Passos", desc: "Aprenda as configurações básicas e como configurar o seu perfil.", icon: <Star className="text-yellow-500" />, href: "/ajuda/primeiros-passos" },
    { title: "Gestão de Agenda", desc: "Como marcar, desmarcar e gerir os horários da sua equipa.", icon: <Clock className="text-blue-500" />, href: "/ajuda/gestao-agenda" },
    { title: "Faturação e Comissões", desc: "Entenda como funcionam os relatórios financeiros e pagamentos.", icon: <PlayCircle className="text-green-500" />, href: "/ajuda/faturacao-comissoes" },
  ]

  const faqs = [
    { q: "Como altero o logótipo do meu salão?", a: "Vá a Configurações > Identidade Visual e faça o upload da sua imagem. Recomendamos o formato PNG ou JPG com fundo transparente." },
    { q: "Posso ter mais do que um profissional?", a: "Sim! Dependendo do seu plano (Basic ou Premium), pode gerir vários profissionais na aba Equipa." },
    { q: "O AgendarPro tem período de experiência?", a: "Não, o AgendarPro funciona num modelo de subscrição direta. Pode começar com o plano Mínimo e fazer upgrade conforme o seu negócio cresce." },
    { q: "Como os clientes fazem as reservas?", a: "Cada salão tem um link exclusivo (ex: agendar.napp.pt/pt/seu-nome). Pode partilhar este link nas suas redes sociais ou via WhatsApp." }
  ]

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Centro de Ajuda & Suporte</h1>
        <p className="text-muted-foreground font-medium">Estamos aqui para garantir que o seu salão nunca pare.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Tutoriais e FAQ */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-tight italic">Tutoriais Rápidos</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tutorials.map((item, i) => (
                  <Link key={i} href={item.href}>
                    <Card className="border-none shadow-lg rounded-3xl bg-background/50 backdrop-blur-sm cursor-pointer hover:scale-[1.02] hover:bg-white dark:hover:bg-slate-900 transition-all border border-transparent hover:border-primary/20 h-full">
                      <CardContent className="p-6">
                        <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center mb-4 text-xl">
                          {item.icon}
                        </div>
                        <h3 className="font-bold mb-2">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
             </div>
          </section>

          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-tight italic">Perguntas Frequentes</h2>
             </div>
             <Card className="border-none shadow-xl rounded-[2rem] bg-background/50 backdrop-blur-xl p-4">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border-b-muted/20 px-4">
                      <AccordionTrigger className="hover:no-underline font-bold text-sm text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-loose">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
             </Card>
          </section>

          {/* Ticket History */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black uppercase tracking-tight italic">Histórico de Pedidos</h2>
             </div>
             {tickets.length === 0 ? (
               <div className="text-center py-10 bg-muted/10 rounded-3xl border border-dashed border-muted/30">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Ainda não abriu nenhum ticket de suporte.</p>
               </div>
             ) : (
               <div className="space-y-4">
                  {tickets.map((ticket: any) => (
                    <Card key={ticket.id} className="border-none shadow-md rounded-2xl overflow-hidden">
                       <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <h4 className="font-bold">{ticket.subject}</h4>
                                <Badge className={cn(
                                  "rounded-lg py-0 px-2 text-[10px] uppercase font-black tracking-widest",
                                  ticket.status === 'open' ? "bg-amber-100 text-amber-600" : 
                                  ticket.status === 'resolved' ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                                )}>
                                  {ticket.status}
                                </Badge>
                             </div>
                             <p className="text-xs text-muted-foreground truncate max-w-sm">{ticket.message}</p>
                             <p className="text-[10px] text-muted-foreground opacity-50">{format(new Date(ticket.created_at), "dd MMM yyyy 'às' HH:mm", { locale: pt })}</p>
                          </div>
                          {ticket.response && (
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mt-2 sm:mt-0">
                               <p className="text-xs font-bold text-primary mb-1 flex items-center gap-1">
                                  <LifeBuoy className="h-3 w-3" /> Resposta da Central Core:
                               </p>
                               <p className="text-xs italic">{ticket.response}</p>
                            </div>
                          )}
                       </CardContent>
                    </Card>
                  ))}
               </div>
             )}
          </section>

        </div>

        {/* Lado Direito: Formulário de Ticket */}
        <div className="space-y-6">
           <Card className="border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-primary to-cyan-700 p-px">
              <div className="bg-background rounded-[2.4rem] p-8 space-y-6 h-full">
                 <div className="space-y-2">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                       <Send className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Novo Ticket</h3>
                    <p className="text-sm text-muted-foreground">Envie a sua dúvida ou problema para a nossa equipa técnica.</p>
                 </div>

                 {userPlan === 'minimo' ? (
                    <div className="bg-primary/5 p-6 rounded-3xl border border-dashed border-primary/30 text-center space-y-4">
                       <LifeBuoy className="h-8 w-8 text-primary mx-auto opacity-50" />
                       <div className="space-y-1">
                          <p className="font-bold text-sm">Suporte via Ticket Indisponível</p>
                          <p className="text-xs text-muted-foreground">O suporte direto via Central Core está disponível apenas para parceiros nos planos <strong>Basic</strong> ou <strong>Premium</strong>.</p>
                       </div>
                       <Button variant="outline" className="w-full rounded-xl text-xs font-bold uppercase tracking-widest h-10 border-primary/20 text-primary hover:bg-primary/5">Fazer Upgrade</Button>
                    </div>
                 ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                       <div className="space-y-2">
                          <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Assunto</Label>
                          <Input 
                           id="subject" 
                           placeholder="Ex: Dúvida sobre Relatórios" 
                           className="rounded-2xl h-12 bg-muted/20 border-transparent focus:bg-background transition-all"
                           value={formData.subject}
                           onChange={(e) => setFormData({...formData, subject: e.target.value})}
                           required
                          />
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Prioridade</Label>
                          <select 
                           id="priority" 
                           className="w-full rounded-2xl h-12 bg-muted/20 border-transparent px-4 text-sm focus:bg-background transition-all outline-none"
                           value={formData.priority}
                           onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          >
                             <option value="low">Baixa</option>
                             <option value="medium">Média</option>
                             <option value="high">Urgente</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Mensagem Detalhada</Label>
                          <Textarea 
                           id="message" 
                           placeholder="Descreva o seu problema..." 
                           className="rounded-2xl bg-muted/20 border-transparent min-h-[120px] focus:bg-background transition-all"
                           value={formData.message}
                           onChange={(e) => setFormData({...formData, message: e.target.value})}
                           required
                          />
                       </div>
                       <Button 
                         type="submit" 
                         className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-primary/20"
                         disabled={isSubmitting}
                       >
                          {isSubmitting ? "A enviar..." : "Enviar Solicitação"}
                          <Send className="h-4 w-4" />
                       </Button>
                    </form>
                 )}
              </div>
           </Card>

           <Card className="border-none shadow-xl rounded-3xl bg-muted/50 p-6">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                 </div>
                 <div>
                    <h4 className="font-bold text-sm italic">WhatsApp Central</h4>
                    <p className="text-xs text-muted-foreground">+351 9XX XXX XXX</p>
                 </div>
              </div>
           </Card>
        </div>

      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
