import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { ProductFilters, PaginatedResponse, Product } from '@ecommerce/types';
import { imageService } from '../services/uploadService';
import type { AuthRequest } from '../middleware/auth';

// Get featured products for homepage
export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const { theme } = req.query as { theme?: 'BLACK' | 'WHITE' };

  const where: any = {};
  if (theme) {
    where.theme = theme;
  }

  // First try to get configured featured products
  const featuredProducts = await prisma.featuredProduct.findMany({
    where,
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
              price: true,
              salePrice: true,
              stock: true,
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
      },
    },
    orderBy: { position: 'asc' },
  });

  let products;

  if (featuredProducts.length > 0) {
    // If featured products are configured, use them
    products = await Promise.all(
      featuredProducts.map(async (fp) => {
        const reviews = await prisma.review.findMany({
          where: { productId: fp.product.id },
          select: { rating: true },
        });

        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : null;

        return {
          ...fp.product,
          averageRating,
        };
      })
    );
  } else {
    // Fallback: return regular products filtered by theme
    const productWhere: any = {};
    if (theme) {
      productWhere.theme = theme;
    }

    const regularProducts = await prisma.product.findMany({
      where: productWhere,
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
            price: true,
            salePrice: true,
            stock: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 8, // Limit to 8 products for featured section
    });

    // Calculate average ratings for regular products
    products = await Promise.all(
      regularProducts.map(async (product) => {
        const reviews = await prisma.review.findMany({
          where: { productId: product.id },
          select: { rating: true },
        });

        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : null;

        return {
          ...product,
          averageRating,
        };
      })
    );
  }

  res.json({
    success: true,
    data: products,
  });
});

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
    theme,
  } = req.query as any;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (theme && (theme === 'BLACK' || theme === 'WHITE')) {
    console.log('Filtering by theme:', theme);
    where.theme = theme;
  }

  console.log('Final where clause:', JSON.stringify(where, null, 2));

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
        variants: {
          select: {
            id: true,
            sku: true,
            size: true,
            color: true,
            price: true,
            salePrice: true,
            stock: true,
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

  // Calculate average rating and review count, and determine price range
  const productsWithRating = products.map((product) => {
    const reviews = product.reviews;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

    // Calculate price range from variants
    const variants = product.variants;
    let minPrice = product.basePrice;
    let maxPrice = product.basePrice;
    let minSalePrice = product.baseSalePrice;
    let maxSalePrice = product.baseSalePrice;
    let totalStock = 0;

    if (variants.length > 0) {
      const prices = variants.map(v => v.price);
      const salePrices = variants.map(v => v.salePrice).filter(Boolean);
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
      if (salePrices.length > 0) {
        minSalePrice = Math.min(...salePrices);
        maxSalePrice = Math.max(...salePrices);
      }
      totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    }

    return {
      ...product,
      averageRating,
      reviewCount: reviews.length,
      priceRange: {
        min: minSalePrice || minPrice,
        max: maxSalePrice || maxPrice,
        hasVariablePrice: minPrice !== maxPrice,
      },
      totalStock,
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
      variants: {
        orderBy: [
          { color: 'asc' },
          { size: 'asc' },
        ],
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

  // Group variants by attribute for easier frontend consumption
  const variantOptions = {
    colors: [...new Set(product.variants.map(v => v.color).filter(Boolean))],
    sizes: [...new Set(product.variants.map(v => v.size).filter(Boolean))],
    materials: [...new Set(product.variants.map(v => v.material).filter(Boolean))],
  };

  // Calculate price range
  const prices = product.variants.map(v => v.price);
  const salePrices = product.variants.map(v => v.salePrice).filter(Boolean);
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : product.basePrice,
    max: prices.length > 0 ? Math.max(...prices) : product.basePrice,
    saleMin: salePrices.length > 0 ? Math.min(...salePrices) : product.baseSalePrice,
    saleMax: salePrices.length > 0 ? Math.max(...salePrices) : product.baseSalePrice,
  };

  const productWithRating = {
    ...product,
    averageRating,
    reviewCount: product.reviews.length,
    variantOptions,
    priceRange,
    totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
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

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, price, salePrice, stock, categoryId } = req.body;
  const files = req.files as Express.Multer.File[];

  // Generate slug from name
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Check if slug already exists
  const existingProduct = await prisma.product.findUnique({
    where: { slug },
  });

  if (existingProduct) {
    throw new AppError('Product with this name already exists', 409);
  }

  // Process uploaded images
  let imageUrls: string[] = [];
  if (files && files.length > 0) {
    const processedImages = await imageService.processProductImages(files);
    imageUrls = processedImages.map(img => img.url);
  }

  // Create product data
  const productData = {
    name,
    slug,
    description,
    price: parseFloat(price),
    salePrice: salePrice ? parseFloat(salePrice) : null,
    stock: parseInt(stock),
    categoryId,
    images: imageUrls,
  };

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

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, price, salePrice, stock, categoryId, existingImages } = req.body;
  const files = req.files as Express.Multer.File[];

  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  // Generate new slug if name changed
  let slug = existingProduct.slug;
  if (name && name !== existingProduct.name) {
    slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if new slug already exists
    const slugExists = await prisma.product.findUnique({
      where: { slug, NOT: { id } },
    });

    if (slugExists) {
      throw new AppError('Product with this name already exists', 409);
    }
  }

  // Handle images
  let finalImageUrls: string[] = [];

  // Keep existing images that weren't removed
  if (existingImages) {
    const existingImagesArray = Array.isArray(existingImages) ? existingImages : [existingImages];
    finalImageUrls = existingImagesArray.filter(img => img);
  }

  // Process new uploaded images
  if (files && files.length > 0) {
    const processedImages = await imageService.processProductImages(files);
    const newImageUrls = processedImages.map(img => img.url);
    finalImageUrls = [...finalImageUrls, ...newImageUrls];
  }

  // Delete images that were removed
  const imagesToDelete = existingProduct.images.filter(img => !finalImageUrls.includes(img));
  if (imagesToDelete.length > 0) {
    // Extract file paths from URLs for deletion
    const imagePaths = imagesToDelete.map(url => {
      const urlParts = url.split('/uploads/');
      return urlParts[1]; // Get path after /uploads/
    });
    await imageService.deleteImages(imagePaths);
  }

  // Create update data
  const updateData: any = {
    ...(name && { name, slug }),
    ...(description && { description }),
    ...(price && { price: parseFloat(price) }),
    ...(stock !== undefined && { stock: parseInt(stock) }),
    ...(categoryId && { categoryId }),
    images: finalImageUrls,
  };

  // Handle salePrice separately to allow null values
  if (salePrice !== undefined) {
    updateData.salePrice = salePrice ? parseFloat(salePrice) : null;
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

  // Delete associated images
  if (existingProduct.images && existingProduct.images.length > 0) {
    const imagePaths = existingProduct.images.map(url => {
      const urlParts = url.split('/uploads/');
      return urlParts[1]; // Get path after /uploads/
    });
    await imageService.deleteImages(imagePaths);
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
    theme,
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

  // Theme filter
  if (theme && (theme === 'BLACK' || theme === 'WHITE')) {
    where.theme = theme;
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

// Get specific product variant
export const getProductVariant = asyncHandler(async (req: Request, res: Response) => {
  const { productId, variantId } = req.params;

  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId: productId,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
        },
      },
    },
  });

  if (!variant) {
    throw new AppError('Product variant not found', 404);
  }

  res.json({
    success: true,
    data: variant,
  });
});

// Get variants by filters (color, size, etc.)
export const getProductVariants = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { color, size, material } = req.query;

  const where: any = { productId };

  if (color) where.color = color;
  if (size) where.size = size;
  if (material) where.material = material;

  const variants = await prisma.productVariant.findMany({
    where,
    orderBy: [
      { color: 'asc' },
      { size: 'asc' },
    ],
  });

  res.json({
    success: true,
    data: variants,
  });
});

// Check variant availability
export const checkVariantAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { variantId } = req.params;
  const { quantity = 1 } = req.query;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId as string },
    select: {
      id: true,
      stock: true,
      price: true,
      salePrice: true,
    },
  });

  if (!variant) {
    throw new AppError('Variant not found', 404);
  }

  const isAvailable = variant.stock >= Number(quantity);
  const maxQuantity = variant.stock;

  res.json({
    success: true,
    data: {
      available: isAvailable,
      maxQuantity,
      currentPrice: variant.salePrice || variant.price,
      stock: variant.stock,
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

// Admin Variant Management

export const createProductVariant = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { sku, size, color, material, price, salePrice, stock, images } = req.body;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if SKU already exists
  const existingSku = await prisma.productVariant.findUnique({
    where: { sku },
  });

  if (existingSku) {
    throw new AppError('SKU already exists', 400);
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      sku,
      size,
      color,
      material,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      stock: parseInt(stock),
      images: images || [],
    },
  });

  res.status(201).json({
    success: true,
    data: variant,
    message: 'Product variant created successfully',
  });
});

export const updateProductVariant = asyncHandler(async (req: Request, res: Response) => {
  const { variantId } = req.params;
  const { sku, size, color, material, price, salePrice, stock, images } = req.body;

  const existingVariant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!existingVariant) {
    throw new AppError('Product variant not found', 404);
  }

  // Check if SKU already exists (exclude current variant)
  if (sku && sku !== existingVariant.sku) {
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku },
    });

    if (existingSku) {
      throw new AppError('SKU already exists', 400);
    }
  }

  const updateData: any = {};
  if (sku !== undefined) updateData.sku = sku;
  if (size !== undefined) updateData.size = size;
  if (color !== undefined) updateData.color = color;
  if (material !== undefined) updateData.material = material;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (salePrice !== undefined) updateData.salePrice = salePrice ? parseFloat(salePrice) : null;
  if (stock !== undefined) updateData.stock = parseInt(stock);
  if (images !== undefined) updateData.images = images;

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: updateData,
  });

  res.json({
    success: true,
    data: variant,
    message: 'Product variant updated successfully',
  });
});

export const deleteProductVariant = asyncHandler(async (req: Request, res: Response) => {
  const { variantId } = req.params;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    throw new AppError('Product variant not found', 404);
  }

  await prisma.productVariant.delete({
    where: { id: variantId },
  });

  res.json({
    success: true,
    message: 'Product variant deleted successfully',
  });
});