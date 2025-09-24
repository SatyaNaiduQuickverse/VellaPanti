import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  searchProducts,
  getCategoriesForFilter,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariant,
  getProductVariants,
  checkVariantAvailability,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  getFeaturedProducts,
} from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { productQuerySchema, createProductSchema, updateProductSchema } from '../schemas/product';
import { uploadMultiple } from '../services/uploadService';

const router = Router();

router.get('/', validateQuery(productQuerySchema), getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/categories-filter', getCategoriesForFilter);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Variant routes
router.get('/:productId/variants', getProductVariants);
router.get('/:productId/variants/:variantId', getProductVariant);
router.get('/variants/:variantId/availability', checkVariantAvailability);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, uploadMultiple('images', 5), createProduct);
router.put('/:id', authenticateToken, requireAdmin, uploadMultiple('images', 5), updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

// Admin variant management routes
router.post('/:productId/variants', authenticateToken, requireAdmin, createProductVariant);
router.put('/variants/:variantId', authenticateToken, requireAdmin, updateProductVariant);
router.delete('/variants/:variantId', authenticateToken, requireAdmin, deleteProductVariant);

export default router;