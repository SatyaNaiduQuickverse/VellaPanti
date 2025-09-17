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

export default router;