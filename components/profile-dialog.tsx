"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProfile, updateProfile } from "@/lib/actions/profile"
import { uploadFile } from "@/lib/actions/upload"
import { toast } from "sonner"
import { User, Phone, Mail, Lock, Percent, Save, Loader2, Camera, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const t = useTranslations("Dashboard")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    image: "",
    commission_rate: 0
  })

  useEffect(() => {
    if (open) {
      fetchProfile()
    }
  }, [open])

  async function fetchProfile() {
    setLoading(true)
    try {
      const data = await getProfile()
      if (data) {
        setProfile(data)
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          password: "",
          image: data.image || data.avatar_url || "",
          commission_rate: data.commission_rate || 0
        })
      }
    } catch (err) {
      toast.error("Erro ao carregar perfil")
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    try {
      const res = await uploadFile(formDataUpload)
      if (res?.url) {
        setFormData(prev => ({ ...prev, image: res.url }))
        toast.success("Foto carregada!")
      } else if (res?.error) {
        toast.error(res.error)
      }
    } catch (err: any) {
      toast.error("Erro ao carregar imagem")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(formData)
      toast.success("Perfil atualizado com sucesso!")
      // Disparar evento para atualizar a sidebar e outros componentes
      window.dispatchEvent(new Event("profileUpdated"))
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar perfil")
    } finally {
      setSaving(false)
    }
  }

  const isOwner = profile?.role === "owner"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-0 overflow-y-auto max-h-[90vh] border-none shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] bg-background animate-in zoom-in duration-300">
        <DialogHeader className="p-5 sm:p-8 bg-primary/5 border-b relative">
           <div className="flex items-center gap-4">
              <div className="relative group/avatar">
                <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-black shadow-lg shadow-primary/20 shrink-0 overflow-hidden">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : formData.image ? (
                    <img src={formData.image} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    formData.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-6 w-6 bg-white border border-muted shadow-sm rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95"
                  title="Alterar foto"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">{profile?.name || "O meu Perfil"}</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium flex items-center gap-2">
                   Gerencie os seus dados pessoais e preferências.
                   <span className="uppercase text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black tracking-widest">{profile?.role}</span>
                </DialogDescription>
              </div>
           </div>
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
           />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4 sm:space-y-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Carregando dados...</p>
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="profile-name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="pl-10 h-11 rounded-xl border-muted bg-muted/5 focus:bg-background transition-all"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="profile-email"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="pl-10 h-11 rounded-xl border-muted bg-muted/5 focus:bg-background transition-all"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Telefone</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="profile-phone"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="pl-10 h-11 rounded-xl border-muted bg-muted/5 focus:bg-background transition-all"
                      placeholder="+351 000 000 000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Senha</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="profile-password"
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="pl-10 h-11 rounded-xl border-muted bg-muted/5 focus:bg-background transition-all"
                      placeholder="Nova senha (opcional)"
                    />
                  </div>
                </div>

                <div className="space-y-2 grow md:col-span-2">
                  <Label htmlFor="profile-image" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Avatar / Foto de Perfil</Label>
                  <div className="relative group">
                    <button 
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary hover:text-primary transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <Input 
                      id="profile-image"
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                      className="pl-10 h-11 rounded-xl border-muted bg-muted/5 focus:bg-background transition-all pr-20"
                      placeholder="URL da imagem..."
                    />
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute right-1 top-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                    >
                      <Upload className="h-3 w-3 mr-1" /> Upar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-commission" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center justify-between">
                    Comissão (%)
                    {!isOwner && <span className="text-[9px] lowercase text-amber-600 font-medium italic">Somente o Proprietário pode alterar</span>}
                  </Label>
                  <div className="relative group">
                    <Percent className={cn("absolute left-3 top-3 h-4 w-4 transition-colors", isOwner ? "text-muted-foreground group-focus-within:text-primary" : "text-muted-foreground/30")} />
                    <Input 
                      id="profile-commission"
                      type="number"
                      value={formData.commission_rate}
                      onChange={e => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
                      className={cn(
                        "pl-10 h-11 rounded-xl transition-all font-mono font-bold",
                        isOwner ? "border-muted bg-muted/5 focus:bg-background" : "bg-muted/20 border-muted opacity-80 cursor-not-allowed"
                      )}
                      disabled={!isOwner}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <DialogFooter className="pt-4 border-t gap-2 sm:gap-3 flex-col sm:flex-row">
            <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="h-10 sm:h-12 rounded-xl sm:rounded-2xl px-6 font-bold order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
                type="submit" 
                disabled={saving || loading || uploading}
                className="h-10 sm:h-12 rounded-xl sm:rounded-2xl px-6 font-black bg-primary shadow-xl shadow-primary/20 gap-2 min-w-[140px] order-1 sm:order-2"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
