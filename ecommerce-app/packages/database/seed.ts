import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@vellapanti.com',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create test user
  console.log('👤 Creating test user...');
  const hashedUserPassword = await bcrypt.hash('user123', 12);
  const testUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedUserPassword,
      name: 'John Doe',
      role: 'USER',
    },
  });

  // Create user address
  await prisma.userAddress.create({
    data: {
      userId: testUser.id,
      street: '123 Test Street, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400069',
      country: 'India',
      isDefault: true,
    },
  });

  // Create categories
  console.log('📁 Creating categories...');

  // BLACK THEME CATEGORIES
  const streetWear = await prisma.category.create({
    data: {
      name: 'STREET WEAR',
      slug: 'street-wear',
      description: 'Raw street aesthetics meets premium comfort. Oversized fit for that authentic underground vibe.',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK',
    },
  });

  const hoodiesSweats = await prisma.category.create({
    data: {
      name: 'HOODIES & SWEATS',
      slug: 'hoodies-sweats',
      description: 'Premium heavyweight hoodies with street credibility. Perfect for those late night sessions.',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK',
    },
  });

  const rapCulture = await prisma.category.create({
    data: {
      name: 'RAP CULTURE',
      slug: 'rap-culture',
      description: 'Show the world your rap credentials. Limited edition design inspired by the culture.',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK',
    },
  });

  const urbanFootwear = await prisma.category.create({
    data: {
      name: 'URBAN FOOTWEAR',
      slug: 'urban-footwear',
      description: 'Street ready sneakers with that underground flex. Comfort meets style.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK',
    },
  });

  const blackAccessories = await prisma.category.create({
    data: {
      name: 'ACCESSORIES',
      slug: 'black-accessories',
      description: 'Complete your street look with our underground accessories collection.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK',
    },
  });

  const denimJeans = await prisma.category.create({
    data: {
      name: 'DENIM & JEANS',
      slug: 'denim-jeans',
      description: 'Premium denim with street-ready cuts and authentic washes.',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK',
    },
  });

  // WHITE THEME CATEGORIES
  const premiumBasics = await prisma.category.create({
    data: {
      name: 'PREMIUM BASICS',
      slug: 'premium-basics',
      description: 'Clean lines, premium materials. Elevated basics for the discerning individual.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE',
    },
  });

  const minimalLuxury = await prisma.category.create({
    data: {
      name: 'MINIMAL LUXURY',
      slug: 'minimal-luxury',
      description: 'Timeless design with modern comfort. Perfect for any occasion.',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE',
    },
  });

  const cleanCuts = await prisma.category.create({
    data: {
      name: 'CLEAN CUTS',
      slug: 'clean-cuts',
      description: 'Less is more. Sophisticated minimalism for the modern wardrobe.',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE',
    },
  });

  const essentials = await prisma.category.create({
    data: {
      name: 'ESSENTIALS',
      slug: 'essentials',
      description: 'Your daily go-to. Comfort-first design without compromising on style.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE',
    },
  });

  const premiumFootwear = await prisma.category.create({
    data: {
      name: 'PREMIUM FOOTWEAR',
      slug: 'premium-footwear',
      description: 'Sophisticated footwear collection for the modern lifestyle.',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE',
    },
  });

  const refinedAccessories = await prisma.category.create({
    data: {
      name: 'REFINED ACCESSORIES',
      slug: 'refined-accessories',
      description: 'Carefully curated accessories to complement your clean aesthetic.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE',
    },
  });

  // Create products
  console.log('📦 Creating products...');

  // BLACK THEME PRODUCTS

  // Street Wear Product
  const oversizedHoodie = await prisma.product.create({
    data: {
      name: "UNDERGROUND OVERSIZED HOODIE",
      slug: 'underground-oversized-hoodie',
      description: 'Heavy cotton blend oversized hoodie with street credentials. Raw aesthetic meets comfort.',
      shortDescription: 'Premium oversized hoodie for that authentic street look',
      basePrice: 89.99,
      baseSalePrice: 79.99,
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
      ],
      categoryId: streetWear.id,
      theme: 'BLACK',
      materialComposition: 'Heavy Cotton Blend',
      fitType: 'Oversized Fit',
      sleeveType: 'Long Sleeve',
      length: 'Oversized Length',
      countryOfOrigin: 'India',
      manufacturer: 'VellaPanti Underground Collection',
      itemWeight: '580 g',
      genericName: 'Hoodie',
      aboutItems: [
        'Heavy duty cotton blend for that authentic street feel',
        'Oversized cut with dropped shoulders for maximum comfort',
        'Pre-washed for soft feel and durability',
        'Perfect for layering or standalone street style',
        'Machine washable, maintains shape after wash'
      ],
    },
  });

  // Rap Culture Product
  const rapTee = await prisma.product.create({
    data: {
      name: "CULTURE TEE - RAP LEGENDS",
      slug: 'culture-tee-rap-legends',
      description: 'Premium cotton tee celebrating rap culture. Limited edition design with authentic street credibility.',
      shortDescription: 'Celebrate the culture with this premium rap-inspired tee',
      basePrice: 45.99,
      baseSalePrice: 35.99,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1583743814966-8936f37f4fc9?w=600',
      ],
      categoryId: rapCulture.id,
      theme: 'BLACK',
      materialComposition: 'Premium Cotton',
      fitType: 'Regular Fit',
      sleeveType: 'Short Sleeve',
      countryOfOrigin: 'India',
      manufacturer: 'VellaPanti Culture Collection',
      genericName: 'T-Shirt',
      aboutItems: [
        'Premium cotton construction for comfort and durability',
        'Limited edition design celebrating rap culture',
        'Perfect for concerts, casual wear, and cultural events',
        'Pre-shrunk fabric maintains fit after washing',
        'Authentic street credibility in every thread'
      ],
    },
  });

  // Urban Footwear Product
  const streetSneakers = await prisma.product.create({
    data: {
      name: "URBAN FLEX SNEAKERS",
      slug: 'urban-flex-sneakers',
      description: 'Street-ready sneakers with underground flex. Comfort meets authentic style.',
      shortDescription: 'Premium sneakers for street credibility',
      basePrice: 129.99,
      baseSalePrice: 109.99,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600',
      ],
      categoryId: urbanFootwear.id,
      theme: 'BLACK',
      materialComposition: 'Synthetic Leather & Mesh',
      countryOfOrigin: 'India',
      manufacturer: 'VellaPanti Urban Collection',
      genericName: 'Sneakers',
      aboutItems: [
        'Durable synthetic leather with breathable mesh panels',
        'Cushioned sole for all-day comfort',
        'Street-inspired design with authentic urban appeal',
        'Versatile styling for casual and streetwear looks',
        'Easy to clean and maintain'
      ],
    },
  });

  // WHITE THEME PRODUCTS

  // Premium Basics Product
  const premiumBasicTee = await prisma.product.create({
    data: {
      name: "ESSENTIAL PREMIUM TEE",
      slug: 'essential-premium-tee',
      description: 'Clean lines, premium materials. The perfect basic elevated to luxury standards.',
      shortDescription: 'Premium basic tee with clean minimalist design',
      basePrice: 59.99,
      baseSalePrice: 49.99,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600',
      ],
      categoryId: premiumBasics.id,
      theme: 'WHITE',
      materialComposition: 'Premium Organic Cotton',
      fitType: 'Tailored Fit',
      sleeveType: 'Short Sleeve',
      countryOfOrigin: 'India',
      manufacturer: 'VellaPanti Premium Collection',
      genericName: 'T-Shirt',
      aboutItems: [
        'Premium organic cotton for superior comfort',
        'Tailored fit with clean, minimalist lines',
        'Perfect for layering or standalone wear',
        'Sustainable production methods',
        'Maintains shape and color after multiple washes'
      ],
    },
  });

  // Minimal Luxury Product
  const luxuryShirt = await prisma.product.create({
    data: {
      name: "MINIMAL LUXURY SHIRT",
      slug: 'minimal-luxury-shirt',
      description: 'Timeless design with modern comfort. Sophisticated minimalism for the discerning individual.',
      shortDescription: 'Luxury shirt with timeless minimal design',
      basePrice: 149.99,
      baseSalePrice: 129.99,
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600',
      ],
      categoryId: minimalLuxury.id,
      theme: 'WHITE',
      materialComposition: 'Premium Cotton Blend',
      fitType: 'Tailored Fit',
      sleeveType: 'Long Sleeve',
      collarStyle: 'Minimal Collar',
      countryOfOrigin: 'India',
      manufacturer: 'VellaPanti Luxury Collection',
      genericName: 'Shirt',
      aboutItems: [
        'Premium cotton blend with luxury finish',
        'Minimal design philosophy with maximum impact',
        'Perfect for professional and casual sophisticated settings',
        'Tailored cut for modern silhouette',
        'Easy care luxury fabric'
      ],
    },
  });

  // Premium Footwear Product
  const luxurySneakers = await prisma.product.create({
    data: {
      name: "REFINED SNEAKERS",
      slug: 'refined-sneakers',
      description: 'Sophisticated footwear for the modern lifestyle. Clean aesthetics meet premium comfort.',
      shortDescription: 'Premium sneakers with refined aesthetic',
      basePrice: 179.99,
      baseSalePrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
      ],
      categoryId: premiumFootwear.id,
      theme: 'WHITE',
      materialComposition: 'Premium Leather & Suede',
      countryOfOrigin: 'India',
      manufacturer: 'VellaPanti Premium Collection',
      genericName: 'Sneakers',
      aboutItems: [
        'Premium leather construction with suede accents',
        'Minimalist design with sophisticated appeal',
        'Superior comfort for all-day wear',
        'Versatile styling for business casual to weekend',
        'Crafted for the discerning individual'
      ],
    },
  });

  // Create variants for BLACK THEME products

  // Oversized Hoodie variants
  const hoodieColors = ['BLACK', 'CHARCOAL', 'DARK GREY'];
  const hoodieSizes = ['S', 'M', 'L', 'XL', '2XL'];

  for (const color of hoodieColors) {
    for (const size of hoodieSizes) {
      await prisma.productVariant.create({
        data: {
          productId: oversizedHoodie.id,
          sku: `UNDERGROUND-HOODIE-${color}-${size}`,
          size: size,
          color: color,
          price: 89.99,
          salePrice: 79.99,
          stock: Math.floor(Math.random() * 15) + 5,
          images: [],
        },
      });
    }
  }

  // Rap Tee variants
  const rapTeeColors = ['BLACK', 'DARK GREY', 'NAVY'];
  const rapTeeSizes = ['S', 'M', 'L', 'XL', '2XL'];

  for (const color of rapTeeColors) {
    for (const size of rapTeeSizes) {
      await prisma.productVariant.create({
        data: {
          productId: rapTee.id,
          sku: `RAP-TEE-${color}-${size}`,
          size: size,
          color: color,
          price: 45.99,
          salePrice: 35.99,
          stock: Math.floor(Math.random() * 20) + 5,
          images: [],
        },
      });
    }
  }

  // Street Sneakers variants
  const sneakerSizes = ['7', '8', '9', '10', '11', '12'];
  const sneakerColors = ['BLACK', 'BLACK/WHITE', 'ALL BLACK'];

  for (const color of sneakerColors) {
    for (const size of sneakerSizes) {
      await prisma.productVariant.create({
        data: {
          productId: streetSneakers.id,
          sku: `URBAN-SNEAKERS-${color.replace(/\//g, '-')}-${size}`,
          size: size,
          color: color,
          price: 129.99,
          salePrice: 109.99,
          stock: Math.floor(Math.random() * 10) + 3,
          images: [],
        },
      });
    }
  }

  // Create variants for WHITE THEME products

  // Premium Basic Tee variants
  const basicTeeColors = ['WHITE', 'CREAM', 'LIGHT GREY'];
  const basicTeeSizes = ['S', 'M', 'L', 'XL', '2XL'];

  for (const color of basicTeeColors) {
    for (const size of basicTeeSizes) {
      await prisma.productVariant.create({
        data: {
          productId: premiumBasicTee.id,
          sku: `PREMIUM-TEE-${color.replace(/\s+/g, '')}-${size}`,
          size: size,
          color: color,
          price: 59.99,
          salePrice: 49.99,
          stock: Math.floor(Math.random() * 15) + 5,
          images: [],
        },
      });
    }
  }

  // Luxury Shirt variants
  const luxuryShirtColors = ['WHITE', 'CREAM', 'LIGHT BLUE'];
  const luxuryShirtSizes = ['S', 'M', 'L', 'XL', '2XL'];

  for (const color of luxuryShirtColors) {
    for (const size of luxuryShirtSizes) {
      await prisma.productVariant.create({
        data: {
          productId: luxuryShirt.id,
          sku: `LUXURY-SHIRT-${color.replace(/\s+/g, '')}-${size}`,
          size: size,
          color: color,
          price: 149.99,
          salePrice: 129.99,
          stock: Math.floor(Math.random() * 12) + 3,
          images: [],
        },
      });
    }
  }

  // Refined Sneakers variants
  const refinedSneakerSizes = ['7', '8', '9', '10', '11', '12'];
  const refinedSneakerColors = ['WHITE', 'CREAM', 'WHITE/GREY'];

  for (const color of refinedSneakerColors) {
    for (const size of refinedSneakerSizes) {
      await prisma.productVariant.create({
        data: {
          productId: luxurySneakers.id,
          sku: `REFINED-SNEAKERS-${color.replace(/\//g, '-')}-${size}`,
          size: size,
          color: color,
          price: 179.99,
          salePrice: 159.99,
          stock: Math.floor(Math.random() * 8) + 2,
          images: [],
        },
      });
    }
  }

  // Get some variants for sample orders and cart
  const hoodieVariant = await prisma.productVariant.findFirst({
    where: { productId: oversizedHoodie.id, color: 'BLACK', size: 'L' },
  });

  const rapTeeVariant = await prisma.productVariant.findFirst({
    where: { productId: rapTee.id, color: 'BLACK', size: 'M' },
  });

  const streetSneakerVariant = await prisma.productVariant.findFirst({
    where: { productId: streetSneakers.id, color: 'BLACK', size: '10' },
  });

  const premiumTeeVariant = await prisma.productVariant.findFirst({
    where: { productId: premiumBasicTee.id, color: 'WHITE', size: 'L' },
  });

  const luxuryShirtVariant = await prisma.productVariant.findFirst({
    where: { productId: luxuryShirt.id, color: 'WHITE', size: 'M' },
  });

  const refinedSneakerVariant = await prisma.productVariant.findFirst({
    where: { productId: luxurySneakers.id, color: 'WHITE', size: '9' },
  });

  // Create sample orders
  console.log('📋 Creating sample orders...');

  const order1 = await prisma.order.create({
    data: {
      userId: testUser.id,
      status: 'DELIVERED',
      total: 189.98,
      shippingStreet: '123 Test Street, Andheri East, John Doe',
      shippingCity: 'Mumbai',
      shippingState: 'Maharashtra',
      shippingZipCode: '400069',
      shippingCountry: 'India',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        productId: oversizedHoodie.id,
        productVariantId: hoodieVariant?.id,
        quantity: 1,
        price: hoodieVariant?.salePrice || 79.99,
        variantSize: hoodieVariant?.size,
        variantColor: hoodieVariant?.color,
      },
      {
        orderId: order1.id,
        productId: streetSneakers.id,
        productVariantId: streetSneakerVariant?.id,
        quantity: 1,
        price: streetSneakerVariant?.salePrice || 109.99,
        variantSize: streetSneakerVariant?.size,
        variantColor: streetSneakerVariant?.color,
      },
    ],
  });

  const order2 = await prisma.order.create({
    data: {
      userId: testUser.id,
      status: 'SHIPPED',
      total: 179.98,
      shippingStreet: '123 Test Street, Andheri East, John Doe',
      shippingCity: 'Mumbai',
      shippingState: 'Maharashtra',
      shippingZipCode: '400069',
      shippingCountry: 'India',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order2.id,
        productId: premiumBasicTee.id,
        productVariantId: premiumTeeVariant?.id,
        quantity: 1,
        price: premiumTeeVariant?.salePrice || 49.99,
        variantSize: premiumTeeVariant?.size,
        variantColor: premiumTeeVariant?.color,
      },
      {
        orderId: order2.id,
        productId: luxuryShirt.id,
        productVariantId: luxuryShirtVariant?.id,
        quantity: 1,
        price: luxuryShirtVariant?.salePrice || 129.99,
        variantSize: luxuryShirtVariant?.size,
        variantColor: luxuryShirtVariant?.color,
      },
    ],
  });

  const order3 = await prisma.order.create({
    data: {
      userId: testUser.id,
      status: 'PROCESSING',
      total: 195.98,
      shippingStreet: '123 Test Street, Andheri East, John Doe',
      shippingCity: 'Mumbai',
      shippingState: 'Maharashtra',
      shippingZipCode: '400069',
      shippingCountry: 'India',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order3.id,
        productId: rapTee.id,
        productVariantId: rapTeeVariant?.id,
        quantity: 1,
        price: rapTeeVariant?.salePrice || 35.99,
        variantSize: rapTeeVariant?.size,
        variantColor: rapTeeVariant?.color,
      },
      {
        orderId: order3.id,
        productId: luxurySneakers.id,
        productVariantId: refinedSneakerVariant?.id,
        quantity: 1,
        price: refinedSneakerVariant?.salePrice || 159.99,
        variantSize: refinedSneakerVariant?.size,
        variantColor: refinedSneakerVariant?.color,
      },
    ],
  });

  // Create sample cart items for test user
  console.log('🛒 Creating sample cart items...');
  await prisma.cartItem.create({
    data: {
      userId: testUser.id,
      productId: oversizedHoodie.id,
      productVariantId: hoodieVariant?.id,
      quantity: 1,
    },
  });

  await prisma.cartItem.create({
    data: {
      userId: testUser.id,
      productId: premiumBasicTee.id,
      productVariantId: premiumTeeVariant?.id,
      quantity: 2,
    },
  });

  // Create sample reviews
  console.log('⭐ Creating sample reviews...');
  const reviews = [
    {
      userId: testUser.id,
      productId: oversizedHoodie.id,
      rating: 5,
      comment: 'Amazing hoodie! The oversized fit is perfect and the quality is outstanding. True street credibility.',
    },
    {
      userId: testUser.id,
      productId: premiumBasicTee.id,
      rating: 5,
      comment: 'Perfect basic tee! Clean design and premium quality. Worth every penny.',
    },
    {
      userId: testUser.id,
      productId: streetSneakers.id,
      rating: 4,
      comment: 'Great sneakers for street style. Comfortable and looks authentic.',
    },
    {
      userId: testUser.id,
      productId: luxuryShirt.id,
      rating: 5,
      comment: 'Minimal luxury at its finest. Perfect for both casual and formal occasions.',
    },
  ];

  for (const reviewData of reviews) {
    await prisma.review.create({
      data: reviewData,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📊 Created:');
  console.log('   👤 2 users (admin & test user)');
  console.log('   📁 7 categories');
  console.log('   📦 4 products with variants');
  console.log('   🎯 100+ product variants');
  console.log('   📋 3 orders');
  console.log('   🛒 2 cart items');
  console.log('   ⭐ 3 reviews');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('   Admin: admin@vellapanti.com / admin123');
  console.log('   User:  user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });