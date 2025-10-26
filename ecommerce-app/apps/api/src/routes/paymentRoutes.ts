import { Router } from 'express';
import {
  initiatePayment,
  verifyPayment,
  paymentCallback,
} from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Payment callback - no auth required (Cashfree redirects here)
router.get('/callback', paymentCallback);

// Protected routes - require authentication
router.use(authenticateToken);

router.post('/initiate', initiatePayment);
router.get('/verify/:orderId', verifyPayment);

export default router;
