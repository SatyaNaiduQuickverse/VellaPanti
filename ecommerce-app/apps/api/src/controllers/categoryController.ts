import { Request, Response } from 'express';
import { prisma } from '@ecommerce/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';

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

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, description, parentId } = req.body;

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