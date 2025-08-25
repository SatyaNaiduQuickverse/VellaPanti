import { Router } from 'express';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createReviewSchema, updateReviewSchema } from '../schemas/review';

const router = Router();

router.get('/', optionalAuth, getReviews);
router.get('/:id', optionalAuth, getReviewById);

// Authenticated routes
router.post('/', authenticateToken, validate(createReviewSchema), createReview);
router.put('/:id', authenticateToken, validate(updateReviewSchema), updateReview);
router.delete('/:id', authenticateToken, deleteReview);

export default router;