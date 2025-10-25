import { Router } from 'express';
import {
  getDashboardStats,
  getAllCategoriesAdmin,
  getCategoryById,
  getAllProductsAdmin,
  getProductById,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  bulkUpdateProducts,
  bulkDeleteProducts,
  getFeaturedProducts,
  updateFeaturedProducts,
  getCarouselImages,
  updateCarouselImages,
  getFeaturedCollections,
  updateFeaturedCollections,
  getHomepageBanners,
  updateHomepageBanners,
  getOfferPopup,
  createOfferPopup,
  updateOfferPopup,
  getSiteSettings,
  updateSiteSettings,
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createProductSchema, updateProductSchema } from '../schemas/product';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Category Management
router.get('/categories', getAllCategoriesAdmin);
router.get('/categories/:id', getCategoryById);

// Product Management
router.get('/products', getAllProductsAdmin);
router.get('/products/:id', getProductById);
router.post('/products', validate(createProductSchema), createProductAdmin);
router.put('/products/:id', validate(updateProductSchema), updateProductAdmin);
router.delete('/products/:id', deleteProductAdmin);

// Bulk Operations
router.patch('/products/bulk-update', bulkUpdateProducts);
router.delete('/products/bulk-delete', bulkDeleteProducts);

// Featured Products Management
router.get('/featured-products', getFeaturedProducts);
router.put('/featured-products', updateFeaturedProducts);

// Carousel Images Management
router.get('/carousel-images', getCarouselImages);
router.put('/carousel-images', updateCarouselImages);

// Featured Collections Management
router.get('/featured-collections', getFeaturedCollections);
router.put('/featured-collections', updateFeaturedCollections);

// Homepage Banners Management
router.get('/homepage-banners', getHomepageBanners);
router.put('/homepage-banners', updateHomepageBanners);

// Offer Popup Management
router.get('/offer-popup', getOfferPopup);
router.post('/offer-popup', createOfferPopup);
router.put('/offer-popup', updateOfferPopup);

// Site Settings Management
router.get('/settings', getSiteSettings);
router.put('/settings', updateSiteSettings);

export default router;