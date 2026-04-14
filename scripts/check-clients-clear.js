
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkClients() {
  const allClients = await prisma.client.findMany({
    include: {
      appointments: {
        where: { status: 'completed' }
      }
    }
  })

  allClients.forEach(client => {
    if (client.name.includes('Jeferson')) {
      console.log(`[${client.name}] Visits (DB): ${client.visit_count} | Actual Completed: ${client.appointments.length}`)
    }
  })
}

checkClients().finally(() => prisma.$disconnect())
