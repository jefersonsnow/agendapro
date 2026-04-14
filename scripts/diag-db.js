const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log("--- DIAGNÓSTICO DE BASE DE DADOS ---")
    const usersCount = await prisma.user.count()
    console.log("Conexão OK. Total de utilizadores:", usersCount)
    
    const salon = await prisma.salon.findFirst()
    console.log("Primeiro salão encontrado:", salon ? salon.name : "Nenhum")
    
    console.log("Verificando Tabela global_configs...")
    const configs = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM global_configs`).catch(e => [{count: 'Erro: Tabela não existe'}])
    console.log("Configurações Globais:", configs)
    
  } catch (err) {
    console.error("ERRO CRÍTICO NA BD:", err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
