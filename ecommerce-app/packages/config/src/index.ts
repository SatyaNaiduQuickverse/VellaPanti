export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://ecommerce:ecommerce_secure_2024@localhost:5432/ecommerce_dev',
  },
  
  // Server
  server: {
    port: parseInt(process.env.PORT || '3062', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3061',
  },
  
  // Client
  client: {
    port: parseInt(process.env.NEXT_PUBLIC_PORT || '3061', 10),
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3062',
  },
  
  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // File Upload
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
    ],
    uploadPath: process.env.UPLOAD_PATH || 'uploads',
  },
  
  // Email (basic configuration)
  email: {
    from: process.env.EMAIL_FROM || 'noreply@ecommerce.com',
    host: process.env.EMAIL_HOST || 'localhost',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
  },
  
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

export type Config = typeof config;