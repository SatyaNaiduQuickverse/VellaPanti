import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  getHomepageCarousel,
  getFeaturedCategories,
  getPublicHomepageBanners,
  getPublicHomepageSectionTexts,
} from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { uploadSingle } from '../services/uploadService';

const router = Router();

router.get('/', getCategories);
router.get('/carousel', getHomepageCarousel);
router.get('/featured', getFeaturedCategories);
router.get('/homepage-banners', getPublicHomepageBanners);
// Temporarily commented out - causing undefined function error
// router.get('/homepage-section-texts', getPublicHomepageSectionTexts);
router.get('/id/:id', getCategoryById);
router.get('/:slug', getCategoryBySlug);
router.get('/:slug/products', getCategoryProducts);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, uploadSingle('image'), createCategory);
router.put('/:id', authenticateToken, requireAdmin, uploadSingle('image'), updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export default router;