const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const prisma = new PrismaClient()

async function main() {
  const email = "jeferson@admin.com"
  const password = "123"
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
       role: "admin",
       password: hashedPassword
    },
    create: {
      name: "Super Admin",
      email,
      password: hashedPassword,
      role: "admin"
    }
  })

  console.log(`Utilizador ADMIN criado/atualizado: ${user.email}`)
  console.log("Senha: 123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
