import { Router } from 'express';
import { handleCashfreeWebhook } from '../controllers/webhookController';

const router = Router();

// Webhook endpoint - no authentication (uses signature verification)
router.post('/cashfree', handleCashfreeWebhook);

export default router;
