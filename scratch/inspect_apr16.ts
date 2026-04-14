
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const appointments = await prisma.appointment.findMany({
    where: {
      starts_at: {
        gte: new Date('2026-04-16T00:00:00Z'),
        lt: new Date('2026-04-17T00:00:00Z'),
      }
    },
    include: {
      staff: true,
      client: true
    }
  })

  console.log(JSON.stringify(appointments, null, 2))
}

main()
