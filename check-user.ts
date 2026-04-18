import prisma from "./lib/prisma"

async function checkUser() {
  const user = await prisma.user.findFirst({
    where: { email: "barbanegra@cliente.com" }
  })
  console.log("USER:", user)
}

checkUser()
