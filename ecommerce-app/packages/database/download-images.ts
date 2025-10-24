import { prisma } from './src/index';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const UPLOADS_DIR = path.join(__dirname, '../../apps/api/uploads');
const PRODUCTS_DIR = path.join(UPLOADS_DIR, 'products');
const CAROUSEL_DIR = path.join(UPLOADS_DIR, 'carousel');
const CATEGORIES_DIR = path.join(UPLOADS_DIR, 'categories');

// Ensure directories exist
[PRODUCTS_DIR, CAROUSEL_DIR, CATEGORIES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(filepath);
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${path.basename(filepath)}`);
          resolve();
        });
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

function getFileExtension(url: string): string {
  const ext = path.extname(new URL(url).pathname);
  return ext || '.jpg';
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
}

async function downloadProductImages() {
  console.log('\n📦 Downloading product images...');
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, images: true }
  });

  for (const product of products) {
    const newImages: string[] = [];

    for (let i = 0; i < product.images.length; i++) {
      const imageUrl = product.images[i];

      // Skip if already a local path
      if (!imageUrl.startsWith('http')) {
        newImages.push(imageUrl);
        continue;
      }

      try {
        const ext = getFileExtension(imageUrl);
        const filename = `${sanitizeFilename(product.slug)}-${i + 1}${ext}`;
        const filepath = path.join(PRODUCTS_DIR, filename);

        // Download image
        await downloadImage(imageUrl, filepath);

        // Store relative path
        newImages.push(`/uploads/products/${filename}`);
      } catch (error) {
        console.error(`✗ Failed to download ${imageUrl}:`, error);
        newImages.push(imageUrl); // Keep original URL on failure
      }
    }

    // Update database
    if (newImages.join(',') !== product.images.join(',')) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: newImages }
      });
      console.log(`✓ Updated product: ${product.name}`);
    }
  }
}

async function downloadCarouselImages() {
  console.log('\n🎠 Downloading carousel images...');
  const carouselImages = await prisma.carouselImage.findMany({
    select: { id: true, src: true, alt: true }
  });

  for (const carousel of carouselImages) {
    // Skip if already a local path
    if (!carousel.src.startsWith('http')) {
      continue;
    }

    try {
      const ext = getFileExtension(carousel.src);
      const filename = `carousel-${carousel.id}${ext}`;
      const filepath = path.join(CAROUSEL_DIR, filename);

      // Download image
      await downloadImage(carousel.src, filepath);

      // Update database
      await prisma.carouselImage.update({
        where: { id: carousel.id },
        data: { src: `/uploads/carousel/${filename}` }
      });
      console.log(`✓ Updated carousel: ${carousel.alt}`);
    } catch (error) {
      console.error(`✗ Failed to download ${carousel.src}:`, error);
    }
  }
}

async function downloadCategoryImages() {
  console.log('\n📁 Downloading category images...');
  const categories = await prisma.category.findMany({
    where: { image: { not: null } },
    select: { id: true, name: true, slug: true, image: true }
  });

  for (const category of categories) {
    if (!category.image || !category.image.startsWith('http')) {
      continue;
    }

    try {
      const ext = getFileExtension(category.image);
      const filename = `category-${sanitizeFilename(category.slug)}${ext}`;
      const filepath = path.join(CATEGORIES_DIR, filename);

      // Download image
      await downloadImage(category.image, filepath);

      // Update database
      await prisma.category.update({
        where: { id: category.id },
        data: { image: `/uploads/categories/${filename}` }
      });
      console.log(`✓ Updated category: ${category.name}`);
    } catch (error) {
      console.error(`✗ Failed to download ${category.image}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting image download process...');

    await downloadProductImages();
    await downloadCarouselImages();
    await downloadCategoryImages();

    console.log('\n✅ Image download complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
