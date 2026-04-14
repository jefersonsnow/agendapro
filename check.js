const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: "barbanegra@cliente.com" }
  })
  console.log("DB_USER:", user)
  process.exit(0)
}

check()
