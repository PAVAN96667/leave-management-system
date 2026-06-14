const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { email: 'admin' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin',
      password: hash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Done! Login: admin / admin');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());