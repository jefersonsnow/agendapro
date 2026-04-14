const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restore() {
  try {
    const user = await prisma.user.update({
      where: { email: 'jeferson@cliente.com' },
      data: { role: 'owner' }
    });
    console.log('Jeferson role RESTORED TO OWNER:', user.id);
  } catch (err) {
    console.error('Error restoring Jeferson:', err);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
