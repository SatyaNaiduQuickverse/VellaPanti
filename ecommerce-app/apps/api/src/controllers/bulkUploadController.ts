import { Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';
import * as XLSX from 'xlsx';

interface ProductRow {
  name: string;
  description?: string;
  categorySlug: string;
  basePrice: number;
  baseSalePrice?: number;
  images: string; // Comma-separated URLs
  theme?: 'BLACK' | 'WHITE';
  featured?: boolean;
  isActive?: boolean;

  // Variant fields
  variantSku?: string;
  variantSize?: string;
  variantColor?: string;
  variantMaterial?: string;
  variantPrice?: number;
  variantSalePrice?: number;
  variantStock?: number;
  variantImages?: string; // Comma-separated URLs
}

interface ProcessedProduct {
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  baseSalePrice?: number;
  images: string[];
  theme?: 'BLACK' | 'WHITE';
  featured?: boolean;
  isActive: boolean;
  variants: {
    sku: string;
    size?: string;
    color?: string;
    material?: string;
    price: number;
    salePrice?: number;
    stock: number;
    images: string[];
  }[];
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseImages(imageString: string): string[] {
  if (!imageString) return [];
  return imageString.split(',').map(url => url.trim()).filter(url => url.length > 0);
}

export const uploadProductsFromExcel = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  if (!req.file) {
    throw new AppError('Excel file is required', 400);
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: ProductRow[] = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      throw new AppError('Excel file is empty or invalid', 400);
    }

    // Get all categories for mapping
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true, name: true },
    });
    const categoryMap = new Map(categories.map(cat => [cat.slug, cat.id]));

    // Process and validate data
    const processedProducts: ProcessedProduct[] = [];
    const errors: string[] = [];
    const productMap = new Map<string, ProcessedProduct>();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel row number (accounting for header)

      try {
        // Validate required fields
        if (!row.name) {
          errors.push(`Row ${rowNumber}: Product name is required`);
          continue;
        }

        if (!row.categorySlug) {
          errors.push(`Row ${rowNumber}: Category slug is required`);
          continue;
        }

        if (!categoryMap.has(row.categorySlug)) {
          errors.push(`Row ${rowNumber}: Category '${row.categorySlug}' not found`);
          continue;
        }

        if (!row.basePrice || row.basePrice <= 0) {
          errors.push(`Row ${rowNumber}: Valid base price is required`);
          continue;
        }

        const productKey = `${row.name.trim()}-${row.categorySlug}`;
        const slug = createSlug(row.name);

        // Create or update product
        if (!productMap.has(productKey)) {
          productMap.set(productKey, {
            name: row.name.trim(),
            slug,
            description: row.description?.trim(),
            categoryId: categoryMap.get(row.categorySlug)!,
            basePrice: Number(row.basePrice),
            baseSalePrice: row.baseSalePrice ? Number(row.baseSalePrice) : undefined,
            images: parseImages(row.images || ''),
            theme: row.theme || undefined,
            featured: Boolean(row.featured),
            isActive: row.isActive !== false, // Default to true
            variants: [],
          });
        }

        const product = productMap.get(productKey)!;

        // Add variant if variant data exists
        if (row.variantSku || row.variantSize || row.variantColor) {
          const variant = {
            sku: row.variantSku || `${slug}-${product.variants.length + 1}`,
            size: row.variantSize?.trim(),
            color: row.variantColor?.trim(),
            material: row.variantMaterial?.trim(),
            price: row.variantPrice ? Number(row.variantPrice) : product.basePrice,
            salePrice: row.variantSalePrice ? Number(row.variantSalePrice) : product.baseSalePrice,
            stock: row.variantStock ? Number(row.variantStock) : 0,
            images: parseImages(row.variantImages || ''),
          };

          product.variants.push(variant);
        }
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    }

    processedProducts.push(...productMap.values());

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        errors,
        processedCount: 0,
      });
    }

    // Create products in database
    const createdProducts = [];
    const productErrors: string[] = [];

    for (const productData of processedProducts) {
      try {
        // Check if product with same name and category already exists
        const existingProduct = await prisma.product.findFirst({
          where: {
            name: productData.name,
            categoryId: productData.categoryId,
          },
        });

        if (existingProduct) {
          productErrors.push(`Product '${productData.name}' already exists in this category`);
          continue;
        }

        const product = await prisma.product.create({
          data: {
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            categoryId: productData.categoryId,
            basePrice: productData.basePrice,
            baseSalePrice: productData.baseSalePrice,
            images: productData.images,
            theme: productData.theme,
            featured: productData.featured,
            isActive: productData.isActive,
            variants: productData.variants.length > 0 ? {
              create: productData.variants,
            } : undefined,
          },
          include: {
            category: { select: { name: true } },
            variants: true,
          },
        });

        createdProducts.push(product);
      } catch (error) {
        console.error('Error creating product:', error);
        productErrors.push(`Failed to create product '${productData.name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    res.json({
      success: true,
      message: `Successfully uploaded ${createdProducts.length} products`,
      data: {
        createdProducts: createdProducts.length,
        totalProcessed: processedProducts.length,
        errors: productErrors,
      },
      products: createdProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category.name,
        variants: p.variants.length,
      })),
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    throw new AppError('Failed to process Excel file', 500);
  }
});

export const downloadProductTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  // Get categories for reference
  const categories = await prisma.category.findMany({
    select: { slug: true, name: true },
    orderBy: { name: 'asc' },
  });

  // Create sample data
  const sampleData = [
    {
      name: 'Sample T-Shirt',
      description: 'High-quality cotton t-shirt with premium fabric',
      categorySlug: categories[0]?.slug || 'sample-category',
      basePrice: 999,
      baseSalePrice: 799,
      images: 'https://example.com/image1.jpg,https://example.com/image2.jpg',
      theme: 'BLACK',
      featured: true,
      isActive: true,
      variantSku: 'TSH-001-S-BLK',
      variantSize: 'S',
      variantColor: 'Black',
      variantMaterial: 'Cotton',
      variantPrice: 999,
      variantSalePrice: 799,
      variantStock: 50,
      variantImages: 'https://example.com/variant1.jpg',
    },
    {
      name: 'Sample T-Shirt',
      description: '',
      categorySlug: categories[0]?.slug || 'sample-category',
      basePrice: '',
      baseSalePrice: '',
      images: '',
      theme: '',
      featured: '',
      isActive: '',
      variantSku: 'TSH-001-M-BLK',
      variantSize: 'M',
      variantColor: 'Black',
      variantMaterial: 'Cotton',
      variantPrice: 999,
      variantSalePrice: 799,
      variantStock: 75,
      variantImages: '',
    },
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Add sample data sheet
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // Add categories reference sheet
  const categoriesSheet = XLSX.utils.json_to_sheet(
    categories.map(cat => ({ slug: cat.slug, name: cat.name }))
  );
  XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=product-upload-template.xlsx');
  res.send(buffer);
});