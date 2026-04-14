
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migrate() {
  const clients = await prisma.client.findMany({
    select: { id: true, name: true }
  })

  console.log(`Syncing Loyalty Points for ${clients.length} clients... history: 1 visit = 1 point`)

  for (const client of clients) {
    const stats = await prisma.appointment.aggregate({
      where: { 
        client_id: client.id, 
        status: 'completed' 
      },
      _count: { id: true }
    })

    const visits = stats._count.id || 0

    await prisma.client.update({
      where: { id: client.id },
      data: {
        loyalty_points: visits
      }
    })

    console.log(`Updated [${client.name}]: ${visits} points set.`)
  }
}

migrate().finally(() => prisma.$disconnect())
