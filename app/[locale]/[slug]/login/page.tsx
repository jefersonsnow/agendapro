"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSalonBySlug } from "@/lib/actions/admin"
import { login, recoverPassword } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Calendar, Lock, Mail, Loader2, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function BrandedLoginPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [salon, setSalon] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false)
  const [isRecovering, setIsRecovering] = useState(false)

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRecovering(true)
    try {
      const result = await recoverPassword(email, slug as string)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Enviámos uma nova palavra-passe para o seu e-mail!")
        setIsRecoverDialogOpen(false)
      }
    } catch (error) {
      toast.error("Erro ao solicitar nova palavra-passe.")
    } finally {
      setIsRecovering(false)
    }
  }

  useEffect(() => {
    async function fetchBranding() {
      try {
        const data = await getSalonBySlug(slug as string)
        if (data) {
          setSalon(data)
        }
      } catch (err) {
        console.error("Erro ao carregar branding:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBranding()
  }, [slug])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await login({ email, password, slug })
      if (result?.error) {
        toast.error(result.error)
        setIsSubmitting(false)
      }
      // Se não houver erro, o próprio server action 'login' fará o redirect
      // por isso não precisamos de fazer nada aqui.
    } catch (error: any) {
      // Apenas mostramos erro se não for uma interrupção de redirecionamento normal
      if (error.message && !error.message.includes('NEXT_REDIRECT')) {
        toast.error("Erro ao autenticar. Tente novamente.")
        setIsSubmitting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Fallback if salon not found: use default agendarpro branding
  const displayName = salon?.name || "AgendarPro"

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="w-full max-w-[420px] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden group hover:scale-105 transition-transform">
            {salon?.logo_url ? (
               <Image src={salon.logo_url} alt={salon.name} width={80} height={80} className="object-cover" />
            ) : (
                <div className="bg-primary/5 h-full w-full flex items-center justify-center">
                   <Calendar className="h-10 w-10 text-primary" />
                </div>
            )}
          </div>
          <div className="text-center">
             <h1 className="text-2xl font-black uppercase tracking-tighter italic">
                {displayName} <span className="text-primary italic font-normal tracking-normal text-sm lowercase ml-1">painel</span>
             </h1>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mt-1">
                ambiente seguro de gestão operacional
             </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-xl font-bold">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-xs">
              Introduza as suas credenciais para aceder à gestão de <strong>{displayName}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest opacity-70 ml-1">E-mail Corporativo</Label>
                <div className="relative group">
                   <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                   <Input 
                    id="email" 
                    type="email" 
                    placeholder="ex: gina@email.pt" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-11 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:ring-0 transition-all font-medium"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest opacity-70">Palavra-passe</Label>
                  <button type="button" onClick={() => setIsRecoverDialogOpen(true)} className="text-[10px] font-bold text-primary hover:underline">Esqueci-me</button>
                </div>
                <div className="relative group">
                   <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                   <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-11 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary/30 focus:ring-0 transition-all font-medium"
                   />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 group overflow-hidden relative" disabled={isSubmitting}>
                <span className="relative z-10 flex items-center justify-center gap-2">
                   {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar Corporativo"}
                   {!isSubmitting && <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Dialog open={isRecoverDialogOpen} onOpenChange={setIsRecoverDialogOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
            <DialogHeader className="pt-2">
              <DialogTitle className="text-xl font-bold text-center">Recuperar Acesso</DialogTitle>
              <DialogDescription className="text-center text-xs mt-2">
                Iremos gerar uma nova palavra-passe temporária e enviar para o seu e-mail corporativo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRecover} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="recover-email" className="text-[10px] uppercase font-black tracking-widest opacity-70 ml-1">E-mail Corporativo</Label>
                <div className="relative group">
                   <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                   <Input 
                    id="recover-email" 
                    type="email" 
                    placeholder="ex: gina@email.pt" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary/30 focus:ring-0 transition-all font-medium"
                   />
                </div>
              </div>
              <DialogFooter className="sm:justify-center">
                <Button type="submit" disabled={isRecovering} className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                  {isRecovering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isRecovering ? "A Enviar..." : "Receber Nova Senha"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 mt-8">
           tecnologia de gestão agendarpro © 2026
        </p>
      </div>
    </div>
  )
}
