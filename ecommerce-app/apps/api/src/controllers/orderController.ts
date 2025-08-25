import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';
import type { CreateOrderRequest } from '@ecommerce/types';

export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json({
    success: true,
    data: orders,
  });
});

export const getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if user owns this order or is admin
  if (order.userId !== userId && req.user!.role !== 'ADMIN') {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    data: order,
  });
});

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { shippingAddress, items }: CreateOrderRequest = req.body;

  if (items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }

  // Validate products and calculate total
  const productIds = items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  if (products.length !== productIds.length) {
    throw new AppError('One or more products not found', 404);
  }

  let total = 0;
  const orderItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }> = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      throw new AppError(`Product with ID ${item.productId} not found`, 404);
    }

    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for product ${product.name}`, 400);
    }

    const price = product.salePrice || product.price;
    total += price * item.quantity;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price,
    });
  }

  // Create order with transaction
  const order = await prisma.$transaction(async (tx) => {
    // Update product stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        status: 'PENDING',
        total,
        shippingStreet: shippingAddress.street,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingZipCode: shippingAddress.zipCode,
        shippingCountry: shippingAddress.country,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    // Clear cart items for this user
    await tx.cartItem.deleteMany({
      where: { userId },
    });

    return newOrder;
  });

  res.status(201).json({
    success: true,
    data: order,
    message: 'Order created successfully',
  });
});

export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Only admins can update order status
  if (req.user!.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  const existingOrder = await prisma.order.findUnique({
    where: { id },
  });

  if (!existingOrder) {
    throw new AppError('Order not found', 404);
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    data: order,
    message: 'Order status updated successfully',
  });
});

// Admin only - get all orders
export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  const { page = 1, limit = 20 } = req.query as any;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.order.count(),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});