import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.query;
  const { page = 1, limit = 20 } = req.query as any;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (productId) {
    where.productId = productId;
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.review.count({ where }),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getReviewById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  res.json({
    success: true,
    data: review,
  });
});

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId, rating, comment } = req.body;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if user has already reviewed this product
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 409);
  }

  // Check if user has purchased this product
  const hasOrdered = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: 'DELIVERED',
      },
    },
  });

  if (!hasOrdered) {
    throw new AppError('You can only review products you have purchased and received', 400);
  }

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: review,
    message: 'Review created successfully',
  });
});

export const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { rating, comment } = req.body;

  const existingReview = await prisma.review.findUnique({
    where: { id },
  });

  if (!existingReview) {
    throw new AppError('Review not found', 404);
  }

  if (existingReview.userId !== userId) {
    throw new AppError('You can only update your own reviews', 403);
  }

  const review = await prisma.review.update({
    where: { id },
    data: {
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: review,
    message: 'Review updated successfully',
  });
});

export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const existingReview = await prisma.review.findUnique({
    where: { id },
  });

  if (!existingReview) {
    throw new AppError('Review not found', 404);
  }

  // Allow user to delete their own review or admin to delete any review
  if (existingReview.userId !== userId && req.user!.role !== 'ADMIN') {
    throw new AppError('You can only delete your own reviews', 403);
  }

  await prisma.review.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Review deleted successfully',
  });
});