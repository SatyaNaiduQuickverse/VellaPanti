import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  res.json({
    success: true,
    data: categories,
  });
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  res.json({
    success: true,
    data: category,
  });
});

// Get products by category slug with pagination and filters
export const getCategoryProducts = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const {
    page = 1,
    limit = 20,
    search,
    minPrice,
    maxPrice,
    sort = 'createdAt',
    sortOrder = 'desc',
    inStock = true,
  } = req.query as any;

  const skip = (page - 1) * limit;

  // Find category first
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Build where clause for products
  const where: any = {
    categoryId: category.id,
  };

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

  if (inStock === 'true') {
    where.stock = { gt: 0 };
  }

  // Build order by clause
  const orderBy: any = {};
  if (sort === 'rating') {
    orderBy.reviews = { _count: sortOrder };
  } else {
    orderBy[sort] = sortOrder;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
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
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Calculate average ratings
  const productsWithRatings = products.map(product => {
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : null;
    
    const { reviews, ...productData } = product;
    return {
      ...productData,
      averageRating,
      reviewCount: product._count.reviews,
    };
  });

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: productsWithRatings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
    },
    category,
  });
});

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, slug, description, parentId } = req.body;

  // Check if slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategory) {
    throw new AppError('Category with this slug already exists', 409);
  }

  // If parentId is provided, verify parent exists
  if (parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: parentId },
    });

    if (!parentCategory) {
      throw new AppError('Parent category not found', 404);
    }
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      parentId,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully',
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, description, parentId } = req.body;

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      parentId,
    },
    include: {
      parent: {
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
    data: category,
    message: 'Category updated successfully',
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  if (existingCategory._count.products > 0) {
    throw new AppError('Cannot delete category with existing products', 400);
  }

  if (existingCategory._count.children > 0) {
    throw new AppError('Cannot delete category with subcategories', 400);
  }

  await prisma.category.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});