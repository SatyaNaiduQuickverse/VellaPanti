import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { cashfreeService } from '../services/cashfreeService';
import type { AuthRequest } from '../middleware/auth';

/**
 * Initiate payment for an order
 * Creates Cashfree order and returns payment session
 */
export const initiatePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { orderId } = req.body;

  if (!orderId) {
    throw new AppError('Order ID is required', 400);
  }

  // Fetch order with user details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify order belongs to user
  if (order.userId !== userId) {
    throw new AppError('Access denied', 403);
  }

  // Check if order is already paid
  if (order.paymentStatus === 'COMPLETED') {
    throw new AppError('Order is already paid', 400);
  }

  // Check if payment was already initiated
  if (order.cashfreeOrderId) {
    throw new AppError('Payment already initiated for this order', 400);
  }

  // Validate phone number
  if (!order.user.phone || order.user.phone.length < 10) {
    throw new AppError('Valid phone number is required for payment', 400);
  }

  try {
    // Create Cashfree order
    const paymentSession = await cashfreeService.createOrder({
      orderId: order.id,
      orderAmount: order.total,
      customerName: order.user.name,
      customerEmail: order.user.email,
      customerPhone: order.user.phone,
    });

    // Update order with Cashfree details
    await prisma.order.update({
      where: { id: order.id },
      data: {
        cashfreeOrderId: paymentSession.cfOrderId,
        paymentMethod: 'CASHFREE_ONLINE',
        paymentGatewayResponse: {
          sessionId: paymentSession.paymentSessionId,
          status: paymentSession.orderStatus,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Generate payment link
    const paymentLink = cashfreeService.getPaymentLink(paymentSession.paymentSessionId);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        paymentSessionId: paymentSession.paymentSessionId,
        paymentLink,
        amount: order.total,
      },
      message: 'Payment session created successfully',
    });
  } catch (error: any) {
    console.error('[Payment] Initiate payment error:', error);
    throw new AppError(error.message || 'Failed to initiate payment', 500);
  }
});

/**
 * Verify payment status
 * Check if payment was successful
 */
export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify order belongs to user
  if (order.userId !== userId) {
    throw new AppError('Access denied', 403);
  }

  if (!order.cashfreeOrderId) {
    throw new AppError('Payment not initiated for this order', 400);
  }

  try {
    // Get payment status from Cashfree
    const paymentStatus = await cashfreeService.getOrderStatus(order.cashfreeOrderId);

    // Update order based on payment status
    let updatedOrder = order;

    if (paymentStatus.paymentStatus === 'SUCCESS' && order.paymentStatus !== 'COMPLETED') {
      updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'PROCESSING',
          paymentGatewayResponse: {
            ...(order.paymentGatewayResponse as object || {}),
            verifiedAt: new Date().toISOString(),
            paymentDetails: paymentStatus,
          },
        },
      });
    } else if (
      ['FAILED', 'CANCELLED', 'USER_DROPPED'].includes(paymentStatus.paymentStatus || '') &&
      order.paymentStatus !== 'FAILED'
    ) {
      updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          paymentGatewayResponse: {
            ...(order.paymentGatewayResponse as object || {}),
            failedAt: new Date().toISOString(),
            paymentDetails: paymentStatus,
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        orderId: updatedOrder.id,
        paymentStatus: updatedOrder.paymentStatus,
        orderStatus: updatedOrder.status,
        amount: updatedOrder.total,
      },
    });
  } catch (error: any) {
    console.error('[Payment] Verify payment error:', error);
    throw new AppError(error.message || 'Failed to verify payment', 500);
  }
});

/**
 * Handle payment callback from Cashfree
 * User is redirected here after payment
 */
export const paymentCallback = asyncHandler(async (req: Request, res: Response) => {
  const { order_id } = req.query;

  if (!order_id || typeof order_id !== 'string') {
    return res.redirect('https://www.vellapanti.co.in/payment/failed');
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      return res.redirect('https://www.vellapanti.co.in/payment/failed');
    }

    // Check payment status
    if (order.paymentStatus === 'COMPLETED') {
      return res.redirect(`https://www.vellapanti.co.in/order/success?orderId=${order_id}`);
    }

    // If not completed, verify with Cashfree
    if (order.cashfreeOrderId) {
      try {
        const paymentStatus = await cashfreeService.getOrderStatus(order.cashfreeOrderId);

        if (paymentStatus.paymentStatus === 'SUCCESS') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'PROCESSING',
              cashfreePaymentId: paymentStatus.cfOrderId,
            },
          });

          return res.redirect(`https://www.vellapanti.co.in/order/success?orderId=${order_id}`);
        }
      } catch (error) {
        console.error('[Payment] Callback verification error:', error);
      }
    }

    return res.redirect(`https://www.vellapanti.co.in/payment/pending?orderId=${order_id}`);
  } catch (error) {
    console.error('[Payment] Callback error:', error);
    return res.redirect('https://www.vellapanti.co.in/payment/failed');
  }
});
