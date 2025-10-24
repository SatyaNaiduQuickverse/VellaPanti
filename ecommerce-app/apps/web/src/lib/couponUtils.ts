import type { CartItem, Coupon, AppliedCoupon } from '@ecommerce/types';

// Helper to get item price
export const getItemPrice = (item: CartItem): number => {
  if (item.productVariant) {
    return item.productVariant.salePrice || item.productVariant.price || 0;
  } else if (item.product) {
    return item.product.baseSalePrice || item.product.basePrice || 0;
  }
  return 0;
};

// Calculate subtotal
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const price = getItemPrice(item);
    return sum + (price * item.quantity);
  }, 0);
};

// Check if coupon is valid
export const isCouponValid = (coupon: Coupon): { valid: boolean; message: string } => {
  if (coupon.status !== 'ACTIVE') {
    return { valid: false, message: 'This coupon is not active' };
  }

  const now = new Date();

  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, message: 'This coupon is not yet valid' };
  }

  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return { valid: false, message: 'This coupon has expired' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'This coupon has reached its usage limit' };
  }

  return { valid: true, message: 'Coupon is valid' };
};

// Check if coupon applies to cart items
export const doesCouponApply = (coupon: Coupon, items: CartItem[]): boolean => {
  if (coupon.applicability === 'ALL') {
    return items.length > 0;
  }

  if (coupon.applicability === 'CATEGORY' && coupon.categoryId) {
    return items.some(item => item.product?.categoryId === coupon.categoryId);
  }

  if (coupon.applicability === 'PRODUCT' && coupon.productId) {
    return items.some(item => item.productId === coupon.productId);
  }

  return false;
};

// Get applicable items for a coupon
export const getApplicableItems = (coupon: Coupon, items: CartItem[]): CartItem[] => {
  if (coupon.applicability === 'ALL') {
    return items;
  }

  if (coupon.applicability === 'CATEGORY' && coupon.categoryId) {
    return items.filter(item => item.product?.categoryId === coupon.categoryId);
  }

  if (coupon.applicability === 'PRODUCT' && coupon.productId) {
    return items.filter(item => item.productId === coupon.productId);
  }

  return [];
};

// Calculate 50% off discount
export const calculate50PercentOff = (
  coupon: Coupon,
  items: CartItem[]
): AppliedCoupon => {
  const applicableItems = getApplicableItems(coupon, items);

  // Calculate discount on applicable items
  let discountAmount = 0;

  applicableItems.forEach(item => {
    const price = getItemPrice(item);
    const itemDiscount = (price * item.quantity) * (coupon.discountPercentage! / 100);
    discountAmount += itemDiscount;
  });

  // Apply max discount if specified
  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  return {
    coupon,
    discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimals
  };
};

// Calculate BOGO (Buy One Get One Free)
export const calculateBOGO = (
  coupon: Coupon,
  items: CartItem[]
): AppliedCoupon => {
  const applicableItems = getApplicableItems(coupon, items);

  if (applicableItems.length === 0) {
    return { coupon, discountAmount: 0, freeItems: [] };
  }

  // For BOGO: customer pays for the higher-priced items, gets lower-priced items free
  // Sort by price (highest first)
  const sortedItems = [...applicableItems].sort((a, b) => {
    const priceA = getItemPrice(a);
    const priceB = getItemPrice(b);
    return priceB - priceA;
  });

  let freeItems: CartItem[] = [];
  let discountAmount = 0;

  // For each item, calculate how many free items they get
  sortedItems.forEach(item => {
    const quantity = item.quantity;
    const price = getItemPrice(item);

    // For every 2 items, 1 is free (rounded down)
    const freeQuantity = Math.floor(quantity / 2);

    if (freeQuantity > 0) {
      freeItems.push({
        ...item,
        quantity: freeQuantity,
      });

      discountAmount += price * freeQuantity;
    }
  });

  return {
    coupon,
    discountAmount: Math.round(discountAmount * 100) / 100,
    freeItems,
  };
};

// Apply coupon to cart
export const applyCoupon = (
  coupon: Coupon,
  items: CartItem[]
): { success: boolean; message: string; appliedCoupon?: AppliedCoupon } => {
  // Validate coupon
  const validation = isCouponValid(coupon);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  // Check if coupon applies to any items
  if (!doesCouponApply(coupon, items)) {
    return {
      success: false,
      message: 'This coupon does not apply to any items in your cart',
    };
  }

  // Check minimum purchase amount
  const subtotal = calculateSubtotal(items);
  if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
    return {
      success: false,
      message: `Minimum purchase of ₹${coupon.minPurchaseAmount.toFixed(2)} required`,
    };
  }

  // Calculate discount based on coupon type
  let appliedCoupon: AppliedCoupon;

  if (coupon.type === 'PERCENTAGE') {
    appliedCoupon = calculate50PercentOff(coupon, items);
  } else if (coupon.type === 'BOGO') {
    appliedCoupon = calculateBOGO(coupon, items);
  } else {
    return { success: false, message: 'Invalid coupon type' };
  }

  return {
    success: true,
    message: 'Coupon applied successfully!',
    appliedCoupon,
  };
};
