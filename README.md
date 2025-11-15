# VellaPanti - Premium Fashion E-Commerce Platform

<div align="center">

**A modern, full-stack e-commerce platform for premium streetwear fashion**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://vellapanti.co.in)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

[Live Demo](https://vellapanti.co.in) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started)

</div>

---

## 🎯 Overview

VellaPanti is a production-ready e-commerce platform built for selling premium streetwear fashion. The platform features a modern black-and-white aesthetic, comprehensive product management, secure payment processing, and SMS-based authentication.

**🌐 Live Site:** [https://vellapanti.co.in](https://vellapanti.co.in)

### Key Highlights

- 🛍️ Full-featured e-commerce with product catalog, cart, and checkout
- 📱 SMS OTP authentication using MSG91
- 💳 Integrated Cashfree payment gateway
- 🎨 Modern responsive UI with black & white theme
- 🔐 Role-based access control (Admin panel)
- 📊 Performance optimized with caching strategies
- 🚀 Production deployed on Oracle Cloud with Nginx

---

## ✨ Features

### Customer Features

- **Authentication**
  - Phone number registration with OTP verification
  - SMS-based login (MSG91 integration)
  - JWT token authentication
  - Session management

- **Shopping Experience**
  - Browse products by category (BLACK & WHITE collections)
  - Product search and filtering
  - Shopping cart management
  - Guest checkout support
  - Multiple address management
  - Order tracking and history

- **Payment**
  - Cashfree payment gateway integration
  - Secure payment processing
  - Order confirmation emails

### Admin Features

- Product management (Add/Edit/Delete)
- Order management and status updates
- Homepage carousel management
- Featured collections management
- Site settings configuration
- Support ticket management

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Hook Form + Zod** - Form validation
- **TanStack Query** - Data fetching and caching

### Backend
- **Node.js + Express.js** - REST API
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Multer** - File uploads

### Infrastructure
- **Oracle Cloud** - Hosting
- **Nginx** - Reverse proxy
- **PM2** - Process management
- **Cloudflare** - CDN & SSL

### Third-Party Services
- **MSG91** - SMS OTP delivery
- **Cashfree** - Payment processing
- **Gmail SMTP** - Email notifications

### Development
- **Turborepo** - Monorepo management
- **pnpm** - Package manager
- **ESLint** - Code linting

---

## 🏗️ Architecture

Monorepo structure powered by Turborepo:

```
ecommerce-app/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js backend
├── packages/
│   ├── ui/           # Shared React components
│   ├── config/       # Shared configuration
│   ├── database/     # Prisma schema and client
│   └── types/        # Shared TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pratyush150/VellaPanti.git
   cd VellaPanti/ecommerce-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `.env` files:
   ```bash
   # Backend
   cp apps/api/.env.example apps/api/.env

   # Frontend
   cp apps/web/.env.example apps/web/.env.local
   ```

   Edit with your credentials (see `.env.example` files)

4. **Set up database**
   ```bash
   # Generate Prisma client
   pnpm --filter @ecommerce/database generate

   # Push schema to database
   pnpm --filter @ecommerce/database db:push
   ```

5. **Run development servers**
   ```bash
   # Terminal 1 - Backend
   pnpm --filter api dev

   # Terminal 2 - Frontend
   pnpm --filter web dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3061
   - Backend API: http://localhost:3062

---

## 🔐 Environment Variables

### Backend (`apps/api/.env`)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/vellapanti
PORT=3062
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key

# MSG91 SMS
MSG91_AUTH_KEY=your-msg91-key
MSG91_SENDER_ID=MSGIND
MSG91_TEMPLATE_ID=your-template-id

# Cashfree Payment
CASHFREE_APP_ID=your-app-id
CASHFREE_SECRET_KEY=your-secret-key
CASHFREE_ENV=SANDBOX

# Email
EMAIL_FROM=your-email@gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Frontend (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3062/api
NEXT_PUBLIC_SITE_URL=http://localhost:3061
```

---

## 📦 Build & Deployment

### Production Build

```bash
# Build all packages
pnpm build

# Or individually
pnpm --filter api build
pnpm --filter web build
```

### PM2 Process Management

```bash
pm2 start apps/api/dist/index.js --name vellapanti-api
pm2 start apps/web/.next/standalone/server.js --name vellapanti-web
pm2 save
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register with phone
- `POST /api/auth/verify-phone-otp` - Verify OTP
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update status (Admin)

### Collections
- `GET /api/collections` - List collections
- `GET /api/collections/:id` - Get collection

---

## 📁 Project Structure

```
ecommerce-app/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── stores/         # Zustand stores
│   │   └── public/             # Static assets
│   │
│   └── api/                    # Express.js Backend
│       └── src/
│           ├── controllers/    # Route controllers
│           ├── middleware/     # Express middleware
│           ├── routes/         # API routes
│           ├── schemas/        # Validation schemas
│           └── services/       # Business logic
│
├── packages/
│   ├── ui/                     # Shared components
│   ├── config/                 # Configuration
│   ├── database/               # Prisma schema
│   └── types/                  # TypeScript types
│
└── turbo.json                  # Turborepo config
```

---

## 🎨 Key Features Implementation

### SMS OTP Authentication

1. User registers with phone number
2. Backend generates 6-digit OTP
3. MSG91 sends SMS to user
4. User verifies OTP
5. JWT tokens generated
6. User logged in

**File:** `apps/api/src/services/msg91Service.ts`

### Payment Processing

1. User completes checkout
2. Cashfree payment order created
3. Payment modal opens
4. User completes payment
5. Webhook updates order status
6. Confirmation email sent

**File:** `apps/api/src/controllers/paymentController.ts`

### Performance Optimization

- Product listings cached (5-min TTL)
- Featured collections with stale-while-revalidate
- CDN caching via Cloudflare
- Prisma query optimization

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Pratyush**
- GitHub: [@Pratyush150](https://github.com/Pratyush150)
- Live Site: [vellapanti.co.in](https://vellapanti.co.in)

---

## 🙏 Acknowledgments

- Next.js - React framework
- Prisma - Database ORM
- Tailwind CSS - Styling
- MSG91 - SMS gateway
- Cashfree - Payment processing

---

<div align="center">

**Built with ❤️ for the streetwear community**

⭐ Star this repo if you find it helpful!

</div>
