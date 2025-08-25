// Mock implementations

// Mock Prisma client
jest.mock('@ecommerce/database', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cartItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      findFirst: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    userAddress: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock config
jest.mock('@ecommerce/config', () => ({
  config: {
    server: {
      port: 3062,
      host: 'localhost',
      corsOrigin: 'http://localhost:3061',
    },
    jwt: {
      accessSecret: 'test-access-secret',
      refreshSecret: 'test-refresh-secret',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    security: {
      bcryptRounds: 12,
      rateLimitWindowMs: 900000,
      rateLimitMaxRequests: 100,
    },
    upload: {
      maxSize: 10485760,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
      uploadPath: 'uploads',
    },
    env: 'test',
    isDevelopment: false,
    isProduction: false,
    isTest: true,
  },
}));

// Set test environment
process.env.NODE_ENV = 'test';