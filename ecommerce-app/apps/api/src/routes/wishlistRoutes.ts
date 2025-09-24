import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkWishlistStatus,
  getWishlistCount,
} from '../controllers/wishlistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All wishlist routes require authentication
router.use(authenticateToken);

// Get user's wishlist
router.get('/', getWishlist);

// Get wishlist count
router.get('/count', getWishlistCount);

// Check if product is in wishlist
router.get('/status/:productId', checkWishlistStatus);

// Add product to wishlist
router.post('/add', addToWishlist);

// Toggle product in wishlist
router.post('/toggle', toggleWishlist);

// Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

export default router;