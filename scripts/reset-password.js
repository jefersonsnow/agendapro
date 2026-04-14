const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function reset() {
  const email = "jeferson@admin.com"
  const newPassword = "ilu510n"

  console.log(`Buscando utilizador: ${email}...`)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.error(`ERRO: Utilizador ${email} não encontrado no banco de dados.`)
    return
  }

  console.log(`A gerar hash para a nova senha...`)
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  console.log(`A atualizar senha...`)
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      password: hashedPassword,
      role: 'admin' // Garantir que ele continua sendo admin
    }
  })

  console.log(`SUCESSO: Senha de ${email} alterada para "${newPassword}".`)
}

reset()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect())
