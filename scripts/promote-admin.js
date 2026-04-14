const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.log("Forneça um email: node scripts/promote-admin.js email@exemplo.com")
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" }
  })

  console.log(`Utilizador ${user.email} agora é ADMIN!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
