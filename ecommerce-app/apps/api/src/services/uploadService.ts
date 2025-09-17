import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { config } from '@ecommerce/config';
import { AppError } from '../middleware/errorHandler';

// Ensure upload directory exists
const ensureUploadDir = async (uploadPath: string) => {
  try {
    await fs.access(uploadPath);
  } catch {
    await fs.mkdir(uploadPath, { recursive: true });
  }
};

// Configure multer for memory storage (we'll process with sharp)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Check if file type is allowed
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} is not allowed. Allowed types: ${config.upload.allowedMimeTypes.join(', ')}`, 400), false);
  }
};

// Create multer upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize, // 10MB
    files: 10, // Maximum 10 files at once
  },
});

// Image processing service
export class ImageService {
  private uploadPath: string;

  constructor() {
    this.uploadPath = path.join(process.cwd(), config.upload.uploadPath);
    this.init();
  }

  private async init() {
    await ensureUploadDir(this.uploadPath);
    await ensureUploadDir(path.join(this.uploadPath, 'products'));
    await ensureUploadDir(path.join(this.uploadPath, 'thumbnails'));
  }

  // Generate unique filename
  private generateFilename(originalName: string, suffix = ''): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalName).toLowerCase();
    const name = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '-');
    return `${name}-${timestamp}-${random}${suffix}${ext}`;
  }

  // Process and save product image
  async processProductImage(file: Express.Multer.File): Promise<{
    original: string;
    thumbnail: string;
    url: string;
    thumbnailUrl: string;
  }> {
    if (!file.buffer) {
      throw new AppError('No file buffer provided', 400);
    }

    const filename = this.generateFilename(file.originalname);
    const thumbnailFilename = this.generateFilename(file.originalname, '-thumb');

    const originalPath = path.join(this.uploadPath, 'products', filename);
    const thumbnailPath = path.join(this.uploadPath, 'thumbnails', thumbnailFilename);

    try {
      // Process original image (resize if too large, optimize)
      await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(originalPath);

      // Create thumbnail
      await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'cover'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      // Return URLs (assuming static file serving is configured)
      const baseUrl = config.isDevelopment ? 
        `http://${config.server.host}:${config.server.port}` : 
        config.client.apiUrl;

      return {
        original: path.join('products', filename),
        thumbnail: path.join('thumbnails', thumbnailFilename),
        url: `${baseUrl}/uploads/products/${filename}`,
        thumbnailUrl: `${baseUrl}/uploads/thumbnails/${thumbnailFilename}`,
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new AppError('Failed to process image', 500);
    }
  }

  // Process multiple product images
  async processProductImages(files: Express.Multer.File[]): Promise<Array<{
    original: string;
    thumbnail: string;
    url: string;
    thumbnailUrl: string;
  }>> {
    const results = [];

    for (const file of files) {
      const result = await this.processProductImage(file);
      results.push(result);
    }

    return results;
  }

  // Delete image files
  async deleteImage(imagePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadPath, imagePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete image:', error);
      // Don't throw error if file doesn't exist
    }
  }

  // Delete multiple images
  async deleteImages(imagePaths: string[]): Promise<void> {
    await Promise.all(
      imagePaths.map(imagePath => this.deleteImage(imagePath))
    );
  }

  // Get image info
  async getImageInfo(imagePath: string): Promise<{
    exists: boolean;
    size?: number;
    dimensions?: { width: number; height: number };
  }> {
    try {
      const fullPath = path.join(this.uploadPath, imagePath);
      const stats = await fs.stat(fullPath);
      
      const metadata = await sharp(fullPath).metadata();
      
      return {
        exists: true,
        size: stats.size,
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0,
        },
      };
    } catch (error) {
      return { exists: false };
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();

// Upload middleware variants
export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount = 10) => upload.array(fieldName, maxCount);
export const uploadFields = (fields: { name: string; maxCount?: number }[]) => upload.fields(fields);