import { config } from '@ecommerce/config';
import crypto from 'crypto';
import axios from 'axios';

export interface CreateOrderRequest {
  orderId: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentSessionResponse {
  paymentSessionId: string;
  orderStatus: string;
  cfOrderId: string;
}

export interface OrderStatusResponse {
  orderId: string;
  orderStatus: string;
  paymentStatus?: string;
  cfOrderId: string;
  orderAmount: number;
  paymentTime?: string;
  paymentMessage?: string;
}

class CashfreeService {
  private baseUrl: string;
  private appId: string;
  private secretKey: string;

  constructor() {
    // Set base URL based on environment
    this.baseUrl = config.cashfree.environment === 'PRODUCTION'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    this.appId = config.cashfree.appId;
    this.secretKey = config.cashfree.secretKey;

    console.log('[Cashfree] Initialized with:', {
      environment: config.cashfree.environment,
      baseUrl: this.baseUrl,
      appId: this.appId.substring(0, 10) + '...',
    });
  }

  /**
   * Create a payment order and get payment session ID using direct HTTP API
   */
  async createOrder(orderData: CreateOrderRequest): Promise<PaymentSessionResponse> {
    try {
      const orderRequest = {
        order_id: orderData.orderId,
        order_amount: orderData.orderAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: orderData.customerEmail.replace(/[@.]/g, '_'),
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          customer_phone: orderData.customerPhone,
        },
        order_meta: {
          return_url: `https://www.vellapanti.co.in/api/payments/callback?order_id={order_id}`,
          notify_url: `https://www.vellapanti.co.in/api/webhooks/cashfree`,
        },
      };

      console.log('[Cashfree] Creating order:', {
        orderId: orderRequest.order_id,
        amount: orderRequest.order_amount,
        customer: orderRequest.customer_details.customer_phone,
      });

      // Make direct HTTP request to Cashfree API
      const response = await axios.post(
        `${this.baseUrl}/orders`,
        orderRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-version': config.cashfree.apiVersion,
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
          },
        }
      );

      console.log('[Cashfree] API Response Status:', response.status);
      console.log('[Cashfree] API Response Data:', JSON.stringify(response.data, null, 2));

      if (!response.data || !response.data.payment_session_id) {
        throw new Error('Failed to create Cashfree order: No payment session ID in response');
      }

      console.log('[Cashfree] Order created successfully:', response.data.cf_order_id);

      return {
        paymentSessionId: response.data.payment_session_id,
        orderStatus: response.data.order_status,
        cfOrderId: response.data.cf_order_id || response.data.order_id,
      };
    } catch (error: any) {
      console.error('[Cashfree] Create order error - Full details:');
      console.error('Error message:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error response headers:', error.response?.headers);

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create payment order. Please try again.'
      );
    }
  }

  /**
   * Get order status from Cashfree
   */
  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    try {
      console.log('[Cashfree] Fetching order status for:', orderId);

      const response = await axios.get(
        `${this.baseUrl}/orders/${orderId}/payments`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-version': config.cashfree.apiVersion,
            'x-client-id': this.appId,
            'x-client-secret': this.secretKey,
          },
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new Error('No payment data found for this order');
      }

      const payment = response.data[0];

      console.log('[Cashfree] Order status fetched:', {
        orderId: payment.order_id,
        status: payment.payment_status,
      });

      return {
        orderId: payment.order_id,
        orderStatus: payment.order_status || 'ACTIVE',
        paymentStatus: payment.payment_status,
        cfOrderId: payment.cf_order_id || payment.order_id,
        orderAmount: payment.order_amount,
        paymentTime: payment.payment_time,
        paymentMessage: payment.payment_message,
      };
    } catch (error: any) {
      console.error('[Cashfree] Get order status error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch payment status. Please try again.'
      );
    }
  }

  /**
   * Verify webhook signature from Cashfree
   */
  verifyWebhookSignature(signature: string, timestamp: string, rawBody: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', config.cashfree.secretKey)
        .update(timestamp + rawBody)
        .digest('base64');

      return signature === expectedSignature;
    } catch (error) {
      console.error('[Cashfree] Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Get payment link for customer
   */
  getPaymentLink(paymentSessionId: string): string {
    const baseUrl = config.cashfree.environment === 'PRODUCTION'
      ? 'https://payments.cashfree.com'
      : 'https://sandbox.cashfree.com';

    return `${baseUrl}/pay/${paymentSessionId}`;
  }
}

export const cashfreeService = new CashfreeService();
