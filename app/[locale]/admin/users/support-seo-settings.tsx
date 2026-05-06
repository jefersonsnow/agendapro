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

export function SupportSeoSettings() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [whatsappNumber, setWhatsappNumber] = useState("")
  
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
         seo_config: seoConfigSet
      })
      
      toast.success("Configurações atualizadas!")
    } catch (err: any) {
      toast.error(err.message || "Falha ao gravar configurações")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Gravar Alterações
        </Button>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl mb-4">
          <TabsTrigger value="geral" className="rounded-lg text-[10px] font-black uppercase tracking-widest">Geral & Suporte</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg text-[10px] font-black uppercase tracking-widest">SEO & Tracking</TabsTrigger>
          <TabsTrigger value="infra" className="rounded-lg text-[10px] font-black uppercase tracking-widest">Saúde Core</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 italic">
                  <Phone className="h-4 w-4 text-orange-600" />
                  Suporte & NAPP Direct
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase opacity-50">WhatsApp de Suporte</Label>
                    <Input 
                        value={whatsappNumber} 
                        onChange={(e) => setWhatsappNumber(e.target.value)} 
                        placeholder="Ex: 351912345678" 
                        className="h-10 rounded-xl"
                    />
                </div>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="seo" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader><CardTitle className="text-sm font-bold">Meta Tags Globais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black opacity-50">SEO Meta Title</Label>
                  <Input 
                    value={metaTitle} 
                    onChange={(e) => setMetaTitle(e.target.value)} 
                    placeholder="Ex: AgendarPro — Sistema de Agendamento para Salões"
                    className="h-10 rounded-xl" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black opacity-50">SEO Meta Description</Label>
                  <Textarea 
                    value={metaDescription} 
                    onChange={(e) => setMetaDescription(e.target.value)} 
                    placeholder="Ex: A plataforma completa para gerir o seu salão de beleza..."
                    className="rounded-xl min-h-[80px]" 
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black opacity-50">Keywords (Separadas por vírgula)</Label>
                  <Input 
                    value={metaKeywords} 
                    onChange={(e) => setMetaKeywords(e.target.value)} 
                    placeholder="agenda, salão, barbearia, software gestão"
                    className="h-10 rounded-xl" 
                  />
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader><CardTitle className="text-sm font-bold">Tracking Scripts</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black opacity-50">Facebook Pixel ID</Label>
                    <Input 
                        value={fbPixelId} 
                        onChange={(e) => setFbPixelId(e.target.value)} 
                        placeholder="Ex: 123456789012345"
                        className="h-10 rounded-xl" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black opacity-50">Google Analytics ID</Label>
                    <Input 
                        value={googleAnalyticsId} 
                        onChange={(e) => setGoogleAnalyticsId(e.target.value)} 
                        placeholder="Ex: G-A1B2C3D4E5"
                        className="h-10 rounded-xl" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl">
                <CardHeader><CardTitle className="text-[10px] font-black opacity-50 uppercase tracking-widest">Social Media (Open Graph)</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Label className="text-[10px] font-black opacity-50">URL da Imagem de Partilha (OG Image)</Label>
                  <Input 
                    value={ogImageUrl} 
                    onChange={(e) => setOgImageUrl(e.target.value)} 
                    placeholder="https://sua-url.com/poster.jpg"
                    className="h-10 rounded-xl" 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="infra">
          <Card className="border-none shadow-sm rounded-2xl bg-slate-900 text-white p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-[10px] font-black opacity-50">API STATUS</span>
                <Badge className="bg-green-500">OPERATIONAL</Badge>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-[10px] font-black opacity-50">DATABASE</span>
                <Badge className="bg-green-500">CONNECTED</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
