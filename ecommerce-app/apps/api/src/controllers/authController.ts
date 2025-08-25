import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@ecommerce/database';
import { config } from '@ecommerce/config';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@ecommerce/types';

interface RefreshTokenRequest {
  refreshToken: string;
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
  const { email, password, name }: RegisterRequest = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'USER',
    },
    include: {
      addresses: true,
    },
  });

  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

  const { password: _, ...userWithoutPassword } = user;

  const response: AuthResponse = {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };

  res.status(201).json({
    success: true,
    data: response,
    message: 'Registration successful',
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