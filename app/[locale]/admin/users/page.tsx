// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { getAllUsers } from "@/lib/actions/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Shield, Mail, Calendar, Plus, Edit2, Trash2, Settings, Loader2 } from "lucide-react"
import { UserDialog } from "./user-dialog"
import { deleteUser } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemSettings } from "./system-settings"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
     if (!confirm("Tem a certeza que deseja eliminar este utilizador?")) return
     try {
       await deleteUser(id)
       fetchData()
     } catch (err: any) {
        alert(err.message)
     }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Controlo Core</h1>
          <p className="text-muted-foreground">
            Gestão global de utilizadores e configurações do sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
         <TabsList className="bg-muted p-1 rounded-2xl border flex gap-2 w-fit">
            <TabsTrigger value="users" className="rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <Shield className="h-4 w-4" /> Gestão de Contas
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2">
               <Settings className="h-4 w-4" /> Configuração do Sistema
            </TabsTrigger>
         </TabsList>

         <TabsContent value="users" className="space-y-6">
            <div className="flex justify-end">
               <Button onClick={() => { setEditUser(null); setDialogOpen(true); }} className="bg-orange-600 hover:bg-orange-700 h-10 px-6 rounded-xl shadow-lg shadow-orange-600/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Administrador / Dono
               </Button>
            </div>

            <UserDialog 
               open={dialogOpen} 
               onOpenChange={setDialogOpen} 
               onSuccess={fetchData} 
               user={editUser}
            />

            <Card className="border-none shadow-xl shadow-black/5 overflow-hidden rounded-2xl">
               <CardContent className="p-0">
                  <Table>
                     <TableHeader className="bg-muted/50">
                        <TableRow>
                           <TableHead>Utilizador</TableHead>
                           <TableHead>Cargo</TableHead>
                           <TableHead className="text-center">Salões</TableHead>
                           <TableHead>Membro Desde</TableHead>
                           <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {users.map((user) => (
                           <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell>
                                 <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                                       {user.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                       <div className="font-bold">{user.name}</div>
                                       <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${
                                    user.role === 'admin' 
                                       ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                                       : 'bg-blue-100 text-blue-700 border border-blue-200'
                                 }`}>
                                    {user.role}
                                 </span>
                              </TableCell>
                              <TableCell className="text-center font-bold">
                                 {user._count.ownedSalons}
                              </TableCell>
                              <TableCell className="text-sm font-medium opacity-60">
                                 {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                 <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5" onClick={() => { setEditUser(user); setDialogOpen(true); }}>
                                       <Edit2 className="h-4 w-4 text-primary" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-destructive/5" onClick={() => handleDelete(user.id)}>
                                       <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="system">
            <SystemSettings />
         </TabsContent>
      </Tabs>
    </div>
  )
}

