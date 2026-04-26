// <title> <meta name="description" content="SEO" /> <Head>
'use client'

import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Calendar, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success_registration') === 'true'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await login({ email, password })
      if (result?.error) {
        setError(result.error)
      }
    } catch (error: any) {
      // Deixa o Next.js lidar com redireccionamentos
      if (error?.message === 'NEXT_REDIRECT' || error?.digest?.includes('NEXT_REDIRECT')) {
        throw error;
      }
      
      console.error("Login Error:", error)
      setError(error.message || "Erro técnico ao aceder ao painel.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Calendar className="h-8 w-8" />
            <span className="text-2xl font-bold">agendar.pro</span>
          </div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Entrar</CardTitle>
              <CardDescription>
                Aceda ao painel do seu salão
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="py-4 space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                       <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-green-900">Conta criada com sucesso!</h3>
                       <p className="text-sm text-muted-foreground leading-relaxed">
                          Enviámos as suas credenciais de acesso para o e-mail introduzido. 
                          <strong> Verifique a sua caixa de entrada e pasta de Spam.</strong>
                       </p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-xl border text-center">
                     <p className="text-xs text-muted-foreground">
                        Por segurança, deve aceder ao painel através do link enviado para o seu e-mail.
                     </p>
                  </div>
                  
                  <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => window.location.href = '/'}>
                     Voltar à página inicial
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Palavra-passe</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'A entrar...' : 'Entrar'}
                    </Button>
                  </div>
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Entre com as suas credenciais para aceder ao painel.
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center bg-muted/30">
        <div className="animate-pulse font-bold">A carregar...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
