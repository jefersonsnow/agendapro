const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { contains: "jeferson" } }
  })
  console.log("Utilizador Jeferson Encontrado:")
  console.log(JSON.stringify(user, null, 2))
}

main().finally(() => prisma.$disconnect())
