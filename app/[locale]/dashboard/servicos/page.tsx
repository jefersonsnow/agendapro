"use client"

import { useState, useEffect } from "react"
import { 
  getServices, upsertService, deleteService 
} from "@/lib/actions/dashboard"
import { checkServiceLimit } from "@/lib/actions/plan-guard"
import PlanLimitBanner from "@/components/plan-limit-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Plus, Pencil, Trash2, Clock, Scissors, Tags, Lock, AlertCircle } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  category: string
  is_active: boolean
  is_plan_blocked?: boolean
}

const serviceCategories = [
  "Cabelo", "Barba", "Unhas", "Estética", "Massagem", "Maquilhagem", "Depilação", "Outro",
]

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [planCheck, setPlanCheck] = useState({ allowed: true, limit: -1, current: 0, plan: "free" })
  
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  
  const [editingService, setEditingService] = useState<Service | null>(null)

  const [serviceForm, setServiceForm] = useState({
    name: "", description: "", duration_minutes: 30, price: 0, category: "Cabelo", is_active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const svs = await getServices()
    setServices(svs || [])

    const limit = await checkServiceLimit()
    setPlanCheck(limit)

    setLoading(false)
  }

  function openCreateService() {
    setEditingService(null)
    setServiceForm({ name: "", description: "", duration_minutes: 30, price: 0, category: "Cabelo", is_active: true })
    setIsServiceDialogOpen(true)
  }
  
  function openEditService(svc: Service) {
    setEditingService(svc)
    setServiceForm({ ...svc, description: svc.description || "" })
    setIsServiceDialogOpen(true)
  }
  
  async function handleServiceSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await upsertService(editingService?.id || null, serviceForm)
      setIsServiceDialogOpen(false)
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const groupedServices = services.reduce((acc, s) => {
    const cat = s.category || "Geral"; if (!acc[cat]) acc[cat] = []; acc[cat].push(s); return acc
  }, {} as Record<string, Service[]>)

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
  }

  return (
    <div className="space-y-12 pb-20">
      <PlanLimitBanner
        plan={planCheck.plan}
        feature="services"
        current={planCheck.current}
        limit={planCheck.limit}
        resourceName="serviços"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" /> Serviços
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Gerencie os serviços oferecidos pelo seu salão</p>
          </div>
          <Button onClick={openCreateService} className="rounded-xl shadow-lg shadow-primary/20" disabled={!planCheck.allowed && !editingService}>
            <Plus className="h-4 w-4 mr-2" /> Novo Serviço
          </Button>
        </div>

        {Object.keys(groupedServices).length === 0 && (
           <div className="py-20 text-center bg-card rounded-3xl border-2 border-dashed flex flex-col items-center">
             <Scissors className="h-12 w-12 text-muted-foreground/20 mb-4" />
             <p className="text-muted-foreground font-bold">Nenhum serviço registado</p>
             <Button variant="link" onClick={openCreateService}>Adicionar primeiro serviço</Button>
           </div>
        )}

        {Object.entries(groupedServices).map(([category, svcs]) => (
          <Card key={category} className="border-2">
            <CardHeader className="bg-muted/30 py-4 px-6 border-b">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">{category}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y">
                  {svcs.map(s => (
                    <div key={s.id} className={cn(
                       "p-6 flex items-center justify-between transition-colors relative overflow-hidden",
                       s.is_plan_blocked ? "bg-amber-500/[0.03] opacity-60" : "hover:bg-muted/10 cursor-default"
                    )}>
                       {s.is_plan_blocked && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-12 pointer-events-none">
                             <Lock className="h-4 w-4 text-amber-600 animate-bounce" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">Plano Excedido</span>
                          </div>
                       )}
                       <div className="space-y-1 flex-1">
                          <h4 className={cn("font-bold text-lg flex items-center gap-2 tracking-tight", s.is_plan_blocked && "text-amber-800")}>
                             {s.name} 
                             {s.is_plan_blocked && <Lock className="h-4 w-4 opacity-40" />}
                          </h4>
                          {s.description && <p className="text-sm text-muted-foreground line-clamp-1 italic">{s.description}</p>}
                          <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest pt-2">
                             <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration_minutes} MIN</span>
                             <span className="flex items-center gap-1"><Tags className="h-3 w-3" /> {(Number(s.price) || 0).toFixed(2)} €</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 relative z-10">
                          <Switch 
                             checked={s.is_active && !s.is_plan_blocked} 
                             disabled={s.is_plan_blocked}
                             onCheckedChange={async () => { await upsertService(s.id, {...s, is_active: !s.is_active}); fetchData() }} 
                          />
                          {!s.is_plan_blocked && (
                             <>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => openEditService(s)}>
                                   <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => { if(confirm("Deseja eliminar?")) { deleteService(s.id).then(fetchData) } }}>
                                   <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                             </>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            <DialogDescription className="sr-only">
              Preencha os detalhes do serviço para gerir o catálogo do seu salão.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleServiceSubmit} className="space-y-4 pt-4">
             <div className="space-y-1">
                <Label htmlFor="service-name">Nome</Label>
                <Input id="service-name" value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} required />
             </div>
             <div className="space-y-1">
                <Label htmlFor="service-desc">Descrição</Label>
                <Textarea id="service-desc" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <Label htmlFor="service-duration">Duração (minutos)</Label>
                   <Input 
                      id="service-duration"
                      type="number" 
                      value={isNaN(serviceForm.duration_minutes) ? "" : serviceForm.duration_minutes} 
                      onChange={e => setServiceForm({...serviceForm, duration_minutes: parseInt(e.target.value) || 0})} 
                   />
                </div>
                <div className="space-y-1">
                   <Label htmlFor="service-price">Preço (EUR)</Label>
                   <Input 
                      id="service-price"
                      type="number" 
                      step={0.5} 
                      value={isNaN(serviceForm.price) ? "" : serviceForm.price} 
                      onChange={e => setServiceForm({...serviceForm, price: parseFloat(e.target.value) || 0})} 
                   />
                </div>
             </div>
             <div className="space-y-1">
                <Label htmlFor="service-category">Categoria</Label>
                <Select value={serviceForm.category} onValueChange={v => setServiceForm({...serviceForm, category: v})}>
                   <SelectTrigger id="service-category"><SelectValue /></SelectTrigger>
                   <SelectContent>{serviceCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
             </div>
             <Button type="submit" className="w-full h-12 rounded-xl mt-4">{editingService ? "Guardar" : "Criar Serviço"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
