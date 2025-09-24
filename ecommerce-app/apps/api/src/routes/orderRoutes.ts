import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderTracking,
  getOrderForSuccess,
} from '../controllers/orderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order';

const router = Router();

// Order success route - more permissive authentication
router.get('/:id/success', authenticateToken, getOrderForSuccess);

// All other order routes require authentication
router.use(authenticateToken);

router.get('/', getOrders);
router.get('/all', requireAdmin, getAllOrders); // Admin only
router.get('/:id', getOrderById);
router.get('/:id/tracking', getOrderTracking);
router.post('/', validate(createOrderSchema), createOrder);
router.patch('/:id/status', requireAdmin, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;