# API Endpoints Documentation

Base URL: `http://localhost:3062/api`

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required | Validation Schema |
|--------|----------|-------------|---------------|------------------|
| POST | `/auth/login` | User login | No | loginSchema |
| POST | `/auth/register` | User registration | No | registerSchema |
| POST | `/auth/refresh` | Refresh access token | No | refreshTokenSchema |
| POST | `/auth/forgot-password` | Send password reset email | No | forgotPasswordSchema |
| POST | `/auth/reset-password` | Reset password with token | No | resetPasswordSchema |
| GET | `/auth/me` | Get current user info | Yes | - |

## Product Endpoints (`/api/products`)

| Method | Endpoint | Description | Auth Required | Admin Only | Validation Schema |
|--------|----------|-------------|---------------|------------|------------------|
| GET | `/products` | Get all products with pagination/filters | No | No | productQuerySchema |
| GET | `/products/search` | Search products | No | No | - |
| GET | `/products/categories-filter` | Get categories for filter dropdown | No | No | - |
| GET | `/products/slug/:slug` | Get product by slug | No | No | - |
| GET | `/products/:id` | Get product by ID | No | No | - |
| POST | `/products` | Create new product | Yes | Yes | createProductSchema |
| PUT | `/products/:id` | Update product | Yes | Yes | updateProductSchema |
| DELETE | `/products/:id` | Delete product | Yes | Yes | - |

## Category Endpoints (`/api/categories`)

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/categories` | Get all categories | No | No |
| GET | `/categories/:slug` | Get category by slug | No | No |
| GET | `/categories/:slug/products` | Get products in category | No | No |
| POST | `/categories` | Create new category | Yes | Yes |
| PUT | `/categories/:id` | Update category | Yes | Yes |
| DELETE | `/categories/:id` | Delete category | Yes | Yes |

## Cart Endpoints (`/api/cart`)
*All cart routes require authentication*

| Method | Endpoint | Description | Validation Schema |
|--------|----------|-------------|------------------|
| GET | `/cart` | Get user's cart | - |
| POST | `/cart` | Add item to cart | addToCartSchema |
| PUT | `/cart/:id` | Update cart item quantity | updateCartItemSchema |
| DELETE | `/cart/:id` | Remove item from cart | - |
| DELETE | `/cart` | Clear entire cart | - |

## Order Endpoints (`/api/orders`)
*All order routes require authentication*

| Method | Endpoint | Description | Admin Only | Validation Schema |
|--------|----------|-------------|------------|------------------|
| GET | `/orders` | Get user's orders | No | - |
| GET | `/orders/all` | Get all orders (admin) | Yes | - |
| GET | `/orders/:id` | Get order by ID | No | - |
| POST | `/orders` | Create new order | No | createOrderSchema |
| PATCH | `/orders/:id/status` | Update order status | Yes | updateOrderStatusSchema |

## User Endpoints (`/api/users`)
*All user routes require authentication*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get user profile |
| PUT | `/users/profile` | Update user profile |
| GET | `/users/addresses` | Get user addresses |
| POST | `/users/addresses` | Create new address |
| PUT | `/users/addresses/:id` | Update address |
| DELETE | `/users/addresses/:id` | Delete address |

## Review Endpoints (`/api/reviews`)

| Method | Endpoint | Description | Auth Required | Validation Schema |
|--------|----------|-------------|---------------|------------------|
| GET | `/reviews` | Get reviews | Optional | - |
| GET | `/reviews/:id` | Get review by ID | Optional | - |
| POST | `/reviews` | Create review | Yes | createReviewSchema |
| PUT | `/reviews/:id` | Update review | Yes | updateReviewSchema |
| DELETE | `/reviews/:id` | Delete review | Yes | - |

## Upload Endpoints (`/api/uploads`)
*All upload routes require admin authentication*

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/uploads/products` | Upload product images (max 10) |
| DELETE | `/uploads/products/:imagePath` | Delete product image |
| GET | `/uploads/info/:imagePath` | Get image info |

## Admin Endpoints (`/api/admin`)
*All admin routes require authentication and admin role*

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard/stats` | Get dashboard statistics |

### Category Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/categories` | Get all categories with admin details |
| GET | `/admin/categories/:id` | Get category by ID with full details |

### Product Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/products` | Get all products with admin details and filters |
| GET | `/admin/products/:id` | Get product by ID with full admin details |
| POST | `/admin/products` | Create product (admin version) |
| PUT | `/admin/products/:id` | Update product (admin version) |
| DELETE | `/admin/products/:id` | Delete product (admin version) |

### Bulk Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/admin/products/bulk-update` | Bulk update products |
| DELETE | `/admin/products/bulk-delete` | Bulk delete products |

## Authentication Headers

For authenticated endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Query Parameters

### Products (`/api/products`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `categoryId` - Filter by category
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sort` - Sort field (name, price, createdAt)
- `sortOrder` - Sort direction (asc, desc)
- `inStock` - Filter for in-stock items (boolean)

### Admin Products (`/api/admin/products`)
- All product query parameters plus:
- `status` - Product status filter (all, active, inactive, low-stock, out-of-stock)

### Categories (`/api/categories`)
- `page` - Page number
- `limit` - Items per page
- `search` - Search term

### Orders (`/api/orders`)
- `page` - Page number
- `limit` - Items per page
- `status` - Order status filter

## Response Format

All API responses follow this format:
```json
{
  "success": true|false,
  "data": <response data>,
  "message": "<optional message>",
  "pagination": {  // For paginated responses
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "error": "<error message if success is false>"
}
```

## Error Handling

- `400` - Bad Request (validation errors, missing parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate resource, e.g., slug already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

- Window: 15 minutes
- Max requests: 100 per window per IP