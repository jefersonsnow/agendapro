// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { 
  getServices, upsertService, deleteService, getStaff, getSalon, updateSalonCategories
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
import { Plus, Pencil, Trash2, Clock, Scissors, Tags, Lock, Users, Euro } from "lucide-react"

interface StaffAssignment {
  staffId: string
  name: string
  color: string
  commission: number | null
}

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  category: string
  is_active: boolean
  is_plan_blocked?: boolean
  staffAssignments: StaffAssignment[]
}

interface StaffMember {
  id: string
  name: string
  color: string
  role: string
  is_active: boolean
}

const serviceCategories = [
  "Cabelo", "Barba", "Unhas", "Estética", "Massagem", "Maquilhagem", "Depilação", "Outro",
]

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [allStaff, setAllStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [planCheck, setPlanCheck] = useState({ allowed: true, limit: -1, current: 0, plan: "minimo" })
  
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)

  const [categories, setCategories] = useState<string[]>(serviceCategories)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [savingCategories, setSavingCategories] = useState(false)

  const [serviceForm, setServiceForm] = useState({
    name: "", description: "", duration_minutes: 30, price: 0, category: "Cabelo", is_active: true,
  })
  // staffAssignments: map of staffId → commission value (null = not assigned)
  const [staffAssignments, setStaffAssignments] = useState<Record<string, { assigned: boolean; commission: string }>>({})

  useEffect(() => { 
    fetchData() 
    
    const handleRefresh = () => fetchData()
    window.addEventListener("next-refresh", handleRefresh)
    return () => window.removeEventListener("next-refresh", handleRefresh)
  }, [])

  async function fetchData() {
    setLoading(true)
    const [svs, staff, limit, salon] = await Promise.all([
      getServices(),
      getStaff(),
      checkServiceLimit(),
      getSalon()
    ])
    setServices((svs || []) as Service[])
    setAllStaff((staff || []).filter((s: any) => s.is_active && s.role !== "receptionist") as StaffMember[])
    setPlanCheck(limit)
    if (salon?.settings?.categories && Array.isArray(salon.settings.categories)) {
      setCategories(salon.settings.categories)
    }
    setLoading(false)
  }

  function buildAssignmentsState(existing: StaffAssignment[]): Record<string, { assigned: boolean; commission: string }> {
    const state: Record<string, { assigned: boolean; commission: string }> = {}
    allStaff.forEach(s => {
      const found = existing.find(a => a.staffId === s.id)
      state[s.id] = found
        ? { assigned: true, commission: found.commission !== null ? String(found.commission) : "" }
        : { assigned: false, commission: "" }
    })
    return state
  }

  function openCreateService() {
    setEditingService(null)
    const defaultCat = categories.length > 0 ? categories[0] : "Cabelo"
    setServiceForm({ name: "", description: "", duration_minutes: 30, price: 0, category: defaultCat, is_active: true })
    setStaffAssignments(buildAssignmentsState([]))
    setIsServiceDialogOpen(true)
  }
  
  function openEditService(svc: Service) {
    setEditingService(svc)
    const defaultCat = categories.length > 0 ? categories[0] : "Cabelo"
    setServiceForm({ ...svc, description: svc.description || "", category: svc.category || defaultCat })
    setStaffAssignments(buildAssignmentsState(svc.staffAssignments || []))
    setIsServiceDialogOpen(true)
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    if (categories.includes(trimmed)) {
      alert("Esta categoria já existe.")
      return
    }
    const updated = [...categories, trimmed]
    setSavingCategories(true)
    try {
      await updateSalonCategories(updated)
      setCategories(updated)
      setNewCategoryName("")
      fetchData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSavingCategories(false)
    }
  }

  async function handleDeleteCategory(catToDelete: string) {
    if (categories.length <= 1) {
      alert("O salão deve ter pelo menos uma categoria.")
      return
    }
    const fallbackCategory = categories.find(c => c !== catToDelete) || "Outro"
    const msg = `Tem a certeza que deseja eliminar a categoria "${catToDelete}"? Todos os serviços associados a esta categoria serão reatribuídos para "${fallbackCategory}".`
    if (!confirm(msg)) return

    const updated = categories.filter(c => c !== catToDelete)
    setSavingCategories(true)
    try {
      await updateSalonCategories(updated)
      setCategories(updated)
      fetchData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSavingCategories(false)
    }
  }
  
  async function handleServiceSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const assignments = allStaff
        .filter(s => staffAssignments[s.id]?.assigned)
        .map(s => ({
          staffId: s.id,
          commission: staffAssignments[s.id]?.commission !== "" ? staffAssignments[s.id]?.commission : null
        }))

      await upsertService(editingService?.id || null, {
        ...serviceForm,
        staffAssignments: assignments
      })
      setIsServiceDialogOpen(false)
      fetchData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const groupedServices = services.reduce((acc, s) => {
    const cat = s.category || "Geral"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
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
            <p className="text-muted-foreground text-sm font-medium">Gerencie os serviços e a equipa que os realiza</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)} className="rounded-xl border-2">
              <Tags className="h-4 w-4 mr-2" /> Gerir Categorias
            </Button>
            <Button onClick={openCreateService} className="rounded-xl shadow-lg shadow-primary/20" disabled={!planCheck.allowed && !editingService}>
              <Plus className="h-4 w-4 mr-2" /> Novo Serviço
            </Button>
          </div>
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
                       "p-6 transition-colors relative overflow-hidden",
                       s.is_plan_blocked ? "bg-amber-500/[0.03] opacity-60" : "hover:bg-muted/10 cursor-default"
                    )}>
                       {s.is_plan_blocked && (
                          <div className="absolute right-4 top-4 flex items-center gap-2 pointer-events-none">
                             <Lock className="h-4 w-4 text-amber-600 animate-bounce" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">Plano Excedido</span>
                          </div>
                       )}
                       <div className="flex items-start justify-between gap-4">
                         <div className="space-y-1 flex-1">
                            <h4 className={cn("font-bold text-lg flex items-center gap-2 tracking-tight", s.is_plan_blocked && "text-amber-800")}>
                               {s.name} 
                               {s.is_plan_blocked && <Lock className="h-4 w-4 opacity-40" />}
                            </h4>
                            {s.description && <p className="text-sm text-muted-foreground line-clamp-1 italic">{s.description}</p>}
                            <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest pt-1">
                               <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration_minutes} MIN</span>
                               <span className="flex items-center gap-1"><Tags className="h-3 w-3" /> {(Number(s.price) || 0).toFixed(2)} €</span>
                            </div>
                            {/* Equipa atribuída */}
                            {s.staffAssignments && s.staffAssignments.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 pt-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1">
                                  <Users className="h-3 w-3" /> Equipa:
                                </span>
                                {s.staffAssignments.map(a => (
                                  <span key={a.staffId} className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-muted px-2 py-0.5 rounded-full border">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
                                    {a.name}
                                    {a.commission !== null && (
                                      <span className="text-primary font-black">€{Number(a.commission).toFixed(0)}</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                         </div>
                         <div className="flex items-center gap-3 relative z-10 shrink-0">
                            <Switch 
                               checked={s.is_active && !s.is_plan_blocked} 
                               disabled={s.is_plan_blocked}
                               onCheckedChange={async () => { await upsertService(s.id, {...s, staffAssignments: s.staffAssignments.map(a => ({staffId: a.staffId, commission: a.commission}))}); fetchData() }} 
                            />
                            {!s.is_plan_blocked && (
                               <>
                                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => openEditService(s)} aria-label={`Editar serviço ${s.name}`}>
                                     <Pencil className="h-4 w-4" />
                                  </Button>

                                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => { if(confirm("Deseja eliminar este serviço?")) { deleteService(s.id).then(fetchData) } }} aria-label={`Eliminar serviço ${s.name}`}>
                                     <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>

                               </>
                            )}
                         </div>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Criar/Editar Serviço */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            <DialogDescription className="sr-only">
              Preencha os detalhes do serviço e defina a equipa que o realiza com os respetivos valores de comissão.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleServiceSubmit} className="space-y-5 pt-2">
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
                   <Label htmlFor="service-duration">Duração (min)</Label>
                   <Input 
                      id="service-duration"
                      type="number" 
                      value={isNaN(serviceForm.duration_minutes) ? "" : serviceForm.duration_minutes} 
                      onChange={e => setServiceForm({...serviceForm, duration_minutes: parseInt(e.target.value) || 0})} 
                   />
                </div>
                <div className="space-y-1">
                   <Label htmlFor="service-price">Preço (€)</Label>
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
                   <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
             </div>

             {/* Secção de Equipa */}
             <div className="space-y-3 pt-2 border-t">
               <div className="flex items-center gap-2">
                 <Users className="h-4 w-4 text-primary" />
                 <Label className="font-bold text-sm">Equipa que realiza este serviço</Label>
               </div>
               <p className="text-xs text-muted-foreground">Selecione quem pode realizar este serviço e defina o valor de comissão fixo por cada atendimento.</p>
               
               {allStaff.length === 0 && (
                 <p className="text-xs text-muted-foreground italic py-2">Nenhum profissional ativo encontrado. Adicione profissionais na secção Equipa.</p>
               )}

               <div className="space-y-2">
                 {allStaff.map(member => {
                   const state = staffAssignments[member.id] || { assigned: false, commission: "" }
                   return (
                     <div key={member.id} className={cn(
                       "flex items-center gap-3 p-3 rounded-xl border transition-all",
                       state.assigned ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20"
                     )}>
                       <input
                         type="checkbox"
                         id={`staff-${member.id}`}
                         checked={state.assigned}
                         onChange={e => setStaffAssignments(prev => ({
                           ...prev,
                           [member.id]: { ...state, assigned: e.target.checked }
                         }))}
                         className="h-4 w-4 rounded accent-primary cursor-pointer"
                       />
                       <label htmlFor={`staff-${member.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
                         <span className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: member.color }}>
                           {member.name.charAt(0)}
                         </span>
                         <span className="font-semibold text-sm">{member.name}</span>
                       </label>
                       {state.assigned && (
                         <div className="flex items-center gap-1.5">
                           <Euro className="h-3.5 w-3.5 text-muted-foreground" />
                           <div className="flex flex-col gap-1">
                              <Label htmlFor={`commission-${member.id}`} className="sr-only">Comissão para {member.name}</Label>
                              <Input
                                id={`commission-${member.id}`}
                                type="number"
                                step="0.5"
                                min="0"
                                placeholder="Comissão"
                                value={state.commission}
                                onChange={e => setStaffAssignments(prev => ({
                                  ...prev,
                                  [member.id]: { ...state, commission: e.target.value }
                                }))}
                                className="w-28 h-11 text-sm text-right font-bold"
                              />
                           </div>
                         </div>
                       )}
                     </div>
                   )
                 })}
               </div>
             </div>

             <Button type="submit" className="w-full h-12 rounded-xl mt-2" disabled={saving}>
               {saving ? "A guardar..." : (editingService ? "Guardar Alterações" : "Criar Serviço")}
             </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Gestão de Categorias */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerir Categorias</DialogTitle>
            <DialogDescription>
              Adicione novas categorias ou remova as existentes. Serviços em categorias eliminadas serão reatribuídos automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <Input
                placeholder="Nome da nova categoria"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                required
                className="rounded-xl h-11"
              />
              <Button type="submit" disabled={savingCategories} className="rounded-xl h-11 px-4">
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </form>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {categories.map(c => (
                <div key={c} className="flex items-center justify-between p-3 bg-muted/20 border rounded-xl">
                  <span className="font-semibold text-sm">{c}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(c)}
                    disabled={savingCategories}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
