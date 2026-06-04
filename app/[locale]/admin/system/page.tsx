// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getGlobalConfig, updateGlobalConfig } from "@/lib/actions/admin"
import { Settings, Save, MessageCircle, Phone, Globe, ShieldCheck, Zap, Loader2, Sparkles, Gift, Search, Facebook, Activity } from "lucide-react"
import { toast } from "sonner"

export default function AdminSystemPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [whatsappNumber, setWhatsappNumber] = useState("")
  
  // Promotion State
  const [isPromoActive, setIsPromoActive] = useState(false)
  const [promoText, setPromoText] = useState("")
  const [promoTrialDays, setPromoTrialDays] = useState(60)

  // SEO State
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [metaKeywords, setMetaKeywords] = useState("")
  const [fbPixelId, setFbPixelId] = useState("")
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("")
  const [ogImageUrl, setOgImageUrl] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getGlobalConfig()
        setConfig(data)
        
        // Parse support_config
        const support = data.support_config ? JSON.parse(data.support_config) : {}
        setWhatsappNumber(support.whatsappNumber || "")

        // Parse promotion_config
        const promo = data.promotion_config ? JSON.parse(data.promotion_config) : { enabled: false, trial_days: 60, promo_text: "" }
        setIsPromoActive(promo.enabled || false)
        setPromoText(promo.promo_text || "")
        setPromoTrialDays(promo.trial_days || 60)

        // Parse seo_config
        const seo = data.seo_config ? JSON.parse(data.seo_config) : {}
        setMetaTitle(seo.metaTitle || "")
        setMetaDescription(seo.metaDescription || "")
        setMetaKeywords(seo.metaKeywords || "")
        setFbPixelId(seo.fbPixelId || "")
        setGoogleAnalyticsId(seo.googleAnalyticsId || "")
        setOgImageUrl(seo.ogImageUrl || "")

      } catch (err) {
        toast.error("Erro ao carregar configurações")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const supportConfigSet = {
        whatsappNumber: whatsappNumber.replace(/\s+/g, ""), // Limpar espaços
      }

      const promotionConfigSet = {
        enabled: isPromoActive,
        promo_text: promoText,
        trial_days: promoTrialDays
      }

      const seoConfigSet = {
        metaTitle,
        metaDescription,
        metaKeywords,
        fbPixelId,
        googleAnalyticsId,
        ogImageUrl
      }
      
      await updateGlobalConfig({
         support_config: supportConfigSet,
         promotion_config: promotionConfigSet,
         seo_config: seoConfigSet
      })
      
      toast.success("Configurações atualizadas com sucesso!")
    } catch (err: any) {
      toast.error(err.message || "Falha ao gravar configurações")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic">Central <span className="text-orange-600">Core</span></h1>
          <p className="text-muted-foreground text-lg font-medium">Gestão global corporativa do AgendarPro / NAPP</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="h-14 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 rounded-2xl group transition-all px-8 shrink-0"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />}
          {saving ? "A Sincronizar..." : "Gravar Mudanças"}
        </Button>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-2xl mb-8 h-auto flex flex-wrap gap-1">
          <TabsTrigger value="geral" className="rounded-xl px-6 py-3 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <Settings className="h-4 w-4" /> Geral & Suporte
          </TabsTrigger>
          <TabsTrigger value="marketing" className="rounded-xl px-6 py-3 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Marketing
          </TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl px-6 py-3 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <Search className="h-4 w-4" /> Configuração SEO
          </TabsTrigger>
          <TabsTrigger value="infra" className="rounded-xl px-6 py-3 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
            <Activity className="h-4 w-4" /> Infraestrutura
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/60 backdrop-blur-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5"> <MessageCircle className="h-24 w-24 -rotate-12" /> </div>
            <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                  <div className="h-10 w-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600">
                      <Phone className="h-5 w-5" />
                  </div>
                  Suporte & NAPP Direct
                </CardTitle>
                <CardDescription>Defina os canais de contacto oficiais da vossa empresa para os salões.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">WhatsApp de Suporte (Vendas/Upgrade)</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center text-green-600">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <Input 
                            value={whatsappNumber} 
                            onChange={(e) => setWhatsappNumber(e.target.value)} 
                            placeholder="Ex: 351912345678" 
                            className="h-14 pl-12 rounded-2xl border-2 border-muted hover:border-orange-600/30 transition-all focus:border-orange-600 text-lg font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground italic px-2">Insira o número com o indicativo internacional (ex: 351 para Portugal) sem o símbolo "+".</p>
                  </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/60 backdrop-blur-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5"> <Sparkles className="h-24 w-24 -rotate-12" /> </div>
            <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Gift className="h-5 w-5" />
                  </div>
                  Marketing & Promoção
                </CardTitle>
                <CardDescription>Gerencie campanhas de trial e promoções de lançamento.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="space-y-0.5">
                      <Label className="text-sm font-bold tracking-tight">Campanha "60 Dias Premium"</Label>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ativar campanha no site público</p>
                  </div>
                  <Switch checked={isPromoActive} onCheckedChange={setIsPromoActive} className="data-[state=checked]:bg-primary" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Texto Destacado (Banner)</Label>
                  <Input 
                      value={promoText} 
                      onChange={(e) => setPromoText(e.target.value)} 
                      placeholder="Ex: 60 Dias de Premium GRÁTIS!" 
                      disabled={!isPromoActive}
                      className="h-12 rounded-xl border-2 border-muted focus:border-primary text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Duração do Trial (Dias)</Label>
                  <Input 
                      type="number"
                      value={promoTrialDays} 
                      onChange={(e) => setPromoTrialDays(parseInt(e.target.value) || 0)} 
                      disabled={!isPromoActive}
                      className="h-12 rounded-xl border-2 border-muted focus:border-primary text-sm font-medium w-32"
                  />
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/60 backdrop-blur-xl">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                    <Search className="h-5 w-5" />
                  </div>
                  Meta Tags Globais
                </CardTitle>
                <CardDescription>Otimize como o AgendarPro aparece no Google e outros motores de busca.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SEO Meta Title</Label>
                  <Input 
                    value={metaTitle} 
                    onChange={(e) => setMetaTitle(e.target.value)} 
                    placeholder="Ex: AgendarPro — Sistema de Agendamento para Salões" 
                    className="h-12 rounded-xl border-2 border-muted focus:border-blue-600"
                  />
                  <p className="text-[9px] text-muted-foreground italic">Recomendado: 50-60 caracteres.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">SEO Meta Description</Label>
                  <Textarea 
                    value={metaDescription} 
                    onChange={(e) => setMetaDescription(e.target.value)} 
                    placeholder="Ex: A plataforma completa para gerir o seu salão de beleza..." 
                    className="min-h-[100px] rounded-xl border-2 border-muted focus:border-blue-600 resize-none"
                  />
                  <p className="text-[9px] text-muted-foreground italic">Recomendado: 150-160 caracteres.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Keywords (Separadas por vírgula)</Label>
                  <Input 
                    value={metaKeywords} 
                    onChange={(e) => setMetaKeywords(e.target.value)} 
                    placeholder="agenda, salão, barbearia, software gestão" 
                    className="h-12 rounded-xl border-2 border-muted focus:border-blue-600"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/60 backdrop-blur-xl">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                      <Facebook className="h-5 w-5" />
                    </div>
                    Tracking Scripts
                  </CardTitle>
                  <CardDescription>Configure ferramentas de monitorização e anúncios.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">ID do Facebook Pixel</Label>
                    <Input 
                      value={fbPixelId} 
                      onChange={(e) => setFbPixelId(e.target.value)} 
                      placeholder="Ex: 123456789012345" 
                      className="h-12 rounded-xl border-2 border-muted focus:border-indigo-600"
                    />
                    <p className="text-[9px] text-muted-foreground italic">O script será carregado automaticamente em todas as páginas públicas.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Google Analytics ID (G-XXXXXXX)</Label>
                    <Input 
                      value={googleAnalyticsId} 
                      onChange={(e) => setGoogleAnalyticsId(e.target.value)} 
                      placeholder="Ex: G-A1B2C3D4E5" 
                      className="h-12 rounded-xl border-2 border-muted focus:border-indigo-600"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/60 backdrop-blur-xl">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">Social Media (Open Graph)</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-4">
                   <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">URL da Imagem de Partilha (OG Image)</Label>
                    <Input 
                      value={ogImageUrl} 
                      onChange={(e) => setOgImageUrl(e.target.value)} 
                      placeholder="https://sua-url.com/poster.jpg" 
                      className="h-12 rounded-xl border-2 border-muted"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="infra" className="space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-slate-100 italic py-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"> <ShieldCheck className="h-40 w-40" /> </div>
            <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xl font-black uppercase tracking-tighter">Core Health Check</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-sm font-bold uppercase tracking-widest opacity-60">Status API</span>
                  <Badge className="bg-green-500 text-white border-0 rounded-full font-black text-[10px] px-3">OPERATIONAL</Badge>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-sm font-bold uppercase tracking-widest opacity-60">Base de Dados</span>
                  <Badge className="bg-green-500 text-white border-0 rounded-full font-black text-[10px] px-3">PROTECTED</Badge>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-sm font-bold uppercase tracking-widest opacity-60">Licenciamento</span>
                  <span className="font-mono text-xs opacity-50">NAPP-V2-CORE-PRO</span>
                </div>
                
                <div className="pt-4 flex gap-4">
                  <Button variant="outline" className="flex-1 rounded-2xl border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest h-12">Logs Globais</Button>
                  <Button variant="outline" className="flex-1 rounded-2xl border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest h-12">Versão 2.4.0</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-50 md:hidden">
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-600/30 rounded-[2rem] group transition-all"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />}
          {saving ? "A Sincronizar..." : "Gravar Tudo"}
        </Button>
      </div>
    </div>
  )
}
