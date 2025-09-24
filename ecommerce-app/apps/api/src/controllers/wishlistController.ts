import { Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

// Get user's wishlist
export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          variants: {
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
          reviews: {
            select: { rating: true },
          },
          _count: {
            select: { reviews: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate average ratings and pricing for each product
  const wishlistWithDetails = wishlistItems.map(item => {
    const { product } = item;
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : null;

    // Calculate price range from variants
    let priceRange = null;
    let totalStock = 0;

    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map(v => v.salePrice || v.price).filter(p => p > 0);
      const originalPrices = product.variants.map(v => v.price).filter(p => p > 0);

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...originalPrices);
        const saleMinPrice = Math.min(...product.variants.map(v => v.salePrice).filter(p => p && p > 0));

        priceRange = {
          min: minPrice,
          max: maxPrice,
          saleMin: saleMinPrice > 0 ? saleMinPrice : null,
          hasVariablePrice: prices.length > 1 && Math.min(...prices) !== Math.max(...prices),
        };
      }

      totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }

    const { reviews, ...productData } = product;

    return {
      id: item.id,
      createdAt: item.createdAt,
      product: {
        ...productData,
        averageRating,
        reviewCount: product._count.reviews,
        priceRange,
        totalStock,
      },
    };
  });

  res.json({
    success: true,
    data: wishlistWithDetails,
  });
});

// Add product to wishlist
export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { productId } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if already in wishlist
  const existingWishlistItem = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existingWishlistItem) {
    throw new AppError('Product already in wishlist', 409);
  }

  // Add to wishlist
  const wishlistItem = await prisma.wishlist.create({
    data: { userId, productId },
    include: {
      product: {
        select: { id: true, name: true, images: true },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: `${product.name} added to wishlist`,
    data: wishlistItem,
  });
});

// Remove product from wishlist
export const removeFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { productId } = req.params;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  // Check if item exists in wishlist
  const existingWishlistItem = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
    include: {
      product: {
        select: { name: true },
      },
    },
  });

  if (!existingWishlistItem) {
    throw new AppError('Product not found in wishlist', 404);
  }

  // Remove from wishlist
  await prisma.wishlist.delete({
    where: { userId_productId: { userId, productId } },
  });

  res.json({
    success: true,
    message: `${existingWishlistItem.product.name} removed from wishlist`,
  });
});

// Toggle product in wishlist (add if not present, remove if present)
export const toggleWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { productId } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if already in wishlist
  const existingWishlistItem = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existingWishlistItem) {
    // Remove from wishlist
    await prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });

    res.json({
      success: true,
      action: 'removed',
      message: `${product.name} removed from wishlist`,
      inWishlist: false,
    });
  } else {
    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: { userId, productId },
    });

    res.json({
      success: true,
      action: 'added',
      message: `${product.name} added to wishlist`,
      inWishlist: true,
      data: wishlistItem,
    });
  }
});

// Check if product is in user's wishlist
export const checkWishlistStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { productId } = req.params;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  const wishlistItem = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  res.json({
    success: true,
    inWishlist: !!wishlistItem,
    data: wishlistItem,
  });
});

// Get wishlist count for user
export const getWishlistCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const count = await prisma.wishlist.count({
    where: { userId },
  });

  res.json({
    success: true,
    count,
  });
});