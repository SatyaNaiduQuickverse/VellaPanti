import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'user@ecommerce.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'USER',
    },
  });

  // Create user address
  await prisma.userAddress.create({
    data: {
      userId: testUser.id,
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA',
      isDefault: true,
    },
  });

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
    },
  });

  const smartphones = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      parentId: electronics.id,
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Portable computers',
      parentId: electronics.id,
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
    },
  });

  const mensClothing = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: 'Clothing for men',
      parentId: clothing.id,
    },
  });

  // Create products
  const iphone = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Latest iPhone with advanced features and A17 Pro chip',
      price: 999.99,
      salePrice: 899.99,
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500',
      ],
      stock: 50,
      categoryId: smartphones.id,
    },
  });

  const macbook = await prisma.product.create({
    data: {
      name: 'MacBook Pro 16"',
      slug: 'macbook-pro-16',
      description: 'Powerful laptop with M3 Pro chip for professional work',
      price: 2499.99,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
      ],
      stock: 25,
      categoryId: laptops.id,
    },
  });

  const tshirt = await prisma.product.create({
    data: {
      name: 'Classic Cotton T-Shirt',
      slug: 'classic-cotton-tshirt',
      description: 'Comfortable cotton t-shirt in various colors',
      price: 29.99,
      salePrice: 24.99,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500',
      ],
      stock: 100,
      categoryId: mensClothing.id,
    },
  });

  const jeans = await prisma.product.create({
    data: {
      name: 'Premium Denim Jeans',
      slug: 'premium-denim-jeans',
      description: 'High-quality denim jeans with perfect fit',
      price: 89.99,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      ],
      stock: 75,
      categoryId: mensClothing.id,
    },
  });

  const sneakers = await prisma.product.create({
    data: {
      name: 'Running Sneakers',
      slug: 'running-sneakers',
      description: 'Comfortable running shoes for daily workouts',
      price: 129.99,
      salePrice: 99.99,
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
        'https://images.unsplash.com/photo-1465453869711-7e174808ace9?w=500',
      ],
      stock: 60,
      categoryId: mensClothing.id,
    },
  });

  // Add some items to test user's cart
  await prisma.cartItem.create({
    data: {
      userId: testUser.id,
      productId: iphone.id,
      quantity: 1,
    },
  });

  await prisma.cartItem.create({
    data: {
      userId: testUser.id,
      productId: tshirt.id,
      quantity: 2,
    },
  });

  // Create a test order
  const order = await prisma.order.create({
    data: {
      userId: testUser.id,
      status: 'DELIVERED',
      total: 959.97,
      shippingStreet: '123 Main St',
      shippingCity: 'Anytown',
      shippingState: 'CA',
      shippingZipCode: '12345',
      shippingCountry: 'USA',
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order.id,
        productId: iphone.id,
        quantity: 1,
        price: 899.99,
      },
      {
        orderId: order.id,
        productId: tshirt.id,
        quantity: 2,
        price: 24.99,
      },
    ],
  });

  // Create reviews
  await prisma.review.create({
    data: {
      userId: testUser.id,
      productId: iphone.id,
      rating: 5,
      comment: 'Amazing phone! The camera quality is outstanding and the performance is top-notch.',
    },
  });

  await prisma.review.create({
    data: {
      userId: testUser.id,
      productId: tshirt.id,
      rating: 4,
      comment: 'Good quality t-shirt, comfortable to wear. The fabric feels nice.',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Test accounts created:');
  console.log('   Admin: admin@ecommerce.com / password123');
  console.log('   User:  user@ecommerce.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });