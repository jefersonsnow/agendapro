import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Scissors,
  Wallet,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  getServices, upsertService, deleteService 
} from "@/lib/actions/dashboard"
import { checkServiceLimit } from "@/lib/actions/plan-guard"
import PlanLimitBanner from "@/components/plan-limit-banner"
import ProfessionalStatsView from "@/components/professional-stats-view"
import QRCodeModal from "@/components/qr-code-modal"
import AnnouncementsBanner from "@/components/announcements-banner"
import { isFeatureAllowed } from "@/lib/plan-limits"
import { Zap } from "lucide-react"
import DashboardFilters from "@/components/dashboard-filters"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const locale = resolvedParams?.locale || routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "DashboardHome" })
  
  const session = await auth()
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  // SEMPRE buscar o role diretamente na BD (o JWT pode estar desatualizado)
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        { email: session.user.email as string }
      ]
    },
    select: { role: true }
  })
  const userRole = dbUser?.role || "professional"

  // Se for Profissional, mostrar dashboard interativo com filtros
  if (userRole === "professional") {
    return (
        <div className="space-y-6">
          <AnnouncementsBanner />
          <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600">
            {t("hello")}, {(session.user.name || t("professional")).split(' ')[0]} ⚡
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("productivityDesc")}
          </p>
        </div>

        <ProfessionalStatsView />
      </div>
    )
  }

  // Buscar salão do usuário (Dono / Manager / Rececionista)
  let salonId = null
  let salonData = null

  // 1. Tentar como Dono
  const ownerSalon = await prisma.salon.findFirst({
    where: { owner_id: session.user.id }
  })

  if (ownerSalon) {
    salonId = ownerSalon.id
    salonData = ownerSalon
  } else {
    // 2. Tentar como Equipas (Manager / Receptionist)
    const staffMember = await prisma.staff.findFirst({
      where: { user_id: session.user.id },
      include: { salon: true }
    })
    if (staffMember?.salon) {
      salonId = staffMember.salon.id
      salonData = staffMember.salon
    }
  }

  if (!salonId || !salonData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{t("salonNotFound")}</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {t("salonNotFoundDesc")}
        </p>
      </div>
    )
  }

  const salon = salonData

  // Se for Rececionista, mostrar dashboard focado em agendamentos e recepção
  if (userRole === "receptionist") {
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0))
      const endOfDay = new Date(today.setHours(23, 59, 59, 999))

      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          salon_id: salon.id,
          starts_at: { gte: startOfDay, lte: endOfDay }
        },
        include: {
          client: { select: { name: true } },
          staff: { select: { name: true } },
          service: { select: { name: true } }
        },
        orderBy: { starts_at: "asc" },
        take: 10
      })

      return (
        <div className="space-y-6">
          <AnnouncementsBanner />
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {t("hello")}, {session.user.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("welcomeBack")} {salon.name}.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
             {/* Link de Reservas Online */}
             <Card className="bg-primary/5 border-primary/20 shadow-sm rounded-2xl flex flex-col justify-center">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{t("bookingPage")}</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        {t("bookingPageDesc")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-background border rounded-2xl p-2 pl-4 shadow-inner">
                      <span className="text-sm font-mono truncate flex-1 text-muted-foreground">
                        {baseUrl}/{salon.slug}
                      </span>
                      <div className="flex gap-2">
                        {isFeatureAllowed(salon.plan || "free", "qr_code", null, salon.status) ? (
                          <QRCodeModal 
                            url={`${baseUrl}/${salon.slug}`} 
                            salonName={salon.name} 
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 border border-amber-200 rounded-xl mr-1">
                             <Zap className="h-3 w-3 fill-amber-600" /> PRO
                          </div>
                        )}
                        <Button className="rounded-xl px-5 h-11 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                            {t("copyLink")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
             </Card>

             {/* Próximos Agendamentos */}
             <Card className="rounded-2xl shadow-sm border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold">{t("upcomingAppointments")}</CardTitle>
                  <Link href="/dashboard/agenda">
                    <Button variant="ghost" size="sm" className="font-bold text-primary">{t("viewAll")}</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map((apt) => (
                        <div key={apt.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group cursor-default">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Clock className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-bold group-hover:text-primary transition-colors">{apt.client?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                   {apt.service?.name} com {apt.staff?.name}
                                </p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-black text-lg">
                                 {new Date(apt.starts_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-muted/50">
                                 {apt.status}
                              </Badge>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                         <Calendar className="h-10 w-10 mx-auto opacity-20 mb-3" />
                         {t("noAppointmentsToday")}
                      </div>
                    )}
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>
      )
  }

  // Buscar estatísticas (Owner Dashboard)
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))
  
  const now = new Date()
  
  // Lógica de datas para o filtro (conforme pedido: padrão mês atual)
  const fromParam = resolvedSearchParams?.from
  const toParam = resolvedSearchParams?.to
  
  const filterStart = fromParam 
    ? new Date(fromParam + 'T00:00:00') 
    : new Date(now.getFullYear(), now.getMonth(), 1)
    
  const filterEnd = toParam 
    ? new Date(toParam + 'T23:59:59') 
    : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [
    totalClients,
    todayAppointments,
    filteredStats,
    commissionsByStaff,
    allStaff,
    todayAppointmentsList,
  ] = await Promise.all([
    prisma.client.count({
      where: { salon_id: salon.id }
    }),
    prisma.appointment.count({
      where: { 
        salon_id: salon.id,
        starts_at: { gte: startOfDay, lte: endOfDay },
        status: { not: "cancelled" }
      }
    }),
    prisma.appointment.aggregate({
      where: {
        salon_id: salon.id,
        starts_at: { gte: filterStart, lte: filterEnd },
        status: "completed"
      },
      _sum: { price: true }
    }),
    prisma.appointment.groupBy({
      by: ['staff_id'],
      where: {
        salon_id: salon.id,
        starts_at: { gte: filterStart, lte: filterEnd },
        status: "completed"
      },
      _sum: { price: true }
    }),
    prisma.staff.findMany({
      where: { salon_id: salon.id },
      select: { id: true, commission_rate: true }
    }),
    prisma.appointment.findMany({
      where: {
        salon_id: salon.id,
        starts_at: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        client: { select: { name: true } },
        staff: { select: { name: true } },
        service: { select: { name: true } }
      },
      orderBy: { starts_at: "asc" },
      take: 5
    })
  ])

  const filteredRevenue = Number(filteredStats._sum.price || 0)
  
  const totalCommissions = commissionsByStaff.reduce((acc, current) => {
    const staff = allStaff.find(s => s.id === current.staff_id)
    const rate = Number(staff?.commission_rate || 0)
    return acc + (Number(current._sum.price || 0) * rate / 100)
  }, 0)

  const stats = [
    {
      name: t("appointmentsToday"),
      value: todayAppointments || 0,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      name: t("totalClients"),
      value: totalClients || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: t("grossRevenue"),
      value: new Intl.NumberFormat(locale === 'pt' ? 'pt-PT' : locale, {
        style: "currency",
        currency: "EUR",
      }).format(filteredRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: t("totalCommissions"),
      value: new Intl.NumberFormat(locale === 'pt' ? 'pt-PT' : locale, {
        style: "currency",
        currency: "EUR",
      }).format(totalCommissions),
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-6">
      <AnnouncementsBanner />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("welcomeTo")} {salon.name}
          </h1>
          <p className="text-muted-foreground">
            {t("salonSummary")}
          </p>
        </div>

        <DashboardFilters />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Today's Appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/dashboard/agenda">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Calendar className="h-4 w-4" />
                {t("viewFullAgenda")}
              </Button>
            </Link>
            <Link href="/dashboard/clientes">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Users className="h-4 w-4" />
                {t("addNewClient")}
              </Button>
            </Link>
            <Link href="/dashboard/servicos">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Clock className="h-4 w-4" />
                {t("manageServices")}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("upcomingAppointments")}</CardTitle>
            <Link href="/dashboard/agenda">
              <Button variant="ghost" size="sm">
                {t("viewAll")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todayAppointmentsList && todayAppointmentsList.length > 0 ? (
              <div className="space-y-3">
                {todayAppointmentsList.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {appointment.client?.name || "Cliente"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service?.name || "Serviço"} com{" "}
                          {appointment.staff?.name || "Profissional"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Date(appointment.starts_at).toLocaleTimeString(
                          "pt-PT",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {appointment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  {t("noAppointmentsToday")}
                </p>
                <Link href="/dashboard/agenda" className="mt-2">
                  <Button variant="link" className="text-primary">
                    {t("createAppointment")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Public Booking Link */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">{t("bookingPage")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("shareLinkDesc")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-3 py-1.5 text-sm font-mono text-xs">
                {salon.slug}
              </code>
              <Button variant="outline" size="sm">
                {t("copy")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
