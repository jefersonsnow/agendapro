// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { getStaff, upsertStaff, deleteStaff, getUserRole } from "@/lib/actions/dashboard"
import { checkStaffLimit } from "@/lib/actions/plan-guard"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Plus, Pencil, Trash2, Mail, Phone, Users, Lock, AlertCircle } from "lucide-react"

interface Staff {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  bio: string | null
  is_active: boolean
  color: string
  working_hours: any
  avatar_url?: string | null
  user_id?: string | null
  is_plan_blocked?: boolean
}

const roles = [
  { value: "owner", label: "Proprietário" },
  { value: "manager", label: "Gerente" },
  { value: "professional", label: "Profissional" },
  { value: "receptionist", label: "Rececionista" },
]

const weekDays = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
]

const colors = [
  "#0D9488",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#CA8A04",
  "#16A34A",
  "#64748B",
]

export default function EquipaPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [salonId, setSalonId] = useState<string | null>(null)
  const [planCheck, setPlanCheck] = useState({ allowed: true, limit: -1, current: 0, plan: "free" })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "professional",
    bio: "",
    is_active: true,
    color: "#0D9488",
    has_custom_hours: false,
    working_hours: {} as Record<string, { open: string; close: string; enabled: boolean; hasBreak?: boolean; breakStart?: string; breakEnd?: string }>,
    password: "",
    user_id: null as string | null
  })

  // const supabase = createClient() // Removido

  const [user, setUser] = useState({ role: "professional", name: "" })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const staffData = await getStaff()
    setStaff(staffData || [])
    setSalonId("local-id")
    setLoading(false)

    const userData = await getUserRole()
    setUser(userData)

    const limit = await checkStaffLimit()
    setPlanCheck(limit)
  }

  function openCreateDialog() {
    setEditingStaff(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "professional",
      bio: "",
      is_active: true,
      color: "#0D9488",
      has_custom_hours: false,
      working_hours: {},
      password: "",
      user_id: null
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(member: Staff) {
    setEditingStaff(member)
    setFormData({
      name: member.name,
      email: member.email || "",
      phone: member.phone || "",
      role: member.role,
      bio: member.bio || "",
      is_active: member.is_active,
      color: member.color,
      has_custom_hours: !!member.working_hours,
      working_hours: member.working_hours || {},
      password: "",
      user_id: member.user_id || null
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    await upsertStaff(editingStaff?.id || null, {
      ...formData,
      working_hours: formData.has_custom_hours ? formData.working_hours : null
    })

    setIsDialogOpen(false)
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem a certeza que deseja remover este membro da equipa?"))
      return
    await deleteStaff(id)
    fetchData()
  }

  async function toggleActive(member: Staff) {
    await upsertStaff(member.id, {
      ...member,
      is_active: !member.is_active
    })
    fetchData()
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  function getRoleLabel(role: string) {
    return roles.find((r) => r.value === role)?.label || role
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PlanLimitBanner
        plan={planCheck.plan}
        feature="staff"
        current={planCheck.current}
        limit={planCheck.limit}
        resourceName="profissionais"
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipa</h1>
          <p className="text-muted-foreground">
            Gerencie os profissionais do seu salão
          </p>
        </div>
        {(user.role === "owner" || user.role === "manager") && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} disabled={!planCheck.allowed && !editingStaff}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStaff ? "Editar Membro" : "Novo Membro"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Preencha os dados do profissional para gerir a sua equipa e permissões.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+351 912 345 678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Breve descrição do profissional"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cor no Calendário</span>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full border-2 transition-transform ${
                          formData.color === color
                            ? "border-foreground scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Membro Ativo</Label>
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-password">Palavra-passe para Login de Equipa</Label>
                    <Input
                      id="staff-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingStaff?.user_id ? "Preencha APENAS para trocar senha" : "Definir senha de acesso"}
                    />
                    <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter">
                      Ao definir uma senha e email, este colaborador poderá fazer login no sistema e verá exclusivamente a sua própria agenda.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="custom-hours">Horário Personalizado</Label>
                    <p className="text-[12px] text-muted-foreground">Se desligado, usará o horário matriz do Salão.</p>
                  </div>
                  <Switch
                    id="custom-hours"
                    checked={formData.has_custom_hours}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, has_custom_hours: checked })
                    }
                  />
                </div>

                {formData.has_custom_hours && (
                  <div className="space-y-4 border rounded-xl p-4 bg-muted/20">
                    {weekDays.map((day) => {
                      const schedule = formData.working_hours[day.key] || {
                        enabled: false,
                        open: "09:00",
                        close: "19:00",
                        hasBreak: false,
                        breakStart: "13:00",
                        breakEnd: "14:00",
                      }

                      const updateSchedule = (updates: any) => {
                        setFormData(prev => ({
                          ...prev,
                          working_hours: {
                            ...prev.working_hours,
                            [day.key]: { ...schedule, ...updates }
                          }
                        }))
                      }

                      return (
                        <div key={day.key} className="flex flex-col gap-2 py-3 border-b last:border-0 border-dashed border-primary/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Switch
                                id={`schedule-${day.key}`}
                                checked={schedule.enabled}
                                onCheckedChange={(c) => updateSchedule({ enabled: c })}
                              />
                              <Label htmlFor={`schedule-${day.key}`} className="font-semibold min-w-20">{day.label}</Label>
                            </div>
                            {schedule.enabled && (
                              <div className="flex items-center gap-2">
                                <Input type="time" value={schedule.open} onChange={(e) => updateSchedule({ open: e.target.value })} className="w-[85px] h-8 text-xs" />
                                <span className="text-muted-foreground">-</span>
                                <Input type="time" value={schedule.close} onChange={(e) => updateSchedule({ close: e.target.value })} className="w-[85px] h-8 text-xs" />
                              </div>
                            )}
                          </div>
                          {schedule.enabled && (
                              <div className="pl-14 flex items-center justify-between opacity-80 mt-1">
                                <div className="flex items-center gap-2 text-xs">
                                    <Switch checked={schedule.hasBreak} onCheckedChange={(c) => updateSchedule({ hasBreak: c })} className="scale-75 origin-left" />
                                    <span className="text-muted-foreground">Pausa Almoço</span>
                                </div>
                                {schedule.hasBreak && (
                                    <div className="flex items-center gap-1">
                                      <Input type="time" value={schedule.breakStart} onChange={(e) => updateSchedule({ breakStart: e.target.value })} className="w-[75px] h-7 text-[11px]" />
                                      <span className="text-muted-foreground text-xs">-</span>
                                      <Input type="time" value={schedule.breakEnd} onChange={(e) => updateSchedule({ breakEnd: e.target.value })} className="w-[75px] h-7 text-[11px]" />
                                    </div>
                                )}
                              </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingStaff ? "Guardar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Nenhum membro na equipa</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece adicionando os profissionais do seu salão
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Membro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card
              key={member.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                !member.is_active || member.is_plan_blocked 
                  ? "opacity-60 saturate-50" 
                  : "hover:shadow-lg hover:border-primary/20",
                member.is_plan_blocked && "border-amber-500/30 bg-amber-500/[0.02]"
              )}
            >
              {member.is_plan_blocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] text-center p-4 animate-in fade-in duration-500">
                  <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-2 border border-amber-500/30">
                    <Lock className="h-5 w-5 text-amber-600 animate-bounce" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Plano Excedido</p>
                  <p className="text-[9px] text-muted-foreground mt-1 max-w-[150px] font-medium">Faça upgrade para reativar este membro da equipa.</p>
                  <Link href="/dashboard/configuracoes/planos" className="mt-3">
                    <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest rounded-lg border-amber-200 hover:bg-amber-500 hover:text-white shadow-xl shadow-amber-500/10">Upgrade <Plus className="ml-1 h-3 w-3" /></Button>
                  </Link>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      {member.avatar_url && (
                        <AvatarImage src={member.avatar_url} alt={member.name} className="object-cover" />
                      )}
                      <AvatarFallback
                        style={{ backgroundColor: member.color }}
                        className="text-white font-black text-xs"
                      >
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight">{member.name}</h3>
                      <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
                        {getRoleLabel(member.role)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(user.role === "owner" || user.role === "manager") && !member.is_plan_blocked && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                          onClick={() => openEditDialog(member)}
                          aria-label={`Editar membro ${member.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={() => handleDelete(member.id)}
                          aria-label={`Eliminar membro ${member.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                      </>
                    )}
                  </div>
                </div>

                {member.bio && (
                  <p className="text-[12px] text-muted-foreground mb-4 line-clamp-2 leading-relaxed italic opacity-80">
                    "{member.bio}"
                  </p>
                )}

                <div className="space-y-2 text-xs">
                  {member.email && (
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Mail className="h-3 w-3 opacity-50" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <Phone className="h-3 w-3 opacity-50" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted/50">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    member.is_plan_blocked ? "text-amber-600" : member.is_active ? "text-green-600" : "text-slate-400"
                  )}>
                    {member.is_plan_blocked ? "Bloqueado" : member.is_active ? "Ativo" : "Inativo"}
                  </span>
                  <Switch
                    checked={member.is_active && !member.is_plan_blocked}
                    disabled={user.role === "receptionist" || member.is_plan_blocked}
                    onCheckedChange={() => !member.is_plan_blocked && toggleActive(member)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
