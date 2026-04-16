"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSalonFullDetails, manageStaff, deleteStaff, manageSalonUser, updateSalonSaaS, updateSalonContact, updateSalonSlug } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Building2, Users, Calendar, ShieldCheck, Zap, 
  Clock, Mail, Phone, MapPin, ChevronLeft, Plus, 
  Trash2, Edit2, Key, UserCheck, AlertTriangle, TrendingUp,
  Link2, Copy, ExternalLink, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format, differenceInDays } from "date-fns"
import { pt } from "date-fns/locale"
import { toast } from "sonner"
import Link from "next/link"

export default function SalonDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [salon, setSalon] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    nif: "",
    slug: ""
  })

  useEffect(() => {
    fetchSalon()
  }, [id])

  async function fetchSalon() {
    setLoading(true)
    try {
      const data = await getSalonFullDetails(id as string)
      setSalon(data)
      setEditFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        nif: data.nif || "",
        slug: data.slug || ""
      })
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar detalhes")
      router.push("/admin/salons")
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(userId: string) {
    const newPassword = prompt("Introduza a nova palavra-passe:")
    if (!newPassword || newPassword.length < 6) {
      if (newPassword) toast.error("A palavra-passe deve ter pelo menos 6 caracteres.")
      return
    }

    try {
      await manageSalonUser(salon.id, userId, { password: newPassword })
      toast.success("Palavra-passe atualizada com sucesso!")
    } catch (error: any) {
      toast.error("Erro ao atualizar password: " + error.message)
    }
  }

  async function handleDeleteMember(staffId: string) {
    if (!confirm("Tem a certeza que deseja remover este membro da equipa?")) return
    try {
      await deleteStaff(salon.id, staffId)
      toast.success("Membro removido!")
      fetchSalon()
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message)
    }
  }

  async function handleUpdateContact(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateSalonContact(salon.id, editFormData)
      
      // Se o slug mudou, atualizar separadamente
      if (editFormData.slug !== salon.slug) {
        await updateSalonSlug(salon.id, editFormData.slug)
      }

      toast.success("Informações atualizadas com sucesso!")
      setIsEditDialogOpen(false)
      fetchSalon()
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!salon) return null

  const tenureDays = differenceInDays(new Date(), new Date(salon.created_at))

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-black uppercase tracking-tighter italic">{salon.name}</h1>
             <Badge className={cn(
                "rounded-lg py-0 px-2 text-[10px] uppercase font-black tracking-widest",
                salon.status === 'active' ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"
             )}>
                {salon.status}
             </Badge>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Link href={`/${salon.slug}`} target="_blank" className="hover:text-primary transition-colors italic">
              /{salon.slug}
            </Link>
            • Cliente há {tenureDays} dias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Faturado" value={`${salon.total_revenue.toFixed(2)}€`} icon={<TrendingUp className="text-green-500" />} />
        <StatCard title="Agendamentos" value={salon._count.appointments} icon={<Calendar className="text-blue-500" />} />
        <StatCard title="Base Clientes" value={salon._count.clients} icon={<Users className="text-primary" />} />
        <StatCard title="Serviços" value={salon._count.services} icon={<ShieldCheck className="text-amber-500" />} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-2xl h-14 w-full md:w-auto overflow-x-auto">
          <TabsTrigger value="overview" className="rounded-xl px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">Resumo</TabsTrigger>
          <TabsTrigger value="team" className="rounded-xl px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">Equipa ({salon.staff.length})</TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">Contas Acesso ({salon.relatedUsers.length})</TabsTrigger>
          <TabsTrigger value="subscription" className="rounded-xl px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">Assinatura</TabsTrigger>
          <TabsTrigger value="links" className="rounded-xl px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl rounded-3xl bg-background/50 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Informações de Contacto</CardTitle>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 hover:bg-primary/10 hover:text-primary">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">Editar Contactos</DialogTitle>
                      <DialogDescription>
                        Atualize os dados oficiais do salão e do proprietário.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateContact} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-widest opacity-50">Nome do Salão</Label>
                        <Input id="edit-name" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="rounded-xl" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-email" className="text-[10px] font-black uppercase tracking-widest opacity-50">E-mail</Label>
                          <Input id="edit-email" type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone" className="text-[10px] font-black uppercase tracking-widest opacity-50">Telemóvel</Label>
                          <Input id="edit-phone" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} className="rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-address" className="text-[10px] font-black uppercase tracking-widest opacity-50">Morada Completa</Label>
                        <Input id="edit-address" value={editFormData.address} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} className="rounded-xl" placeholder="Rua, Número, Código Postal, Cidade" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-nif" className="text-[10px] font-black uppercase tracking-widest opacity-50">NIF / Contribuinte</Label>
                        <Input id="edit-nif" value={editFormData.nif} onChange={(e) => setEditFormData({...editFormData, nif: e.target.value})} className="rounded-xl font-mono" />
                      </div>
                      <div className="space-y-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <Label htmlFor="edit-slug" className="text-[10px] font-black uppercase tracking-widest text-primary">Link Customizado (Slug)</Label>
                        <div className="flex items-center gap-1 group">
                          <span className="text-sm opacity-40 font-mono">/</span>
                          <Input 
                            id="edit-slug" 
                            value={editFormData.slug} 
                            onChange={(e) => setEditFormData({...editFormData, slug: e.target.value})} 
                            className="rounded-xl bg-transparent border-none p-0 focus-visible:ring-0 font-bold italic h-6" 
                            placeholder="ex: barbearia-neves"
                          />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1 italic">Apenas letras, números e hífen. Evite espaços.</p>
                      </div>
                      <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full rounded-xl font-black uppercase tracking-widest text-xs h-12">Guardar Alterações</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow icon={<Mail />} label="E-mail" value={salon.email || "Não definido"} />
                <InfoRow icon={<Phone />} label="Telemóvel" value={salon.phone || "Não definido"} />
                <InfoRow icon={<MapPin />} label="Morada" value={salon.address || "Não definida"} />
                <InfoRow icon={<Building2 />} label="NIF" value={salon.nif || "Não definido"} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-3xl bg-background/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Proprietário Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-muted/20">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                      {salon.owner.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-lg">{salon.owner.name}</h3>
                      <p className="text-sm text-muted-foreground">{salon.owner.email}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] uppercase font-bold tracking-widest">{salon.owner.role}</Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" className="w-full rounded-xl gap-2 font-bold" onClick={() => handleResetPassword(salon.owner.id)}>
                      <Key className="h-4 w-4" /> Alterar Senha
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-8">
           <Card className="border-none shadow-xl rounded-3xl bg-background/50 backdrop-blur-xl overflow-hidden">
              <div className="p-6 flex justify-between items-center border-b border-muted/10">
                 <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Profissionais do Salão</CardTitle>
                 <Button className="rounded-xl font-bold gap-2" size="sm">
                    <Plus className="h-4 w-4" /> Adicionar Profissional
                 </Button>
              </div>
              <CardContent className="p-0">
                 <table className="w-full">
                    <thead className="bg-muted/30">
                       <tr>
                          <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-50">Nome</th>
                          <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-50">Role</th>
                          <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-50">Contacto</th>
                          <th className="text-right py-4 px-8 text-[10px] font-black uppercase tracking-widest opacity-50">Ações</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/10">
                       {salon.staff.map((member: any) => (
                          <tr key={member.id} className="hover:bg-muted/5 transition-colors group">
                             <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-xl bg-muted/20 flex items-center justify-center font-bold text-sm">
                                      {member.name[0]}
                                   </div>
                                   <div className="font-bold">{member.name}</div>
                                </div>
                             </td>
                             <td className="py-4 px-6 italic text-sm text-muted-foreground">{member.role}</td>
                             <td className="py-4 px-6 text-sm">
                                <div>{member.email}</div>
                                <div>{member.phone}</div>
                             </td>
                             <td className="py-4 px-8 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                      <Edit2 className="h-3.5 w-3.5" />
                                   </Button>
                                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => handleDeleteMember(member.id)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                   </Button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-8">
           <Card className="border-none shadow-xl rounded-3xl bg-background/50 backdrop-blur-xl overflow-hidden">
              <div className="p-6 flex justify-between items-center border-b border-muted/10">
                 <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Utilizadores com Acesso ao Painel</CardTitle>
                 <Button className="rounded-xl font-bold gap-2" size="sm">
                    <Plus className="h-4 w-4" /> Nova Conta Acesso
                 </Button>
              </div>
              <CardContent className="p-0">
                 <table className="w-full">
                    <thead className="bg-muted/30">
                       <tr>
                          <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-50">Utilizador</th>
                          <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-50">Papel (Role)</th>
                          <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest opacity-50">Data Registo</th>
                          <th className="text-right py-4 px-8 text-[10px] font-black uppercase tracking-widest opacity-50">Ações</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/10">
                       {salon.relatedUsers.map((user: any) => (
                          <tr key={user.id} className="hover:bg-muted/5 transition-colors group">
                             <td className="py-4 px-6 font-bold">
                                <div>{user.name}</div>
                                <div className="text-[11px] font-medium opacity-60 italic">{user.email}</div>
                             </td>
                             <td className="py-4 px-6 uppercase text-[10px] font-black tracking-widest italic opacity-70">{user.role}</td>
                             <td className="py-4 px-6 text-xs text-muted-foreground">{format(new Date(user.created_at), "dd MMM yyyy", { locale: pt })}</td>
                             <td className="py-4 px-8 text-right space-x-2">
                                <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold text-xs" onClick={() => handleResetPassword(user.id)}>
                                   <Key className="h-3 w-3" /> Senha
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs text-destructive hover:bg-destructive/10">
                                   Remover
                                </Button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-8">
           <Card className="border-none shadow-xl rounded-3xl bg-background/50 backdrop-blur-xl">
              <CardHeader>
                 <CardTitle className="text-lg font-black uppercase tracking-tighter italic">Plano e Faturação</CardTitle>
                 <CardDescription>Gerencie as condições comerciais deste parceiro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-4">
                       <Zap className="h-10 w-10 text-primary animate-pulse" />
                       <div>
                          <h3 className="text-xl font-black uppercase italic tracking-tighter">Plano {salon.plan}</h3>
                          <p className="text-sm text-muted-foreground">Status do serviço: <span className="text-primary font-bold uppercase">{salon.status}</span></p>
                       </div>
                    </div>
                    <Button className="rounded-xl font-black uppercase tracking-widest text-xs px-8">Upgrade / Downgrade</Button>
                 </div>

                 {salon.status === 'trial' && salon.trial_ends_at && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
                       <Clock className="h-5 w-5" />
                       <div className="text-sm">
                          O período de experiência termina em <strong>{format(new Date(salon.trial_ends_at), "dd/MM/yyyy")}</strong>.
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="links" className="mt-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LinkCard 
                title="Página de Reservas" 
                description="Link público para clientes agendarem serviços online."
                icon={<Globe className="text-blue-500" />}
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${salon.slug}`}
              />
              <LinkCard 
                title="Painel de Gestão (Login)" 
                description="Link exclusivo para o proprietário e equipa acederem ao sistema."
                icon={<Link2 className="text-primary" />}
                url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${salon.slug}/login`}
              />
           </div>

           <Card className="border-none shadow-xl rounded-3xl bg-primary/5 border border-primary/10">
              <CardContent className="p-6 flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                    <h3 className="font-bold">Dica para o Parceiro</h3>
                    <p className="text-sm text-muted-foreground">Estes links são exclusivos. O login personalizado ajuda a reforçar a marca do salão perante a equipa.</p>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LinkCard({ title, description, icon, url }: { title: string, description: string, icon: any, url: string }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    toast.success("Link copiado para a área de transferência!")
  }

  return (
    <Card className="border-none shadow-xl rounded-3xl bg-background/50 backdrop-blur-xl overflow-hidden group">
      <CardHeader>
        <div className="flex items-center gap-3 mb-1">
           <div className="h-10 w-10 rounded-2xl bg-muted/30 flex items-center justify-center">
              {icon}
           </div>
           <CardTitle className="text-lg font-black uppercase tracking-tighter italic">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/20 border border-muted/10 group-hover:border-primary/20 transition-all">
          <code className="flex-1 text-xs truncate font-mono opacity-70">{url}</code>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
           <Button className="flex-1 rounded-xl font-bold gap-2" variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" /> Copiar Link
           </Button>
           <Link href={url} target="_blank" className="flex-1">
              <Button className="w-full rounded-xl font-bold gap-2" variant="secondary">
                 <ExternalLink className="h-4 w-4" /> Abrir
              </Button>
           </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ title, value, icon }: { title: string, value: any, icon: any }) {
  return (
    <Card className="border-none shadow-lg rounded-3xl bg-background/60 backdrop-blur-sm group hover:scale-[1.02] transition-all">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="h-10 w-10 rounded-2xl bg-muted/30 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="mt-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{title}</p>
           <p className="text-2xl font-black tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="h-10 w-10 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {icon && (typeof icon === 'object' ? icon : null)}
        {typeof icon === 'function' ? icon({}) : null}
        {/** Workaround since Lucide icons are passed as elements */}
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{label}</p>
        <p className="font-bold text-sm tracking-tight">{value}</p>
      </div>
    </div>
  )
}
