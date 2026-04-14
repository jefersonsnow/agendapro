const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = "jeferson@admin.com";
  const password = "123";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "admin"
      },
      create: {
        email,
        name: "Jeferson Admin",
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Utilizador Admin criado/atualizado com sucesso!");
    console.log("Email:", user.email);
    console.log("ID:", user.id);
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
