const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.count()
  const salons = await prisma.salon.count()
  const salonList = await prisma.salon.findMany({ 
    orderBy: { created_at: "desc" }
  })

  console.log("Estado Atual DB:")
  console.log("- Users:", users)
  console.log("- Salons:", salons)
  console.log("Salons List:", JSON.stringify(salonList, null, 2))
}

main().finally(() => prisma.$disconnect())
