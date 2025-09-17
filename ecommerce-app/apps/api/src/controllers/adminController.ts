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
    prisma.product.findMany({
      where: {
        stock: { lte: 10 },
      },
      take: 10,
      include: {
        category: {
          select: { name: true, slug: true },
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