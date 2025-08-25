# E-commerce Application

A production-ready, full-stack e-commerce application built with modern technologies.

## 🚀 Features

### Backend (Express.js + PostgreSQL)
- **RESTful API** with comprehensive endpoints
- **JWT Authentication** with access/refresh tokens
- **PostgreSQL Database** with Prisma ORM
- **Security** with Helmet, CORS, rate limiting, input validation
- **File Uploads** with Multer for product images
- **Comprehensive Testing** with Jest

### Frontend (Next.js 14 + TypeScript)
- **Modern UI** with Tailwind CSS and responsive design  
- **State Management** with Zustand for global state
- **API Integration** with TanStack Query for server state
- **Form Handling** with React Hook Form and Zod validation
- **Authentication Flow** with protected routes
- **Shopping Cart** with persistent state

### Core Functionality
- ✅ User authentication and registration
- ✅ Product catalog with categories, search, filtering
- ✅ Shopping cart with quantity management
- ✅ Order management with status tracking
- ✅ Product reviews and ratings
- ✅ User profile and address management
- ✅ Admin panel capabilities
- ✅ Responsive design for all devices

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting, Zod validation
- **File Handling**: Multer for image uploads
- **Testing**: Jest with supertest

### Frontend  
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Development
- **Monorepo**: Turborepo for workspace management
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier, TypeScript
- **Testing**: Jest for unit/integration tests

## 📋 Prerequisites

- **Node.js** 18+ with pnpm installed
- **PostgreSQL** 12+ running locally
- **Database credentials**:
  - Host: localhost
  - User: ecommerce
  - Password: ecommerce_secure_2024  
  - Database: ecommerce_dev

## 🚀 Quick Start

1. **Clone and setup**:
   ```bash
   cd ecommerce-app
   ./scripts/setup.sh
   ```

2. **Start development servers**:
   ```bash
   ./scripts/start-dev.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:3061
   - Backend API: http://localhost:3062

## 🔐 Demo Accounts

- **User Account**: user@ecommerce.com / password123
- **Admin Account**: admin@ecommerce.com / password123

## 📁 Project Structure

```
ecommerce-app/
├── apps/
│   ├── web/                 # Next.js frontend (port 3061)  
│   └── api/                 # Express.js backend (port 3062)
├── packages/
│   ├── ui/                  # Shared React components
│   ├── database/            # Prisma schema and client
│   ├── types/               # Shared TypeScript types
│   └── config/              # Shared configuration
├── tools/
│   └── eslint-config/       # Shared ESLint configuration
├── tests/                   # Integration tests
└── scripts/                 # Setup and utility scripts
```

## 🧪 Testing

Run comprehensive validation tests:
```bash
npm run test
```

This will test:
- Database connectivity and seeded data
- API endpoints and authentication flow
- Frontend accessibility  
- Cart functionality
- Error handling

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build all applications
- `npm run test` - Run validation tests
- `npm run lint` - Lint all code
- `npm run type-check` - TypeScript type checking

### Database Operations
```bash
cd packages/database
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema changes  
pnpm db:migrate     # Create and run migrations
pnpm db:seed        # Seed database with sample data
pnpm db:studio      # Open Prisma Studio GUI
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Products
- `GET /api/products` - List products with filtering/search
- `GET /api/products/slug/:slug` - Get product by slug
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories  
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category by slug
- `POST /api/categories` - Create category (Admin)

### Shopping Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order  
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status (Admin)

### Reviews
- `GET /api/reviews?productId=:id` - Get product reviews
- `POST /api/reviews` - Create product review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=postgresql://ecommerce:ecommerce_secure_2024@localhost:5432/ecommerce_dev
PORT=3062
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:3061
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3062
```

## 🚢 Production Deployment

1. **Build applications**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Run database migrations**:
   ```bash
   cd packages/database
   pnpm db:migrate
   ```

4. **Start production servers**:
   ```bash
   npm run start:prod
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Run linting: `npm run lint`  
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check that PostgreSQL is running with correct credentials
2. Ensure all dependencies are installed: `pnpm install`
3. Try running the setup script: `./scripts/setup.sh`
4. Run validation tests: `npm run test`

For additional help, check the logs or create an issue in the repository.