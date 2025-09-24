import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { imageService } from '../services/uploadService';
import type { AuthRequest } from '../middleware/auth';

// Dashboard Stats
export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const [
    totalProducts,
    totalCategories,
    totalOrders,
    totalUsers,
    recentOrders,
    topProducts,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.product.findMany({
      take: 5,
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: {
        orderItems: {
          _count: 'desc',
        },
      },
    }),
    prisma.productVariant.findMany({
      where: {
        stock: { lte: 10 },
      },
      take: 10,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            category: {
              select: { name: true, slug: true },
            },
          },
        },
      },
      orderBy: { stock: 'asc' },
    }),
  ]);

  const monthlyRevenue = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
      status: {
        in: ['DELIVERED'],
      },
    },
    _sum: {
      total: true,
    },
  });

  const revenue = monthlyRevenue.reduce((sum, order) => sum + (order._sum.total || 0), 0);

  res.json({
    success: true,
    data: {
      stats: {
        totalProducts,
        totalCategories,
        totalOrders,
        totalUsers,
        monthlyRevenue: revenue,
      },
      recentOrders,
      topProducts,
      lowStockProducts,
    },
  });
});

// Category Management
export const getAllCategoriesAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, search } = req.query as any;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.category.count({ where }),
  ]);

  res.json({
    success: true,
    data: categories,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getCategoryById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: {
        select: { id: true, name: true, slug: true },
      },
      children: {
        select: { id: true, name: true, slug: true },
      },
      products: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          images: true,
        },
        take: 10,
      },
      _count: {
        select: { products: true },
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

// Product Management
export const getAllProductsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 20,
    search,
    categoryId,
    status = 'all', // all, active, inactive, low-stock
    sort = 'createdAt',
    sortOrder = 'desc',
  } = req.query as any;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (status === 'low-stock') {
    where.stock = { lte: 10 };
  } else if (status === 'out-of-stock') {
    where.stock = { lte: 0 };
  }

  const orderBy: any = {};
  orderBy[sort] = sortOrder;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      reviews: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      orderItems: {
        include: {
          order: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              user: {
                select: { name: true, email: true },
              },
            },
          },
        },
        orderBy: { order: { createdAt: 'desc' } },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
          orderItems: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Calculate average rating
  const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : null;

  res.json({
    success: true,
    data: {
      ...product,
      averageRating,
    },
  });
});

// Enhanced product creation with image handling
export const createProductAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, slug, description, price, salePrice, categoryId, stock, images } = req.body;

  // Check if slug already exists
  const existingProduct = await prisma.product.findUnique({
    where: { slug },
  });

  if (existingProduct) {
    throw new AppError('Product with this slug already exists', 409);
  }

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      stock: parseInt(stock),
      categoryId,
      images: images || [],
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully',
  });
});

export const updateProductAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, slug, description, price, salePrice, categoryId, stock, images } = req.body;

  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  // If slug is being updated, check for uniqueness
  if (slug && slug !== existingProduct.slug) {
    const slugExists = await prisma.product.findUnique({
      where: { slug },
    });

    if (slugExists) {
      throw new AppError('Product with this slug already exists', 409);
    }
  }

  // If category is being updated, verify it exists
  if (categoryId && categoryId !== existingProduct.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (salePrice !== undefined) updateData.salePrice = salePrice ? parseFloat(salePrice) : null;
  if (stock !== undefined) updateData.stock = parseInt(stock);
  if (categoryId !== undefined) updateData.categoryId = categoryId;
  if (images !== undefined) updateData.images = images;

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  res.json({
    success: true,
    data: product,
    message: 'Product updated successfully',
  });
});

export const deleteProductAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          orderItems: true,
          cartItems: true,
        },
      },
    },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  // Check if product has been ordered
  if (existingProduct._count.orderItems > 0) {
    throw new AppError('Cannot delete product that has been ordered. Consider marking it as inactive.', 400);
  }

  // Remove from carts first
  if (existingProduct._count.cartItems > 0) {
    await prisma.cartItem.deleteMany({
      where: { productId: id },
    });
  }

  // Delete associated images if they exist
  if (existingProduct.images && existingProduct.images.length > 0) {
    try {
      await imageService.deleteImages(existingProduct.images);
    } catch (error) {
      console.warn('Failed to delete some product images:', error);
    }
  }

  // Delete reviews
  await prisma.review.deleteMany({
    where: { productId: id },
  });

  // Delete product
  await prisma.product.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// Bulk operations
export const bulkUpdateProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productIds, updates } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new AppError('Product IDs are required', 400);
  }

  const updateData: any = {};
  if (updates.categoryId) updateData.categoryId = updates.categoryId;
  if (updates.stock !== undefined) updateData.stock = parseInt(updates.stock);
  if (updates.salePrice !== undefined) {
    updateData.salePrice = updates.salePrice ? parseFloat(updates.salePrice) : null;
  }

  const result = await prisma.product.updateMany({
    where: {
      id: { in: productIds },
    },
    data: updateData,
  });

  res.json({
    success: true,
    data: { updatedCount: result.count },
    message: `${result.count} products updated successfully`,
  });
});

export const bulkDeleteProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new AppError('Product IDs are required', 400);
  }

  // Check if any products have been ordered
  const productsWithOrders = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      orderItems: { some: {} },
    },
    select: { id: true, name: true },
  });

  if (productsWithOrders.length > 0) {
    throw new AppError(
      `Cannot delete products that have been ordered: ${productsWithOrders.map(p => p.name).join(', ')}`,
      400
    );
  }

  // Remove from carts
  await prisma.cartItem.deleteMany({
    where: { productId: { in: productIds } },
  });

  // Delete reviews
  await prisma.review.deleteMany({
    where: { productId: { in: productIds } },
  });

  // Delete products
  const result = await prisma.product.deleteMany({
    where: { id: { in: productIds } },
  });

  res.json({
    success: true,
    data: { deletedCount: result.count },
    message: `${result.count} products deleted successfully`,
  });
});

// Featured Products Management
export const getFeaturedProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { theme } = req.query as { theme?: 'BLACK' | 'WHITE' };

  const where: any = {};
  if (theme) {
    where.theme = theme;
  }

  const featuredProducts = await prisma.featuredProduct.findMany({
    where,
    include: {
      product: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
    orderBy: { position: 'asc' },
  });

  res.json({
    success: true,
    data: featuredProducts,
  });
});

export const updateFeaturedProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { blackFeaturedIds, whiteFeaturedIds } = req.body;

  if (!Array.isArray(blackFeaturedIds) || !Array.isArray(whiteFeaturedIds)) {
    throw new AppError('Invalid featured products data', 400);
  }

  // Validate that all products exist and have correct themes
  const blackProducts = await prisma.product.findMany({
    where: {
      id: { in: blackFeaturedIds },
      theme: 'BLACK',
    },
  });

  const whiteProducts = await prisma.product.findMany({
    where: {
      id: { in: whiteFeaturedIds },
      theme: 'WHITE',
    },
  });

  if (blackProducts.length !== blackFeaturedIds.length) {
    throw new AppError('Some BLACK theme products not found', 400);
  }

  if (whiteProducts.length !== whiteFeaturedIds.length) {
    throw new AppError('Some WHITE theme products not found', 400);
  }

  // Remove existing featured products
  await prisma.featuredProduct.deleteMany({});

  // Add new featured products
  const featuredProductsData = [
    ...blackFeaturedIds.map((productId: string, index: number) => ({
      productId,
      theme: 'BLACK' as const,
      position: index,
    })),
    ...whiteFeaturedIds.map((productId: string, index: number) => ({
      productId,
      theme: 'WHITE' as const,
      position: index,
    })),
  ];

  await prisma.featuredProduct.createMany({
    data: featuredProductsData,
  });

  res.json({
    success: true,
    message: 'Featured products updated successfully',
  });
});

// Carousel Images Management
export const getCarouselImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const carouselImages = await prisma.carouselImage.findMany({
    where: { isActive: true },
    orderBy: { position: 'asc' },
  });

  res.json({
    success: true,
    data: carouselImages,
  });
});

export const updateCarouselImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { images } = req.body;

  if (!Array.isArray(images)) {
    throw new AppError('Invalid carousel images data', 400);
  }

  // Validate required fields
  for (const image of images) {
    if (!image.src || !image.alt) {
      throw new AppError('Image src and alt are required', 400);
    }
  }

  // Remove existing carousel images
  await prisma.carouselImage.deleteMany({});

  // Add new carousel images
  const carouselImagesData = images.map((image: any, index: number) => ({
    src: image.src,
    alt: image.alt,
    title: image.title || null,
    description: image.description || null,
    position: index,
    isActive: true,
  }));

  await prisma.carouselImage.createMany({
    data: carouselImagesData,
  });

  res.json({
    success: true,
    message: 'Carousel images updated successfully',
  });
});

// Featured Collections Management
export const getFeaturedCollections = asyncHandler(async (req: AuthRequest, res: Response) => {
  const featuredCollections = await prisma.featuredCollection.findMany({
    include: {
      category: {
        select: { id: true, name: true, slug: true, image: true, theme: true },
      },
    },
    orderBy: { position: 'asc' },
  });

  res.json({
    success: true,
    data: featuredCollections,
  });
});

export const updateFeaturedCollections = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { blackFeaturedIds, whiteFeaturedIds } = req.body;

  if (!Array.isArray(blackFeaturedIds) || !Array.isArray(whiteFeaturedIds)) {
    throw new AppError('Invalid featured collections data', 400);
  }

  // Validate that categories exist
  const allCategoryIds = [...blackFeaturedIds, ...whiteFeaturedIds];
  if (allCategoryIds.length > 0) {
    const categories = await prisma.category.findMany({
      where: { id: { in: allCategoryIds } },
      select: { id: true, theme: true },
    });

    const foundIds = categories.map(cat => cat.id);
    const missingIds = allCategoryIds.filter(id => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new AppError(`Categories not found: ${missingIds.join(', ')}`, 404);
    }

    // Check theme matching
    const blackCategories = categories.filter(cat => blackFeaturedIds.includes(cat.id));
    const whiteCategories = categories.filter(cat => whiteFeaturedIds.includes(cat.id));

    const wrongBlackTheme = blackCategories.filter(cat => cat.theme !== 'BLACK');
    const wrongWhiteTheme = whiteCategories.filter(cat => cat.theme !== 'WHITE');

    if (wrongBlackTheme.length > 0) {
      throw new AppError(`Some BLACK theme categories not found: ${wrongBlackTheme.map(cat => cat.id).join(', ')}`, 400);
    }

    if (wrongWhiteTheme.length > 0) {
      throw new AppError(`Some WHITE theme categories not found: ${wrongWhiteTheme.map(cat => cat.id).join(', ')}`, 400);
    }
  }

  // Remove existing featured collections
  await prisma.featuredCollection.deleteMany({});

  // Create new featured collections
  const featuredCollectionsData = [
    ...blackFeaturedIds.map((categoryId: string, index: number) => ({
      categoryId,
      theme: 'BLACK' as const,
      position: index,
    })),
    ...whiteFeaturedIds.map((categoryId: string, index: number) => ({
      categoryId,
      theme: 'WHITE' as const,
      position: index,
    })),
  ];

  if (featuredCollectionsData.length > 0) {
    await prisma.featuredCollection.createMany({
      data: featuredCollectionsData,
    });
  }

  res.json({
    success: true,
    message: 'Featured collections updated successfully',
    data: { blackCount: blackFeaturedIds.length, whiteCount: whiteFeaturedIds.length },
  });
});

// Get homepage banners
export const getHomepageBanners = asyncHandler(async (req: Request, res: Response) => {
  const banners = await prisma.homepageBanner.findMany({
    orderBy: { theme: 'asc' }, // BLACK first, then WHITE
  });

  res.json({
    success: true,
    data: banners,
  });
});

// Update homepage banners
export const updateHomepageBanners = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { blackBanner, whiteBanner } = req.body;

  console.log('Updating homepage banners:', { blackBanner, whiteBanner });

  // Validate required fields (only src and alt are required, everything else is optional)
  const validateBanner = (banner: any, theme: string) => {
    if (!banner) return;
    if (!banner.src) {
      throw new AppError(`${theme} banner must have src field`, 400);
    }
    // Alt can be empty string, but should exist for accessibility
    if (banner.alt === undefined) {
      banner.alt = '';
    }
  };

  validateBanner(blackBanner, 'BLACK');
  validateBanner(whiteBanner, 'WHITE');

  const updates = [];

  // Update BLACK banner
  if (blackBanner) {
    const updateData = {
      theme: 'BLACK' as const,
      src: blackBanner.src,
      alt: blackBanner.alt,
      title: blackBanner.title || null,
      description: blackBanner.description || null,
      buttonText: blackBanner.buttonText || null,
      buttonLink: blackBanner.buttonLink || null,
      isActive: blackBanner.isActive !== undefined ? blackBanner.isActive : true,
    };

    const blackUpdate = prisma.homepageBanner.upsert({
      where: { theme: 'BLACK' },
      create: updateData,
      update: updateData,
    });
    updates.push(blackUpdate);
  }

  // Update WHITE banner
  if (whiteBanner) {
    const updateData = {
      theme: 'WHITE' as const,
      src: whiteBanner.src,
      alt: whiteBanner.alt,
      title: whiteBanner.title || null,
      description: whiteBanner.description || null,
      buttonText: whiteBanner.buttonText || null,
      buttonLink: whiteBanner.buttonLink || null,
      isActive: whiteBanner.isActive !== undefined ? whiteBanner.isActive : true,
    };

    const whiteUpdate = prisma.homepageBanner.upsert({
      where: { theme: 'WHITE' },
      create: updateData,
      update: updateData,
    });
    updates.push(whiteUpdate);
  }

  if (updates.length === 0) {
    throw new AppError('No banner data provided', 400);
  }

  const results = await Promise.all(updates);

  console.log('Homepage banners updated successfully:', results);

  res.json({
    success: true,
    message: 'Homepage banners updated successfully',
    data: results,
  });
});