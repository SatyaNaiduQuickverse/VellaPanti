import { Response } from 'express';
import { emailService } from '../services/emailService';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '@ecommerce/database';

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

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const normalizedPriority = priority.toUpperCase();
    if (!validPriorities.includes(normalizedPriority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority level',
      });
    }

    // Get user info if authenticated
    let customerName: string | undefined;
    let customerEmail: string | undefined;
    let userId: string | null = null;

    if (req.user) {
      customerName = req.user.name;
      customerEmail = req.user.email;
      userId = req.user.id;
    }

    // Save support ticket to database only if user is authenticated
    let savedTicket = null;
    if (userId) {
      savedTicket = await prisma.supportTicket.create({
        data: {
          userId,
          subject,
          category,
          priority: normalizedPriority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          message,
          status: 'OPEN',
        },
      });
    }

    // Send support ticket email
    await emailService.sendSupportTicket({
      subject,
      category,
      priority: normalizedPriority,
      message,
      customerName,
      customerEmail,
    });

    const ticketId = savedTicket ? savedTicket.id : `SUP-${Date.now().toString().slice(-6)}`;

    return res.status(200).json({
      success: true,
      message: 'Support ticket submitted successfully',
      data: {
        ticketId,
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