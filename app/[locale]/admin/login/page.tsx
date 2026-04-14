"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Lock, Mail, ChevronRight } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError("Credenciais de administrador inválidas.")
      } else {
        // Redirecionar manualmente após sucesso para garantir o destino correto
        router.push("/admin")
        router.refresh()
      }
    } catch (err) {
      setError("Erro ao processar login administrativo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 space-y-2">
           <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-600/20">
                 <ShieldCheck className="h-10 w-10 text-white" />
              </div>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight uppercase">Super Admin</h1>
           <p className="text-muted-foreground font-medium">Ecossistema de Gestão AgendarPro</p>
        </div>

        <Card className="border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />
          <CardHeader>
            <CardTitle className="text-white text-xl">Acesso Restrito</CardTitle>
            <CardDescription className="text-gray-400">
              Introduza as suas credenciais de nível superior para gerir a plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Administrativo</Label>
                <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                   <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 text-white pl-10 h-12 focus:border-orange-500 transition-colors"
                    placeholder="admin@agendarpro.pt"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="Palavra-passe" className="text-gray-300">Palavra-passe</Label>
                <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                   <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 text-white pl-10 h-12 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                   {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98]"
              >
                {loading ? "A Autenticar..." : "ENTRAR NO SISTEMA"}
                {!loading && <ChevronRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-gray-500 text-xs font-bold uppercase tracking-widest opacity-50">
           © 2026 agendarpro v2.0 • secure core
        </div>
      </div>
    </div>
  )
}
