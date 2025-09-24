import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional().nullable(),
  comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional().nullable(),
  images: z.array(z.string()).max(5, 'Maximum 5 images allowed').optional().default([]),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
  title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
  comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional(),
});