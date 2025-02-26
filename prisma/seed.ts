import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});

  const users = [
    {
      email: 'imhayatunnabi@gmail.com',
      password: await bcrypt.hash('password123', 10),
    },
    {
      email: 'imhayatunnabi.pen@gmail.com',
      password: await bcrypt.hash('password123', 10),
    },
    {
      email: 'admin@gmail.com',
      password: await bcrypt.hash('admin123', 10),
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  console.log('Seeded users successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
