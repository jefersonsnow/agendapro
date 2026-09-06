// <title> <meta name="description" content="SEO" /> <Head>
"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  Users,
  Scissors,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Home,
  UserCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter, useParams } from "next/navigation"
import { signOut } from "next-auth/react"
import { getUserRole } from "@/lib/actions/dashboard"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import TrialStatusBanner from "@/components/trial-status-banner"
import ProfileDialog from "@/components/profile-dialog"
import AutoRefresh from "@/components/auto-refresh"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations("Dashboard")

  const navigation = [
    { name: t("home"), href: "/dashboard", icon: Home },
    { name: t("agenda"), href: "/dashboard/agenda", icon: Calendar },
    { name: t("clients"), href: "/dashboard/clientes", icon: Users },
    { name: t("team"), href: "/dashboard/equipa", icon: UserCircle },
    { name: t("services"), href: "/dashboard/servicos", icon: Scissors },
    { name: t("reports"), href: "/dashboard/relatorios", icon: BarChart3 },
    { name: t("settings"), href: "/dashboard/configuracoes", icon: Settings },
    { name: t("help"), href: "/dashboard/ajuda", icon: HelpCircle },
  ]

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState({ 
    role: "professional", 
    name: "", 
    image: null as string | null,
    status: "active",
    plan: "minimo",
    trialEndsAt: null as string | null,
    salonSlug: "",
    colorPalette: "default"
  })
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string || "pt"

  useEffect(() => {
    // Load collapse state from localStorage
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved === "true") setCollapsed(true)

    async function fetchRole() {
      try {
        const data = await getUserRole()
        if (data) {
          setUser(data as any)
        }
      } catch (e) {
        console.error("Error fetching role in layout:", e)
      }
    }
    fetchRole()
    window.addEventListener("profileUpdated", fetchRole)
    return () => window.removeEventListener("profileUpdated", fetchRole)
  }, [pathname, router])

  const toggleCollapse = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
  }

  const filteredNavigation = navigation.filter((item) => {
    // 1. ADMIN / OWNER / MANAGER vêem TUDO
    if (user.role === "admin" || user.role === "owner" || user.role === "manager") return true
    
    // 2. Todos vêem Início e Agenda por defeito
    if (item.name === t("home") || item.name === t("agenda")) return true

    // 3. Rececionista vê Clientes, Equipa e Serviços
    if (user.role === "receptionist") {
      return [t("clients"), t("team"), t("services")].includes(item.name)
    }
    
    // Profissional regular vê apenas Início e Agenda
    return false
  })

  const handleLogout = () => {
    const callbackUrl = user.salonSlug 
      ? `/${locale}/${user.salonSlug}/login` 
      : `/${locale}/auth/login`
    
    signOut({ callbackUrl })
  }

  if (user.status === "cancelled") {
    if (typeof window !== 'undefined') {
      window.location.href = "https://agendar.napp.pt/parceiros";
    }
    return null;
  }

  if (user.status === "suspended") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/20 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
         
         <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl relative z-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="h-24 w-24 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto border border-red-500/30">
               <X className="h-12 w-12 text-red-500" />
            </div>
            <div className="space-y-4">
               <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Acesso <span className="text-red-500">Suspenso</span></h1>
               <p className="text-slate-400 font-medium leading-relaxed">
                  Lamentamos, mas o acesso a esta conta foi temporariamente desativado pela administração.
               </p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-[11px] font-mono text-slate-500 uppercase tracking-widest leading-loose">
               Motivo: Falta de Pagamento ou <br/> Violação dos Termos
            </div>
            <Button 
               onClick={handleLogout}
               variant="outline" 
               className="w-full h-14 rounded-2xl border-white/10 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs"
            >
               Sair da Conta
            </Button>
         </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen bg-muted/30 transition-colors duration-500", user.colorPalette !== "default" && `theme-${user.colorPalette}`)}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer (Only < 1024px) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-card border-r transition-transform duration-300 ease-in-out lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden shadow-md">
              <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase text-foreground">AgendarPro</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t space-y-4 bg-card">
          <button 
            onClick={() => {
              setSidebarOpen(false)
              setProfileOpen(true)
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-all group text-left"
          >
             <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/10 shrink-0 overflow-hidden">
                {user.image ? (
                   <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                   user.name?.charAt(0).toUpperCase()
                )}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate text-foreground">{user.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{user.role}</p>
             </div>
          </button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-11 rounded-xl"
          >
            <LogOut className="h-5 w-5" />
            {t("logout")}
          </Button>
          <div className="pt-2 text-[10px] text-muted-foreground/40 text-center uppercase tracking-widest leading-loose border-t">
             Desenvolvido por <br/> <a href="https://napp.pt" target="_blank" className="hover:text-primary transition-colors font-black">Napp Sistemas</a>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar (Only >= 1024px) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col border-r bg-card transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-20" : "w-64"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden shadow-md">
              <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
            </div>
            {!collapsed && <span className="font-bold text-lg tracking-tight uppercase whitespace-nowrap text-foreground">AgendarPro</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8 hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : ""}
                className={cn(
                  "flex items-center rounded-lg transition-colors whitespace-nowrap",
                  collapsed ? "px-0 justify-center h-10 w-full" : "px-3 py-2.5 text-sm font-medium gap-3",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
        <div className={cn(
          "shrink-0 p-4 border-t space-y-4 bg-card transition-all",
          collapsed ? "items-center" : ""
        )}>
           <button 
            onClick={() => setProfileOpen(true)}
            title={collapsed ? user.name : ""}
            className={cn(
              "w-full flex items-center rounded-2xl hover:bg-muted transition-all group text-left",
              collapsed ? "p-0 justify-center h-12" : "p-3 gap-3"
            )}
          >
             <div className="h-10 w-10 shrink-0 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/10 overflow-hidden">
                {user.image ? (
                   <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                   user.name?.charAt(0).toUpperCase()
                )}
             </div>
             {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate text-foreground">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{user.role}</p>
                </div>
             )}
          </button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            title={collapsed ? t("logout") : ""}
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-foreground h-11 rounded-xl transition-all",
              collapsed ? "p-0 justify-center" : "gap-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{t("logout")}</span>}
          </Button>
          {!collapsed && (
            <div className="pt-2 text-[10px] text-muted-foreground/40 text-center uppercase tracking-widest border-t">
              Desenvolvido por <a href="https://napp.pt" target="_blank" className="hover:text-primary transition-colors font-black">Napp Sistemas</a>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "min-h-screen transition-all duration-300 flex flex-col",
        "pl-0", // Always 0 on mobile (< 1024px)
        collapsed ? "lg:pl-20" : "lg:pl-64" // Padding only on Desktop (>= 1024px)
      )}>
        {/* Mobile Header (Only < 1024px) */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-2 lg:p-4 bg-background text-foreground transition-colors duration-500">
          <AutoRefresh interval={120000} />
          <TrialStatusBanner plan={user.plan} trialEndsAt={(user as any).trialEndsAt} />
          {children}
          <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
        </main>
      </div>
    </div>
  )
}

