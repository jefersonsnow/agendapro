
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.appointment.delete({
    where: {
      id: "c5bd32ea-43dc-482d-ae53-5ada319bee71"
    }
  })

  console.log("Agendamento de Lucas apagado com sucesso:", result.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
