// <title> <meta name="description" content="SEO" /> <Head>
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Calendar, Building2, Users, LayoutDashboard, Settings, LogOut, ShieldCheck, MessageSquare } from "lucide-react"
import { AdminSidebarFooter } from "./sidebar-footer"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
      redirect("/dashboard")
  }

  const adminUser = {
    id: session.user.id || "",
    name: session.user.name,
    email: session.user.email,
    role: session.user.role
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:block relative">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xs tracking-widest text-foreground block uppercase">Central Core</span>
              <span className="text-[10px] text-muted-foreground font-bold block">AGENDARPRO ECO</span>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
              { icon: Building2, label: "Salões", href: "/admin/salons" },
              { icon: Settings, label: "Gestão de Configurações", href: "/admin/users" },
              { icon: MessageSquare, label: "Tickets Suporte", href: "/admin/tickets" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <AdminSidebarFooter user={adminUser} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b bg-background flex md:hidden items-center px-4 justify-between">
            <span className="font-bold">Super Admin</span>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
