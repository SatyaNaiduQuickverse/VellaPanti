import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '@ecommerce/config';

export function setupMiddleware(app: Express) {
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMaxRequests,
    message: {
      success: false,
      error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false }, // Disable validation since we're behind nginx proxy
  });

  app.use('/api', limiter);

  // Static files for uploads
  app.use('/uploads', express.static(config.upload.uploadPath));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      environment: config.env,
    });
  });
}