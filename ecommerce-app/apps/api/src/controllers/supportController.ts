import { Response } from 'express';
import { emailService } from '../services/emailService';
import { AuthRequest } from '../middleware/auth';

interface SupportTicketRequest {
  subject: string;
  category: string;
  priority: string;
  message: string;
}

export const submitSupportTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, category, priority, message }: SupportTicketRequest = req.body;

    if (!subject || !category || !priority || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority level',
      });
    }

    // Get user info if authenticated
    let customerName: string | undefined;
    let customerEmail: string | undefined;

    if (req.user) {
      customerName = req.user.name;
      customerEmail = req.user.email;
    }

    // Send support ticket email
    await emailService.sendSupportTicket({
      subject,
      category,
      priority,
      message,
      customerName,
      customerEmail,
    });

    return res.status(200).json({
      success: true,
      message: 'Support ticket submitted successfully',
      data: {
        ticketId: `SUP-${Date.now().toString().slice(-6)}`,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Submit support ticket error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit support ticket',
    });
  }
};