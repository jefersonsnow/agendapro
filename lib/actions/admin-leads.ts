"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function checkAdmin() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    throw new Error("Não autorizado. Apenas administradores podem realizar esta ação.")
  }
}

// Buscar filtros de concorrentes do banco
export async function getCompetitorFilters() {
  await checkAdmin()
  
  let filters = await prisma.competitorFilter.findMany({
    orderBy: { created_at: "asc" }
  })
  
  // Se a tabela estiver vazia, faz o seeding inicial para que apareçam na tela
  if (filters.length === 0) {
    const defaultDomains = [
      "fresha.com",
      "noona.pt",
      "noona.is",
      "zappysoftware.com",
      "zappy.pt",
      "treatwell.pt",
      "treatwell.com",
      "sheerhme.com",
      "bookasy.com",
      "zencookbook.com",
      "buk.pt",
      "appbarber.com.br"
    ]
    await prisma.competitorFilter.createMany({
      data: defaultDomains.map(domain => ({ domain }))
    })
    filters = await prisma.competitorFilter.findMany({
      orderBy: { created_at: "asc" }
    })
  }
  
  return filters
}

// Adicionar um novo filtro de concorrente
export async function addCompetitorFilter(domain: string) {
  await checkAdmin()
  
  const cleanDomain = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "")
  
  if (!cleanDomain) {
    throw new Error("O domínio do concorrente não pode ser vazio.")
  }
  
  try {
    const filter = await prisma.competitorFilter.create({
      data: { domain: cleanDomain }
    })
    revalidatePath("/admin/system")
    return { success: true, filter }
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Este domínio já está cadastrado como filtro.")
    }
    throw new Error("Erro ao cadastrar filtro de concorrente.")
  }
}

// Apagar um filtro de concorrente
export async function deleteCompetitorFilter(id: string) {
  await checkAdmin()
  
  await prisma.competitorFilter.delete({
    where: { id }
  })
  
  revalidatePath("/admin/system")
  return { success: true }
}

// Parser de CSV simples e robusto que suporta aspas e vírgulas internas
function parseCSV(text: string): string[][] {
  const result: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim())
      cell = ""
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++ // salta \n
      }
      row.push(cell.trim())
      result.push(row)
      row = []
      cell = ""
    } else {
      cell += char
    }
  }
  if (row.length > 0 || cell.length > 0) {
    row.push(cell.trim())
    result.push(row)
  }
  return result.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ""))
}

// Auxiliar para gerar slug limpo e único
function generateBaseSlug(name: string, city: string | null): string {
  const base = city ? `${name}-${city}` : name
  return base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// Importar Leads a partir do conteúdo de texto do arquivo CSV
export async function importLeadsFromCsv(csvText: string) {
  await checkAdmin()

  // Buscar os filtros do banco (com seeding se estiver vazio)
  let activeFilters = await prisma.competitorFilter.findMany()
  if (activeFilters.length === 0) {
    const defaultDomains = [
      "fresha.com",
      "noona.pt",
      "noona.is",
      "zappysoftware.com",
      "zappy.pt",
      "treatwell.pt",
      "treatwell.com",
      "sheerhme.com",
      "bookasy.com",
      "zencookbook.com",
      "buk.pt",
      "appbarber.com.br"
    ]
    await prisma.competitorFilter.createMany({
      data: defaultDomains.map(domain => ({ domain }))
    })
    activeFilters = await prisma.competitorFilter.findMany()
  }

  const competitorDomains = activeFilters.map(f => f.domain.toLowerCase())

  if (!csvText || csvText.trim() === "") {
    throw new Error("O arquivo CSV está vazio.")
  }

  const rows = parseCSV(csvText)
  if (rows.length < 2) {
    throw new Error("O arquivo CSV não possui linhas de dados válidas.")
  }

  // Normalizar cabeçalhos para mapeamento dinâmico de colunas
  const headers = rows[0].map(h => 
    h.toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "")
     .replace(/[^a-z0-9-_]/g, "")
     .trim()
  )

  const idxNome = headers.indexOf("nome")
  const idxEndereco = headers.indexOf("endereco")
  const idxTelefone = headers.indexOf("telefone")
  const idxWebsite = headers.indexOf("website")
  const idxWhatsapp = headers.indexOf("whatsapp")
  const idxFacebook = headers.indexOf("facebook")
  const idxInstagram = headers.indexOf("instagram")
  const idxLocalizacao = headers.indexOf("localizacao")
  const idxBusca = headers.indexOf("busca")
  const idxEmail = headers.indexOf("email") !== -1 ? headers.indexOf("email") : headers.indexOf("e-mail")

  if (idxNome === -1) {
    throw new Error("Coluna 'Nome' é obrigatória no cabeçalho do CSV.")
  }

  let totalParsed = 0
  let inserted = 0
  let updated = 0
  let skipped = 0

  // Processamento linha por linha
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.length < idxNome + 1 || !row[idxNome]) {
      continue // ignora linhas corrompidas ou sem nome
    }

    totalParsed++

    const name = row[idxNome].trim()
    const address = idxEndereco !== -1 ? row[idxEndereco]?.trim() : null
    const rawPhone = idxTelefone !== -1 ? row[idxTelefone]?.trim() : null
    const rawWebsite = idxWebsite !== -1 ? row[idxWebsite]?.trim() : null
    const rawWhatsapp = idxWhatsapp !== -1 ? row[idxWhatsapp]?.trim() : null
    const rawFacebook = idxFacebook !== -1 ? row[idxFacebook]?.trim() : null
    const rawInstagram = idxInstagram !== -1 ? row[idxInstagram]?.trim() : null
    const location = idxLocalizacao !== -1 ? row[idxLocalizacao]?.trim() : null
    const category = idxBusca !== -1 ? row[idxBusca]?.trim() : null
    const rawEmail = idxEmail !== -1 ? row[idxEmail]?.trim() : null

    // Higienização do Telefone
    const cleanPhone = rawPhone ? rawPhone.replace(/\s+/g, "") : null

    // Determinar Cidade a partir da localização (ex: "Vila Real, Portugal" -> "Vila Real")
    const city = location ? location.split(",")[0].trim() : null

    // Higienização Inteligente dos Links (Website, WhatsApp, Redes Sociais)
    let website: string | null = rawWebsite ? rawWebsite.trim() : null
    let whatsapp: string | null = rawWhatsapp ? rawWhatsapp.trim() : null
    let facebook: string | null = rawFacebook ? rawFacebook.trim() : null
    let instagram: string | null = rawInstagram ? rawInstagram.trim() : null

    if (website) {
      const lowerWeb = website.toLowerCase()

      // 1. detetar link de whatsapp por engano no website
      if (lowerWeb.includes("wa.me") || lowerWeb.includes("whatsapp.com")) {
        if (!whatsapp) {
          whatsapp = website
        }
        website = null
      }
      // 2. detetar link do Instagram por engano
      else if (lowerWeb.includes("instagram.com")) {
        if (!instagram) {
          instagram = website
        }
        website = null
      }
      // 3. detetar link do Facebook por engano
      else if (lowerWeb.includes("facebook.com")) {
        if (!facebook) {
          facebook = website
        }
        website = null
      }
      // 4. detetar concorrentes conhecidos e anular
      else {
        const isCompetitor = competitorDomains.some(domain => lowerWeb.includes(domain))
        if (isCompetitor) {
          website = null
        }
      }
    }

    // Normalizar link do whatsapp se vier limpo sem wa.me
    if (whatsapp && !whatsapp.startsWith("http")) {
      const cleanNum = whatsapp.replace(/[^0-9]/g, "")
      whatsapp = `https://wa.me/${cleanNum.startsWith("351") ? cleanNum : "351" + cleanNum}`
    }

    const baseSlug = generateBaseSlug(name, city)

    // Procurar por telefone para verificar duplicações caso mude de slug
    let existingLead = await prisma.lead.findFirst({
      where: {
        OR: [
          { slug: baseSlug },
          cleanPhone ? { phone: cleanPhone } : {}
        ].filter(cond => Object.keys(cond).length > 0)
      }
    })

    const leadPayload = {
      name,
      address,
      phone: cleanPhone,
      website,
      email: rawEmail ? rawEmail.trim() : null,
      city,
      category,
      whatsapp,
      facebook: facebook ? facebook.trim() : null,
      instagram: instagram ? instagram.trim() : null,
      cover_url: null,
      logo_url: null,
    }

    if (existingLead) {
      if (existingLead.status === "claimed") {
        skipped++
        continue // Não sobrescreve salões parceiros reais
      }

      await prisma.lead.update({
        where: { id: existingLead.id },
        data: leadPayload
      })
      updated++
    } else {
      // Garantir slug único no banco
      let uniqueSlug = baseSlug
      let counter = 1
      while (true) {
        const check = await prisma.lead.findUnique({
          where: { slug: uniqueSlug }
        })
        if (!check) break
        uniqueSlug = `${baseSlug}-${counter}`
        counter++
      }

      await prisma.lead.create({
        data: {
          ...leadPayload,
          slug: uniqueSlug,
          status: "active"
        }
      })
      inserted++
    }
  }

  revalidatePath("/admin/system")
  return {
    success: true,
    totalParsed,
    inserted,
    updated,
    skipped
  }
}

// Buscar estatísticas de leads para a Central Core
export async function getLeadsStats() {
  await checkAdmin()

  const total = await prisma.lead.count()
  const active = await prisma.lead.count({ where: { status: "active" } })
  const claimed = await prisma.lead.count({ where: { status: "claimed" } })

  // Leads por cidade
  const leadsByCity = await prisma.lead.groupBy({
    by: ['city'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 5
  })

  return {
    total,
    active,
    claimed,
    leadsByCity: leadsByCity.map(c => ({
      city: c.city || "Desconhecido",
      count: c._count.id
    }))
  }
}
