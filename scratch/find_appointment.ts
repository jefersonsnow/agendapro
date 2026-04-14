
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const appointments = await prisma.appointment.findMany({
    where: {
      starts_at: {
        gte: new Date('2026-04-15T00:00:00Z'),
        lt: new Date('2026-04-16T00:00:00Z'),
      },
      client: {
        name: {
          contains: 'Davi Sousa'
        }
      }
    }
  })

  console.log(JSON.stringify(appointments, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
