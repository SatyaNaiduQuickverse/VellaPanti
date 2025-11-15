import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@ecommerce/database';
import { config } from '@ecommerce/config';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';
import msg91Service from '../services/msg91Service';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@ecommerce/types';

interface RefreshTokenRequest {
  refreshToken: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface SendPhoneOtpRequest {
  phone: string;
}

interface VerifyPhoneOtpRequest {
  phone: string;
  otp: string;
}

const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, email, role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      addresses: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

  const { password: _, ...userWithoutPassword } = user;

  const response: AuthResponse = {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };

  res.json({
    success: true,
    data: response,
    message: 'Login successful',
  });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, phone }: RegisterRequest = req.body;

  // Validate phone number
  if (!msg91Service.isValidIndianPhone(phone)) {
    throw new AppError('Invalid phone number. Please enter a valid 10-digit Indian mobile number.', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    if (existingUser.isEmailVerified || existingUser.isPhoneVerified) {
      throw new AppError('User with this email already exists', 409);
    }
    // If user exists but not verified, allow resending OTP
    // Delete the old unverified user and create new one with new OTP
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
  }

  const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

  // Generate 6-digit OTP for phone
  const phoneOtp = crypto.randomInt(100000, 999999).toString();
  const phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Format phone number for storage
  const formattedPhone = msg91Service.formatPhoneNumber(phone);

  // Create user with unverified phone and OTP
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone: formattedPhone,
      role: 'USER',
      isEmailVerified: false,
      isPhoneVerified: false,
      phoneOtp,
      phoneOtpExpiry,
    },
  });

  // Send OTP via SMS
  try {
    await msg91Service.sendOTP(formattedPhone, phoneOtp);
  } catch (error) {
    // If SMS fails, delete the user and throw error
    await prisma.user.delete({ where: { id: user.id } });
    throw new AppError('Failed to send verification SMS. Please try again.', 500);
  }

  res.status(201).json({
    success: true,
    message: 'Registration initiated. Please check your phone for verification code.',
    data: {
      phone: formattedPhone,
      requiresVerification: true,
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken }: RefreshTokenRequest = req.body;

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
      userId: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.email,
      user.role
    );

    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      user: userWithoutPassword,
      accessToken,
      refreshToken: newRefreshToken,
    };

    res.json({
      success: true,
      data: response,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  // User is attached to request by auth middleware
  const userId = (req as any).user?.id;

  if (!userId) {
    throw new AppError('User not found', 404);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      addresses: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email }: ForgotPasswordRequest = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Return success even if user doesn't exist to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  // Update user with reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  // Send password reset email
  const resetUrl = `${config.client.apiUrl.replace(':3062', ':3061')}/reset-password?token=${resetToken}`;
  
  try {
    await emailService.sendPasswordReset(user.email, {
      customerName: user.name,
      resetToken,
      resetUrl,
    });

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email.',
    });
  } catch (error) {
    // Clear reset token if email fails
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    throw new AppError('Failed to send password reset email. Please try again.', 500);
  }
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password }: ResetPasswordRequest = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

  // Update user password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  res.json({
    success: true,
    message: 'Password has been reset successfully. You can now login with your new password.',
  });
});

export const sendPhoneOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone }: SendPhoneOtpRequest = req.body;

  // Validate phone number
  if (!msg91Service.isValidIndianPhone(phone)) {
    throw new AppError('Invalid phone number. Please enter a valid 10-digit Indian mobile number.', 400);
  }

  const formattedPhone = msg91Service.formatPhoneNumber(phone);

  // Find user by phone
  const user = await prisma.user.findFirst({
    where: { phone: formattedPhone },
  });

  if (!user) {
    throw new AppError('No user found with this phone number', 404);
  }

  if (user.isPhoneVerified) {
    throw new AppError('Phone number is already verified', 400);
  }

  // Generate new OTP
  const phoneOtp = crypto.randomInt(100000, 999999).toString();
  const phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Update user with new OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      phoneOtp,
      phoneOtpExpiry,
    },
  });

  // Send OTP via SMS
  try {
    await msg91Service.sendOTP(formattedPhone, phoneOtp);
  } catch (error) {
    throw new AppError('Failed to send verification SMS. Please try again.', 500);
  }

  res.json({
    success: true,
    message: 'OTP sent successfully to your phone.',
    data: {
      phone: formattedPhone,
    },
  });
});

export const verifyPhoneOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp }: VerifyPhoneOtpRequest = req.body;

  // Validate phone number
  if (!msg91Service.isValidIndianPhone(phone)) {
    throw new AppError('Invalid phone number. Please enter a valid 10-digit Indian mobile number.', 400);
  }

  const formattedPhone = msg91Service.formatPhoneNumber(phone);

  // Find user by phone with valid OTP
  const user = await prisma.user.findFirst({
    where: {
      phone: formattedPhone,
      phoneOtp: otp,
      phoneOtpExpiry: {
        gt: new Date(),
      },
    },
    include: {
      addresses: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  // Mark phone as verified and clear OTP
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPhoneVerified: true,
      phoneOtp: null,
      phoneOtpExpiry: null,
    },
  });

  // Generate authentication tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

  const { password: _, ...userWithoutPassword } = user;

  const response: AuthResponse = {
    user: {
      ...userWithoutPassword,
      isPhoneVerified: true,
    },
    accessToken,
    refreshToken,
  };

  res.json({
    success: true,
    data: response,
    message: 'Phone verified successfully. You are now logged in.',
  });
});