import nodemailer from 'nodemailer';
import { config } from '@ecommerce/config';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface OrderEmailData {
  customerName: string;
  orderId: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface PasswordResetEmailData {
  customerName: string;
  resetToken: string;
  resetUrl: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private isEmailConfigured: boolean;

  constructor() {
    // Check if email credentials are configured
    this.isEmailConfigured = !!(config.email.user && config.email.password);

    // TEMPORARY: Force console mode for testing
    // TODO: Fix Gmail App Password to enable real email sending
    const forceConsoleMode = true;

    // In development or when email is not configured, use a dummy transporter
    if (!this.isEmailConfigured || forceConsoleMode) {
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
      console.log('📧 Email service in CONSOLE MODE - OTP codes will be logged to console');
    } else {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
      console.log('📧 Email service configured with SMTP:', config.email.host);
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      // If email is not configured or in development, just log to console
      if (!this.isEmailConfigured || config.isDevelopment || true) {
        console.log('\n📧 ========== EMAIL SENT (Console Mode) ==========');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('------- Content -------');
        console.log(options.text || 'See HTML version');
        console.log('=================================================\n');
        return;
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendOrderConfirmation(email: string, orderData: OrderEmailData): Promise<void> {
    const subject = `Order Confirmation - Order #${orderData.orderId}`;
    
    const text = `
Dear ${orderData.customerName},

Thank you for your order! Your order #${orderData.orderId} has been received and is being processed.

Order Details:
${orderData.orderItems.map(item => 
  `- ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`
).join('\n')}

Total: $${orderData.orderTotal.toFixed(2)}

Shipping Address:
${orderData.shippingAddress.street}
${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}
${orderData.shippingAddress.country}

We'll send you another email when your order ships.

Thank you for shopping with us!

Best regards,
VellaPanti Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .order-details { background-color: #fff; border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        .item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 1.2em; color: #28a745; }
        .address { background-color: #f8f9fa; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
            <p>Order #${orderData.orderId}</p>
        </div>
        
        <p>Dear ${orderData.customerName},</p>
        <p>Thank you for your order! Your order has been received and is being processed.</p>
        
        <div class="order-details">
            <h3>Order Details:</h3>
            ${orderData.orderItems.map(item => `
                <div class="item">
                    <strong>${item.name}</strong><br>
                    Quantity: ${item.quantity} × $${item.price.toFixed(2)}
                </div>
            `).join('')}
            <div class="total">
                Total: $${orderData.orderTotal.toFixed(2)}
            </div>
        </div>
        
        <div class="address">
            <h3>Shipping Address:</h3>
            <p>
                ${orderData.shippingAddress.street}<br>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}<br>
                ${orderData.shippingAddress.country}
            </p>
        </div>
        
        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for shopping with us!</p>
        
        <p>Best regards,<br>VellaPanti Team</p>
    </div>
</body>
</html>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async sendPasswordReset(email: string, resetData: PasswordResetEmailData): Promise<void> {
    const subject = 'Password Reset Request - VellaPanti';
    
    const text = `
Dear ${resetData.customerName},

You have requested to reset your password for your VellaPanti account.

Please click the following link to reset your password:
${resetData.resetUrl}

This link will expire in 1 hour for security reasons.

If you did not request this password reset, please ignore this email.

Best regards,
VellaPanti Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #007bff; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0; 
        }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        
        <p>Dear ${resetData.customerName},</p>
        <p>You have requested to reset your password for your VellaPanti account.</p>
        
        <div style="text-align: center;">
            <a href="${resetData.resetUrl}" class="button">Reset Password</a>
        </div>
        
        <div class="warning">
            <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons.
        </div>
        
        <p>If you did not request this password reset, please ignore this email.</p>
        
        <p>Best regards,<br>VellaPanti Team</p>
    </div>
</body>
</html>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async sendOrderStatusUpdate(email: string, customerName: string, orderId: string, status: string): Promise<void> {
    const subject = `Order Update - Order #${orderId}`;
    
    const statusMessages = {
      PROCESSING: 'Your order is now being processed.',
      SHIPPED: 'Your order has been shipped and is on its way!',
      DELIVERED: 'Your order has been delivered. Thank you for shopping with us!',
      CANCELLED: 'Your order has been cancelled.',
    };

    const text = `
Dear ${customerName},

Your order #${orderId} status has been updated.

Status: ${status}
${statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.'}

Thank you for shopping with us!

Best regards,
VellaPanti Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .status { padding: 15px; margin: 15px 0; border-radius: 4px; }
        .status.PROCESSING { background-color: #fff3cd; border: 1px solid #ffeaa7; }
        .status.SHIPPED { background-color: #d4edda; border: 1px solid #c3e6cb; }
        .status.DELIVERED { background-color: #d1ecf1; border: 1px solid #bee5eb; }
        .status.CANCELLED { background-color: #f8d7da; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Status Update</h1>
            <p>Order #${orderId}</p>
        </div>
        
        <p>Dear ${customerName},</p>
        <p>Your order status has been updated.</p>
        
        <div class="status ${status}">
            <strong>Status: ${status}</strong><br>
            ${statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.'}
        </div>
        
        <p>Thank you for shopping with us!</p>
        
        <p>Best regards,<br>VellaPanti Team</p>
    </div>
</body>
</html>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async sendSupportTicket(ticketData: {
    subject: string;
    category: string;
    priority: string;
    message: string;
    customerName?: string;
    customerEmail?: string;
  }): Promise<void> {
    const subject = `New Support Ticket: ${ticketData.subject}`;

    const text = `
New Support Ticket Received

Category: ${ticketData.category}
Priority: ${ticketData.priority}
Subject: ${ticketData.subject}

From: ${ticketData.customerName || 'Guest'} ${ticketData.customerEmail ? `(${ticketData.customerEmail})` : ''}

Message:
${ticketData.message}

---
This ticket was submitted via the VellaPanti website contact form.
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Support Ticket</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #000; }
        .ticket-info { background-color: #fff; border: 2px solid #000; padding: 20px; margin: 20px 0; }
        .priority-high { border-left: 4px solid #dc3545; }
        .priority-critical { border-left: 4px solid #dc3545; background-color: #fff5f5; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #28a745; }
        .message-content { background-color: #f8f9fa; padding: 15px; margin: 15px 0; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NEW SUPPORT TICKET</h1>
            <p><strong>${ticketData.subject}</strong></p>
        </div>

        <div class="ticket-info priority-${ticketData.priority.toLowerCase()}">
            <h3>Ticket Details:</h3>
            <p><strong>Category:</strong> ${ticketData.category}</p>
            <p><strong>Priority:</strong> ${ticketData.priority.toUpperCase()}</p>
            <p><strong>From:</strong> ${ticketData.customerName || 'Guest'} ${ticketData.customerEmail ? `(${ticketData.customerEmail})` : ''}</p>
        </div>

        <div class="message-content">
            <h3>Message:</h3>
            <p>${ticketData.message.replace(/\n/g, '<br>')}</p>
        </div>

        <hr>
        <p><em>This ticket was submitted via the VellaPanti website contact form.</em></p>
    </div>
</body>
</html>
    `;

    // Send to support team email (in production this would be configured)
    const supportEmail = config.email.supportEmail || 'support@vellapanti.com';
    await this.sendEmail({ to: supportEmail, subject, text, html });
  }

  async sendOtpEmail(email: string, otp: string, customerName: string): Promise<void> {
    const subject = 'Verify Your Email - VellaPanti';

    const text = `
Dear ${customerName},

Welcome to VellaPanti!

Your verification code is: ${otp}

This code will expire in 10 minutes for security reasons.

Please enter this code to complete your registration.

If you did not request this verification code, please ignore this email.

Best regards,
VellaPanti Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
        .header { background-color: #000000; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .content { padding: 30px 20px; }
        .otp-box {
            background: linear-gradient(135deg, #000000 0%, #333333 100%);
            color: white;
            text-align: center;
            padding: 30px;
            margin: 30px 0;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .otp-code {
            font-size: 42px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #ffffff;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VellaPanti</h1>
        </div>

        <div class="content">
            <p>Dear ${customerName},</p>
            <p>Welcome to <strong>VellaPanti</strong>! We're excited to have you join our streetwear community.</p>

            <p>Please use the following verification code to complete your registration:</p>

            <div class="otp-box">
                <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
            </div>

            <div class="warning">
                <strong>⏱ Security Notice:</strong> This verification code will expire in 10 minutes for security reasons.
            </div>

            <p>If you did not request this verification code, please ignore this email.</p>
        </div>

        <div class="footer">
            <p>Best regards,<br><strong>VellaPanti Team</strong></p>
            <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.isEmailConfigured || config.isDevelopment) {
        console.log('📧 Email service in CONSOLE MODE - no SMTP connection needed');
        return true;
      }

      await this.transporter.verify();
      console.log('✅ Email service SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();