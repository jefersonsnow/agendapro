import { Scissors, MapPin, Globe, MessageCircle, Sparkles, AlertCircle, ChevronRight, Star, Mail, Facebook, Instagram } from "lucide-react"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import PhoneRevealer from "./phone-revealer"

interface Params {
  locale: string
  slug: string
}

// Mapeamento de correspondência de cidade para ordenação local
function salonMatchesCity(address: string, city: string): boolean {
  if (!address || !city) return false
  const normalizedAddress = address.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const normalizedCity = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return normalizedAddress.includes(normalizedCity)
}

// Extrai prefixo de código postal para ordenação secundária
function extractPostalCodePrefix(address: string): string | null {
  const match = address.match(/\b(\d{4})\b/)
  return match ? match[1] : null
}

export async function generateMetadata({ params }: { params: Promise<Params> | Params }) {
  const resolvedParams = await Promise.resolve(params)
  const slug = resolvedParams.slug

  const lead = await prisma.lead.findUnique({
    where: { slug }
  })

  if (!lead) return {}

  return {
    title: `${lead.name} - ${lead.address || lead.city} | AgendarPro`,
    description: `Contactos, telefone, morada e informações para ${lead.name} em ${lead.city || "Portugal"}. Descubra os melhores salões e reserve online no AgendarPro.`,
    alternates: {
      canonical: `/locais/${lead.slug}`
    }
  }
}

export default async function LeadPage({ params }: { params: Promise<Params> | Params }) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || "pt"
  const slug = resolvedParams.slug

  // 1. Procurar o Lead na base de dados
  const lead = await prisma.lead.findUnique({
    where: { slug },
    include: { salon: true }
  })

  if (!lead) {
    notFound()
  }

  // 2. Se já foi reivindicado (claimed) e tem salão associado: Redirecionamento Permanente (308)
  if (lead.status === "claimed" && lead.salon) {
    permanentRedirect(`/${locale}/${lead.salon.slug}`)
  }

  // 3. Buscar salões parceiros reais para exibir recomendações próximas
  const activeSalons = await prisma.salon.findMany({
    where: {
      status: "active",
      slug: { not: "admin" } // Omitir admin
    }
  })

  // Ordenar salões parceiros por proximidade geográfica ao lead
  const leadCity = lead.city || ""
  const leadPostal = lead.address ? extractPostalCodePrefix(lead.address) : null

  const sortedPartners = [...activeSalons].sort((a, b) => {
    let scoreA = 0
    let scoreB = 0

    if (leadCity) {
      if (salonMatchesCity(a.address || "", leadCity)) scoreA += 10
      if (salonMatchesCity(b.address || "", leadCity)) scoreB += 10
    }

    if (leadPostal) {
      const aPostal = extractPostalCodePrefix(a.address || "")
      const bPostal = extractPostalCodePrefix(b.address || "")
      if (aPostal === leadPostal) scoreA += 5
      if (bPostal === leadPostal) scoreB += 5
    }

    return scoreB - scoreA
  }).slice(0, 4) // Exibir no máximo 4 parceiros mais próximos

  // Mensagem personalizada do WhatsApp contendo propaganda do AgendarPro
  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : ""
  const waNumber = cleanPhone.startsWith("351") ? cleanPhone : "351" + cleanPhone
  const waMessage = encodeURIComponent(`Olá! Vi o vosso salão no Agendar Napp. Gostaria de agendar um serviço. Sabiam que podem receber marcações automáticas grátis com o AgendarPro? Conheçam aqui: https://agendar.pro`);
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  const defaultCoverImage = "/agendarpro-ad.webp"

  // Lista de gradientes de cores para salões sem imagem
  const gradients = [
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
  ]

  // Categoria em formato legível
  const categoryLabel = lead.category 
    ? lead.category.charAt(0).toUpperCase() + lead.category.slice(1)
    : "Salão de Beleza"

  return (
    <div className="theme-magenta min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      {/* Script para dados estruturados JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": lead.name,
            "image": lead.cover_url || defaultCoverImage,
            "telephone": lead.phone,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": lead.address || "",
              "addressLocality": lead.city || "",
              "addressCountry": "PT"
            },
            "url": lead.website || `https://agendar.pro/locais/${lead.slug}`
          })
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
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
            <Link href={`/${locale}/parceiros`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
              Parceiros
            </Link>
            <Link href={`/${locale}/loja`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
              Loja
            </Link>
            <Link href={`/${locale}/contacto`} className="text-sm font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
              Contacto
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative pt-8 pb-24">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap py-1">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">Início</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-foreground">{categoryLabel}</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-foreground">{lead.city || "Portugal"}</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-primary truncate">{lead.name}</span>
          </nav>

          {/* Main Info Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Left Info Column */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div>
                <div className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1 text-[10px] font-black text-orange-600 mb-4 uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 mr-2" />
                  <span>Informação Pública</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-[0.9] italic text-foreground">
                  {lead.name}
                </h1>
                
                <div className="space-y-3 mb-6">
                  {lead.address && (
                    <div className="flex items-start gap-2.5 text-muted-foreground font-medium text-base">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{lead.address}</span>
                    </div>
                  )}

                  {lead.email && (
                    <div className="flex items-start gap-2.5 text-muted-foreground font-medium text-base">
                      <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors">
                        {lead.email}
                      </a>
                    </div>
                  )}

                  {(lead.facebook || lead.instagram) && (
                    <div className="flex items-center gap-4 text-muted-foreground font-medium text-base pt-1">
                      {lead.facebook && (
                        <a
                          href={lead.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                          <Facebook className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm font-semibold">Facebook</span>
                        </a>
                      )}
                      {lead.instagram && (
                        <a
                          href={lead.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                          <Instagram className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm font-semibold">Instagram</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Call and Web Actions */}
              <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
                <div className="flex-1 min-w-0">
                  {lead.phone ? (
                    <PhoneRevealer phone={lead.phone} name={lead.name} />
                  ) : (
                    <Button disabled className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs cursor-not-allowed">
                      Sem número disponível
                    </Button>
                  )}
                </div>

                {lead.website && (
                  <div className="flex-1 min-w-0">
                    <Button
                      variant="outline"
                      asChild
                      className="w-full h-14 px-6 rounded-2xl font-black uppercase tracking-widest text-xs border-2 transition-all"
                    >
                      <a href={lead.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Visitar Website
                      </a>
                    </Button>
                  </div>
                )}

                {lead.phone && (
                  <div className="flex-1 min-w-0">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition-all font-black uppercase tracking-widest text-xs"
                      title="Enviar mensagem pelo WhatsApp"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>Conversar no WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Media / Cover Column */}
            <div className="lg:col-span-5">
              <a
                href="https://agendar.napp.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-[2.5rem] overflow-hidden shadow-2xl border-2 h-64 lg:h-80 w-full bg-muted hover:scale-[1.02] transition-transform duration-300"
                title="Conheça o AgendarPro"
              >
                <img
                  src={lead.cover_url || defaultCoverImage}
                  alt={lead.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                  <span className="text-white text-xs font-black uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm">
                    {categoryLabel}
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Suggest Update / Transparency Banner */}
          <div className="bg-card/50 backdrop-blur-md p-6 rounded-[2rem] border-2 shadow-sm mb-12 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-orange-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Sugerir uma atualização</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Esta página serve para facilitar a sua busca por este local usando informações públicas obtidas da internet. Esclarecemos que este estabelecimento não possui, de momento, ligação direta com a nossa plataforma. 
                <span className="text-foreground font-bold"> Aproveite para indicar a este proprietário o AgendarPro para automatizar a sua agenda grátis!</span>
              </p>
              <div className="pt-2">
                <Link href={`/${locale}/contacto`} className="text-xs font-black uppercase tracking-widest text-primary hover:underline">
                  Entrar em contacto &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Map Section */}
          {lead.address && (
            <div className="mb-16">
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-6">Localização no Mapa</h3>
              <div className="rounded-[2.5rem] overflow-hidden border-2 shadow-lg h-96 w-full relative">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(lead.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
            </div>
          )}

          {/* Recommendations Carousel */}
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tighter italic uppercase">Reserve online em estabelecimentos próximos</h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Salões parceiros oficiais do AgendarPro com marcação online ativa nas proximidades de {lead.city || "si"}.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-xl font-black uppercase tracking-widest text-xs h-11 border-2 shrink-0">
                <Link href={`/${locale}/parceiros`}>Ver Todos Próximos</Link>
              </Button>
            </div>

            {sortedPartners.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed rounded-3xl text-muted-foreground font-medium">
                Nenhum parceiro oficial registado nesta região ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedPartners.map((salon, i) => {
                  const partnerGradient = gradients[i % gradients.length]
                  return (
                    <div
                      key={salon.id}
                      className="group bg-card rounded-[2rem] border-2 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                    >
                      {/* Cover visual */}
                      <div className="h-28 w-full relative overflow-hidden bg-muted">
                        {salon.cover_url ? (
                          <img
                            src={salon.cover_url}
                            alt={salon.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${partnerGradient} opacity-90`} />
                        )}
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                          Parceiro Oficial
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-black tracking-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {salon.name}
                        </h3>
                        {salon.description ? (
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-4 line-clamp-2">
                            {salon.description}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic font-medium mb-4 line-clamp-2">
                            Marcação online disponível de forma instantânea.
                          </p>
                        )}

                        <div className="mt-auto space-y-3 pt-3 border-t">
                          {salon.address && (
                            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-medium leading-none">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate">{salon.address.split(",")[0]}</span>
                            </div>
                          )}
                          <Button
                            asChild
                            className="w-full rounded-xl h-10 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                          >
                            <Link href={`/${locale}/${salon.slug}/agendar`} target="_blank" rel="noopener noreferrer">
                              Reservar Online
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
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
