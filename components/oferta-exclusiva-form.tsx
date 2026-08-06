"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { CheckCircle, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react"
import { signUpWithDetails } from "@/lib/actions/auth"

const EUROPEAN_COUNTRIES = [
  { code: "PT", name: "Portugal 🇵🇹" },
  { code: "BR", name: "Brasil 🇧🇷" },
  { code: "ES", name: "España 🇪🇸" },
  { code: "FR", name: "France 🇫🇷" },
  { code: "IT", name: "Italia 🇮🇹" },
  { code: "DE", name: "Deutschland 🇩🇪" },
  { code: "GB", name: "United Kingdom 🇬🇧" },
  { code: "CH", name: "Suisse 🇨🇭" },
  { code: "BE", name: "Belgique 🇧🇪" },
  { code: "NL", name: "Nederland 🇳🇱" },
  { code: "LU", name: "Luxembourg 🇱🇺" },
  { code: "IE", name: "Ireland 🇮🇪" },
] as const

const formSchema = z.object({
  name: z.string().min(3, "Por favor insira o seu nome completo (mínimo 3 caracteres)."),
  salonName: z.string().min(2, "Por favor insira o nome do seu salão/espaço."),
  email: z.string().email("Endereço de e-mail inválido."),
  password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres."),
  country: z.string().default("PT"),
  phone: z.string().min(9, "Telemóvel inválido (mínimo 9 dígitos)."),
})

export function OfertaExclusivaForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      salonName: "",
      email: "",
      password: "",
      country: "PT",
      phone: "",
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await signUpWithDetails({
        ...values,
        address: "",
        nif: "",
        plan: "premium"
      })

      if (result.success) {
        setUserEmail(values.email)
        setIsSuccess(true)

        // Meta Pixel Lead Event Tracking
        if (typeof window !== "undefined" && (window as any).fbq) {
          try {
            (window as any).fbq('track', 'Lead', {
              content_name: 'Oferta Exclusiva Premium 60 Dias',
              status: 'registered'
            })
          } catch (e) {
            console.error("Meta Pixel Error:", e)
          }
        }

        // Google Ads Conversion Tracking (if gtag available)
        if (typeof window !== "undefined" && (window as any).gtag) {
          try {
            (window as any).gtag('event', 'conversion', {
              'send_to': 'AW-CONVERSION_ID/signup',
              'value': 1.0,
              'currency': 'EUR'
            })
          } catch (e) {
            console.error("Google Ads Event Error:", e)
          }
        }

      } else if (result.error) {
        if (typeof result.error === 'object') {
          Object.keys(result.error).forEach((key: any) => {
             form.setError(key as any, { message: (result.error as any)[key][0] })
          })
        } else {
          toast.error(result.error)
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao processar o seu registo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-slate-900/90 border border-primary/40 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl text-center animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-black text-white tracking-tight mb-3">
          Conta Criada com Sucesso! 🎉
        </h3>
        <p className="text-slate-300 text-base leading-relaxed mb-6">
          Enviámos um e-mail de ativação para <strong className="text-primary font-bold">{userEmail}</strong>. 
          Basta clicar no link para libertar os seus <span className="font-bold text-white">60 Dias Grátis do Plano Premium</span>.
        </p>
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-6 text-left text-sm text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs">
            <Zap className="h-4 w-4" /> Passo Seguinte:
          </div>
          <p>1. Abra a sua caixa de entrada (ou pasta de spam).</p>
          <p>2. Clique em <strong>"ACTIVAR CONTA AGORA"</strong>.</p>
          <p>3. Aceda instantaneamente ao seu painel completo.</p>
        </div>
        <Button 
          onClick={() => { setIsSuccess(false); form.reset(); }} 
          variant="outline" 
          className="w-full h-12 rounded-xl font-bold border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Criar Outra Conta
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/90 border-2 border-primary/40 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-primary/20 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-primary to-cyan-500 bg-[length:200%_auto] animate-gradient-x" />
      
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-white border border-primary/30 uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" /> Oferta Exclusiva 60 Dias
        </span>
      </div>

      <h3 className="text-3xl font-black text-white tracking-tight mb-2">
        Crie a sua Conta Premium Grátis
      </h3>
      <p className="text-slate-400 text-sm mb-8 font-medium">
        Acesso total a todas as funcionalidades por 60 dias. Sem cartão de crédito.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">O Seu Nome</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Maria Santos" 
                      className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary h-12 rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">Nome do Salão / Espaço</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Salão Studio Beauty" 
                      className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary h-12 rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">E-mail Profissional</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="seuemail@exemplo.com" 
                      className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary h-12 rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">Palavra-passe</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="******" 
                      className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary h-12 rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">País</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-950/60 border-slate-800 text-white focus:border-primary h-12 rounded-xl">
                        <SelectValue placeholder="Selecione o país" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      {EUROPEAN_COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="focus:bg-slate-800 focus:text-white">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">Telemóvel / WhatsApp</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+351 912 345 678" 
                      className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary h-12 rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-16 mt-4 rounded-2xl font-black uppercase tracking-wider text-white bg-gradient-to-r from-cyan-600 via-primary to-cyan-600 bg-[length:200%_auto] animate-gradient-x hover:opacity-90 shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                A criar a sua conta...
              </span>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> QUERO 60 DIAS GRÁTIS AGORA <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>

          <div className="pt-3 flex items-center justify-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Sem Cartão de Crédito
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-primary" /> Ativação Imediata
            </span>
          </div>
        </form>
      </Form>
    </div>
  )
}
