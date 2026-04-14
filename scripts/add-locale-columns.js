const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE salons ADD COLUMN locale VARCHAR(191) NOT NULL DEFAULT 'pt'`);
    console.log("Salons table altered.");
  } catch(e) {
    console.log(e.message);
  }
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN locale VARCHAR(191) NOT NULL DEFAULT 'pt'`);
    console.log("Users table altered.");
  } catch(e) {
    console.log(e.message);
  }
}

main().finally(() => prisma.$disconnect());
