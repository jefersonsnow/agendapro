import { Scissors, MapPin, Phone, Mail, Globe, Search, Sparkles, ChevronRight, MessageCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import { headers } from "next/headers"

interface Params {
  locale: string
}

interface SearchParams {
  search?: string
  city?: string
}

// Mapeamento de intervalos de códigos postais de Portugal para principais distritos/cidades
function getCityPostalRanges(cityName: string): { min: number, max: number }[] {
  const normalized = cityName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  
  if (normalized.includes("porto")) {
    return [{ min: 4000, max: 4699 }]
  }
  if (normalized.includes("vila real")) {
    return [{ min: 5000, max: 5299 }]
  }
  if (normalized.includes("braga")) {
    return [{ min: 4700, max: 4899 }]
  }
  if (normalized.includes("lisboa") || normalized.includes("lisbon")) {
    return [
      { min: 1000, max: 1999 },
      { min: 2500, max: 2799 }
    ]
  }
  if (normalized.includes("setubal")) {
    return [{ min: 2800, max: 2999 }]
  }
  if (normalized.includes("aveiro")) {
    return [{ min: 3700, max: 3899 }]
  }
  if (normalized.includes("coimbra")) {
    return [{ min: 3000, max: 3399 }]
  }
  if (normalized.includes("faro") || normalized.includes("algarve")) {
    return [{ min: 8000, max: 8999 }]
  }
  if (normalized.includes("viseu")) {
    return [{ min: 3400, max: 3699 }]
  }
  if (normalized.includes("viana do castelo")) {
    return [{ min: 4900, max: 4999 }]
  }
  if (normalized.includes("braganca")) {
    return [{ min: 5300, max: 5399 }]
  }
  if (normalized.includes("guarda")) {
    return [{ min: 6300, max: 6499 }]
  }
  if (normalized.includes("castelo branco")) {
    return [{ min: 6000, max: 6299 }]
  }
  if (normalized.includes("portalegre")) {
    return [{ min: 7300, max: 7499 }]
  }
  if (normalized.includes("evora")) {
    return [{ min: 7000, max: 7299 }]
  }
  if (normalized.includes("beja")) {
    return [{ min: 7800, max: 7999 }]
  }
  if (normalized.includes("santarem")) {
    return [{ min: 2000, max: 2399 }]
  }
  if (normalized.includes("leiria")) {
    return [{ min: 2400, max: 2499 }]
  }
  
  return []
}

// Extrai os 4 dígitos iniciais do código postal português (XXXX-XXX ou XXXX)
function extractPostalCodePrefix(address: string): number | null {
  // Tenta formato XXXX-XXX
  const match7 = address.match(/\b(\d{4})-\d{3}\b/)
  if (match7) {
    return parseInt(match7[1], 10)
  }
  // Tenta formato XXXX isolado
  const match4 = address.match(/\b(\d{4})\b/g)
  if (match4) {
    for (let i = match4.length - 1; i >= 0; i--) {
      const val = parseInt(match4[i], 10)
      if (val >= 1000 && val <= 9999) {
        return val
      }
    }
  }
  return null
}

// Verifica se o endereço de um salão corresponde à cidade pesquisada usando código postal ou fallback
function salonMatchesCity(address: string, cityQuery: string): boolean {
  if (!address || !cityQuery) return false
  
  const postalPrefix = extractPostalCodePrefix(address)
  const ranges = getCityPostalRanges(cityQuery)
  
  if (postalPrefix !== null && ranges.length > 0) {
    return ranges.some(r => postalPrefix >= r.min && postalPrefix <= r.max)
  }
  
  // Fallback para quando não há código postal ou a cidade/região não está mapeada explicitamente
  const normalizedAddress = address.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const normalizedQuery = cityQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  
  if (normalizedAddress.includes(normalizedQuery)) {
    return true
  }
  
  // Casos especiais de correspondência regional
  if (normalizedQuery === "vila real" && normalizedAddress.includes("tras-os-montes")) {
    return true
  }
  
  return false
}

export default async function PartnersPage({
  params,
  searchParams,
}: {
  params: Promise<Params> | Params
  searchParams: Promise<SearchParams> | SearchParams
}) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams?.locale || "pt"

  const resolvedSearchParams = await Promise.resolve(searchParams)
  const search = resolvedSearchParams?.search || ""
  const city = resolvedSearchParams?.city || ""

  const headersList = await headers()
  const userCity = city || headersList.get("x-vercel-ip-city") || ""

  // Fetch active salons that match the search query (name, description, address)
  const salons = await prisma.salon.findMany({
    where: {
      status: "active",
      slug: { not: "admin" }, // NEVER show the admin salon
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: {
      created_at: "desc",
    },
  })

  // Filter by city in memory using our postal code matching logic
  const filteredSalons = city
    ? salons.filter(salon => salonMatchesCity(salon.address || "", city))
    : salons

  // Sort salons: prioritize those matching the user's city (IP city or searched city)
  const sortedSalons = [...filteredSalons].sort((a, b) => {
    if (!userCity) return 0
    const aMatches = salonMatchesCity(a.address || "", userCity)
    const bMatches = salonMatchesCity(b.address || "", userCity)
    if (aMatches && !bMatches) return -1
    if (!aMatches && bMatches) return 1
    return 0
  })

  // Gradient fallbacks for covers
  const gradients = [
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
  ]

  return (
    <div className="theme-magenta min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg overflow-hidden shadow-lg transition-transform group-hover:scale-105">
              <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 uppercase">
              AgendarPro
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href={`/${locale}#planos`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
              Planos
            </Link>
            <Link href={`/${locale}/parceiros`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity underline decoration-2 underline-offset-4">
              Parceiros
            </Link>
            <Link href={`/${locale}/loja`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
              Loja
            </Link>
            <Link href={`/${locale}/contacto`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* WhatsApp Link */}
            <a 
              href="https://wa.me/351910664744?text=Olá! Estou na página de Parceiros e gostaria de saber mais."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20 hover:scale-110 transition-transform relative group"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </a>
          </div>
        </div>
      </header>

      <main className="relative pt-12 pb-24">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        <div className="absolute top-[-10%] left-[-10%] -z-10 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] opacity-40"></div>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Heading */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary mb-6 backdrop-blur-sm uppercase tracking-widest animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Rede de Parceiros</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 max-w-3xl leading-[0.9] italic">
              Encontra o <span className="text-primary italic">parceiro ideal</span> perto de ti.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl font-medium">
              Explora e reserva diretamente nos melhores salões, barbearias e clínicas de estética que utilizam o ecossistema AgendarPro.
            </p>
          </div>

          {/* Search bar & filter form */}
          <div className="bg-card/50 backdrop-blur-xl p-6 rounded-[2rem] border-2 shadow-xl max-w-4xl mx-auto mb-16 relative overflow-hidden group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[2rem] blur-xl opacity-50"></div>
            <form method="GET" action={`/${locale}/parceiros`} className="relative z-10 flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Nome do salão ou serviços..."
                  className="w-full h-14 pl-12 pr-4 bg-background/80 border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-inner"
                />
              </div>
              <div className="w-full md:w-64 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="city"
                  defaultValue={city}
                  placeholder="Cidade..."
                  className="w-full h-14 pl-12 pr-4 bg-background/80 border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-inner"
                />
              </div>
              <Button type="submit" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all shrink-0">
                Pesquisar
              </Button>
            </form>

            {userCity && (
              <div className="relative z-10 mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 bg-muted/40 px-3 py-1.5 rounded-lg w-fit">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>Salões próximos de: <strong className="text-primary">{userCity}</strong></span>
              </div>
            )}
          </div>

          {/* Partners Listing Grid */}
          {sortedSalons.length === 0 ? (
            <div className="py-20 text-center bg-card/30 rounded-3xl border-2 border-dashed flex flex-col items-center max-w-xl mx-auto shadow-sm">
              <Scissors className="h-16 w-16 text-muted-foreground/20 mb-4 animate-bounce" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Nenhum parceiro encontrado</h3>
              <p className="text-muted-foreground font-medium mb-6 px-6">
                Não conseguimos encontrar nenhum salão correspondente aos teus filtros. Tenta expandir os termos de pesquisa.
              </p>
              <Button asChild className="rounded-xl">
                <Link href={`/${locale}/parceiros`}>Ver Todos os Parceiros</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedSalons.map((salon, i) => {
                const coverGradient = gradients[i % gradients.length]
                const isNearby = userCity && salonMatchesCity(salon.address || "", userCity)

                return (
                  <div
                    key={salon.id}
                    className="group bg-card rounded-[2.5rem] border-2 overflow-hidden shadow-md hover:shadow-2xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full relative"
                  >
                    {isNearby && (
                      <div className="absolute top-4 right-4 z-20 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md animate-pulse">
                        Próximo de si
                      </div>
                    )}

                    {/* Cover Photo */}
                    <div className="h-36 w-full relative overflow-hidden bg-muted">
                      {salon.cover_url ? (
                        <img
                          src={salon.cover_url}
                          alt={salon.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${coverGradient} opacity-90`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* Logo/Avatar */}
                    <div className="px-6 relative -mt-10 mb-4 flex justify-between items-end z-10">
                      <div className="h-20 w-20 rounded-2xl border-4 border-card bg-background overflow-hidden shadow-lg shrink-0">
                        {salon.logo_url ? (
                          <img src={salon.logo_url} alt={salon.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center font-bold text-2xl text-primary uppercase">
                            {salon.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Partner Info */}
                    <div className="px-6 pb-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-2xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {salon.name}
                        </h3>
                        {salon.description ? (
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                            {salon.description}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic font-medium">
                            Sem descrição disponível no momento. Visite a página de marcações para conhecer os serviços.
                          </p>
                        )}
                      </div>

                      {/* Info Badges */}
                      <div className="space-y-2 mb-6 pt-4 border-t border-muted text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {salon.address && (
                          <div className="flex items-start gap-2 text-foreground/80">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <span className="line-clamp-2 leading-tight normal-case font-medium">{salon.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                        <Button
                          variant="outline"
                          asChild
                          className="rounded-xl h-12 border-2 text-xs font-black uppercase tracking-wider"
                        >
                          <Link href={`/${locale}/${salon.slug}`} target="_blank" rel="noopener noreferrer">Ver Página</Link>
                        </Button>
                        <Button
                          asChild
                          className="rounded-xl h-12 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                        >
                          <Link href={`/${locale}/${salon.slug}/agendar`} target="_blank" rel="noopener noreferrer">Reservar</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg overflow-hidden shadow-lg">
                <img src="/favicon.png" alt="AgendarPro" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight uppercase">AgendarPro</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
              <Link href={`/${locale}/termos`} className="hover:text-primary transition-colors">Termos</Link>
              <Link href={`/${locale}/privacidade`} className="hover:text-primary transition-colors">Privacidade</Link>
              <Link href={`/${locale}/contacto`} className="hover:text-primary transition-colors">Contacto</Link>
            </div>

            <p className="text-sm text-muted-foreground text-center md:text-right">
              &copy; {new Date().getFullYear()} AgendarPro — Desenvolvido por <a href="https://napp.pt" target="_blank" className="hover:text-primary underline transition-all font-bold">Napp Sistemas</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
