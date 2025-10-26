import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { cashfreeService } from '../services/cashfreeService';
import { emailService } from '../services/emailService';

/**
 * Handle Cashfree webhook notifications
 * Called by Cashfree when payment status changes
 */
export const handleCashfreeWebhook = async (req: Request, res: Response) => {
  try {
    // Get signature and timestamp from headers
    const signature = req.headers['x-webhook-signature'] as string;
    const timestamp = req.headers['x-webhook-timestamp'] as string;

    if (!signature || !timestamp) {
      console.error('[Webhook] Missing signature or timestamp');
      return res.status(400).json({ error: 'Missing webhook signature' });
    }

    // Verify webhook signature
    const rawBody = JSON.stringify(req.body);
    const isValid = cashfreeService.verifyWebhookSignature(signature, timestamp, rawBody);

    if (!isValid) {
      console.error('[Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const webhookData = req.body;
    const eventType = webhookData.type;

    console.log('[Webhook] Received event:', eventType, webhookData);

    // Handle different webhook events
    switch (eventType) {
      case 'PAYMENT_SUCCESS_WEBHOOK':
        await handlePaymentSuccess(webhookData.data);
        break;

      case 'PAYMENT_FAILED_WEBHOOK':
        await handlePaymentFailed(webhookData.data);
        break;

      case 'PAYMENT_USER_DROPPED_WEBHOOK':
        await handlePaymentDropped(webhookData.data);
        break;

      default:
        console.log('[Webhook] Unhandled event type:', eventType);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    // Still return 200 to prevent Cashfree from retrying
    res.status(200).json({ success: false, error: 'Internal error' });
  }
};

/**
 * Handle successful payment webhook
 */
async function handlePaymentSuccess(data: any) {
  try {
    const orderId = data.order?.order_id;
    const cfOrderId = data.order?.cf_order_id;
    const paymentAmount = data.payment?.payment_amount;
    const paymentTime = data.payment?.payment_time;

    if (!orderId) {
      console.error('[Webhook] Payment success: Missing order ID');
      return;
    }

    console.log('[Webhook] Processing payment success for order:', orderId);

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            productVariant: {
              select: {
                size: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      console.error('[Webhook] Order not found:', orderId);
      return;
    }

    // Check if already processed (idempotency)
    if (order.paymentStatus === 'COMPLETED') {
      console.log('[Webhook] Payment already processed for order:', orderId);
      return;
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'PROCESSING',
        cashfreeOrderId: cfOrderId,
        cashfreePaymentId: data.payment?.cf_payment_id,
        paymentGatewayResponse: {
          ...(order.paymentGatewayResponse as object || {}),
          webhookReceivedAt: new Date().toISOString(),
          paymentSuccess: data,
          paymentAmount,
          paymentTime,
        },
      },
    });

    console.log('[Webhook] Order updated successfully:', orderId);

    // Send payment confirmation email
    try {
      await emailService.sendOrderConfirmation(order.user.email, {
        customerName: order.user.name,
        orderId: order.id,
        orderTotal: order.total,
        orderItems: order.items.map(item => ({
          name: `${item.product.name}${item.productVariant ? ` (${item.productVariant.color} ${item.productVariant.size})` : ''}`,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          street: order.shippingStreet,
          city: order.shippingCity,
          state: order.shippingState,
          zipCode: order.shippingZipCode,
          country: order.shippingCountry,
        },
      });
      console.log('[Webhook] Confirmation email sent for order:', orderId);
    } catch (emailError) {
      console.error('[Webhook] Failed to send confirmation email:', emailError);
    }
  } catch (error) {
    console.error('[Webhook] Error handling payment success:', error);
  }
}

/**
 * Handle failed payment webhook
 */
async function handlePaymentFailed(data: any) {
  try {
    const orderId = data.order?.order_id;

    if (!orderId) {
      console.error('[Webhook] Payment failed: Missing order ID');
      return;
    }

    console.log('[Webhook] Processing payment failure for order:', orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error('[Webhook] Order not found:', orderId);
      return;
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'FAILED',
        paymentGatewayResponse: {
          ...(order.paymentGatewayResponse as object || {}),
          webhookReceivedAt: new Date().toISOString(),
          paymentFailed: data,
        },
      },
    });

    console.log('[Webhook] Order marked as failed:', orderId);
  } catch (error) {
    console.error('[Webhook] Error handling payment failure:', error);
  }
}

/**
 * Handle user dropped payment webhook
 */
async function handlePaymentDropped(data: any) {
  try {
    const orderId = data.order?.order_id;

    if (!orderId) {
      console.error('[Webhook] Payment dropped: Missing order ID');
      return;
    }

    console.log('[Webhook] Processing payment dropped for order:', orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error('[Webhook] Order not found:', orderId);
      return;
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentGatewayResponse: {
          ...(order.paymentGatewayResponse as object || {}),
          webhookReceivedAt: new Date().toISOString(),
          paymentDropped: data,
        },
      },
    });

    console.log('[Webhook] Payment dropped recorded for order:', orderId);
  } catch (error) {
    console.error('[Webhook] Error handling payment dropped:', error);
  }
}
