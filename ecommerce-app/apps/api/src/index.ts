import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from '@ecommerce/config';
import { prisma } from '@ecommerce/database';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { emailService } from './services/emailService';

const app = express();

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Security middleware
    app.use(helmet());
    app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://80.225.231.66:3061',
      credentials: true,
    }));

    // Static file serving for uploads
    app.use('/uploads', express.static(path.join(process.cwd(), config.upload.uploadPath)));

    // Setup middleware
    setupMiddleware(app);

    // Setup routes
    setupRoutes(app);

    // Test email service connection
    // await emailService.testConnection();

    // Error handling middleware (must be last)
    app.use(errorHandler);

    // Start server
    app.listen(config.server.port, config.server.host, () => {
      console.log(`🚀 API server running on http://${config.server.host}:${config.server.port}`);
      console.log(`📊 Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('⏳ SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⏳ SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();