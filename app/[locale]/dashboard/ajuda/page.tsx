// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { createSupportTicket, getSupportTickets, getUserRole, getSupportConfig } from "@/lib/actions/dashboard"
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
  CheckCircle2, AlertCircle, Phone, Youtube,
  Sparkles, Copy, Check, Image as ImageIcon
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function HelpSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userPlan, setUserPlan] = useState("minimo")
  const router = useRouter()

  const [aiImageType, setAiImageType] = useState("logo")
  const [aiStyle, setAiStyle] = useState("Modern & Elegant")
  const [aiColors, setAiColors] = useState("")
  const [aiElements, setAiElements] = useState("")
  const [aiHasLogo, setAiHasLogo] = useState(false)
  const [aiLogoDesc, setAiLogoDesc] = useState("")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  
  const [supportWhatsApp, setSupportWhatsApp] = useState("")
  
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

      try {
        const support = await getSupportConfig()
        if (support?.whatsappNumber) {
          setSupportWhatsApp(support.whatsappNumber)
        }
      } catch (err) {
        console.error("Erro ao carregar suporte WhatsApp:", err)
      }
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

  function handleGeneratePrompt() {
    let typeInstructions = ""
    let negativePrompt = "Avoid any text, words, letters, signatures, watermarks, or typography inside the image. The image should be completely clean of any text."
    
    if (aiImageType === "logo") {
      typeInstructions = "A professional minimalist logo icon, 1:1 aspect ratio, perfectly centered, square layout. It should be clean, modern, and high-end, suitable for a salon branding. Solid clean background or elegant flat design, vector-like quality."
    } else if (aiImageType === "cover") {
      typeInstructions = "A widescreen banner cover, 16:9 aspect ratio. The composition must be center-focused with elements balanced on the sides so text can be overlaid on top if needed. High-end interior design or atmospheric representation of a professional salon."
    } else { // gallery
      typeInstructions = "A vertical portrait photo of a high-end salon workspace or service result, 3:4 aspect ratio. Professional photography style, cinematic lighting, sharp focus, showing realistic details of hair, beauty service, or salon setup."
    }

    const styleDesc = `Visual style: ${aiStyle}. Color palette: ${aiColors || "natural colors matching the style"}.`
    const elementsDesc = aiElements ? `Main elements and atmosphere: ${aiElements}.` : ""
    const logoDesc = (aiHasLogo && aiLogoDesc) ? `Make the visual style and colors consistent with this logo description: ${aiLogoDesc}.` : ""

    const finalEnglish = `Image generation prompt:
${typeInstructions}
${styleDesc}
${elementsDesc}
${logoDesc}
Important: ${negativePrompt}
Quality tags: 8k resolution, professional lighting, photorealistic, premium design.`

    setGeneratedPrompt(finalEnglish)
    setIsPromptModalOpen(true)
  }

  function copyGeneratedPrompt() {
    navigator.clipboard.writeText(generatedPrompt)
    setCopiedPrompt(true)
    toast.success("Prompt copiado para a área de transferência!")
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const tutorials = [
    { title: "Primeiros Passos", desc: "Aprenda as configurações básicas e como configurar o seu perfil.", icon: <Star className="text-yellow-500" />, href: "/ajuda/primeiros-passos" },
    { title: "Gestão de Agenda", desc: "Como marcar, desmarcar e gerir os horários da sua equipa.", icon: <Clock className="text-blue-500" />, href: "/ajuda/gestao-agenda" },
    { title: "Faturação e Comissões", desc: "Entenda como funcionam os relatórios financeiros e pagamentos.", icon: <PlayCircle className="text-green-500" />, href: "/ajuda/faturacao-comissoes" },
  ]

  const faqs = [
    { q: "Como altero o logótipo do meu salão?", a: "Vá a Configurações > Identidade Visual e faça o upload da sua imagem. Recomendamos o formato PNG ou JPG com fundo transparente." },
    { q: "Posso ter mais do que um profissional?", a: "Sim! Dependendo do seu plano (Basic ou Premium), pode gerir vários profissionais na aba Equipa." },
    { q: "O AgendarPro tem período de experiência?", a: "Sim! O AgendarPro oferece um período experimental gratuito de 60 dias para novos parceiros (quando ativo). Durante este trial, tem acesso total a todas as funcionalidades do sistema para configurar e testar o seu salão sem qualquer cobrança inicial." },
    { q: "Como os clientes fazem as reservas?", a: "Cada salão tem um link exclusivo (ex: agendarpro.pt/seu-salao). Pode partilhar este link diretamente no seu Instagram, nas redes sociais ou enviar via WhatsApp." }
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

          {/* GUIA DE IMAGENS & ASSISTENTE DE IA */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                <h2 className="text-xl font-black uppercase tracking-tight italic">Guia de Imagens & Assistente de IA</h2>
             </div>
             
             <Card className="border-none shadow-xl rounded-[2rem] bg-background/50 backdrop-blur-xl p-6 space-y-6">
                {/* Dimensões Recomendadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Logótipo</span>
                    <p className="text-base font-bold mt-1">Quadrado (1:1)</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Tamanho ideal de <strong>512x512px</strong>. Recomendamos formatos PNG com fundo transparente.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Banner / Capa</span>
                    <p className="text-base font-bold mt-1">Paisagem (16:9)</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Tamanho de <strong>1920x1080px</strong>. Mantenha os elementos visuais focados no centro.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Galeria</span>
                    <p className="text-base font-bold mt-1">Retrato (3:4)</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Tamanho ideal de <strong>900x1200px</strong> (proporção vertical). Ideal para focar nos serviços.
                    </p>
                  </div>
                </div>

                <div className="border-t border-dashed border-muted/50 pt-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Gerador de Prompt do Gemini</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Responda às perguntas abaixo e nós criaremos um prompt estruturado em inglês (otimizado para geradores de imagem IA) com filtros para remover textos indesejados.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-img-type" className="text-xs font-bold uppercase">Que imagem deseja criar?</Label>
                      <Select value={aiImageType} onValueChange={setAiImageType}>
                        <SelectTrigger id="ai-img-type" className="border-2 rounded-xl h-11 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="logo">Logótipo do Salão (1:1)</SelectItem>
                          <SelectItem value="cover">Banner de Capa (16:9)</SelectItem>
                          <SelectItem value="gallery">Item de Galeria / Foto de Serviço (3:4)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai-img-style" className="text-xs font-bold uppercase">Estilo Visual / Estética</Label>
                      <Select value={aiStyle} onValueChange={setAiStyle}>
                        <SelectTrigger id="ai-img-style" className="border-2 rounded-xl h-11 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Modern & Elegant">Moderno & Elegante</SelectItem>
                          <SelectItem value="Minimalist & Clean">Minimalista & Limpo</SelectItem>
                          <SelectItem value="Cozy & Rustic Wood">Rústico / Acolhedor</SelectItem>
                          <SelectItem value="Luxury & Golden Highlights">Luxuoso & Detalhes Dourados</SelectItem>
                          <SelectItem value="Cyberpunk & Neon Light">Tecnológico / Neon</SelectItem>
                          <SelectItem value="Vintage & Retro Barber Shop">Retro / Barbearia Clássica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-img-colors" className="text-xs font-bold uppercase">Paleta de Cores</Label>
                      <Input
                        id="ai-img-colors"
                        value={aiColors}
                        onChange={(e) => setAiColors(e.target.value)}
                        placeholder="Ex: Rose gold, branco e mármore; Preto e dourado"
                        className="border-2 rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai-img-elements" className="text-xs font-bold uppercase">Elementos na Imagem</Label>
                      <Input
                        id="ai-img-elements"
                        value={aiElements}
                        onChange={(e) => setAiElements(e.target.value)}
                        placeholder="Ex: Plantas verdes, espelho redondo iluminado por LED, secador"
                        className="border-2 rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-dashed border-muted/50">
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-background shadow-sm">
                      <div className="space-y-0.5">
                        <Label htmlFor="ai-has-logo" className="text-sm font-bold cursor-pointer">Seguir estilo de um logótipo existente</Label>
                        <p className="text-xs text-muted-foreground">
                          Ative esta opção se já possuir um logótipo e quiser manter a mesma identidade nos banners.
                        </p>
                      </div>
                      <Switch
                        id="ai-has-logo"
                        checked={aiHasLogo}
                        onCheckedChange={setAiHasLogo}
                      />
                    </div>

                    {aiHasLogo && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="ai-logo-desc" className="text-xs font-bold uppercase">Descrição do seu Logótipo</Label>
                        <Textarea
                          id="ai-logo-desc"
                          value={aiLogoDesc}
                          onChange={(e) => setAiLogoDesc(e.target.value)}
                          placeholder="Ex: Ícone de uma tesoura dourada com folhagens verdes ao redor, fundo preto com letras minimalistas..."
                          className="border-2 rounded-xl min-h-[80px] resize-none"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleGeneratePrompt}
                    className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                    Criar Prompt de IA Otimizado
                  </Button>
                </div>
             </Card>
          </section>

          {/* MODAL DO PROMPT GERADO */}
          <Dialog open={isPromptModalOpen} onOpenChange={setIsPromptModalOpen}>
            <DialogContent className="max-w-md sm:max-w-lg bg-white rounded-3xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" /> Prompt Pronto para o Gemini
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Copie o prompt estruturado em inglês abaixo e cole no <strong>Gemini (gemini.google.com)</strong> ou outra IA de imagem para obter resultados perfeitos.
                </p>

                <div className="relative">
                  <Textarea
                    readOnly
                    value={generatedPrompt}
                    className="w-full min-h-[220px] font-mono text-xs bg-muted/40 border-2 rounded-2xl p-4 resize-none focus-visible:ring-0 cursor-text"
                  />
                  <Button
                    size="sm"
                    onClick={copyGeneratedPrompt}
                    className="absolute right-3 bottom-3 rounded-xl h-9 px-4 font-bold text-xs"
                  >
                    {copiedPrompt ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copiedPrompt ? "Copiado!" : "Copiar Prompt"}
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                  <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">Como obter o melhor resultado no Gemini?</p>
                    <p className="text-[10px] text-amber-800 leading-relaxed mt-1 opacity-90">
                      Insira o prompt acima na conversa com o Gemini. Após gerar a imagem, faça o download dela e carregue-a no painel de Configurações nos campos correspondentes (Logótipo, Capa ou Galeria).
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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

             <Card className="border-none shadow-xl rounded-3xl bg-muted/50 p-6 hover:bg-green-500/5 transition-all">
                <a 
                  href={supportWhatsApp ? `https://wa.me/${supportWhatsApp}` : "#"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={cn("flex items-center gap-4 group", !supportWhatsApp && "pointer-events-none")}
                >
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                     <h4 className="font-bold text-sm italic group-hover:text-green-600 transition-colors">WhatsApp Central</h4>
                     <p className="text-xs text-muted-foreground">{supportWhatsApp ? `+${supportWhatsApp}` : "+351 9XX XXX XXX"}</p>
                  </div>
                </a>
             </Card>

            <Card className="border-none shadow-xl rounded-3xl bg-muted/50 p-6 hover:bg-red-500/5 transition-all">
               <a href="https://www.youtube.com/@nappsistemas" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Youtube className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-sm italic group-hover:text-red-600 transition-colors">Canal do YouTube</h4>
                     <p className="text-xs text-muted-foreground truncate">youtube.com/@nappsistemas</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
               </a>
            </Card>
         </div>

      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
