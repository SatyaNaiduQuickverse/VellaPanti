import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://ecommerce:ecommerce_secure_2024@localhost:5432/ecommerce_test',
    },
  },
});

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  // Clean up database before each test
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log({ error });
      }
    }
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});