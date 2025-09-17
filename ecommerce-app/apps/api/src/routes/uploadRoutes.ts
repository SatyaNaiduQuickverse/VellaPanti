import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { uploadMultiple, imageService } from '../services/uploadService';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// Upload product images (admin only)
router.post(
  '/products',
  authenticateToken,
  requireAdmin,
  uploadMultiple('images'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    if (files.length > 10) {
      throw new AppError('Maximum 10 images allowed per upload', 400);
    }

    try {
      const processedImages = await imageService.processProductImages(files);

      res.json({
        success: true,
        data: {
          images: processedImages,
          count: processedImages.length,
        },
        message: `Successfully uploaded ${processedImages.length} image(s)`,
      });
    } catch (error) {
      throw new AppError('Failed to process uploaded images', 500);
    }
  })
);

// Delete product image (admin only)
router.delete(
  '/products/:imagePath',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { imagePath } = req.params;

    if (!imagePath) {
      throw new AppError('Image path is required', 400);
    }

    // Verify image exists
    const imageInfo = await imageService.getImageInfo(imagePath);
    if (!imageInfo.exists) {
      throw new AppError('Image not found', 404);
    }

    await imageService.deleteImage(imagePath);

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  })
);

// Get image info
router.get(
  '/info/:imagePath',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { imagePath } = req.params;

    if (!imagePath) {
      throw new AppError('Image path is required', 400);
    }

    const imageInfo = await imageService.getImageInfo(imagePath);

    if (!imageInfo.exists) {
      throw new AppError('Image not found', 404);
    }

    res.json({
      success: true,
      data: imageInfo,
    });
  })
);

export default router;