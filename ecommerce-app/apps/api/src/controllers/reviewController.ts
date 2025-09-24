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
  console.log('Create review request:', {
    body: req.body,
    userId: req.userId,
    headers: req.headers.authorization
  });

  const userId = req.userId!;
  const { productId, rating, title, comment, images = [] } = req.body;

  if (!productId || !rating) {
    throw new AppError('Product ID and rating are required', 400);
  }

  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

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

  // Check if user has purchased this product (optional - allow reviews from all users)
  const hasOrdered = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: 'DELIVERED',
      },
    },
  });

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      title,
      comment,
      images,
      isVerified: !!hasOrdered, // Mark as verified if they purchased
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
  const userId = req.userId!;
  const { id } = req.params;
  const { rating, title, comment, images } = req.body;

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
      ...(rating && { rating }),
      ...(title !== undefined && { title }),
      ...(comment !== undefined && { comment }),
      ...(images !== undefined && { images }),
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
  const userId = req.userId!;
  const { id } = req.params;

  const existingReview = await prisma.review.findUnique({
    where: { id },
  });

  if (!existingReview) {
    throw new AppError('Review not found', 404);
  }

  // Allow user to delete their own review
  if (existingReview.userId !== userId) {
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

// Get product reviews with stats
export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = 'newest' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  let orderBy: any = { createdAt: 'desc' };

  switch (sort) {
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'highest':
      orderBy = { rating: 'desc' };
      break;
    case 'lowest':
      orderBy = { rating: 'asc' };
      break;
    case 'helpful':
      orderBy = { isHelpful: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  const [reviews, totalCount, averageRating] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
      skip,
      take: Number(limit),
    }),
    prisma.review.count({
      where: { productId },
    }),
    prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  // Get rating distribution
  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { productId },
    _count: { rating: true },
  });

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach(item => {
    distribution[item.rating as keyof typeof distribution] = item._count.rating;
  });

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit)),
      },
      summary: {
        averageRating: averageRating._avg.rating || 0,
        totalReviews: averageRating._count.rating,
        distribution,
      },
    },
  });
});

// Mark review as helpful
export const markReviewHelpful = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      isHelpful: review.isHelpful + 1,
    },
  });

  res.json({
    success: true,
    message: 'Review marked as helpful',
    data: { helpfulCount: updatedReview.isHelpful },
  });
});