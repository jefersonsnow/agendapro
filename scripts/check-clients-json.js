
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

  const result = allClients
    .filter(c => c.name.includes('Jeferson'))
    .map(c => ({
      name: c.name,
      dbVisits: c.visit_count,
      actualCompleted: c.appointments.length
    }))
  
  console.log(JSON.stringify(result, null, 2))
}

checkClients().finally(() => prisma.$disconnect())
