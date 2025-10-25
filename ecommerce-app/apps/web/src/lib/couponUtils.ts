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
// This works across products in the same category
// Supports configurable rules like Buy 2 Get 1 Free, Buy 3 Get 2 Free, etc.
export const calculateBOGO = (
  coupon: Coupon,
  items: CartItem[],
  bogoBuyQty: number = 1,
  bogoGetQty: number = 1
): AppliedCoupon => {
  const applicableItems = getApplicableItems(coupon, items);

  if (applicableItems.length === 0) {
    return { coupon, discountAmount: 0, freeItems: [] };
  }

  // Expand cart items into individual units with their details
  interface Unit {
    item: CartItem;
    price: number;
    categoryId?: string;
  }

  const units: Unit[] = [];
  applicableItems.forEach(item => {
    const price = getItemPrice(item);
    const categoryId = item.product?.categoryId;

    // Create individual units for each quantity
    for (let i = 0; i < item.quantity; i++) {
      units.push({ item, price, categoryId });
    }
  });

  // Always group by category and apply BOGO within each category
  // This ensures BOGO works for same category products only
  let discountAmount = 0;
  const freeUnits = new Map<string, number>(); // Track free quantity per product

  // Group units by category
  const categorizedUnits = new Map<string, Unit[]>();

  units.forEach(unit => {
    const catId = unit.categoryId || 'no-category';
    if (!categorizedUnits.has(catId)) {
      categorizedUnits.set(catId, []);
    }
    categorizedUnits.get(catId)!.push(unit);
  });

  // Calculate the group size for BOGO (buy + get free)
  const groupSize = bogoBuyQty + bogoGetQty;

  // Apply BOGO to each category group
  categorizedUnits.forEach((categoryUnits) => {
    // Only apply BOGO if there are enough items in this category
    if (categoryUnits.length < groupSize) {
      return;
    }

    // Sort by price descending (most expensive first)
    categoryUnits.sort((a, b) => b.price - a.price);

    // Process units in groups
    for (let i = 0; i < categoryUnits.length; i += groupSize) {
      const group = categoryUnits.slice(i, i + groupSize);

      // Only apply discount if we have a complete group
      if (group.length === groupSize) {
        // The last 'bogoGetQty' items in the group are free (the cheapest ones)
        const freeItemsInGroup = group.slice(bogoBuyQty);

        freeItemsInGroup.forEach(freeUnit => {
          discountAmount += freeUnit.price;
          const itemId = freeUnit.item.id;
          freeUnits.set(itemId, (freeUnits.get(itemId) || 0) + 1);
        });
      }
    }
  });

  // Build free items array
  const freeItems: CartItem[] = [];
  freeUnits.forEach((quantity, itemId) => {
    const item = applicableItems.find(i => i.id === itemId);
    if (item && quantity > 0) {
      freeItems.push({
        ...item,
        quantity,
      });
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
  items: CartItem[],
  bogoConfig?: { bogoBuyQty: number; bogoGetQty: number }
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
    const bogoBuyQty = bogoConfig?.bogoBuyQty || 1;
    const bogoGetQty = bogoConfig?.bogoGetQty || 1;
    appliedCoupon = calculateBOGO(coupon, items, bogoBuyQty, bogoGetQty);
  } else {
    return { success: false, message: 'Invalid coupon type' };
  }

  return {
    success: true,
    message: 'Coupon applied successfully!',
    appliedCoupon,
  };
};
