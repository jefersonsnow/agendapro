// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { getClients, upsertClient, deleteClient, getClientProfile } from "@/lib/actions/dashboard"
import { checkClientLimit } from "@/lib/actions/plan-guard"
import PlanLimitBanner from "@/components/plan-limit-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Phone,
  Mail,
  Star,
  Calendar,
  Euro,
  Users,
  Eye,
  Clock,
  Scissors,
  MessageCircle,
  TrendingUp
} from "lucide-react"

// Chart imports
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts"

// Date format
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  nif: string | null
  notes: string | null
  loyalty_points: number
  total_spent: number
  visit_count: number
  created_at: string
  last_visit: string | null
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(50)
  const [loading, setLoading] = useState(true)
  const [planCheck, setPlanCheck] = useState({ allowed: true, limit: -1, current: 0, plan: "minimo" })
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  
  // Profile Sheet States
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    nif: "",
    notes: "",
    password: "",
    loyalty_points: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1) // Reset to page 1 on search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchData(currentPage)
    
    const handleRefresh = () => fetchData(currentPage)
    window.addEventListener("next-refresh", handleRefresh)
    return () => window.removeEventListener("next-refresh", handleRefresh)
  }, [currentPage])

  async function fetchData(page: number = currentPage) {
    setLoading(true)
    try {
      const data = await getClients(page, pageSize, searchQuery)
      
      // APENAS atualiza se recebermos dados válidos do servidor.
      // Isso evita que a lista de clientes fique vazia se a Server Action falhar.
      if (data && Array.isArray(data.clients)) {
        setClients(data.clients)
        setTotalCount(data.totalCount || 0)
      }
      
      const limit = await checkClientLimit()
      setPlanCheck(limit)
    } catch (error) {
      console.error("Error fetching clients:", error)
      // No caso de erro (ex: 500 do servidor), NÃO limpamos o estado.
      // O utilizador continua a ver os dados carregados anteriormente.
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingClient(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      nif: "",
      notes: "",
      password: "",
      loyalty_points: 0,
    })
    setIsDialogOpen(true)
  }

  function openEditDialog(client: Client) {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      nif: client.nif || "",
      notes: client.notes || "",
      password: "",
      loyalty_points: client.loyalty_points || 0,
    })
    setIsDialogOpen(true)
  }

  async function handleOpenProfile(id: string) {
    setIsProfileOpen(true)
    setProfileLoading(true)
    try {
      const data = await getClientProfile(id)
      setSelectedProfile(data)
    } catch (error) {
      console.error("Error fetching client profile:", error)
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await upsertClient(editingClient?.id || null, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        nif: formData.nif,
        notes: formData.notes,
        password: formData.password || undefined,
        loyalty_points: formData.loyalty_points,
      })
      setIsDialogOpen(false)
      fetchData()
      
      // If saving while profile is open, refresh profile
      if (isProfileOpen && editingClient?.id) {
          handleOpenProfile(editingClient.id)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem a certeza que deseja eliminar este cliente?")) return
    await deleteClient(id)
    fetchData()
  }

  function getInitials(name: string) {
    return name?.split(" ")?.map((n) => n[0])?.join("")?.toUpperCase()?.slice(0, 2) || "??"
  }

  // Stats
  const totalClients = clients.length
  const totalRevenue = clients.reduce((acc, c) => acc + Number(c.total_spent), 0)
  const avgVisits =
    clients.length > 0
      ? (
          clients.reduce((acc, c) => acc + c.visit_count, 0) / clients.length
        ).toFixed(1)
      : 0

  // Profile Charts Data
  const getChartData = () => {
    if (!selectedProfile?.appointments) return []
    // Group last 6 months spends
    const grouped: Record<string, number> = {}
    selectedProfile.appointments.forEach((app: any) => {
      const date = new Date(app.starts_at)
      const monthYear = format(date, "MMM yy", { locale: ptBR })
      if (!grouped[monthYear]) grouped[monthYear] = 0
      grouped[monthYear] += Number(app.price || 0)
    })
    return Object.entries(grouped).map(([name, total]) => ({ name, total })).reverse().slice(0, 6).reverse()
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
        feature="clients"
        current={planCheck.current}
        limit={planCheck.limit}
        resourceName="clientes"
      />
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os seus clientes e histórico de visitas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreateDialog} disabled={!planCheck.allowed && !editingClient}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Gerencie as informações detalhadas e o histórico de cada cliente do seu salão.
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
                  placeholder="Ex: Maria Silva"
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
                <Label htmlFor="address">Morada Completa (Opcional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Rua, Número, Código Postal, Cidade"
                />
              </div>

              <div className="space-y-2 text-primary">
                <Label htmlFor="loyalty_points" className="flex items-center gap-2">
                  <Star className="h-3 w-3 fill-primary" /> Pontos de Fidelidade
                </Label>
                <Input
                  id="loyalty_points"
                  type="number"
                  value={formData.loyalty_points}
                  onChange={(e) =>
                    setFormData({ ...formData, loyalty_points: parseInt(e.target.value) || 0 })
                  }
                  className="border-primary/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe (Opcional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={editingClient ? "Preencha APENAS para redefinir senha" : "Definir senha inicial"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas do Perfil (CRM)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Ex: Alergia a tinta X, prefere corte desfiado nas pontas."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingClient ? "Guardar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-xl font-bold">{totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-green-100">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-xl font-bold">
                  {totalRevenue.toFixed(2)}€
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Média de Visitas
                </p>
                <p className="text-xl font-bold">{avgVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Label htmlFor="search-clients" className="sr-only">Pesquisar clientes</Label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-clients"
          placeholder="Pesquisar clientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>


      {/* Clients Table */}
      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">
              {searchQuery
                ? "Nenhum cliente encontrado"
                : "Nenhum cliente cadastrado"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery
                ? "Tente uma pesquisa diferente"
                : "Comece adicionando os seus clientes para ver o histórico."}
            </p>
            {!searchQuery && (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Contacto
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Visitas
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Total Gasto
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Pontos
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors group" 
                    onClick={() => handleOpenProfile(client.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {getInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{client.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {client.phone || client.email || "Sem contacto"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[150px]">
                              {client.email}
                            </span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{client.visit_count}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{Number(client.total_spent).toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />
                        <span className="font-medium">{client.loyalty_points}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Ver Perfil Detalhado"
                          onClick={() => handleOpenProfile(client.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar Menus"
                          onClick={() => openEditDialog(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination Controls */}
            {totalCount > pageSize && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  A mostrar <strong>{(currentPage - 1) * pageSize + 1}</strong> a <strong>{Math.min(currentPage * pageSize, totalCount)}</strong> de <strong>{totalCount}</strong> clientes
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage * pageSize >= totalCount}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CRM Profile Sheet Viewer */}
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent className="w-full sm:max-w-md lg:max-w-xl overflow-hidden p-0 flex flex-col border-l-0 shadow-2xl">
          {profileLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <SheetHeader className="sr-only">
                <SheetTitle>Carregando Perfil</SheetTitle>
                <SheetDescription>A carregar os detalhes do cliente selecionado.</SheetDescription>
              </SheetHeader>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">A carregar perfil completo...</p>
            </div>
          ) : selectedProfile ? (
            <>
              <SheetHeader className="sr-only">
                 <SheetTitle>{selectedProfile.name}</SheetTitle>
                 <SheetDescription>Perfil detalhado de {selectedProfile.name}</SheetDescription>
              </SheetHeader>
              {/* Header Profile Cover Style */}
              <div className="bg-gradient-to-t from-muted/50 to-muted/10 p-6 border-b relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/20 to-cyan-500/20 -z-10"></div>
                <div className="flex gap-5 mt-4">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-600 text-white text-2xl font-bold">
                      {getInitials(selectedProfile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pt-2">
                    <SheetTitle className="text-2xl font-extrabold">{selectedProfile.name}</SheetTitle>
                    <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mt-2">
                      {selectedProfile.phone && (
                        <span className="flex items-center gap-2 font-medium"><Phone className="h-3.5 w-3.5" /> {selectedProfile.phone}</span>
                      )}
                      {selectedProfile.email && (
                        <span className="flex items-center gap-2 font-medium"><Mail className="h-3.5 w-3.5" /> {selectedProfile.email}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="px-3 py-1 font-semibold text-sm rounded-lg shadow-sm">
                    <Star className="h-4 w-4 mr-1.5 text-yellow-500 fill-yellow-500" /> {selectedProfile.loyalty_points} Pontos
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 font-semibold text-sm bg-green-50 text-green-700 border-green-200 rounded-lg shadow-sm">
                    <Euro className="h-4 w-4 mr-1.5" /> {Number(selectedProfile.total_spent).toFixed(2)} Gasto
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 font-semibold text-sm rounded-lg shadow-sm ml-auto cursor-pointer flex gap-2"
                   onClick={() => openEditDialog(selectedProfile)}>
                    <Pencil className="h-3 w-3" /> Editar
                  </Badge>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-background scrollbar-thin">
                
                {/* Notas do CRM */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-amber-100 p-1.5 rounded-md">
                      <MessageCircle className="h-4 w-4 text-amber-700" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Anotações (CRM)</h3>
                  </div>
                  {selectedProfile.notes ? (
                    <div className="bg-amber-50/50 border border-amber-200/60 text-amber-900 p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-inner">
                      {selectedProfile.notes}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-5 rounded-2xl border border-dashed text-center">
                      Nenhuma anotação registada para este cliente. Pode guardar preferências diretamente na edição.
                    </div>
                  )}
                </div>

                {/* Grafico de Gastos Mensal */}
                {getChartData().length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-primary/10 p-1.5 rounded-md">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Evolução de Gastos</h3>
                    </div>
                    
                    <div className="h-[200px] w-full bg-card border rounded-2xl p-4 shadow-sm">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                          <Tooltip 
                            cursor={{fill: 'var(--tw-colors-muted)'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            formatter={(value: any) => [`${Number(value).toFixed(2)}€`, "Gasto Total"]}
                            labelStyle={{ color: 'var(--tw-colors-muted-foreground)', fontWeight: 'bold', marginBottom: '4px' }}
                          />
                          <Bar dataKey="total" fill="var(--tw-colors-primary-DEFAULT)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Histórico de Serviços */}
                <div className="pb-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-cyan-100 p-1.5 rounded-md">
                      <HistoryIcon className="h-4 w-4 text-cyan-700" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Histórico de Serviços ({selectedProfile.appointments?.length || 0})
                    </h3>
                  </div>
                  
                  {selectedProfile.appointments && selectedProfile.appointments.length > 0 ? (
                    <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-6">
                      {selectedProfile.appointments.map((app: any, index: number) => {
                        const date = new Date(app.starts_at)
                        const isCompleted = app.status === "completed"
                        const isCancelled = app.status === "cancelled"
                        
                        return (
                          <div key={app.id} className="relative group">
                            {/* Linha da timeline point */}
                            <div className={`absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-background ring-4 ring-background ${isCompleted ? 'bg-primary' : isCancelled ? 'bg-destructive' : 'bg-muted-foreground'}`}></div>
                            
                            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-bold flex items-center gap-2 text-base">
                                    {app.service?.name || "Serviço Removido"}
                                    {isCompleted ? (
                                      <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-green-500 hover:bg-green-600">Concluído</Badge>
                                    ) : isCancelled ? (
                                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">Cancelado</Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Pendente</Badge>
                                    )}
                                  </h4>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    {format(date, "d 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
                                  </p>
                                </div>
                                <span className="font-bold text-lg bg-muted px-2 py-1 rounded-md">{Number(app.price).toFixed(2)}€</span>
                              </div>
                              
                              <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2.5 bg-muted/50 px-3 py-1.5 rounded-full text-foreground font-medium">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={app.staff?.avatar_url} />
                                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                                      {getInitials(app.staff?.name || "")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{app.staff?.name}</span>
                                </div>
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {app.service?.duration_minutes}m
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 flex flex-col items-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                      <Scissors className="h-8 w-8 text-muted-foreground/40 mb-3" />
                      <p>Este cliente não possui nenhum serviço concluído.</p>
                    </div>
                  )}
                </div>

              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function HistoryIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}
