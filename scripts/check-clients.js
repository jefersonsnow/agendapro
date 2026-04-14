
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkClients() {
  const clients = await prisma.client.findMany({
    where: { name: { contains: 'Jeferson' } },
    include: {
      appointments: {
        where: { status: 'completed' }
      }
    }
  })

  clients.forEach(client => {
    console.log(`--- Client: ${client.name} (ID: ${client.id}) ---`)
    console.log(`Visit Count in DB: ${client.visit_count}`)
    console.log(`Completed Appointments Found: ${client.appointments.length}`)
    console.log(`Appointments:`, client.appointments.map(a => a.id))
  })
}

checkClients().finally(() => prisma.$disconnect())
