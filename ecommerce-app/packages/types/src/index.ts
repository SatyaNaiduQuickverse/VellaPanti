export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  addresses?: UserAddress[];
}

export interface UserAddress {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  theme?: ThemeLabel;
  parent?: Category;
  children?: Category[];
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  basePrice?: number;
  baseSalePrice?: number;
  images: string[];
  categoryId: string;
  theme?: ThemeLabel;

  // Detailed Product Information
  materialComposition?: string;
  fitType?: string;
  sleeveType?: string;
  collarStyle?: string;
  length?: string;
  neckStyle?: string;
  countryOfOrigin?: string;

  // Manufacturer Information
  manufacturer?: string;
  packer?: string;
  itemWeight?: string;
  itemDimensions?: string;
  netQuantity?: string;
  genericName?: string;

  // Product Features
  aboutItems?: string[];

  category?: Category;
  variants?: ProductVariant[];
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;

  // Computed fields from API
  variantOptions?: {
    colors: string[];
    sizes: string[];
    materials: string[];
  };
  priceRange?: {
    min: number;
    max: number;
    saleMin?: number;
    saleMax?: number;
    hasVariablePrice?: boolean;
  };
  totalStock?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  productVariantId?: string;
  quantity: number;
  product?: Product;
  productVariant?: ProductVariant;
  createdAt: Date;
  updatedAt: Date;
}

// Coupon Types
export type CouponType = 'PERCENTAGE' | 'BOGO';
export type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type CouponApplicability = 'ALL' | 'CATEGORY' | 'PRODUCT';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  discountPercentage?: number; // For PERCENTAGE type (e.g., 50 for 50% off)
  applicability: CouponApplicability;
  categoryId?: string; // For category-specific coupons
  productId?: string; // For product-specific coupons
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate?: Date;
  endDate?: Date;
  status: CouponStatus;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
  freeItems?: CartItem[]; // For BOGO coupons
}

export interface CartWithCoupon {
  items: CartItem[];
  appliedCoupon?: AppliedCoupon;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productVariantId?: string;
  quantity: number;
  price: number;

  // Store variant details at time of order
  variantSize?: string;
  variantColor?: string;
  variantMaterial?: string;

  product?: Product;
  productVariant?: ProductVariant;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  user?: User;
  product?: Product;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type ThemeLabel = 'BLACK' | 'WHITE';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Product Query Types
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  theme?: ThemeLabel;
  sort?: 'name' | 'price' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Cart Types
export interface AddToCartRequest {
  productId: string;
  productVariantId?: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApplyCouponRequest {
  code: string;
}

export interface ApplyCouponResponse {
  success: boolean;
  message: string;
  appliedCoupon?: AppliedCoupon;
  cart?: CartWithCoupon;
}

// Order Types
export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  items: Array<{
    productId: string;
    productVariantId?: string;
    quantity: number;
  }>;
  couponCode?: string;
  discountAmount?: number;
}

// Admin Types
export interface CreateProductVariantRequest {
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  salePrice?: number;
  stock: number;
  images?: string[];
}

export interface UpdateProductVariantRequest {
  sku?: string;
  size?: string;
  color?: string;
  material?: string;
  price?: number;
  salePrice?: number;
  stock?: number;
  images?: string[];
}

// Review Types
export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment?: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: ValidationError[];
}