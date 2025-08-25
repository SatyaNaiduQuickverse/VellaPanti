import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { ProductFilters, PaginatedResponse, Product } from '@ecommerce/types';

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    categoryId,
    search,
    minPrice,
    maxPrice,
    sort = 'createdAt',
    sortOrder = 'desc',
  } = req.query as any;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
    if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
  }

  const orderBy: any = {};
  if (sort === 'rating') {
    // For rating sort, we'll use a subquery approach
    orderBy.reviews = {
      _count: sortOrder,
    };
  } else {
    orderBy[sort] = sortOrder;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Calculate average rating and review count
  const productsWithRating = products.map((product) => {
    const reviews = product.reviews;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

    return {
      ...product,
      averageRating,
      reviewCount: reviews.length,
      reviews: undefined, // Remove reviews from response
    };
  });

  const response: PaginatedResponse<Product> = {
    data: productsWithRating as Product[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  res.json({
    success: true,
    ...response,
  });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Calculate average rating
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : null;

  const productWithRating = {
    ...product,
    averageRating,
    reviewCount: product.reviews.length,
  };

  res.json({
    success: true,
    data: productWithRating,
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Calculate average rating
  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : null;

  const productWithRating = {
    ...product,
    averageRating,
    reviewCount: product.reviews.length,
    reviews: undefined,
  };

  res.json({
    success: true,
    data: productWithRating,
  });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const productData = req.body;

  const product = await prisma.product.create({
    data: productData,
    include: {
      category: {
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
    data: product,
    message: 'Product created successfully',
  });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: {
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
    data: product,
    message: 'Product updated successfully',
  });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  await prisma.product.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});