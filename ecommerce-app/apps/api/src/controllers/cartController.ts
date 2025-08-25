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
          price: true,
          salePrice: true,
          images: true,
          stock: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const total = cartItems.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
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
  const { productId, quantity } = req.body;

  // Check if product exists and has enough stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  // Check if item already exists in cart
  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + quantity;
    
    if (product.stock < newQuantity) {
      throw new AppError('Insufficient stock', 400);
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: {
        quantity: newQuantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            images: true,
            stock: true,
          },
        },
      },
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
        quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            images: true,
            stock: true,
          },
        },
      },
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
    },
  });

  if (!cartItem || cartItem.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  if (cartItem.product.stock < quantity) {
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
          price: true,
          salePrice: true,
          images: true,
          stock: true,
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