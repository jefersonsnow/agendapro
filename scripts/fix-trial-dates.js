const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Ativando Datas de Trial para Napp Sistemas ---');
  
  // Dar 30 dias a partir de hoje para quem está em trial mas sem data
  const salons = await prisma.salon.findMany({
    where: {
      status: 'trial',
      trial_ends_at: null
    }
  });

  console.log(`Encontrados ${salons.length} salões em trial sem data definida.`);

  for (const salon of salons) {
    const trialDate = new Date();
    trialDate.setDate(trialDate.getDate() + 30);
    
    await prisma.salon.update({
      where: { id: salon.id },
      data: { trial_ends_at: trialDate }
    });
    console.log(`✅ Salão '${salon.name}' agora tem 30 dias de trial.`);
  }

  console.log('--- Operação Concluída ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
