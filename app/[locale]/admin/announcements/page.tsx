"use client"

import { useState, useEffect } from "react"
import { getAnnouncements, createAnnouncement, toggleAnnouncement } from "@/lib/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Megaphone, Plus, Power, Trash2, Calendar, AlertTriangle, Info, CheckCircle, Flame } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info"
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const data = await getAnnouncements()
      setAnnouncements(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createAnnouncement(formData)
      toast.success("Anúncio criado com sucesso!")
      setFormData({ title: "", content: "", type: "info" })
      setDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error("Erro: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(id: string, current: boolean) {
    try {
      await toggleAnnouncement(id, !current)
      toast.success(`Anúncio ${!current ? 'ativado' : 'desativado'}`)
      fetchData()
    } catch (err: any) {
      toast.error("Erro ao alterar estado")
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse">Carregando anúncios...</div>

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Broadcasting <span className="text-primary italic">Global</span></h1>
          <p className="text-muted-foreground font-medium">Comunique novidades e alertas para todos os salões parceiros.</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
              <Megaphone className="h-5 w-5 mr-3" />
              Novo Anúncio
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-none shadow-2xl max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Criar Novo Comunicado</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pl-1">Título do Alerta</label>
                  <Input 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="Ex: Atualização do Sistema" 
                    required 
                    className="h-12 rounded-xl"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pl-1">Tipo de Mensagem</label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="info">💡 Informação (Azul)</SelectItem>
                      <SelectItem value="success">✅ Novidade (Verde)</SelectItem>
                      <SelectItem value="warning">⚠️ Aviso (Amarelo)</SelectItem>
                      <SelectItem value="critical">🚨 Urgente (Vermelho)</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pl-1">Conteúdo</label>
                  <Textarea 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    placeholder="Descreva o que os parceiros precisam de saber..." 
                    required 
                    className="min-h-[120px] rounded-xl"
                  />
               </div>
               <Button type="submit" disabled={submitting} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary">
                  {submitting ? "Publicando..." : "Publicar Comunicado"}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {announcements.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent rounded-3xl h-48 flex items-center justify-center italic text-muted-foreground">
            Ainda não há anúncios globais no histórico.
          </Card>
        ) : (
          announcements.map((ann) => (
            <Card key={ann.id} className={`border-none shadow-xl rounded-3xl overflow-hidden bg-background/60 backdrop-blur-xl ${!ann.is_active ? 'opacity-50 grayscale' : ''}`}>
               <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className={`w-2 md:w-3 shrink-0 ${
                    ann.type === 'critical' ? 'bg-red-500' : 
                    ann.type === 'warning' ? 'bg-amber-500' : 
                    ann.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="p-8 flex-1">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                           {ann.type === 'critical' && <Flame className="h-5 w-5 text-red-500" />}
                           {ann.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                           {ann.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                           {ann.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                           <h3 className="text-xl font-black tracking-tighter uppercase">{ann.title}</h3>
                        </div>
                        <Badge variant="outline" className="rounded-full uppercase text-[9px] font-black tracking-widest py-1 px-3">
                           {new Date(ann.created_at).toLocaleDateString()}
                        </Badge>
                     </div>
                     <p className="text-muted-foreground leading-relaxed">{ann.content}</p>
                  </div>
                  <div className="p-6 md:border-l border-muted/10 flex flex-row md:flex-col justify-center gap-3">
                     <Button 
                       onClick={() => handleToggle(ann.id, ann.is_active)}
                       variant={ann.is_active ? "destructive" : "outline"} 
                       className="rounded-xl h-12 w-full font-bold px-6"
                     >
                        <Power className="h-4 w-4 mr-2" />
                        {ann.is_active ? "Desativar" : "Ativar"}
                     </Button>
                  </div>
               </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
