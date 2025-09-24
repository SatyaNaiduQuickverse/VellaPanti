import express from 'express';
import { submitSupportTicket } from '../controllers/supportController';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

// Support endpoints
router.post('/ticket', optionalAuth, submitSupportTicket);

export default router;