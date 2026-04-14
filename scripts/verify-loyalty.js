
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verify() {
  const clients = await prisma.client.findMany({
    select: { name: true, loyalty_points: true }
  })
  console.log(JSON.stringify(clients, null, 2))
}

verify().finally(() => prisma.$disconnect())
