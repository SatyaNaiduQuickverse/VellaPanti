import { prisma } from './src/index';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const BANNERS_DIR = path.join(__dirname, '../../apps/api/uploads/banners');

// Ensure directory exists
if (!fs.existsSync(BANNERS_DIR)) {
  fs.mkdirSync(BANNERS_DIR, { recursive: true });
}

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
  return ext || '.avif';
}

async function downloadHomepageBanners() {
  console.log('\n🎨 Downloading homepage banners...');
  const banners = await prisma.homepageBanner.findMany({
    select: { id: true, theme: true, src: true }
  });

  for (const banner of banners) {
    // Skip if already a local path
    if (!banner.src.startsWith('http')) {
      console.log(`⏭️  Skipping ${banner.theme} banner - already local`);
      continue;
    }

    try {
      const ext = getFileExtension(banner.src);
      const filename = `banner-${banner.theme.toLowerCase()}${ext}`;
      const filepath = path.join(BANNERS_DIR, filename);

      // Download image
      await downloadImage(banner.src, filepath);

      // Update database
      await prisma.homepageBanner.update({
        where: { id: banner.id },
        data: { src: `/uploads/banners/${filename}` }
      });
      console.log(`✓ Updated ${banner.theme} banner`);
    } catch (error) {
      console.error(`✗ Failed to download ${banner.theme} banner:`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Starting homepage banner download...');
    await downloadHomepageBanners();
    console.log('\n✅ Homepage banner download complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
