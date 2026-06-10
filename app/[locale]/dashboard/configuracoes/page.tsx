// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getSalon, updateSalonSettings } from "@/lib/actions/dashboard"
import { exportSalonData } from "@/lib/actions/export"
import { uploadFile } from "@/lib/actions/upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Building2, Globe, Clock, Save, Copy, Check, Palette, Share2, Image as ImageIcon, Sparkles, Coffee, Wifi, Car, Wind, Tv, ShieldCheck, Users, Baby, Accessibility, LayoutGrid, SlidersHorizontal, Layers, MousePointer2, Briefcase, QrCode, Printer, Upload, Loader2, X, MessageCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useRef } from "react"
import { isFeatureAllowed } from "@/lib/plan-utils"


interface Salon {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  working_hours: any
  settings: any
  plan?: string
  status?: string
  locale: string
  timezone: string
  dynamicPlans?: any
  color_palette: string
}

const weekDays = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
]

const AMENITIES = [
  { id: "wifi", icon: Wifi },
  { id: "coffee", icon: Coffee },
  { id: "parking", icon: Car },
  { id: "ac", icon: Wind },
  { id: "hygiene", icon: ShieldCheck },
  { id: "staff", icon: Users },
  { id: "drinks", icon: Coffee },
  { id: "tv", icon: Tv },
  { id: "kids", icon: Baby },
  { id: "accessible", icon: Accessibility },
]

export default function ConfiguracoesPage() {
  const t = useTranslations("DashboardSettings")
  const tAm = useTranslations("Amenities")
  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingLogo, setLoadingLogo] = useState(false)
  const [loadingCover, setLoadingCover] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportStart, setExportStart] = useState("")
  const [exportEnd, setExportEnd] = useState("")

  const logoRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    theme: "default",
    social_instagram: "",
    social_facebook: "",
    social_whatsapp: "",
    about_link: "",
    amenities_layout: "grid",
    amenities_style: "card",
    amenities_color: "theme",
    services_layout: "grid",
    services_style: "card",
    services_subtitles: {} as Record<string, string>,
    logo_url: "",
    cover_url: "",
    locale: "pt",
    timezone: "Europe/Lisbon",
    slot_interval: 15,
    color_palette: "default",
    requires_email_confirmation: false,
  })
  const [galleryUrls, setGalleryUrls] = useState(["", "", "", ""])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [workingHours, setWorkingHours] = useState<
    Record<string, { open: string; close: string; enabled: boolean; hasBreak?: boolean; breakStart?: string; breakEnd?: string }>
  >({})

  useEffect(() => {
    fetchSalon()
  }, [])

  async function fetchSalon() {
    try {
      const data = await getSalon()
      if (!data) {
        toast.error("Não foi possível carregar os dados do salão. Por favor, recarregue a página.")
        setLoading(false)
        return
      }
      
      setSalon(data)
    const settings = data.settings || {}
    
    setFormData({
      name: data.name || "",
        description: data.description || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        logo_url: data.logo_url || "",
        cover_url: data.cover_url || "",
        theme: settings.theme || "default",
        social_instagram: settings.social_instagram || "",
        social_facebook: settings.social_facebook || "",
        social_whatsapp: settings.social_whatsapp || "",
        about_link: settings.about_link || "",
        amenities_layout: settings.amenities_layout || "grid",
        amenities_style: settings.amenities_style || "card",
        amenities_color: settings.amenities_color || "theme",
        services_layout: settings.services_layout || "grid",
        services_style: settings.services_style || "card",
        services_subtitles: settings.services_subtitles || {},
        locale: data.locale || "pt",
        timezone: data.timezone || "Europe/Lisbon",
        slot_interval: data.slot_interval || 15,
        color_palette: data.color_palette || "default",
        requires_email_confirmation: !!data.requires_email_confirmation,
      })
      if (settings.gallery_urls) setGalleryUrls(settings.gallery_urls)
      if (settings.amenities) setSelectedAmenities(settings.amenities)

      const hours: Record<string, { open: string; close: string; enabled: boolean; hasBreak?: boolean; breakStart?: string; breakEnd?: string }> = {}
      weekDays.forEach((day) => {
        const dayHours = (data.working_hours as any)?.[day.key]
        hours[day.key] = {
          open: dayHours?.open || "09:00",
          close: dayHours?.close || "18:00",
          enabled: dayHours !== null && dayHours !== undefined,
          hasBreak: !!dayHours?.breakStart,
          breakStart: dayHours?.breakStart || "13:00",
          breakEnd: dayHours?.breakEnd || "14:00",
        }
      })
      setWorkingHours(hours)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching salon:", err)
      setLoading(false)
    }
  }

  async function handleFileUpload(file: File, type: "logo" | "cover") {
    console.log("DEBUG: File upload detected", { name: file.name, size: file.size, type })
    if (file.size > 10 * 1024 * 1024) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      toast.error("Imagem demasiado grande!", {
        description: `O ficheiro tem ${fileSizeMB}MB. O limite máximo permitido para envio é 10.00MB (o sistema irá comprimi-lo automaticamente).`,
        duration: 5000,
      })
      console.warn(`[UPLOAD] Blocked file ${file.name}: ${fileSizeMB}MB > 10MB`)
      return
    }

    if (type === "logo") setLoadingLogo(true)
    else setLoadingCover(true)
    
    try {
      const data = new FormData()
      data.append("file", file)
      const res = await uploadFile(data)
      
      if (res?.error) {
        toast.error("Falha no envio: " + res.error)
        return
      }

      if (res?.url) {
        setFormData(prev => ({ ...prev, [type === "logo" ? "logo_url" : "cover_url"]: res.url }))
        toast.success("Imagem enviada com sucesso!")
      }
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + (err.message || "Erro de rede"))
    } finally {
      if (type === "logo") setLoadingLogo(false)
      else setLoadingCover(false)
    }
  }

  async function handleSave() {
    if (!salon) return
    setSaving(true)

    const hoursToSave: Record<string, { open: string; close: string; breakStart?: string; breakEnd?: string } | null> = {}
    Object.entries(workingHours).forEach(([day, hours]) => {
      if (!hours.enabled) {
        hoursToSave[day] = null
      } else {
        hoursToSave[day] = {
          open: hours.open,
          close: hours.close,
          ...(hours.hasBreak ? { breakStart: hours.breakStart, breakEnd: hours.breakEnd } : {})
        }
      }
    })
    try {
      await updateSalonSettings({
        ...formData,
        logo_url: (formData as any).logo_url,
        cover_url: (formData as any).cover_url,
        working_hours: hoursToSave,
        settings: {
          ...salon.settings, 
          theme: formData.theme,
          social_instagram: formData.social_instagram,
          social_facebook: formData.social_facebook,
          social_whatsapp: formData.social_whatsapp,
          gallery_urls: galleryUrls,
          about_link: formData.about_link,
          amenities: selectedAmenities,
          amenities_layout: formData.amenities_layout,
          amenities_style: formData.amenities_style,
          amenities_color: formData.amenities_color,
          services_layout: formData.services_layout,
          services_style: formData.services_style,
          services_subtitles: formData.services_subtitles,
          slot_interval: formData.slot_interval,
        },
  
        locale: (formData as any).locale,
        timezone: (formData as any).timezone,
        color_palette: formData.color_palette
      })
  
      fetchSalon()
      toast.success(t("saveBtn") + " - OK!")
      
      // Se o idioma tiver sido alterado, forçar o recarregamento da página para o novo locale
      if ((formData as any).locale && (formData as any).locale !== salon.locale) {
        setTimeout(() => {
          const newLocale = (formData as any).locale;
          window.location.href = `/${newLocale}/dashboard/configuracoes`;
        }, 1000)
      }
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar: " + (error.message || "Erro desconhecido"));
    } finally {
      setSaving(false)
    }
  }

  function toggleAmenity(id: string) {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  function copyBookingUrl() {
    if (!salon) return
    const url = `${window.location.origin}/${salon.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExport() {
    setExporting(true)
    try {
      const { salonName, data } = await exportSalonData(exportStart, exportEnd)
      
      const ExcelJS = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      
      // 1. DASHBOARD SHEET (THE "WOW" FACTOR)
      const dash = workbook.addWorksheet('📊 Dashboard')
      const stats = data.Dashboard as any
      
      // Styling helpers
      const headerFill: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D9488' } }
      const secondaryFill: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }
      const fontWhite: any = { name: 'Arial', color: { argb: 'FFFFFFFF' }, bold: true, size: 12 }
      const fontTitle: any = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF1E293B' } }
      
      // Title
      dash.getCell('B2').value = `RESUMO EXECUTIVO: ${salonName || 'Salão'}`
      dash.getCell('B2').font = fontTitle
      dash.getCell('B3').value = `Período: ${stats.period.start} até ${stats.period.end}`
      dash.getCell('B3').font = { size: 10, italic: true }
      
      // KPI Boxes
      const startCol = 2 // B
      const startRow = 6
      
      stats.metrics.forEach((m: any, i: number) => {
        const col = startCol + (i % 3) * 3
        const row = startRow + Math.floor(i / 3) * 4
        
        const cellHead = dash.getCell(row, col)
        cellHead.value = m.kpi.toUpperCase()
        cellHead.fill = headerFill
        cellHead.font = { color: { argb: 'FFFFFFFF' }, size: 9, bold: true }
        cellHead.alignment = { horizontal: 'center' }
        
        const cellVal = dash.getCell(row + 1, col)
        cellVal.value = m.unit === '€' ? m.value : m.value
        cellVal.font = { size: 16, bold: true }
        cellVal.alignment = { horizontal: 'center' }
        if (m.unit === '€') cellVal.numFmt = '#,##0.00"€"'
        
        dash.mergeCells(row, col, row, col + 1)
        dash.mergeCells(row + 1, col, row + 2, col + 1)
      })
      
      // LISTS (Top Services & Staff)
      const listRow = 15
      dash.getCell(listRow, 2).value = "SERVIÇOS DE MAIOR FATURAÇÃO"
      dash.getCell(listRow, 2).font = { bold: true, color: { argb: 'FF0D9488' } }
      
      let currR = listRow + 2
      stats.topServices.slice(0, 10).forEach((s: any) => {
         dash.getCell(currR, 2).value = s.name
         dash.getCell(currR, 4).value = s.revenue
         dash.getCell(currR, 4).numFmt = '#,##0.00"€"'
         
         // Simulated Bar Chart using Cell Background
         const maxRev = stats.topServices[0].revenue
         const width = Math.round((s.revenue / maxRev) * 10)
         for(let i=0; i<width; i++) {
            dash.getCell(currR, 5+i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF99F6E4' } }
         }
         currR++
      })
      
      // 2. DATA SHEETS
      const sheetsOrder = ["Base de Clientes", "Serviços e Preçário", "Historial de Agendamentos", "Fluxo de Caixa"]
      sheetsOrder.forEach(name => {
         const sheetData = (data as any)[name] as any[]
         const ws = workbook.addWorksheet(name.substring(0, 31))
         
         if (sheetData.length > 0) {
            const columns = Object.keys(sheetData[0]).map(k => ({ header: k, key: k, width: 20 }))
            ws.columns = columns
            ws.addRows(sheetData)
            
            // Format Header
            ws.getRow(1).eachCell(c => {
               c.fill = headerFill
               c.font = fontWhite
            })
         }
      })
      
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `Relatorio_AgendarPro_${salonName}_${new Date().toISOString().split('T')[0]}.xlsx`
      anchor.click()
      window.URL.revokeObjectURL(url)
      
      toast.success(t("exportSuccess"))
    } catch (err) {
      console.error(err)
      toast.error(t("exportError"))
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="space-y-6 max-w-3xl pb-32">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"> <Building2 className="h-5 w-5 text-primary" /> {t("profile")} </CardTitle>
          <CardDescription>{t("profileDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label htmlFor="setting-name" className="text-xs font-bold uppercase">{t("name")}</Label>
                 <Input id="setting-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="border-2 rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="setting-email" className="text-xs font-bold uppercase">{t("email")}</Label>
                 <Input id="setting-email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="border-2 rounded-xl h-11" />
              </div>
           </div>
           
           <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label htmlFor="setting-phone" className="text-xs font-bold uppercase text-primary">{t("phone")}</Label>
                 <Input id="setting-phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="border-2 rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="setting-address" className="text-xs font-bold uppercase">{t("address")}</Label>
                 <Input id="setting-address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="border-2 rounded-xl h-11" />
              </div>
           </div>

            <div className="grid sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label htmlFor="setting-locale" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"> <Globe className="h-3 w-3" /> {t("language")}</Label>
                  <Select value={(formData as any).locale} onValueChange={(v) => setFormData({ ...formData, locale: v } as any)}>
                     <SelectTrigger id="setting-locale" className="border-2 rounded-xl h-11"> <SelectValue /> </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="pt">🇵🇹 Português</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                     </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic">{t("languageDesc")}</p>
               </div>
               <div className="space-y-2">
                  <Label htmlFor="setting-timezone" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"> <Clock className="h-3 w-3" /> Fuso Horário</Label>
                  <Select value={(formData as any).timezone} onValueChange={(v) => setFormData({ ...formData, timezone: v } as any)}>
                     <SelectTrigger id="setting-timezone" className="border-2 rounded-xl h-11"> <SelectValue /> </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="Europe/Lisbon">Lisboa (UTC+0/+1)</SelectItem>
                        <SelectItem value="Europe/London">Londres (UTC+0/+1)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris/Madrid (UTC+1/+2)</SelectItem>
                        <SelectItem value="Europe/Moscow">Moscovo (UTC+3)</SelectItem>
                        <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                        <SelectItem value="America/New_York">Nova Iorque (UTC-5/-4)</SelectItem>
                        <SelectItem value="Africa/Luanda">Luanda (UTC+1)</SelectItem>
                        <SelectItem value="Africa/Maputo">Maputo (UTC+2)</SelectItem>
                        <SelectItem value="Atlantic/Cape_Verde">Cabo Verde (UTC-1)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Los Angeles (UTC-8/-7)</SelectItem>
                        <SelectItem value="Asia/Dubai">Dubai (UTC+4)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tóquio (UTC+9)</SelectItem>
                     </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic">Define o horário local do seu espaço físico.</p>
               </div>
            </div>

           <div className="space-y-2 pt-2">
              <Label htmlFor="setting-description" className="text-xs font-bold uppercase text-muted-foreground">{t("slogan")}</Label>
              <Textarea 
                id="setting-description"
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="border-2 rounded-xl min-h-[100px] resize-none" 
                placeholder={t("sloganHolder")}
              />
           </div>
        </CardContent>
      </Card>

      {/* NOVO: IDENTIDADE VISUAL */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"> <ImageIcon className="h-5 w-5 text-primary" /> {t("visuals")} </CardTitle>
          <CardDescription>{t("visualsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid sm:grid-cols-2 gap-8">
              {/* Logo Section */}
              <div className="space-y-4">
                 <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-[2rem] bg-background/50 relative group">
                    {(formData as any).logo_url ? (
                       <div className="h-24 w-24 rounded-2xl overflow-hidden shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-500">
                          <img src={(formData as any).logo_url} alt="Logo" className="w-full h-full object-cover" />
                       </div>
                    ) : (
                       <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center border-4 border-white shadow-inner">
                          <ImageIcon className="h-8 w-8 opacity-20" />
                       </div>
                    )}
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">{t("logo")}</p>
                       <p className="text-[9px] text-muted-foreground italic">{t("logoDesc")}</p>
                    </div>

                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-[2rem] z-10">
                        {isFeatureAllowed(salon?.plan || "minimo", "logo", salon?.dynamicPlans, salon?.status) ? (
                           <Button 
                              onClick={() => logoRef.current?.click()}
                              variant="outline" 
                              className="rounded-full font-black text-[10px] uppercase tracking-widest relative" 
                              disabled={loadingLogo}
                           >
                              {loadingLogo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                              Substituir Logo
                           </Button>
                        ) : (
                           <div className="flex flex-col items-center gap-2">
                              <Button disabled variant="outline" className="rounded-full font-black text-[10px] uppercase tracking-widest opacity-50">
                                 LOGO BLOQUEADO
                              </Button>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">💎 PREMIUM</Badge>
                           </div>
                        )}
                        <input 
                         ref={logoRef}
                         type="file" 
                         className="hidden" 
                         accept="image/*" 
                         onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, "logo")
                         }}
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="logo-url-field" className="text-[10px] font-bold uppercase pl-1 opacity-60">{t("logoUrlLabel")}</Label>
                    <Input 
                       id="logo-url-field"
                       value={(formData as any).logo_url || ""} 
                       onChange={(e) => setFormData({...formData, logo_url: e.target.value} as any)} 
                       className="border-2 rounded-xl h-11" 
                       placeholder="https://exemplo.com/logo.png"
                    />
                 </div>
              </div>

              {/* Cover Section */}
              <div className="space-y-4">
                 <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-[2rem] bg-background/50 relative group">
                    {(formData as any).cover_url ? (
                       <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-500">
                          <img src={(formData as any).cover_url} alt="Capa" className="w-full h-full object-cover" />
                       </div>
                    ) : (
                       <div className="w-full aspect-video rounded-2xl bg-muted flex items-center justify-center border-4 border-white shadow-inner">
                          <ImageIcon className="h-8 w-8 opacity-20" />
                       </div>
                    )}
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">{t("cover")}</p>
                       <p className="text-[9px] text-muted-foreground italic">{t("coverDesc")}</p>
                    </div>

                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-[2rem] z-10">
                        {isFeatureAllowed(salon?.plan || "minimo", "cover", salon?.dynamicPlans, salon?.status) ? (
                           <Button 
                              onClick={() => coverRef.current?.click()}
                              variant="outline" 
                              className="rounded-full font-black text-[10px] uppercase tracking-widest relative" 
                              disabled={loadingCover}
                           >
                              {loadingCover ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                              Substituir Capa
                           </Button>
                        ) : (
                           <div className="flex flex-col items-center gap-2">
                              <Button disabled variant="outline" className="rounded-full font-black text-[10px] uppercase tracking-widest opacity-50">
                                 CAPA BLOQUEADA
                              </Button>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">💎 PREMIUM</Badge>
                           </div>
                        )}
                        <input 
                         ref={coverRef}
                         type="file" 
                         className="hidden" 
                         accept="image/*" 
                         onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file, "cover")
                         }}
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="cover-url-field" className="text-[10px] font-bold uppercase pl-1 opacity-60">{t("coverUrlLabel")}</Label>
                    <Input 
                       id="cover-url-field"
                       value={(formData as any).cover_url || ""} 
                       onChange={(e) => setFormData({...formData, cover_url: e.target.value} as any)} 
                       className="border-2 rounded-xl h-11" 
                       placeholder="https://exemplo.com/banner.jpg"
                    />
                 </div>
              </div>
           </div>
         </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
           <div className="flex items-center gap-4">
              <code className="flex-1 rounded-xl bg-background px-4 py-3 text-sm font-mono border-2 border-primary/10 truncate">
                 {typeof window !== "undefined" ? `${window.location.host}/${salon?.slug}` : "" }
              </code>
               <Button 
                  title={isFeatureAllowed(salon?.plan || "minimo", "qr_code", salon?.dynamicPlans, salon?.status) ? "Gerar QR Code para Impressão" : "QR Code não disponível no seu plano"} 
                  variant="outline" 
                  size="icon" 
                  className={cn(
                    "h-12 w-12 rounded-xl transition-all",
                    !isFeatureAllowed(salon?.plan || "minimo", "qr_code", salon?.dynamicPlans, salon?.status) && "opacity-40 grayscale cursor-not-allowed"
                  )} 
                  onClick={() => {
                    if (isFeatureAllowed(salon?.plan || "minimo", "qr_code", salon?.dynamicPlans, salon?.status)) {
                       setQrOpen(true)
                    } else {
                       toast.error("O QR Code de reserva é exclusivo dos planos pagos. Faça o upgrade para liberar!")
                    }
                  }}
               >
                  <QrCode className="h-5 w-5" />
               </Button>
              <Button title="Copiar Link Diretamente" size="icon" className="h-12 w-12 rounded-xl" onClick={copyBookingUrl}>
                 {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
           </div>
        </CardContent>
      </Card>

      {/* EXPORTAÇÃO DE DADOS */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5 group overflow-hidden relative">
         {!isFeatureAllowed(salon?.plan || "minimo", "professional_export", salon?.dynamicPlans, salon?.status) && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
               <div className="bg-white p-6 rounded-[2rem] shadow-2xl border flex flex-col items-center gap-4 max-w-xs">
                  <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center">
                     <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
                  </div>
                  <div>
                     <h3 className="font-black uppercase tracking-widest text-xs mb-1">Funcionalidade PRO</h3>
                     <p className="text-[10px] text-muted-foreground leading-relaxed">
                        A Exportação Profissional e Backup em Excel estão disponíveis nos planos <strong>Basic</strong> e <strong>Premium</strong>.
                     </p>
                  </div>
                  <Button variant="default" className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest h-10 shadow-lg shadow-primary/20" asChild>
                     <Link href="/dashboard/configuracoes/planos">FAZER UPGRADE AGORA</Link>
                  </Button>

               </div>
            </div>


         )}
         <CardHeader className="relative">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Upload className="h-24 w-24 -rotate-12" />
           </div>
           <CardTitle className="text-lg flex items-center gap-2"> 
              <Upload className="h-5 w-5 text-primary" /> 
              {t("exportSection")} 
           </CardTitle>
           <CardDescription>{t("exportDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {/* Date Selectors */}
           <div className="grid sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-3xl border border-border/50 backdrop-blur-sm">
             <div className="space-y-1.5">
               <Label htmlFor="export-start" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Início do Período</Label>
               <Input 
                 id="export-start"
                 type="date" 
                 value={exportStart} 
                 onChange={(e) => setExportStart(e.target.value)}
                 className="h-12 rounded-2xl border-2 bg-background focus:ring-primary/20"
               />
             </div>
             <div className="space-y-1.5">
               <Label htmlFor="export-end" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Fim do Período</Label>
               <Input 
                 id="export-end"
                 type="date" 
                 value={exportEnd} 
                 onChange={(e) => setExportEnd(e.target.value)}
                 className="h-12 rounded-2xl border-2 bg-background focus:ring-primary/20"
               />
             </div>
           </div>

           <div className="grid sm:grid-cols-2 gap-6 bg-background/50 p-6 rounded-[2.5rem] border-2 border-dashed border-primary/10">
              <div className="space-y-4">
                 <p className="text-xs font-black uppercase tracking-widest text-primary/80">{t("exportItems")}</p>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                       <span className="text-[10px] font-bold text-muted-foreground">Dashboard Visual Executivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                       <span className="text-[10px] font-bold text-muted-foreground">KPIs e Métricas por Profissional</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                       <span className="text-[10px] font-bold text-muted-foreground">Base de Clientes e Agendamentos</span>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col justify-center gap-3">
                 <Button 
                   variant="outline" 
                   className="h-16 rounded-2xl font-black border-2 border-primary/20 hover:bg-primary/5 hover:border-primary transition-all text-primary group/btn shadow-xl shadow-primary/5"
                   onClick={handleExport}
                   disabled={exporting}
                 >
                    {exporting ? (
                       <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    ) : (
                       <Sparkles className="h-5 w-5 mr-3 text-amber-500 group-hover/btn:scale-125 transition-transform" />
                    )}
                    {t("exportBtn")}
                 </Button>
                 <div className="flex items-center justify-center gap-4 opacity-50">
                    <Badge variant="outline" className="text-[8px] font-bold">XLSX DASHBOARD</Badge>
                    <Badge variant="outline" className="text-[8px] font-bold">BI DRIVEN</Badge>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* GALERIA DE IMAGENS */}
      <Card className="border-2 border-primary/5 overflow-hidden">
        <div className="bg-primary/5 border-b px-6 py-4 flex items-center justify-between">
           <div>
              <CardTitle className="text-lg flex items-center gap-2"> <ImageIcon className="h-5 w-5 text-primary" /> {t("gallery")} </CardTitle>
              <CardDescription>{t("galleryDesc")}</CardDescription>
           </div>
           <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">💎 Módulo Visual</Badge>
        </div>
        <CardContent className="p-6">
           <div className="grid grid-cols-2 gap-4">
              {galleryUrls.map((url, i) => (
                 <div key={i} className="space-y-2 group">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-dashed border-muted bg-muted/30 group-hover:border-primary/50 transition-colors">
                       {url ? (
                          <>
                             <img src={url} alt={`Galeria ${i+1}`} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => {
                                   const newUrls = [...galleryUrls]
                                   newUrls[i] = ""
                                   setGalleryUrls(newUrls)
                                }}>
                                   <X className="h-4 w-4" />
                                </Button>
                             </div>
                          </>
                       ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                             <ImageIcon className="h-8 w-8 opacity-20" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Espaço {i+1}</span>
                          </div>
                       )}
                       
                       <input 
                         type="file" 
                         className="hidden" 
                         id={`gallery-${i}`}
                         accept="image/*"
                         onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                               if (file.size > 10 * 1024 * 1024) {
                                   toast.error("Imagem demasiado grande! O limite para a galeria é de 10MB.")
                                   return
                                }
                                toast.loading("Enviando imagem...", { id: `up-${i}` })

                               try {
                                  const data = new FormData()
                                  data.append("file", file)
                                  const res = await uploadFile(data)
                                  
                                  if (res?.url) {
                                    const newUrls = [...galleryUrls]
                                    newUrls[i] = res.url
                                    setGalleryUrls(newUrls)
                                    toast.success("Imagem adicionada!", { id: `up-${i}` })
                                  } else {
                                    toast.error(res?.error || "Erro no upload", { id: `up-${i}` })
                                  }
                               } catch (err) {
                                  toast.error("Erro no upload", { id: `up-${i}` })
                               }
                            }
                         }}
                       />
                       
                       {!url && (
                          <button 
                             onClick={() => document.getElementById(`gallery-${i}`)?.click()}
                             className="absolute inset-0 w-full h-full cursor-pointer"
                          />
                       )}
                    </div>
                    <div className="relative">
                       <Input 
                          value={url} 
                          onChange={(e) => {
                             const newUrls = [...galleryUrls]
                             newUrls[i] = e.target.value
                             setGalleryUrls(newUrls)
                          }}
                          className="h-9 text-[10px] font-mono rounded-lg pl-8"
                          placeholder="Link da imagem..."
                       />
                       <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-30" />
                    </div>
                 </div>
              ))}
           </div>
           
           <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 items-start">
              <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                 <p className="text-xs font-bold text-amber-900">{t("galleryTipTitle")}</p>
                 <p className="text-[10px] text-amber-800 leading-relaxed opacity-80">{t("galleryTip")}</p>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* HORÁRIOS DE FUNCIONAMENTO */}
      <Card className="border-2 border-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"> <Clock className="h-5 w-5 text-primary" /> {t("hours")} </CardTitle>
          <CardDescription>{t("hoursDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border-2 divide-y">
            {weekDays.map((day) => {
              const hours = workingHours[day.key] || { open: "09:00", close: "18:00", enabled: false, hasBreak: false, breakStart: "13:00", breakEnd: "14:00" }
              return (
                <div key={day.key} className="flex flex-col p-4 gap-4 bg-background">
                  <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={hours.enabled}
                        onCheckedChange={(checked) =>
                          setWorkingHours({ ...workingHours, [day.key]: { ...hours, enabled: checked } })
                        }
                      />
                      <Label className={cn("font-bold min-w-[120px]", !hours.enabled && "text-muted-foreground", hours.enabled && "text-primary")}>
                        {t(day.key)}
                      </Label>
                    </div>
                    
                    {hours.enabled ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...hours, open: e.target.value } })}
                          className="w-[120px] h-10 border-2 font-mono"
                        />
                        <span className="text-muted-foreground font-bold text-xs uppercase">{t("until")}</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...hours, close: e.target.value } })}
                          className="w-[120px] h-10 border-2 font-mono"
                        />
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-muted-foreground px-4 py-2 bg-muted/50 rounded-lg">{t("closed")}</div>
                    )}
                  </div>

                  {hours.enabled && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pl-0 sm:pl-[52px] pt-3 border-t border-dashed mt-1">
                       <label className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground cursor-pointer shrink-0">
                          <input 
                             type="checkbox" 
                             className="h-4 w-4 rounded border-2 border-muted-foreground accent-primary"
                             checked={hours.hasBreak || false}
                             onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...hours, hasBreak: e.target.checked } })}
                          />
                          {t("lunchBreak")}
                       </label>
                       
                       {hours.hasBreak && (
                          <div className="flex items-center gap-2 justify-between sm:justify-start w-full sm:w-auto">
                             <Input
                                type="time"
                                value={hours.breakStart || "13:00"}
                                onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...hours, breakStart: e.target.value } })}
                                className="w-full sm:w-[100px] h-9 text-xs border-2 text-amber-700 bg-amber-50 rounded-xl"
                             />
                             <span className="text-muted-foreground font-black text-[9px] uppercase px-1">{t("until")}</span>
                             <Input
                                type="time"
                                value={hours.breakEnd || "14:00"}
                                onChange={(e) => setWorkingHours({ ...workingHours, [day.key]: { ...hours, breakEnd: e.target.value } })}
                                className="w-full sm:w-[100px] h-9 text-xs border-2 text-amber-700 bg-amber-50 rounded-xl"
                             />
                          </div>
                       )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* AMENIDADES CONFIG */}
      <div className="relative group">
        {!isFeatureAllowed(salon?.plan || "minimo", "amenities", salon?.dynamicPlans, salon?.status) && (
          <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 rounded-3xl">
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl border flex flex-col items-center gap-4 max-w-xs">
                <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
                </div>
                <div>
                    <h3 className="font-black uppercase tracking-widest text-xs mb-1">Amenidades Bloqueadas</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      A personalização de comodidades e diferenciais está disponível apenas nos planos <strong>Basic</strong> e <strong>Premium</strong>.
                    </p>
                </div>
                <Button variant="default" className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest h-10 shadow-lg shadow-primary/20" asChild>
                    <Link href="/dashboard/configuracoes/planos">FAZER UPGRADE AGORA</Link>
                </Button>
              </div>
          </div>
        )}
        <Card className="border-2 border-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"> <Sparkles className="h-5 w-5 text-primary" /> {t("amenities")} </CardTitle>
            <CardDescription>{t("amenitiesDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {AMENITIES.map((am) => {
                  const isSelected = selectedAmenities.includes(am.id)
                  return (
                    <button
                      key={am.id}
                      onClick={() => toggleAmenity(am.id)}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-xl border-2 transition-all gap-1",
                        isSelected 
                          ? "border-primary bg-primary/10 shadow-md text-primary" 
                          : "border-muted bg-muted/40 text-muted-foreground hover:bg-muted/60"
                      )}
                    >
                      <am.icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-[9px] font-black uppercase text-center leading-none">{tAm(am.id)}</span>
                    </button>
                  )
                })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">{t("amBannerLayout")}</Label>
                  <Select value={formData.amenities_layout} onValueChange={(v) => setFormData({ ...formData, amenities_layout: v })}>
                      <SelectTrigger className="border-2"> <SelectValue /> </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">{t("amGrid")}</SelectItem>
                        <SelectItem value="single-line">{t("amSingle")}</SelectItem>
                        <SelectItem value="carousel">{t("amCarousel")}</SelectItem>
                        <SelectItem value="ticker">{t("amTicker")}</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">{t("amBannerStyle")}</Label>
                  <Select value={formData.amenities_style} onValueChange={(v) => setFormData({ ...formData, amenities_style: v })}>
                      <SelectTrigger className="border-2"> <SelectValue /> </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">{t("amCard")}</SelectItem>
                        <SelectItem value="minimal">{t("amMinimal")}</SelectItem>
                        <SelectItem value="badge">{t("amBadge")}</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NOVO: CONTROLO DE SERVIÇOS (A sua nova solicitação!) */}
      <div className="relative group">
        {!isFeatureAllowed(salon?.plan || "minimo", "service_section", salon?.dynamicPlans, salon?.status) && (
          <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 rounded-3xl">
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl border flex flex-col items-center gap-4 max-w-xs">
                <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <LayoutGrid className="h-8 w-8 text-amber-600 animate-pulse" />
                </div>
                <div>
                    <h3 className="font-black uppercase tracking-widest text-xs mb-1">Layout de Serviços Bloqueado</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      A personalização da vitrine e slogans de serviços está disponível apenas nos planos <strong>Basic</strong> e <strong>Premium</strong>.
                    </p>
                </div>
                <Button variant="default" className="w-full rounded-xl font-black text-[10px] uppercase tracking-widest h-10 shadow-lg shadow-primary/20" asChild>
                    <Link href="/dashboard/configuracoes/planos">FAZER UPGRADE AGORA</Link>
                </Button>
              </div>
          </div>
        )}
        <Card className="border-2 border-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"> <Briefcase className="h-5 w-5 text-primary" /> {t("servicesSettings")} </CardTitle>
            <CardDescription>{t("servicesSub")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                      <LayoutGrid className="h-3 w-3" /> {t("servLayoutLabel")}
                  </Label>
                  <Select value={formData.services_layout} onValueChange={(v) => setFormData({ ...formData, services_layout: v })}>
                      <SelectTrigger className="border-2 h-11"> <SelectValue /> </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">{t("servGrid")}</SelectItem>
                        <SelectItem value="carousel">{t("servCarousel")}</SelectItem>
                        <SelectItem value="list">{t("servList")}</SelectItem>
                      </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic">{t("servCarouselHint")}</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                      <Layers className="h-3 w-3" /> {t("servCardLabel")}
                  </Label>
                  <Select value={formData.services_style} onValueChange={(v) => setFormData({ ...formData, services_style: v })}>
                      <SelectTrigger className="border-2 h-11"> <SelectValue /> </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">{t("servCard")}</SelectItem>
                        <SelectItem value="compact">{t("servCompact")}</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-dashed">
                <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                  <MessageCircle className="h-3 w-3" /> {t("servSubLabel")}
                </Label>
                <Textarea 
                  value={formData.services_subtitles[formData.locale] || ""} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    services_subtitles: {
                        ...formData.services_subtitles,
                        [formData.locale]: e.target.value
                    }
                  })} 
                  className="border-2 rounded-xl h-24 resize-none" 
                  placeholder={t("servSubHolder")}
                />
                <p className="text-[10px] text-muted-foreground italic">Este texto muda conforme o <strong>Idioma de Interface</strong> selecionado no topo. Configure uma frase para cada idioma que suporta.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-primary/10 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"> <MousePointer2 className="h-5 w-5 text-primary" /> {t("bookingConfig")} </CardTitle>
          <CardDescription>{t("slotIntervalDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-3">
              <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                 <Clock className="h-3 w-3" /> {t("slotInterval")}
              </Label>
              <Select value={String(formData.slot_interval)} onValueChange={(v) => setFormData({ ...formData, slot_interval: parseInt(v) })}>
                 <SelectTrigger className="border-2 h-11 bg-background"> <SelectValue /> </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="15">{t("slot15")}</SelectItem>
                    <SelectItem value="30">{t("slot30")}</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-amber-500/10 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"> <ShieldCheck className="h-5 w-5 text-amber-500" /> {t("securitySection")} </CardTitle>
          <CardDescription>{t("securityDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center justify-between p-4 border-2 rounded-xl bg-background shadow-sm">
              <div className="space-y-0.5">
                 <Label className="text-base font-bold">{t("requiresEmailConfirmation")}</Label>
                 <p className="text-sm text-muted-foreground max-w-[400px] leading-relaxed">{t("requiresEmailConfirmationDesc")}</p>
              </div>
              <Switch 
                checked={formData.requires_email_confirmation} 
                onCheckedChange={(checked) => setFormData({ ...formData, requires_email_confirmation: checked })} 
              />
           </div>
        </CardContent>
      </Card>


      {/* Global Design & Socials (Already there) */}
      <Card>
        <CardHeader> <CardTitle className="text-lg flex items-center gap-2"> <Palette className="h-5 w-5 text-primary" /> {t("model")} </CardTitle> </CardHeader>
        <CardContent>
          <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}>
            <SelectTrigger className="h-12 border-2"> <SelectValue /> </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{t("themeDefault")}</SelectItem> <SelectItem value="dark">{t("themeDark")}</SelectItem>
              <SelectItem value="minimal">{t("themeMinimal")}</SelectItem> <SelectItem value="retro">{t("themeRetro")}</SelectItem>
              <SelectItem value="feminine-modern">{t("themeFeminine")}</SelectItem> <SelectItem value="luxury">{t("themeLuxury")}</SelectItem>
              <SelectItem value="safira">{t("themeSafira")}</SelectItem> <SelectItem value="imperial">{t("themeImperial")}</SelectItem>
              <SelectItem value="oceano">{t("themeOceano")}</SelectItem> <SelectItem value="cyber">{t("themeCyber")}</SelectItem>
              <SelectItem value="forest">{t("themeForest")}</SelectItem> <SelectItem value="sunset">{t("themeSunset")}</SelectItem>
              <SelectItem value="arctic">{t("themeArctic")}</SelectItem> <SelectItem value="onyx">{t("themeOnyx")}</SelectItem>
              <SelectItem value="lavender">{t("themeLavender")}</SelectItem> <SelectItem value="emerald">{t("themeEmerald")}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader> <CardTitle className="text-lg flex items-center gap-2"> <Share2 className="h-5 w-5 text-primary" /> {t("socialTitle")} </CardTitle> </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2"> <Label className="text-xs font-bold uppercase">Instagram</Label> <Input value={formData.social_instagram} onChange={(e) => setFormData({...formData, social_instagram: e.target.value})} className="border-2" /> </div>
              <div className="space-y-2"> <Label className="text-xs font-bold uppercase">Facebook</Label> <Input value={formData.social_facebook} onChange={(e) => setFormData({...formData, social_facebook: e.target.value})} className="border-2" /> </div>
           </div>
           <div className="space-y-2"> <Label className="text-xs font-bold uppercase text-green-600">WhatsApp</Label> <Input value={formData.social_whatsapp} onChange={(e) => setFormData({...formData, social_whatsapp: e.target.value})} className="border-2" /> </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
        <Button onClick={handleSave} disabled={saving} className="w-full h-14 bg-primary text-white font-bold text-lg shadow-2xl rounded-2xl hover:scale-[1.02] active:scale-95 transition-all">
          <Save className="h-6 w-6 mr-3" />
          {saving ? t("saving") : t("saveBtn")}
        </Button>
      </div>

      {/* Dialog QR Code */}
      {/* NOVO: PALETA DO DASHBOARD */}
      <Card className="border-2 border-primary/10">
        <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2"> <Palette className="h-5 w-5 text-primary" /> {t("dashboardTheme") || "Paleta do Dashboard"} </CardTitle>
           <CardDescription>Escolha um dos 10 temas modernos para personalizar a sua área de trabalho.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: "default", name: "Esmeralda", color: "#10b981" },
                { id: "midnight", name: "Midnight", color: "#1e293b" },
                { id: "imperial-deep", name: "Imperial", color: "#4c0519" },
                { id: "titanium", name: "Titânio", color: "#334155" },
                { id: "forest", name: "Forest", color: "#064e3b" },
                { id: "obsidian", name: "Obsidian", color: "#000000" },
                { id: "safira", name: "Safira", color: "#3b82f6" },
                { id: "imperial", name: "Imperial", color: "#8b5cf6" },
                { id: "oceano", name: "Oceano", color: "#06b6d4" },
                { id: "fusao", name: "Fusão", color: "#2dd4bf" },
                { id: "cosmico", name: "Cósmico", color: "#6366f1" },
                { id: "aurora", name: "Aurora", color: "#d946ef" },
                { id: "veludo", name: "Veludo", color: "#2563eb" },
                { id: "nebula", name: "Nébula", color: "#a855f7" },
                { id: "onyx", name: "Onyx", color: "#334155" },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setFormData({ ...formData, color_palette: theme.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all hover:scale-105",
                    formData.color_palette === theme.id 
                      ? "border-primary bg-primary/5 shadow-lg" 
                      : "border-transparent bg-muted/30 opacity-70 hover:opacity-100"
                  )}
                >
                  <div 
                    className="h-10 w-10 rounded-full shadow-inner border-2 border-white" 
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{theme.name}</span>
                </button>
              ))}
           </div>
           <p className="text-[10px] text-muted-foreground mt-4 italic text-center">
             * A alteração da paleta afeta apenas este painel administrativo, mantendo a experiência focada em produtividade.
           </p>
        </CardContent>
      </Card>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm sm:max-w-md print:max-w-none print:w-full print:h-full print:m-0 print:p-0 print:border-none print:shadow-none bg-white">
          <DialogHeader className="print:hidden">
            <DialogTitle>{t("qrTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-8" id="qr-container">
             <div className="bg-white p-4 rounded-xl shadow-sm border print:border-none print:shadow-none">
                <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/${salon?.slug}` : "")}`} 
                   alt="QR Code" 
                   className="w-64 h-64 print:w-[80vw] print:h-[80vw]"
                />
             </div>
             <p className="text-center font-bold text-lg hidden print:block mt-8 uppercase tracking-widest">{salon?.name}</p>
             <p className="text-center font-medium opacity-60 hidden print:block">{t("qrScan")}</p>
             <Button className="w-full h-12 font-bold gap-2 print:hidden" onClick={() => window.print()}>
               <Printer className="w-5 h-5" /> {t("printQr")} 
             </Button>
          </div>
          <style>
            {`
              @media print {
                body * { visibility: hidden; }
                #qr-container, #qr-container * { visibility: visible; }
                #qr-container { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
              }
            `}
          </style>

        </DialogContent>
      </Dialog>
    </div>
  )
}
