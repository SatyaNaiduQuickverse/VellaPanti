import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          baseSalePrice: true,
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
          price: true,
          salePrice: true,
          stock: true,
          images: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const total = cartItems.reduce((sum, item) => {
    const price = item.productVariant
      ? (item.productVariant.salePrice || item.productVariant.price)
      : (item.product.baseSalePrice || item.product.basePrice || 0);
    return sum + (price * item.quantity);
  }, 0);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  res.json({
    success: true,
    data: {
      items: cartItems,
      total,
      itemCount,
    },
  });
});

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId, productVariantId, quantity } = req.body;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: productVariantId ? {
        where: { id: productVariantId },
      } : false,
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  let variant = null;
  let currentStock = 0;

  if (productVariantId) {
    variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId, productId },
    });

    if (!variant) {
      throw new AppError('Product variant not found', 404);
    }

    currentStock = variant.stock;
  } else {
    // For products without variants, use total stock
    const totalStock = await prisma.productVariant.aggregate({
      where: { productId },
      _sum: { stock: true },
    });
    currentStock = totalStock._sum.stock || 0;
  }

  if (currentStock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  // Check if item already exists in cart (including variant combination)
  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId_productVariantId: {
        userId,
        productId,
        productVariantId: productVariantId || null,
      },
    },
  });

  const includeClause = {
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        baseSalePrice: true,
        images: true,
      },
    },
    productVariant: productVariantId ? {
      select: {
        id: true,
        sku: true,
        size: true,
        color: true,
        material: true,
        price: true,
        salePrice: true,
        stock: true,
        images: true,
      },
    } : false,
  };

  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + quantity;

    if (currentStock < newQuantity) {
      throw new AppError('Insufficient stock', 400);
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: {
        userId_productId_productVariantId: {
          userId,
          productId,
          productVariantId: productVariantId || null,
        },
      },
      data: {
        quantity: newQuantity,
      },
      include: includeClause,
    });

    res.json({
      success: true,
      data: updatedCartItem,
      message: 'Cart item updated successfully',
    });
  } else {
    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        productVariantId: productVariantId || null,
        quantity,
      },
      include: includeClause,
    });

    res.status(201).json({
      success: true,
      data: cartItem,
      message: 'Item added to cart successfully',
    });
  }
});

export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { quantity } = req.body;

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: {
      product: true,
      productVariant: true,
    },
  });

  if (!cartItem || cartItem.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  let currentStock = 0;
  if (cartItem.productVariant) {
    currentStock = cartItem.productVariant.stock;
  } else {
    // For products without variants, use total stock
    const totalStock = await prisma.productVariant.aggregate({
      where: { productId: cartItem.productId },
      _sum: { stock: true },
    });
    currentStock = totalStock._sum.stock || 0;
  }

  if (currentStock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  const updatedCartItem = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          baseSalePrice: true,
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
          price: true,
          salePrice: true,
          stock: true,
          images: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: updatedCartItem,
    message: 'Cart item updated successfully',
  });
});

export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
  });

  if (!cartItem || cartItem.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Item removed from cart successfully',
  });
});

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  await prisma.cartItem.deleteMany({
    where: { userId },
  });

  res.json({
    success: true,
    message: 'Cart cleared successfully',
  });
});