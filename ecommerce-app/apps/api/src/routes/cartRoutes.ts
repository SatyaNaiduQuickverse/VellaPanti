import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { addToCartSchema, updateCartItemSchema } from '../schemas/cart';

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addToCart);
router.put('/:id', validate(updateCartItemSchema), updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export default router;