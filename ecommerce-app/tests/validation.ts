#!/usr/bin/env tsx

import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const API_URL = 'http://localhost:3062';
const WEB_URL = 'http://localhost:3061';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://ecommerce:ecommerce_secure_2024@localhost:5432/ecommerce_dev',
    },
  },
});

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, error?: string) {
  results.push({ name, passed, error });
  console.log(`${passed ? '✅' : '❌'} ${name}${error ? `: ${error}` : ''}`);
}

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    await prisma.user.findFirst();
    addResult('Database Connection', true);
    return true;
  } catch (error) {
    addResult('Database Connection', false, (error as Error).message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function testApiHealth() {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    const isHealthy = response.status === 200 && response.data.success;
    addResult('API Health Check', isHealthy);
    return isHealthy;
  } catch (error) {
    addResult('API Health Check', false, `Cannot reach API at ${API_URL}`);
    return false;
  }
}

async function testWebsiteAccess() {
  try {
    const response = await axios.get(WEB_URL, { timeout: 5000 });
    const isAccessible = response.status === 200;
    addResult('Website Access', isAccessible);
    return isAccessible;
  } catch (error) {
    addResult('Website Access', false, `Cannot reach website at ${WEB_URL}`);
    return false;
  }
}

async function testAuthenticationFlow() {
  try {
    // Test registration
    const userData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Password123',
    };

    const registerResponse = await axios.post(`${API_URL}/api/auth/register`, userData);
    if (registerResponse.status !== 201) {
      throw new Error('Registration failed');
    }

    const { accessToken, user } = registerResponse.data.data;
    if (!accessToken || !user.id) {
      throw new Error('Invalid registration response');
    }

    // Test login
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: userData.email,
      password: userData.password,
    });

    if (loginResponse.status !== 200) {
      throw new Error('Login failed');
    }

    // Test protected route
    const profileResponse = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (profileResponse.status !== 200) {
      throw new Error('Protected route access failed');
    }

    addResult('Authentication Flow', true);
    return true;
  } catch (error) {
    addResult('Authentication Flow', false, (error as Error).message);
    return false;
  }
}

async function testProductsAPI() {
  try {
    const response = await axios.get(`${API_URL}/api/products?limit=5`);
    if (response.status !== 200) {
      throw new Error('Products API failed');
    }

    const { data, pagination } = response.data;
    if (!Array.isArray(data) || !pagination) {
      throw new Error('Invalid products response structure');
    }

    addResult('Products API', true);
    return true;
  } catch (error) {
    addResult('Products API', false, (error as Error).message);
    return false;
  }
}

async function testCategoriesAPI() {
  try {
    const response = await axios.get(`${API_URL}/api/categories`);
    if (response.status !== 200) {
      throw new Error('Categories API failed');
    }

    const categories = response.data.data;
    if (!Array.isArray(categories)) {
      throw new Error('Invalid categories response structure');
    }

    addResult('Categories API', true);
    return true;
  } catch (error) {
    addResult('Categories API', false, (error as Error).message);
    return false;
  }
}

async function testCartFlow() {
  try {
    // First, register a user
    const userData = {
      name: 'Cart Test User',
      email: `carttest${Date.now()}@example.com`,
      password: 'Password123',
    };

    const registerResponse = await axios.post(`${API_URL}/api/auth/register`, userData);
    const { accessToken } = registerResponse.data.data;

    const headers = { Authorization: `Bearer ${accessToken}` };

    // Get products to add to cart
    const productsResponse = await axios.get(`${API_URL}/api/products?limit=1`);
    const products = productsResponse.data.data;
    
    if (products.length === 0) {
      throw new Error('No products available for cart test');
    }

    const product = products[0];

    // Add to cart
    const addToCartResponse = await axios.post(
      `${API_URL}/api/cart`,
      {
        productId: product.id,
        quantity: 1,
      },
      { headers }
    );

    if (addToCartResponse.status !== 201) {
      throw new Error('Add to cart failed');
    }

    // Get cart
    const cartResponse = await axios.get(`${API_URL}/api/cart`, { headers });
    if (cartResponse.status !== 200) {
      throw new Error('Get cart failed');
    }

    const cart = cartResponse.data.data;
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty after adding item');
    }

    addResult('Cart Flow', true);
    return true;
  } catch (error) {
    addResult('Cart Flow', false, (error as Error).message);
    return false;
  }
}

async function checkSeededData() {
  try {
    await prisma.$connect();
    
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    
    if (userCount === 0) {
      throw new Error('No users found in database');
    }
    
    if (productCount === 0) {
      throw new Error('No products found in database');
    }
    
    if (categoryCount === 0) {
      throw new Error('No categories found in database');
    }

    addResult('Seeded Data Check', true, `Found ${userCount} users, ${productCount} products, ${categoryCount} categories`);
    return true;
  } catch (error) {
    addResult('Seeded Data Check', false, (error as Error).message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function runValidation() {
  console.log('🧪 Running E-commerce Application Validation...\n');

  // Database tests
  console.log('📊 Database Tests:');
  await testDatabaseConnection();
  await checkSeededData();
  console.log();

  // API tests
  console.log('🚀 API Tests:');
  const apiHealthy = await testApiHealth();
  if (apiHealthy) {
    await testAuthenticationFlow();
    await testProductsAPI();
    await testCategoriesAPI();
    await testCartFlow();
  }
  console.log();

  // Frontend tests
  console.log('🌐 Frontend Tests:');
  await testWebsiteAccess();
  console.log();

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);

  console.log('📋 Test Summary:');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Passed: ${passed}/${total} (${percentage}%)`);
  
  if (passed < total) {
    console.log(`❌ Failed: ${total - passed}`);
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  • ${r.name}: ${r.error}`);
    });
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (percentage >= 80) {
    console.log('🎉 Application is ready for use!');
  } else if (percentage >= 60) {
    console.log('⚠️  Application has some issues but basic functionality works.');
  } else {
    console.log('🚨 Application has critical issues that need to be resolved.');
  }

  process.exit(passed === total ? 0 : 1);
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run validation
runValidation().catch((error) => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});