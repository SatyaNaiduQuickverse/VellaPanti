import { Express } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
import reviewRoutes from './reviewRoutes';
import uploadRoutes from './uploadRoutes';
import adminRoutes from './adminRoutes';
import supportRoutes from './supportRoutes';
import wishlistRoutes from './wishlistRoutes';
import bulkUploadRoutes from './bulkUploadRoutes';
import paymentRoutes from './paymentRoutes';
import webhookRoutes from './webhookRoutes';
import { getPublicSiteSettings, getStoryPage } from '../controllers/adminController';

export function setupRoutes(app: Express) {
  // Public settings endpoint (no auth required)
  app.get('/api/settings', getPublicSiteSettings);
  app.get('/api/story-page', getStoryPage);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/bulk-upload', bulkUploadRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/webhooks', webhookRoutes);

  // 404 handler for unmatched routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });
}