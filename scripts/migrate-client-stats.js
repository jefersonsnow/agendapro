
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrate() {
  const clients = await prisma.client.findMany({
    select: { id: true, name: true }
  })

  console.log(`Analyzing ${clients.length} clients...`)

  for (const client of clients) {
    const stats = await prisma.appointment.aggregate({
      where: { 
        client_id: client.id, 
        status: 'completed' 
      },
      _count: { id: true },
      _sum: { price: true },
      _max: { starts_at: true }
    })

    const visits = stats._count.id || 0
    const spent = stats._sum.price || 0
    const last = stats._max.starts_at || null

    await prisma.client.update({
      where: { id: client.id },
      data: {
        visit_count: visits,
        total_spent: spent,
        last_visit: last
      }
    })

    console.log(`Updated [${client.name}]: ${visits} visits, ${Number(spent).toFixed(2)} spent`)
  }
}

migrate().finally(() => prisma.$disconnect())
