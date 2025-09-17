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

// Enhanced product search with category filtering and facets
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    q, // search query
    categories, // comma-separated category slugs
    minPrice,
    maxPrice,
    inStock = true,
    minRating,
    sort = 'relevance', // relevance, price, rating, newest
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = req.query as any;

  const skip = (page - 1) * limit;

  const where: any = {};

  // Text search
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  // Category filter
  if (categories) {
    const categoryList = categories.split(',').map((cat: string) => cat.trim());
    const categoryIds = await prisma.category.findMany({
      where: {
        slug: { in: categoryList },
      },
      select: { id: true },
    });
    
    if (categoryIds.length > 0) {
      where.categoryId = { in: categoryIds.map(cat => cat.id) };
    }
  }

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
    if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
  }

  // Stock filter
  if (inStock === 'true') {
    where.stock = { gt: 0 };
  }

  // Build order by clause
  let orderBy: any = {};
  if (sort === 'price') {
    orderBy.price = sortOrder;
  } else if (sort === 'newest') {
    orderBy.createdAt = 'desc';
  } else if (sort === 'rating') {
    orderBy.reviews = { _count: 'desc' };
  } else {
    orderBy.createdAt = 'desc'; // default relevance
  }

  const [products, total, facets] = await Promise.all([
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
    // Get facets for filtering
    Promise.all([
      // Category facets
      prisma.product.groupBy({
        by: ['categoryId'],
        where: q ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        } : {},
        _count: {
          categoryId: true,
        },
      }),
      // Price ranges
      prisma.product.aggregate({
        where: q ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        } : {},
        _min: { price: true },
        _max: { price: true },
      }),
    ]),
  ]);

  // Process products with ratings
  const productsWithRating = products.map(product => {
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : null;
    
    // Filter by minimum rating if specified
    if (minRating && averageRating && averageRating < parseFloat(minRating)) {
      return null;
    }

    const { reviews, ...productData } = product;
    return {
      ...productData,
      averageRating,
      reviewCount: product._count.reviews,
    };
  }).filter(Boolean);

  // Process facets
  const [categoryFacets, priceRange] = facets;
  
  // Get category details for facets
  const categoryIds = categoryFacets.map(f => f.categoryId);
  const categoryDetails = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, slug: true },
  });

  const processedCategoryFacets = categoryFacets.map(facet => {
    const category = categoryDetails.find(cat => cat.id === facet.categoryId);
    return {
      ...category,
      count: facet._count.categoryId,
    };
  });

  res.json({
    success: true,
    data: productsWithRating,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
    facets: {
      categories: processedCategoryFacets,
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 0,
      },
    },
    filters: {
      q,
      categories: categories ? categories.split(',') : [],
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      inStock: inStock === 'true',
    },
  });
});

// Get all categories for filter dropdown
export const getCategoriesForFilter = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
    where: {
      products: {
        some: {}, // Only categories with products
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Organize categories hierarchically
  const rootCategories = categories.filter(cat => !cat.parentId);
  const childCategories = categories.filter(cat => cat.parentId);

  const hierarchicalCategories = rootCategories.map(root => ({
    ...root,
    children: childCategories.filter(child => child.parentId === root.id),
  }));

  res.json({
    success: true,
    data: hierarchicalCategories,
  });
});