import { Router } from 'express';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  markReviewHelpful,
} from '../controllers/reviewController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createReviewSchema, updateReviewSchema } from '../schemas/review';

const router = Router();

// Public routes
router.get('/', optionalAuth, getReviews);
router.get('/product/:productId', getProductReviews);
router.get('/:id', optionalAuth, getReviewById);

// Authenticated routes
router.post('/', authenticateToken, createReview);
router.put('/:id', authenticateToken, validate(updateReviewSchema), updateReview);
router.delete('/:id', authenticateToken, deleteReview);
router.post('/:reviewId/helpful', authenticateToken, markReviewHelpful);

export default router;