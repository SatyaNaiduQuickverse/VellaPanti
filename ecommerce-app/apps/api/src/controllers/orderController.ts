import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';
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
          productVariant: {
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              material: true,
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
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
              basePrice: true,
              baseSalePrice: true,
            },
          },
          productVariant: {
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              material: true,
              price: true,
              salePrice: true,
              images: true,
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

export const getOrderForSuccess = asyncHandler(async (req: AuthRequest, res: Response) => {
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
              images: true,
            },
          },
          productVariant: {
            select: {
              id: true,
              size: true,
              color: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if user owns this order
  if (order.userId !== userId) {
    throw new AppError('Access denied', 403);
  }

  // Additional check: Allow access to orders created within the last 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  if (order.createdAt < thirtyMinutesAgo) {
    // For older orders, ensure stricter authentication
    if (!req.user || order.userId !== req.user.id) {
      throw new AppError('Access denied', 403);
    }
  }

  // Return limited order data for success page
  const orderData = {
    id: order.id,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    shippingStreet: order.shippingStreet,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingZipCode: order.shippingZipCode,
    shippingCountry: order.shippingCountry,
    items: order.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      variantSize: item.variantSize,
      variantColor: item.variantColor,
      product: {
        id: item.product.id,
        name: item.product.name,
        images: item.product.images,
      },
    })),
  };

  res.json({
    success: true,
    data: orderData,
  });
});

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { shippingAddress, items }: CreateOrderRequest = req.body;

  if (items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }

  // Get unique product IDs and variant IDs
  const productIds = items.map(item => item.productId);
  const variantIds = items.map(item => item.productVariantId).filter(Boolean) as string[];

  // Fetch products and variants
  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
    }),
    variantIds.length > 0 ? prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
    }) : Promise.resolve([]),
  ]);

  if (products.length !== [...new Set(productIds)].length) {
    throw new AppError('One or more products not found', 404);
  }

  let total = 0;
  const orderItems: Array<{
    productId: string;
    productVariantId?: string | null;
    quantity: number;
    price: number;
    variantSize?: string | null;
    variantColor?: string | null;
    variantMaterial?: string | null;
  }> = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      throw new AppError(`Product with ID ${item.productId} not found`, 404);
    }

    let variant = null;
    let price = 0;
    let currentStock = 0;

    if (item.productVariantId) {
      variant = variants.find(v => v.id === item.productVariantId);
      if (!variant) {
        throw new AppError(`Product variant with ID ${item.productVariantId} not found`, 404);
      }

      price = variant.salePrice || variant.price;
      currentStock = variant.stock;
    } else {
      // For products without variants, use base price and calculate total stock
      price = product.baseSalePrice || product.basePrice || 0;
      const totalStockResult = await prisma.productVariant.aggregate({
        where: { productId: product.id },
        _sum: { stock: true },
      });
      currentStock = totalStockResult._sum.stock || 0;
    }

    if (currentStock < item.quantity) {
      throw new AppError(`Insufficient stock for product ${product.name}${variant ? ` (${variant.color} ${variant.size})` : ''}`, 400);
    }

    total += price * item.quantity;

    orderItems.push({
      productId: item.productId,
      productVariantId: item.productVariantId || null,
      quantity: item.quantity,
      price,
      variantSize: variant?.size || null,
      variantColor: variant?.color || null,
      variantMaterial: variant?.material || null,
    });
  }

  // Create order with transaction
  const order = await prisma.$transaction(async (tx) => {
    // Update variant stock
    for (const item of items) {
      if (item.productVariantId) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // Calculate estimated delivery (5 business days from now)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

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
        estimatedDelivery: estimatedDeliveryDate,
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
            productVariant: {
              select: {
                id: true,
                sku: true,
                size: true,
                color: true,
                material: true,
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

  // Send order confirmation email
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user) {
      await emailService.sendOrderConfirmation(user.email, {
        customerName: user.name,
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
    }
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError);
    // Don't fail the order creation if email fails
  }

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
              slug: true,
              images: true,
            },
          },
          productVariant: {
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              material: true,
              images: true,
            },
          },
        },
      },
    },
  });

  // Send order status update email
  try {
    await emailService.sendOrderStatusUpdate(
      order.user.email,
      order.user.name,
      order.id,
      status
    );
  } catch (emailError) {
    console.error('Failed to send order status update email:', emailError);
    // Don't fail the status update if email fails
  }

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

  const {
    page = 1,
    limit = 20,
    search,
    status
  } = req.query as any;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause for filtering
  const where: any = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (search) {
    where.OR = [
      {
        id: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        user: {
          OR: [
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
          ],
        },
      },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limitNum,
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
            productVariant: {
              select: {
                id: true,
                sku: true,
                size: true,
                color: true,
                material: true,
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
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});


// Get order tracking information
export const getOrderTracking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'ADMIN';

  // Build where clause based on user role
  const where: any = { id };
  if (!isAdmin) {
    where.userId = userId;
  }

  const order = await prisma.order.findUnique({
    where,
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      trackingNumber: true,
      estimatedDelivery: true,
      shippingStreet: true,
      shippingCity: true,
      shippingState: true,
      shippingZipCode: true,
      shippingCountry: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Mock tracking events based on order status and dates
  const mockTrackingEvents = [];
  const orderDate = new Date(order.createdAt);

  // Always add order placed event
  mockTrackingEvents.push({
    status: 'ORDER_PLACED',
    message: 'Order has been placed and confirmed',
    timestamp: order.createdAt,
    location: 'Online',
  });

  // Add events based on current status
  if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
    mockTrackingEvents.push({
      status: 'PROCESSING',
      message: 'Order is being prepared for shipment',
      timestamp: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      location: 'Warehouse',
    });
  }

  if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
    mockTrackingEvents.push({
      status: 'SHIPPED',
      message: 'Package has been shipped and is on the way',
      timestamp: new Date(orderDate.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      location: 'Distribution Center',
    });
  }

  if (order.status === 'DELIVERED') {
    mockTrackingEvents.push({
      status: 'DELIVERED',
      message: 'Package has been delivered successfully',
      timestamp: new Date(orderDate.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      location: `${order.shippingCity}, ${order.shippingState}`,
    });
  }

  res.json({
    success: true,
    data: {
      order,
      events: mockTrackingEvents,
    },
  });
});