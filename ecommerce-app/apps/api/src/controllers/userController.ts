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
  const { name, phone } = req.body;

  // Build update data object
  const updateData: { name?: string; phone?: string } = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
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

// Admin only - get all users
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  const {
    page = 1,
    limit = 20,
    search,
    role
  } = req.query as any;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause for filtering
  const where: any = {};

  if (role && role !== 'all') {
    where.role = role.toUpperCase();
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// Admin only - update user role
export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  const { id } = req.params;
  const { role } = req.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    throw new AppError('Invalid role. Must be USER or ADMIN', 400);
  }

  // Prevent admin from demoting themselves
  if (id === req.user!.id && role === 'USER') {
    throw new AppError('Cannot demote yourself', 400);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
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
    message: 'User role updated successfully',
  });
});

// Get user account stats
export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    // Get total orders and total spent
    const orderStats = await prisma.order.aggregate({
      where: { userId },
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
    });

    // Calculate loyalty points (1 point per Rs. 100 spent)
    const totalSpent = orderStats._sum.total || 0;
    const loyaltyPoints = Math.floor(totalSpent / 100);

    res.json({
      success: true,
      data: {
        totalOrders: orderStats._count.id || 0,
        totalSpent: totalSpent,
        loyaltyPoints: loyaltyPoints,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats',
    });
  }
});