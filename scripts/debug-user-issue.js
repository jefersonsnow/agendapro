const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'jeferson@cliente.com' }
    });
    console.log('USER_CHECK:', JSON.stringify(user, null, 2));
    
    const staff = await prisma.staff.findMany({
      where: { email: 'jeferson@cliente.com' }
    });
    console.log('STAFF_CHECK:', JSON.stringify(staff, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
