"use client"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { confirmRegistrationByToken } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, CheckCircle2, XCircle, Loader2, Sparkles, Building2 } from "lucide-react"

export default function ConfirmarRegistoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [salonInfo, setSalonInfo] = useState<{ name: string; slug: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMsg("Link de ativação inválido ou ausente.")
      return
    }

    async function handleConfirmation() {
      const result = await confirmRegistrationByToken(token as string)
      if (result.success) {
        setStatus("success")
        setSalonInfo({ name: result.salonName || "", slug: result.salonSlug || "" })
      } else {
        setStatus("error")
        setErrorMsg(result.error || "Ocorreu um erro ao ativar a sua conta.")
      }
    }

    handleConfirmation()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-2xl border-2 border-primary/5 rounded-[2rem] overflow-hidden bg-background">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            {status === "loading" && <Loader2 className="h-10 w-10 text-primary animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-10 w-10 text-emerald-600" />}
            {status === "error" && <XCircle className="h-10 w-10 text-rose-600" />}
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-slate-800">
            {status === "loading" && "A validar..."}
            {status === "success" && "Conta Ativada com Sucesso!"}
            {status === "error" && "Ops! Algo correu mal"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium px-4">
            {status === "loading" && "Estamos a validar os seus dados e a criar o seu espaço de trabalho."}
            {status === "success" && `Parabéns! O seu salão ${salonInfo?.name} foi ativado no período gratuito de 60 dias.`}
            {status === "error" && errorMsg}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10 px-8 text-center">
          {status === "success" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-left">
                <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  A sua conta de teste de 60 dias está ativa e totalmente configurada! Enviámos as suas credenciais e link de acesso único por e-mail.
                </p>
              </div>
              <Button 
                onClick={() => router.push(`/${salonInfo?.slug}/login`)}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold gap-3 shadow-xl"
              >
                <Building2 className="h-5 w-5" />
                ACEDER AO MEU PAINEL
              </Button>
            </div>
          )}

          {status === "error" && (
            <Button 
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 font-bold"
            >
              VOLTAR AO INÍCIO
            </Button>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tecnologia AgendarPro
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
