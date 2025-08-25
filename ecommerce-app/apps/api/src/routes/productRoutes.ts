import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { productQuerySchema, createProductSchema, updateProductSchema } from '../schemas/product';

const router = Router();

router.get('/', validateQuery(productQuerySchema), getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, validate(createProductSchema), createProduct);
router.put('/:id', authenticateToken, requireAdmin, validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;