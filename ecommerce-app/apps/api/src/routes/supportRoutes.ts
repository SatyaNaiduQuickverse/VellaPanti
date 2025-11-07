import express from 'express';
import { submitSupportTicket, getAllSupportTickets, updateSupportTicketStatus } from '../controllers/supportController';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public support endpoints
router.post('/ticket', optionalAuth, submitSupportTicket);

// Admin support endpoints
router.get('/tickets', authenticateToken, requireAdmin, getAllSupportTickets);
router.put('/tickets/:id/status', authenticateToken, requireAdmin, updateSupportTicketStatus);

export default router;