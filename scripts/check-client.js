
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkClient() {
  const client = await prisma.client.findFirst({
    where: { name: { contains: 'Jeferson Neves' } },
    include: {
      appointments: {
        where: { status: 'completed' }
      }
    }
  })

  if (client) {
    console.log(`Client Found: ${client.name}`)
    console.log(`Visit Count in DB: ${client.visit_count}`)
    console.log(`Completed Appointments Found: ${client.appointments.length}`)
    console.log(`Total Spent in DB: ${client.total_spent}`)
    const actualSpent = client.appointments.reduce((sum, apt) => sum + Number(apt.price), 0)
    console.log(`Actual Sum of Completed Prices: ${actualSpent}`)
  } else {
    console.log('Client not found')
  }
}

checkClient().finally(() => prisma.$disconnect())
