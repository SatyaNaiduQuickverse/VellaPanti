import { prisma } from './src/index';

async function fixVariantImages() {
  console.log('🔧 Starting variant image fix...');

  // Get all products with their variants
  const products = await prisma.product.findMany({
    include: {
      variants: true
    }
  });

  let updatedCount = 0;

  for (const product of products) {
    if (product.images.length === 0) {
      console.log(`⚠️  Skipping ${product.name} - no product images`);
      continue;
    }

    for (const variant of product.variants) {
      // Only update variants that have empty images
      if (variant.images.length === 0) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { images: product.images }
        });
        updatedCount++;
        console.log(`✓ Updated variant ${variant.size} ${variant.color} for ${product.name}`);
      }
    }
  }

  console.log(`\n✅ Fixed ${updatedCount} variants with product images`);
  process.exit(0);
}

fixVariantImages().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
