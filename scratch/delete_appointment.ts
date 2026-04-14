
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.appointment.delete({
    where: {
      id: "c293d243-b7f5-4e2e-a6cb-7e1f9d96d380"
    }
  })

  console.log("Agendamento apagado com sucesso:", result.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
