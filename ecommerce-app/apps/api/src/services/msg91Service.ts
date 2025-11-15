import axios from 'axios';
import { config } from '@ecommerce/config';

const MSG91_BASE_URL = 'https://control.msg91.com/api/v5';

interface SendOTPResponse {
  type: string;
  message: string;
}

interface VerifyOTPResponse {
  type: string;
  message: string;
}

/**
 * Send OTP to phone number using MSG91
 * @param phone - Phone number with country code (e.g., 919876543210)
 * @param otp - 6-digit OTP to send
 */
export const sendOTP = async (phone: string, otp: string): Promise<void> => {
  try {
    const authKey = config.msg91.authKey;
    const templateId = config.msg91.templateId;

    if (!authKey) {
      throw new Error('MSG91_AUTH_KEY not configured');
    }

    // Clean phone number - remove any spaces, dashes, or special characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Ensure phone starts with country code (91 for India)
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    // Use MSG91 OTP API v5 (handles DLT automatically)
    const otpUrl = `https://control.msg91.com/api/v5/otp`;

    const otpParams: any = {
      authkey: authKey,
      mobile: formattedPhone,
      otp: otp,
    };

    // Add template_id if available
    if (templateId) {
      otpParams.template_id = templateId;
    }

    console.log(`Sending OTP to ${formattedPhone} via MSG91 OTP API...`);

    const response = await axios.post(otpUrl, null, { params: otpParams });

    console.log(`MSG91 Response:`, JSON.stringify(response.data));

    if (response.data.type === 'error') {
      console.error(`MSG91 Error Response:`, response.data);
      throw new Error(`MSG91 Error: ${response.data.message}`);
    }

    if (response.data.type === 'success') {
      console.log(`✅ OTP sent successfully to ${formattedPhone} - Request ID: ${response.data.request_id}`);
    } else {
      console.warn(`MSG91 returned unexpected response:`, response.data);
    }
  } catch (error) {
    console.error('MSG91 send OTP error:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to send OTP: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('Failed to send OTP via SMS');
  }
};

/**
 * Format phone number for storage (remove country code prefix)
 * @param phone - Raw phone number input
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Remove country code if present (assuming 91 for India)
  if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }

  return cleaned;
};

/**
 * Validate Indian phone number format
 * @param phone - Phone number to validate
 * @returns Boolean indicating if phone is valid
 */
export const isValidIndianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');

  // Indian mobile numbers are 10 digits starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;

  // Check with or without country code
  if (cleaned.length === 10) {
    return phoneRegex.test(cleaned);
  }

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return phoneRegex.test(cleaned.substring(2));
  }

  return false;
};

export default {
  sendOTP,
  formatPhoneNumber,
  isValidIndianPhone,
};
