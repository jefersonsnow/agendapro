"use client"

import { useState, useEffect } from "react"
import { getAllSalons, deleteSalon, updateSalonSaaS, impersonateUser } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Plus, Trash2, ExternalLink, Users, Calendar, ShieldCheck, Zap, MoreHorizontal, UserCheck, Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { differenceInDays, isAfter } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminSalonsPage() {
  const [salons, setSalons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function handleImpersonate(userId: string) {
     if (!userId) {
        toast.error("Erro: Este salão não tem um proprietário associado.")
        return
     }
     window.alert("Botão clicado! A tentar entrar como: " + userId)
     console.log("Tentando entrar como utilizador:", userId)
     const t = toast.loading("A entrar como utilizador...")
     try {
        await impersonateUser(userId)
     } catch (err: any) {
        console.error("Erro ao clicar no botão Impersonate:", err)
        toast.dismiss(t)
        toast.error("Erro ao entrar como utilizador: " + err.message)
     }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const data = await getAllSalons()
      setSalons(data)
    } catch (error) {
      console.error("Erro ao carregar salões:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(id: string, data: any) {
     try {
        await updateSalonSaaS(id, data)
        toast.success("Dados do salão atualizados com sucesso!")
        fetchData()
     } catch (err: any) {
        toast.error("Erro ao atualizar salão: " + err.message)
     }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem a certeza que deseja eliminar este salão? Esta ação é irreversível.")) return
    await deleteSalon(id)
    toast.success("Salão removido com sucesso")
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Infraestrutura <span className="text-primary italic">Ativos</span></h1>
          <p className="text-muted-foreground font-medium">
            Gestão operacional e administrativa de todos os parceiros.
          </p>
        </div>
        <Link href="/admin/salons/new">
          <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo Parceiro
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl bg-background/40 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-none">
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Salão</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Plan & Revenue</TableHead>
                <TableHead className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trial</TableHead>
                <TableHead className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estado</TableHead>
                <TableHead className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stats</TableHead>
                <TableHead className="px-8 py-5 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic">
                    Nenhum parceiro registado no sistema.
                  </TableCell>
                </TableRow>
              ) : (
                salons.map((salon) => (
                  <TableRow 
                    key={salon.id} 
                    className="hover:bg-muted/5 transition-colors border-muted/10 group cursor-pointer"
                    onClick={() => window.location.href = `/admin/salons/${salon.id}`}
                  >
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shadow-inner group-hover:scale-110 transition-transform">
                            {salon.name?.[0]?.toUpperCase()}
                         </div>
                         <div>
                            <div className="font-bold text-base leading-tight">{salon.name}</div>
                            <div className="text-[11px] text-muted-foreground font-medium opacity-70">Dono: {salon.owner.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5 tracking-tighter italic">/{salon.slug}</div>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                       <div className="space-y-1.5">
                          <Badge className={`rounded-lg py-0 px-2 text-[9px] uppercase font-black tracking-widest shadow-sm ${
                             salon.plan === 'premium' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                             salon.plan === 'basic' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                             'bg-muted text-muted-foreground'
                          }`}>
                             {salon.plan}
                          </Badge>
                          <p className="text-sm font-black tracking-tighter">
                             {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(salon.total_revenue || 0)}
                          </p>
                       </div>
                    </TableCell>
                    
                    <TableCell className="px-6 py-6">
                       {salon.plan !== 'free' ? (
                          <div className="flex items-center gap-2 opacity-30 select-none">
                             <ShieldCheck className="h-4 w-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Plano Pago</span>
                          </div>
                       ) : salon.trial_ends_at ? (() => {
                          const endDate = new Date(salon.trial_ends_at)
                          const today = new Date()
                          const expired = isAfter(today, endDate)
                          const daysLeft = differenceInDays(endDate, today)
                          
                          return (
                             <div className="space-y-1">
                                <div className={cn(
                                   "flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tighter",
                                   expired ? "text-destructive" : daysLeft <= 7 ? "text-amber-600" : "text-green-600"
                                )}>
                                   {expired ? <AlertTriangle className="h-3 w-3 animate-pulse" /> : <Clock className="h-3 w-3" />}
                                   {expired ? "EXPIRADO" : `${daysLeft} dias restam`}
                                </div>
                                <div className="text-[9px] text-muted-foreground font-mono opacity-60">
                                   Fim: {new Date(salon.trial_ends_at).toLocaleDateString()}
                                </div>
                             </div>
                          )
                       })() : (
                          <span className="text-[10px] text-muted-foreground italic">Sem trial activo</span>
                       )}
                    </TableCell>
                    <td className="px-6 py-6">
                       <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <Button variant="outline" className={cn(
                                 "h-8 rounded-full px-4 gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all",
                                 salon.status === 'active' ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : 
                                 salon.status === 'trial' ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" :
                                 "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                              )}>
                                 <div className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    salon.status === 'active' ? "bg-green-500 animate-pulse" :
                                    salon.status === 'trial' ? "bg-blue-500 animate-pulse" :
                                    "bg-destructive"
                                 )} />
                                 {salon.status}
                              </Button>
                           </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="rounded-2xl shadow-2xl border-muted/20">
                             <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-tighter opacity-50">Alterar Estado</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem onClick={() => handleUpdate(salon.id, { status: "active" })} className="font-bold text-green-700 focus:bg-green-50">Marcar como Ativo</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleUpdate(salon.id, { status: "suspended" })} className="font-bold text-destructive focus:bg-destructive/5">Suspender Acesso</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleUpdate(salon.id, { status: "trial" })} className="font-bold opacity-70">Período de Experiência</DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-tighter opacity-50">Mudar Plano</DropdownMenuLabel>
                             <DropdownMenuItem onClick={() => handleUpdate(salon.id, { plan: "premium" })} className="font-bold flex items-center gap-2"><Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Premium</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleUpdate(salon.id, { plan: "basic" })} className="font-bold flex items-center gap-2"><Users className="h-3 w-3 text-blue-500" /> Basic</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleUpdate(salon.id, { plan: "free" })} className="font-bold opacity-70 text-[10px]">Plano Gratuito</DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex gap-4">
                          <div className="text-center group-hover:scale-105 transition-transform">
                             <p className="text-[10px] font-black tracking-tighter text-muted-foreground uppercase opacity-80 mb-0.5">Visitas</p>
                             <p className="text-sm font-black">{salon._count.appointments}</p>
                          </div>
                          <div className="h-8 w-px bg-muted/20" />
                          <div className="text-center group-hover:scale-105 transition-transform">
                             <p className="text-[10px] font-black tracking-tighter text-muted-foreground uppercase opacity-80 mb-0.5">Clientes</p>
                             <p className="text-sm font-black tracking-tighter text-primary">{salon._count.clients}</p>
                          </div>
                       </div>
                    </td>
                    <TableCell className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-3 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <Link href={`/reservar/${salon.slug}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                             <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl shadow-md border-muted/50 hover:bg-primary/5 hover:text-primary">
                                <ExternalLink className="h-4 w-4" />
                             </Button>
                          </Link>
                          
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl shadow-md border-blue-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200" 
                            title="Entrar como Proprietário"
                            onClick={(e) => {
                               e.stopPropagation();
                               handleImpersonate(salon.owner?.id || (salon as any).owner_id);
                            }}
                          >
                             <UserCheck className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl shadow-md border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700" 
                            onClick={(e) => {
                               e.stopPropagation();
                               handleDelete(salon.id);
                            }}
                          >
                             <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
