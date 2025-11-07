import { Response } from 'express';
import { emailService } from '../services/emailService';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';

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

// Get all support tickets (Admin only)
export const getAllSupportTickets = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  const {
    page = 1,
    limit = 20,
    status,
    priority,
  } = req.query as any;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (status) {
    where.status = status.toUpperCase();
  }

  if (priority) {
    where.priority = priority.toUpperCase();
  }

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  res.json({
    success: true,
    data: tickets,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// Update support ticket status (Admin only)
export const updateSupportTicketStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
  });

  if (!ticket) {
    throw new AppError('Support ticket not found', 404);
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: updatedTicket,
    message: 'Support ticket status updated successfully',
  });
});