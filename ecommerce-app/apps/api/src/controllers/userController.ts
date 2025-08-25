import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

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

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { name } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
    message: 'Profile updated successfully',
  });
});

export const getAddresses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const addresses = await prisma.userAddress.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  res.json({
    success: true,
    data: addresses,
  });
});

export const createAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { street, city, state, zipCode, country, isDefault = false } = req.body;

  // If this is set as default, unset other default addresses
  if (isDefault) {
    await prisma.userAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.userAddress.create({
    data: {
      userId,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    },
  });

  res.status(201).json({
    success: true,
    data: address,
    message: 'Address created successfully',
  });
});

export const updateAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { street, city, state, zipCode, country, isDefault } = req.body;

  const existingAddress = await prisma.userAddress.findUnique({
    where: { id },
  });

  if (!existingAddress || existingAddress.userId !== userId) {
    throw new AppError('Address not found', 404);
  }

  // If this is set as default, unset other default addresses
  if (isDefault) {
    await prisma.userAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.userAddress.update({
    where: { id },
    data: {
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    },
  });

  res.json({
    success: true,
    data: address,
    message: 'Address updated successfully',
  });
});

export const deleteAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existingAddress = await prisma.userAddress.findUnique({
    where: { id },
  });

  if (!existingAddress || existingAddress.userId !== userId) {
    throw new AppError('Address not found', 404);
  }

  await prisma.userAddress.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Address deleted successfully',
  });
});