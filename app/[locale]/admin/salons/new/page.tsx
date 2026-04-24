// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSalonWithOwner } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, User, Key, Globe, LayoutDashboard, ChevronLeft } from "lucide-react"

export default function NewSalonPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    salonName: "",
    slug: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createSalonWithOwner(formData)
      router.push("/admin/salons")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function generateSlug(name: string) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setFormData({ ...formData, salonName: name, slug: slug })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Novo Salão</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações do Salão
            </CardTitle>
            <CardDescription>
              Dados do negócio no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="salonName">Nome do Salão</Label>
                <Input
                  id="salonName"
                  value={formData.salonName}
                  onChange={(e) => generateSlug(e.target.value)}
                  placeholder="Ex: Barber Shop Elite"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="flex items-center gap-2">
                   <Globe className="h-4 w-4" />
                   Link do Salão
                </Label>
                <div className="flex items-center gap-2">
                   <span className="text-sm text-muted">reservar/</span>
                   <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="barber-shop-elite"
                    required
                    />
                </div>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Conta do Proprietário
            </CardTitle>
            <CardDescription>
               Credenciais de acesso ao Painel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email de Acesso</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemplo@gmail.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe Provisória</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
           {error}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} disabled={loading} size="lg" className="bg-orange-600 hover:bg-orange-700">
          {loading ? "A Criar..." : "Criar Salão e Utilizador"}
        </Button>
      </div>
    </div>
  )
}
