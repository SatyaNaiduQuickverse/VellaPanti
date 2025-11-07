import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';
import { imageService } from '../services/uploadService';

// Helper function to sort sizes in logical order
const sortSizes = (sizes: string[]): string[] => {
  const sizeOrder: { [key: string]: number } = {
    'XXS': 1,
    'XS': 2,
    'S': 3,
    'M': 4,
    'L': 5,
    'XL': 6,
    'XXL': 7,
    'XXXL': 8,
    '2XL': 7,
    '3XL': 8,
    '4XL': 9,
    '5XL': 10,
  };

  return sizes.sort((a, b) => {
    const aUpper = a.toUpperCase();
    const bUpper = b.toUpperCase();

    // Both are standard sizes
    if (sizeOrder[aUpper] && sizeOrder[bUpper]) {
      return sizeOrder[aUpper] - sizeOrder[bUpper];
    }

    // Both are numeric
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }

    // One is standard size, one is not
    if (sizeOrder[aUpper]) return -1;
    if (sizeOrder[bUpper]) return 1;

    // Alphabetical fallback
    return a.localeCompare(b);
  });
};

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const { theme } = req.query;

  const where: any = {};
  if (theme && (theme === 'BLACK' || theme === 'WHITE')) {
    where.theme = theme;
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          theme: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          theme: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: [
      {
        theme: 'asc', // BLACK comes before WHITE alphabetically
      },
      {
        name: 'asc', // Then sort by name within each theme
      },
    ],
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

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
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

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

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
    where.OR = [
      ...(where.OR || []),
      {
        basePrice: {
          ...(minPrice !== undefined && { gte: parseFloat(minPrice) }),
          ...(maxPrice !== undefined && { lte: parseFloat(maxPrice) }),
        },
      },
      {
        variants: {
          some: {
            price: {
              ...(minPrice !== undefined && { gte: parseFloat(minPrice) }),
              ...(maxPrice !== undefined && { lte: parseFloat(maxPrice) }),
            },
          },
        },
      },
    ];
  }

  if (inStock === 'true') {
    where.OR = [
      ...(where.OR || []),
      {
        variants: {
          some: {
            stock: { gt: 0 },
          },
        },
      },
    ];
  }

  // Build order by clause
  const orderBy: any = {};
  orderBy[sort] = sortOrder;

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
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  // Calculate average ratings and variant-based pricing
  const productsWithRatings = products.map(product => {
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : null;

    // Calculate price range and total stock from variants
    let priceRange = null;
    let totalStock = 0;
    let variantOptions = {
      colors: new Set<string>(),
      sizes: new Set<string>(),
      materials: new Set<string>(),
    };

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

      // Collect variant options
      product.variants.forEach(variant => {
        if (variant.color) variantOptions.colors.add(variant.color);
        if (variant.size) variantOptions.sizes.add(variant.size);
        if (variant.material) variantOptions.materials.add(variant.material);
      });
    }

    const { reviews, ...productData } = product;
    return {
      ...productData,
      averageRating,
      reviewCount: product._count.reviews,
      priceRange,
      totalStock,
      variantOptions: {
        colors: Array.from(variantOptions.colors),
        sizes: sortSizes(Array.from(variantOptions.sizes)),
        materials: Array.from(variantOptions.materials),
      },
    };
  });

  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: productsWithRatings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
    category,
  });
});

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, parentId, image } = req.body;
  const file = req.file as Express.Multer.File;

  // Generate slug from name
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Check if slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategory) {
    throw new AppError('Category with this name already exists', 409);
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

  // Process image (either uploaded file or URL)
  let imageUrl: string | null = null;
  if (file) {
    const processedImage = await imageService.processProductImage(file);
    imageUrl = processedImage.url;
  } else if (image) {
    imageUrl = image;
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      parentId: parentId || null,
      image: imageUrl,
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

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, parentId, existingImage } = req.body;
  const file = req.file as Express.Multer.File;

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  // Generate new slug if name changed
  let slug = existingCategory.slug;
  if (name && name !== existingCategory.name) {
    slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if new slug already exists
    const slugExists = await prisma.category.findUnique({
      where: { slug, NOT: { id } },
    });

    if (slugExists) {
      throw new AppError('Category with this name already exists', 409);
    }
  }

  // If parentId is provided, verify parent exists and prevent circular references
  if (parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: parentId },
    });

    if (!parentCategory) {
      throw new AppError('Parent category not found', 404);
    }

    // Prevent setting self as parent or creating circular references
    if (parentId === id) {
      throw new AppError('Category cannot be its own parent', 400);
    }
  }

  // Handle image updates
  let finalImageUrl = existingImage || null;

  // Process new uploaded image
  if (file) {
    const processedImage = await imageService.processProductImage(file);
    finalImageUrl = processedImage.url;

    // Delete old image if it exists and is being replaced
    if (existingCategory.image && existingCategory.image !== existingImage) {
      const imagePath = existingCategory.image.split('/uploads/')[1];
      if (imagePath) {
        await imageService.deleteImage(imagePath);
      }
    }
  } else if (!existingImage && existingCategory.image) {
    // Image was removed
    const imagePath = existingCategory.image.split('/uploads/')[1];
    if (imagePath) {
      await imageService.deleteImage(imagePath);
    }
  }

  const updateData: any = {
    ...(name && { name, slug }),
    ...(description && { description }),
    ...(parentId !== undefined && { parentId: parentId || null }),
    image: finalImageUrl,
  };

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
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

  // Delete associated image
  if (existingCategory.image) {
    const imagePath = existingCategory.image.split('/uploads/')[1];
    if (imagePath) {
      await imageService.deleteImage(imagePath);
    }
  }

  await prisma.category.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

// Get carousel images for homepage (public endpoint)
export const getHomepageCarousel = asyncHandler(async (req: Request, res: Response) => {
  const carouselImages = await prisma.carouselImage.findMany({
    where: { isActive: true },
    orderBy: { position: 'asc' },
  });

  // Map database fields to frontend expected format for backward compatibility
  const mappedImages = carouselImages.map(img => ({
    ...img,
    title: img.centerTitle || img.bottomLeftTitle || '',
    description: img.centerDescription || img.bottomLeftDescription || '',
  }));

  res.json({
    success: true,
    data: mappedImages,
  });
});

// Get featured collections for homepage (public endpoint)
export const getFeaturedCategories = asyncHandler(async (req: Request, res: Response) => {
  const { theme } = req.query;

  const whereClause: any = {};
  if (theme && (theme === 'BLACK' || theme === 'WHITE')) {
    whereClause.theme = theme;
  }

  const featuredCollections = await prisma.featuredCollection.findMany({
    where: whereClause,
    include: {
      category: {
        select: { id: true, name: true, slug: true, image: true, theme: true },
      },
    },
    orderBy: { position: 'asc' },
  });

  // Transform to return categories directly for easier frontend consumption
  const categories = featuredCollections.map(fc => fc.category);

  res.json({
    success: true,
    data: categories,
  });
});

// Get homepage banners for public use
export const getPublicHomepageBanners = asyncHandler(async (req: Request, res: Response) => {
  const banners = await prisma.homepageBanner.findMany({
    where: { isActive: true },
    orderBy: { theme: 'asc' }, // BLACK first, then WHITE
  });

  res.json({
    success: true,
    data: banners,
  });
});

// Get public homepage section texts
export const getPublicHomepageSectionTexts = asyncHandler(async (req: Request, res: Response) => {
  const sectionTexts = await prisma.homepageSectionText.findMany({
    orderBy: { theme: 'asc' }, // BLACK first, then WHITE
  });

  res.json({
    success: true,
    data: sectionTexts,
  });
});