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
import { importLeadsFromCsv, getLeadsStats, getCompetitorFilters, addCompetitorFilter, deleteCompetitorFilter } from "@/lib/actions/admin-leads"
import { Settings, Save, MessageCircle, Phone, Globe, ShieldCheck, Zap, Loader2, Sparkles, Gift, Search, Facebook, Activity, Upload, Database, AlertTriangle, CheckCircle, FileSpreadsheet, Users, Plus, X } from "lucide-react"
import { toast } from "sonner"

export function SupportSeoSettings() {
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

  // Leads & CSV State
  const [leadsStats, setLeadsStats] = useState<any>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [competitorFilters, setCompetitorFilters] = useState<any[]>([])
  const [newDomain, setNewDomain] = useState("")
  const [addingFilter, setAddingFilter] = useState(false)

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

        // Fetch leads stats
        try {
          const stats = await getLeadsStats()
          setLeadsStats(stats)
        } catch (e) {
          console.error("Erro ao carregar estatísticas de leads:", e)
        }

        // Fetch competitor filters
        try {
          const filters = await getCompetitorFilters()
          setCompetitorFilters(filters)
        } catch (e) {
          console.error("Erro ao carregar filtros de concorrentes:", e)
        }

      } catch (err) {
        toast.error("Erro ao carregar configurações")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAddFilter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain.trim()) return
    setAddingFilter(true)
    try {
      const res = await addCompetitorFilter(newDomain)
      if (res.success && res.filter) {
        setCompetitorFilters(prev => [...prev, res.filter])
        setNewDomain("")
        toast.success("Filtro de concorrente adicionado!")
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar filtro")
    } finally {
      setAddingFilter(false)
    }
  }

  const handleDeleteFilter = async (id: string) => {
    try {
      const res = await deleteCompetitorFilter(id)
      if (res.success) {
        setCompetitorFilters(prev => prev.filter(f => f.id !== id))
        toast.success("Filtro de concorrente removido!")
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover filtro")
    }
  }

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile) return
    setImporting(true)
    setImportResult(null)
    
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const text = event.target?.result as string
        try {
          const res = await importLeadsFromCsv(text)
          setImportResult(res)
          toast.success("CSV importado com sucesso!")
          // Atualizar estatísticas
          const stats = await getLeadsStats()
          setLeadsStats(stats)
        } catch (err: any) {
          toast.error(err.message || "Erro ao importar leads")
        } finally {
          setImporting(false)
        }
      }
      reader.readAsText(csvFile)
    } catch (err: any) {
      toast.error("Erro ao ler arquivo")
      setImporting(false)
    }
  }

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
        <TabsList className="bg-muted p-1 rounded-xl mb-4 flex flex-wrap gap-1 w-fit">
          <TabsTrigger value="geral" className="rounded-lg text-[10px] font-black uppercase tracking-widest">Geral & Suporte</TabsTrigger>
          <TabsTrigger value="marketing" className="rounded-lg text-[10px] font-black uppercase tracking-widest">Marketing & Promoção</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-lg text-[10px] font-black uppercase tracking-widest">SEO & Tracking</TabsTrigger>
          <TabsTrigger value="leads" className="rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Diretório & Leads</TabsTrigger>
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

        <TabsContent value="marketing" className="space-y-4">
          <Card className="border-none shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 italic">
                  <Gift className="h-4 w-4 text-orange-600" />
                  Marketing & Promoção
                </CardTitle>
                <CardDescription className="text-xs">Gerencie campanhas de trial e promoções de lançamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-600/5 border border-orange-600/10">
                  <div className="space-y-0.5">
                      <Label className="text-sm font-bold tracking-tight">Campanha "60 Dias Premium"</Label>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Ativar campanha no site público</p>
                  </div>
                  <Switch checked={isPromoActive} onCheckedChange={setIsPromoActive} className="data-[state=checked]:bg-orange-600" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50 pl-1">Texto Destacado (Banner)</Label>
                  <Input 
                      value={promoText} 
                      onChange={(e) => setPromoText(e.target.value)} 
                      placeholder="Ex: 60 Dias de Premium GRÁTIS!" 
                      disabled={!isPromoActive}
                      className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase opacity-50 pl-1">Duração do Trial (Dias)</Label>
                  <Input 
                      type="number"
                      value={promoTrialDays} 
                      onChange={(e) => setPromoTrialDays(parseInt(e.target.value) || 0)} 
                      disabled={!isPromoActive}
                      className="h-10 rounded-xl w-32"
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

        <TabsContent value="leads" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-xl bg-background/60 backdrop-blur-xl rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl p-4 bg-orange-100/50 text-orange-600">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Total de Leads</p>
                    <p className="text-2xl font-black tracking-tighter">{leadsStats?.total ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-background/60 backdrop-blur-xl rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl p-4 bg-green-100/50 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Leads Ativos</p>
                    <p className="text-2xl font-black tracking-tighter">{leadsStats?.active ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-background/60 backdrop-blur-xl rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl p-4 bg-blue-100/50 text-blue-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Reivindicados (Novos Clientes)</p>
                    <p className="text-2xl font-black tracking-tighter">{leadsStats?.claimed ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-background/60 backdrop-blur-xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                  <div className="h-10 w-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600">
                    <Upload className="h-5 w-5" />
                  </div>
                  Importar CSV de Salões
                </CardTitle>
                <CardDescription>
                  Carregue o arquivo CSV gerado pelo seu scraper para criar as páginas públicas automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <form onSubmit={handleCsvUpload} className="space-y-6">
                  <div className="border-2 border-dashed border-muted hover:border-orange-600/40 rounded-[2rem] p-8 transition-colors flex flex-col items-center justify-center gap-4 bg-muted/5 group">
                    <div className="h-12 w-12 rounded-2xl bg-orange-100/30 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">
                        {csvFile ? csvFile.name : "Arraste ou escolha o arquivo CSV"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Formatos suportados: .csv (máx. 10MB)</p>
                    </div>
                    <Input 
                      type="file" 
                      accept=".csv" 
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="hidden" 
                      id="csv-file-picker" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="rounded-xl border-muted-foreground/20 text-xs font-black uppercase tracking-widest"
                      onClick={() => document.getElementById("csv-file-picker")?.click()}
                    >
                      Selecionar Arquivo
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={importing || !csvFile} 
                    className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 rounded-2xl transition-all"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                        A Processar leads...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-3" />
                        Importar {csvFile ? "Arquivo" : "Leads"}
                      </>
                    )}
                  </Button>
                </form>

                {importResult && (
                  <div className="rounded-[1.5rem] bg-orange-50/5 border border-orange-500/10 p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-orange-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Relatório da Importação
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold uppercase tracking-widest">
                      <div className="bg-background/40 p-4 rounded-xl border">
                        <span className="block text-muted-foreground text-[10px] mb-1">Processados</span>
                        <span className="text-lg font-black text-foreground">{importResult.totalParsed}</span>
                      </div>
                      <div className="bg-background/40 p-4 rounded-xl border border-green-500/10 text-green-600">
                        <span className="block text-muted-foreground text-[10px] mb-1">Inseridos</span>
                        <span className="text-lg font-black">{importResult.inserted}</span>
                      </div>
                      <div className="bg-background/40 p-4 rounded-xl border border-orange-500/10 text-orange-600">
                        <span className="block text-muted-foreground text-[10px] mb-1">Atualizados</span>
                        <span className="text-lg font-black">{importResult.updated}</span>
                      </div>
                      <div className="bg-background/40 p-4 rounded-xl border border-muted text-muted-foreground">
                        <span className="block text-muted-foreground text-[10px] mb-1">Ignorados</span>
                        <span className="text-lg font-black">{importResult.skipped}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dynamic Competitor Filters Card */}
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/60 backdrop-blur-xl">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                  <div className="h-10 w-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  Filtros de Concorrentes
                </CardTitle>
                <CardDescription>
                  Gerencie os domínios de concorrentes conhecidos que serão filtrados e removidos do campo Website dos leads importados.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <form onSubmit={handleAddFilter} className="flex gap-2">
                  <Input
                    placeholder="Ex: appbarber.com.br, buk.pt"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    disabled={addingFilter}
                    className="h-12 rounded-xl border-muted-foreground/20 text-sm font-semibold"
                  />
                  <Button
                    type="submit"
                    disabled={addingFilter || !newDomain.trim()}
                    className="h-12 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 flex items-center gap-2"
                  >
                    {addingFilter ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Adicionar
                  </Button>
                </form>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase opacity-50 tracking-widest">Filtros Ativos ({competitorFilters.length})</Label>
                  {competitorFilters.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-muted/20 border border-muted/40 max-h-[220px] overflow-y-auto">
                      {competitorFilters.map((filter) => (
                        <Badge
                          key={filter.id}
                          variant="secondary"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-100/40 hover:bg-orange-100/60 text-orange-950 font-bold border-none transition-all text-xs"
                        >
                          <span>{filter.domain}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteFilter(filter.id)}
                            className="text-orange-600/70 hover:text-red-600 hover:bg-red-50 p-0.5 rounded-full transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed rounded-2xl border-muted-foreground/25">
                      <p className="text-xs text-muted-foreground font-semibold italic">Nenhum filtro de concorrente cadastrado.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/60 backdrop-blur-xl">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 italic">
                    <div className="h-10 w-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    Regras de Limpeza
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4 text-xs leading-relaxed text-muted-foreground font-medium">
                  <p>O importador executa de forma automática e silenciosa:</p>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80 pl-1">
                    <li><strong className="text-orange-600">Filtro de Concorrentes:</strong> Remove links de sites como Fresha, Noona, Zappy, Treatwell do campo de website.</li>
                    <li><strong className="text-orange-600">Redirecionamento de Links:</strong> Move links de WhatsApp ou redes sociais salvos na coluna Website para o local correto.</li>
                    <li><strong className="text-orange-600">Higienização de Telefones:</strong> Remove espaços e formata os números para ligações móveis diretas.</li>
                    <li><strong className="text-orange-600">Desduplicação Inteligente:</strong> Se o lead já existe (por slug ou telefone), atualiza os dados, a menos que ele já seja um parceiro reivindicado.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-[2.5rem] bg-background/60 backdrop-blur-xl">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Top Cidades (Leads)</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="space-y-4">
                    {leadsStats?.leadsByCity && leadsStats.leadsByCity.length > 0 ? (
                      leadsStats.leadsByCity.map((c: any, index: number) => (
                        <div key={c.city} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                          <span className="text-sm font-bold">{c.city}</span>
                          <Badge variant="secondary" className="rounded-lg font-black text-xs px-2.5 py-0.5">
                            {c.count} leads
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Nenhum dado de cidade disponível.</p>
                    )}
                  </div>
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
