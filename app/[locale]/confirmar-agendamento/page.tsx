"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { confirmAppointmentByToken } from "@/lib/actions/booking"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, CheckCircle2, XCircle, Loader2, CalendarCheck2 } from "lucide-react"
import { useTranslations } from "next-intl"

export default function ConfirmarAgendamentoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const t = useTranslations("Booking")
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [salonInfo, setSalonInfo] = useState<{ name: string; slug: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setErrorMsg("Link de confirmação inválido ou ausente.")
      return
    }

    async function handleConfirmation() {
      const result = await confirmAppointmentByToken(token as string)
      if (result.success) {
        setStatus("success")
        setSalonInfo({ name: result.salonName || "", slug: result.salonSlug || "" })
      } else {
        setStatus("error")
        setErrorMsg(result.error || "Ocorreu um erro ao confirmar o agendamento.")
      }
    }

    handleConfirmation()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-2xl border-2 border-primary/5 rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            {status === "loading" && <Loader2 className="h-10 w-10 text-primary animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-10 w-10 text-emerald-600" />}
            {status === "error" && <XCircle className="h-10 w-10 text-rose-600" />}
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-slate-800">
            {status === "loading" && "A verificar..."}
            {status === "success" && "Agendamento Confirmado!"}
            {status === "error" && "Ops! Algo correu mal"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium px-4">
            {status === "loading" && "Estamos a validar o seu link de confirmação segura."}
            {status === "success" && `A sua reserva no salão ${salonInfo?.name} foi validada com sucesso.`}
            {status === "error" && errorMsg}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10 px-8 text-center">
          {status === "success" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-left">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 leading-relaxed">
                  A sua segurança é a nossa prioridade. Ao confirmar o seu e-mail, garante que o seu horário está protegido e reservado exclusivamente para si.
                </p>
              </div>
              <Button 
                onClick={() => router.push(`/${salonInfo?.slug}`)}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-3 shadow-xl"
              >
                <CalendarCheck2 className="h-5 w-5" />
                VOLTAR AO SALÃO
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
