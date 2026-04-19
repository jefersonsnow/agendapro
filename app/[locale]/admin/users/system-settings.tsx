"use client"

import { useState, useEffect } from "react"
import { getGlobalConfig, updateGlobalConfig } from "@/lib/actions/admin"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Globe, ShieldCheck, Zap, Copy, Save, Loader2, Sparkles, Megaphone, CreditCard } from "lucide-react"

export function SystemSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activePlanTab, setActivePlanTab] = useState("free")
  const [config, setConfig] = useState<any>({
    landing_page: { 
      heroTitle1: "", heroTitle2: "", heroDesc: "",
      featuresTitle: "", featuresDesc: "",
      plansTitle: "", plansDesc: "",
    },
    plans: {
       free: { price: 0, appointments_per_month: 50, staff: 1, clients: 100, services: 3, qr_code: false, logo: false, cover: false, reports: false, commissions: false, professional_export: false },
       basic: { price: 19, appointments_per_month: -1, staff: 5, clients: 500, services: 20, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true },
       premium: { price: 39, appointments_per_month: -1, staff: -1, clients: -1, services: -1, qr_code: true, logo: true, cover: true, reports: true, commissions: true, professional_export: true }
    },
    stripe_configs: { secretKey: "", publishableKey: "", webhookSecret: "", productBasicId: "", productPremiumId: "" },
    kiwify_configs: { webhookSecret: "", productBasicId: "", productPremiumId: "" },
    sales_page_config: { headline: "", subheadline: "", videoUrl: "", timerDate: "", fbPixel: "", googlePixel: "" }
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const data = await getGlobalConfig()
      const lp = JSON.parse(data.landing_page || "{}")
      const kw = JSON.parse(data.kiwify_configs || "{}")
      const st = JSON.parse(data.stripe_configs || "{}")
      const sp = JSON.parse(data.sales_page_config || "{}")
      const pl = lp.plans || config.plans
      
      setConfig({
        landing_page: {
          heroTitle1: lp.heroTitle1 || "",
          heroTitle2: lp.heroTitle2 || "",
          heroDesc: lp.heroDesc || "",
          featuresTitle: lp.featuresTitle || "",
          featuresDesc: lp.featuresDesc || "",
          plansTitle: lp.plansTitle || "",
          plansDesc: lp.plansDesc || "",
        },
        plans: pl,
        kiwify_configs: {
          webhookSecret: kw.webhookSecret || "",
          productBasicId: kw.productBasicId || "",
          productPremiumId: kw.productPremiumId || ""
        },
        stripe_configs: {
          secretKey: st.secretKey || "",
          publishableKey: st.publishableKey || "",
          webhookSecret: st.webhookSecret || "",
          productBasicId: st.productBasicId || "",
          productPremiumId: st.productPremiumId || ""
        },
        sales_page_config: {
          headline: sp.headline || "",
          subheadline: sp.subheadline || "",
          videoUrl: sp.videoUrl || "",
          timerDate: sp.timerDate || "",
          fbPixel: sp.fbPixel || "",
          googlePixel: sp.googlePixel || ""
        }
      })
    } catch (error) {
      console.error("Erro ao carregar configs:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Unir planos na landing_page para persistência
      const dataToSave = {
         ...config,
         landing_page: { ...config.landing_page, plans: config.plans }
      }
      await updateGlobalConfig(dataToSave)
      toast.success("Configurações do Core (Planos + CMS) atualizadas!")
    } catch (error) {
      toast.error("Erro ao salvar no banco de dados.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
       <Loader2 className="h-10 w-10 animate-spin text-primary" />
       <p className="text-sm font-bold animate-pulse">Sincronizando Core Ecosystem...</p>
    </div>
  )

  const webhookUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/stripe`

  const PlanEditor = ({ planKey, label }: { planKey: string, label: string }) => {
    const p = config.plans[planKey]
    const update = (field: string, val: any) => {
       const newPlans = { ...config.plans, [planKey]: { ...p, [field]: val } }
       setConfig({ ...config, plans: newPlans })
    }

    return (
       <div className="space-y-6 pt-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-50">Preço Mensal (€)</Label>
                <Input type="number" value={p.price} onChange={(e) => update("price", Number(e.target.value))} className="h-10 border-2 rounded-xl" />
             </div>
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-50">Agendamentos/Mês (-1=ilimitado)</Label>
                <Input type="number" value={p.appointments_per_month} onChange={(e) => update("appointments_per_month", Number(e.target.value))} className="h-10 border-2 rounded-xl" />
             </div>
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-50">Max Profissionais</Label>
                <Input type="number" value={p.staff} onChange={(e) => update("staff", Number(e.target.value))} className="h-10 border-2 rounded-xl" />
             </div>
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-50">Max Clientes</Label>
                <Input type="number" value={p.clients} onChange={(e) => update("clients", Number(e.target.value))} className="h-10 border-2 rounded-xl" />
             </div>
             <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase opacity-50">Max Serviços</Label>
                <Input type="number" value={p.services} onChange={(e) => update("services", Number(e.target.value))} className="h-10 border-2 rounded-xl" />
             </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-2xl grid grid-cols-2 gap-y-3 gap-x-6 border">
             {[
               { k: "qr_code", l: "QR Code de Reserva" },
               { k: "logo", l: "Logótipo Próprio" },
               { k: "cover", l: "Capa do Salão" },
               { k: "reports", l: "Relatórios de BI" },
               { k: "commissions", l: "Cálculo Comissões" },
               { k: "professional_export", l: "Exportação Profissional (Excel)" },
             ].map(feat => (
                <div key={feat.k} className="flex items-center justify-between">
                   <Label className="text-[11px] font-bold">{feat.l}</Label>
                   <Button 
                     size="sm" 
                     variant={p[feat.k] ? "default" : "outline"}
                     className={`h-7 px-3 rounded-full text-[9px] font-black uppercase tracking-tighter ${p[feat.k] ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                     onClick={() => update(feat.k, !p[feat.k])}
                   >
                     {p[feat.k] ? "Ativo" : "Inativo"}
                   </Button>
                </div>
             ))}
          </div>
       </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* LANDING PAGE CONFIG */}
        <div className="space-y-8">
           <Card className="border-2 border-primary/10 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
             <CardHeader className="bg-primary/5 border-b border-primary/5 pb-8">
                <CardTitle className="text-xl flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <Globe className="h-5 w-5 text-white" />
                   </div>
                   Dynamic Landing Page CMS
                </CardTitle>
                <CardDescription>Controle total sobre o conteúdo da página inicial</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6 pt-8">
                <div className="grid sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Hero Título 1</Label>
                      <Input 
                        className="h-12 border-2 rounded-xl focus:ring-primary/20"
                        value={config.landing_page.heroTitle1 || ""} 
                        onChange={(e) => setConfig({...config, landing_page: {...config.landing_page, heroTitle1: e.target.value}})}
                        placeholder="Domine seu Salão."
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Hero Título 2</Label>
                      <Input 
                        className="h-12 border-2 rounded-xl focus:ring-primary/20"
                        value={config.landing_page.heroTitle2 || ""} 
                        onChange={(e) => setConfig({...config, landing_page: {...config.landing_page, heroTitle2: e.target.value}})}
                        placeholder="Lucre como Expert."
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Descrição do Hero</Label>
                   <Textarea 
                     className="border-2 rounded-xl focus:ring-primary/20 min-h-[100px]"
                     value={config.landing_page.heroDesc || ""} 
                     onChange={(e) => setConfig({...config, landing_page: {...config.landing_page, heroDesc: e.target.value}})}
                     placeholder="A solução definitiva para orquestrar sua agenda..."
                   />
                </div>

                <div className="h-px bg-muted" />

                <div className="space-y-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary/80">Configuração de Planos SaaS</Label>
                      <div className="bg-muted p-1 rounded-2xl border flex gap-1">
                         <Button size="sm" variant={activePlanTab === "free" ? "secondary" : "ghost"} className="flex-1 rounded-xl text-[10px] font-black" onClick={() => setActivePlanTab("free")}>FREE</Button>
                         <Button size="sm" variant={activePlanTab === "basic" ? "secondary" : "ghost"} className="flex-1 rounded-xl text-[10px] font-black" onClick={() => setActivePlanTab("basic")}>BASIC</Button>
                         <Button size="sm" variant={activePlanTab === "premium" ? "secondary" : "ghost"} className="flex-1 rounded-xl text-[10px] font-black" onClick={() => setActivePlanTab("premium")}>PREMIUM</Button>
                      </div>
                   </div>

                   <PlanEditor planKey={activePlanTab} label={activePlanTab.toUpperCase()} />
                </div>
             </CardContent>
           </Card>

           <Button 
             className="w-full h-16 rounded-3xl bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all group"
             onClick={handleSave}
             disabled={saving}
           >
              {saving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3 group-hover:scale-125 transition-transform" />}
              IMPLEMENTAR MUDANÇAS NO CORE
           </Button>
        </div>

        {/* STRIPE WEBHOOK CONFIG */}
        <div className="space-y-8">
           <Card className="border-2 border-indigo-500/10 shadow-xl shadow-indigo-500/5 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/5 pb-8">
                <CardTitle className="text-xl flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <CreditCard className="h-5 w-5 text-white" />
                   </div>
                   Stripe Financial Engine
                </CardTitle>
                <CardDescription>Automatize o fluxo de caixa, subscrições e pagamentos do ecossistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                 {/* Webhook URL Helper */}
                 <div className="bg-muted p-4 rounded-xl border-2 border-dashed border-muted-foreground/20 space-y-2">
                    <Label className="text-[10px] font-black uppercase flex items-center gap-2">
                        URL de Webhook (Stripe)
                        <Copy 
                          className="h-3 w-3 cursor-pointer hover:text-primary" 
                          onClick={() => {
                             navigator.clipboard.writeText(webhookUrl)
                             toast.success("URL copiada!")
                          }}
                        />
                    </Label>
                    <code className="text-xs break-all text-primary font-mono bg-background px-3 py-1.5 rounded-lg block border">
                        {webhookUrl}
                    </code>
                    <p className="text-[10px] text-muted-foreground italic mt-2">
                        Configure este endpoint no painel da Stripe (Developers {`>`} Webhooks) e selecione eventos como `checkout.session.completed` e `customer.subscription.deleted`.
                    </p>
                 </div>

                 {/* AVISO IMPORTANTE */}
                 <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl">
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">⚠️ Atenção aos IDs de Preço</p>
                    <p className="text-xs text-muted-foreground mt-1">
                       A Stripe usa IDs diferentes para o <strong>Produto</strong> (começam com `prod_...`) e para o <strong>Preço</strong> (começam com `price_...`). 
                       Você deve <strong>obrigatoriamente usar os IDs que começam com <code>price_</code></strong> nos campos abaixo.
                    </p>
                 </div>

                 <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                           <Label>Secret Key (sk_...)</Label>
                           <Input 
                             type="password"
                             value={config.stripe_configs?.secretKey || ""} 
                             onChange={(e) => setConfig({...config, stripe_configs: {...config.stripe_configs, secretKey: e.target.value}})}
                             placeholder="sk_test_... ou sk_live_..."
                           />
                       </div>
                       <div className="space-y-2">
                           <Label>Publishable Key (pk_...)</Label>
                           <Input 
                             value={config.stripe_configs?.publishableKey || ""} 
                             onChange={(e) => setConfig({...config, stripe_configs: {...config.stripe_configs, publishableKey: e.target.value}})}
                             placeholder="pk_test_... ou pk_live_..."
                           />
                       </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Webhook Signing Secret (whsec_...)</Label>
                        <Input 
                           type="password"
                           value={config.stripe_configs?.webhookSecret || ""} 
                           onChange={(e) => setConfig({...config, stripe_configs: {...config.stripe_configs, webhookSecret: e.target.value}})}
                           placeholder="whsec_..."
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 border-t pt-6">
                    <div className="space-y-2">
                        <Label>Price ID (Basic)</Label>
                        <Input 
                          value={config.stripe_configs?.productBasicId || ""} 
                          onChange={(e) => setConfig({...config, stripe_configs: {...config.stripe_configs, productBasicId: e.target.value}})}
                          placeholder="price_..."
                        />
                        {config.stripe_configs?.productBasicId?.startsWith('price_') && (
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="w-full text-[10px] mt-2 h-7"
                             onClick={async () => {
                               const toastId = toast.loading("Gerando link...")
                               try {
                                  const { generateStripePaymentLink } = await import('@/lib/actions/stripe')
                                  const res = await generateStripePaymentLink(config.stripe_configs.productBasicId)
                                  if (res.error) throw new Error(res.error)
                                  if (res.url) {
                                     navigator.clipboard.writeText(res.url)
                                     toast.success("Link copiado para a área de transferência!", { id: toastId })
                                  }
                               } catch (err: any) {
                                  toast.error(err.message || "Erro ao gerar link", { id: toastId })
                               }
                             }}
                           >
                             <Copy className="h-3 w-3 mr-2" />
                             Gerar Link de Pagamento (Direto)
                           </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Price ID (Premium)</Label>
                        <Input 
                          value={config.stripe_configs?.productPremiumId || ""} 
                          onChange={(e) => setConfig({...config, stripe_configs: {...config.stripe_configs, productPremiumId: e.target.value}})}
                          placeholder="price_..."
                        />
                        {config.stripe_configs?.productPremiumId?.startsWith('price_') && (
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="w-full text-[10px] mt-2 h-7"
                             onClick={async () => {
                               const toastId = toast.loading("Gerando link...")
                               try {
                                  const { generateStripePaymentLink } = await import('@/lib/actions/stripe')
                                  const res = await generateStripePaymentLink(config.stripe_configs.productPremiumId)
                                  if (res.error) throw new Error(res.error)
                                  if (res.url) {
                                     navigator.clipboard.writeText(res.url)
                                     toast.success("Link copiado para a área de transferência!", { id: toastId })
                                  }
                               } catch (err: any) {
                                  toast.error(err.message || "Erro ao gerar link", { id: toastId })
                               }
                             }}
                           >
                             <Copy className="h-3 w-3 mr-2" />
                             Gerar Link de Pagamento (Direto)
                           </Button>
                        )}
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Button 
             className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
             onClick={handleSave}
             disabled={saving}
           >
              {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-3" />}
              SALVAR CONFIGURAÇÕES DO SISTEMA
           </Button>
        </div>
      </div>

      {/* SALES PAGE CONFIG */}
      <Card className="border-2 border-primary/10 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden mt-8">
         <CardHeader className="bg-primary/5 border-b border-primary/5 pb-8">
            <CardTitle className="text-xl flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Megaphone className="h-5 w-5 text-white" />
               </div>
               Página de Vendas (Tráfego Pago)
            </CardTitle>
            <CardDescription>Configure a Landing Page de Alta Conversão focado em tráfego de anúncios (Sem Menus).</CardDescription>
         </CardHeader>
         <CardContent className="space-y-8 pt-8">
            <div className="grid lg:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <h4 className="font-bold text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Copywriting & VSL</h4>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Headline Principal (PNL)</Label>
                     <Input 
                       className="h-12 border-2 rounded-xl"
                       value={config.sales_page_config?.headline || ""} 
                       onChange={(e) => setConfig({...config, sales_page_config: {...config.sales_page_config, headline: e.target.value}})}
                       placeholder="A sua agenda está vazia? Descubra o segredo..."
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Sub-Headline</Label>
                     <Textarea 
                       className="border-2 rounded-xl min-h-[80px]"
                       value={config.sales_page_config?.subheadline || ""} 
                       onChange={(e) => setConfig({...config, sales_page_config: {...config.sales_page_config, subheadline: e.target.value}})}
                       placeholder="O método testado por mais de 500 salões para faturar 3x mais."
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Link do Vídeo (VSL - YouTube Embed)</Label>
                     <Input 
                       className="h-12 border-2 rounded-xl"
                       value={config.sales_page_config?.videoUrl || ""} 
                       onChange={(e) => setConfig({...config, sales_page_config: {...config.sales_page_config, videoUrl: e.target.value}})}
                       placeholder="https://www.youtube.com/embed/..."
                     />
                  </div>
               </div>
               
               <div className="space-y-6">
                  <h4 className="font-bold text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Tracking & Urgência</h4>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Facebook Pixel ID</Label>
                     <Input 
                       className="h-12 border-2 rounded-xl"
                       value={config.sales_page_config?.fbPixel || ""} 
                       onChange={(e) => setConfig({...config, sales_page_config: {...config.sales_page_config, fbPixel: e.target.value}})}
                       placeholder="123456789012345"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Google Ads / Analytics ID</Label>
                     <Input 
                       className="h-12 border-2 rounded-xl"
                       value={config.sales_page_config?.googlePixel || ""} 
                       onChange={(e) => setConfig({...config, sales_page_config: {...config.sales_page_config, googlePixel: e.target.value}})}
                       placeholder="G-XXXXXX / AW-XXXXX"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Contador de Urgência (Data Final)</Label>
                     <Input 
                       type="datetime-local"
                       className="h-12 border-2 rounded-xl"
                       value={config.sales_page_config?.timerDate || ""} 
                       onChange={(e) => setConfig({...config, sales_page_config: {...config.sales_page_config, timerDate: e.target.value}})}
                     />
                  </div>

                  <div className="pt-4 border-t border-dashed">
                     <Button 
                        variant="secondary" 
                        className="w-full h-12 rounded-xl font-bold shadow-sm"
                        onClick={() => {
                           const url = `${window.location.origin}/pt/oferta-exclusiva`
                           navigator.clipboard.writeText(url)
                           toast.success("Link da página de vendas copiado!")
                        }}
                     >
                        <Copy className="h-4 w-4 mr-2" /> Copiar Link da Oferta
                     </Button>
                     <p className="text-center text-[10px] text-muted-foreground mt-2 italic">Use este link nas suas campanhas de tráfego pago.</p>
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>

      {/* PLAN DETAILS TIPS */}
      <Card className="bg-muted/50 border-primary/5">
         <CardContent className="p-6">
            <div className="flex items-start gap-4">
               <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Megaphone className="h-5 w-5 text-primary" />
               </div>
               <div className="space-y-1">
                  <h4 className="font-bold text-sm">Próximo Passo para Vendas</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                     Ao receber um webhook pago da Stripe, o sistema buscará o salão pelo <strong>email do cliente</strong> inserido no Checkout. Certifique-se de que o cliente use o mesmo email de registo no AgendarPro ao subscrever na Stripe para que a ativação seja instantânea.
                  </p>
                  <p className="text-xs text-primary/80 font-bold leading-relaxed">
                     ⚠️ Importante: Se você enviar o Link Direto por WhatsApp, avise o cliente para colocar o MESMO email que usa para entrar no painel do AgendarPro.
                  </p>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}
