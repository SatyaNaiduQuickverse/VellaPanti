import { create } from 'zustand';
import type { CartItem, AppliedCoupon } from '@ecommerce/types';

// Helper function to get correct price from cart item
const getItemPrice = (item: CartItem): number => {
  if (item.productVariant) {
    // Use variant sale price if available, otherwise variant price
    return item.productVariant.salePrice || item.productVariant.price || 0;
  } else if (item.product) {
    // Use product sale price if available, otherwise base price
    return item.product.baseSalePrice || item.product.basePrice || 0;
  }
  return 0;
};

// Calculate subtotal (before discounts)
const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const price = getItemPrice(item);
    return sum + (price * item.quantity);
  }, 0);
};

// Calculate total with coupon discount
const calculateTotal = (subtotal: number, discount: number): number => {
  return Math.max(0, subtotal - discount);
};

interface CartState {
  items: CartItem[];
  appliedCoupon?: AppliedCoupon;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setCart: (items: CartItem[], total: number, itemCount: number) => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  recalculateTotals: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  appliedCoupon: undefined,
  subtotal: 0,
  discount: 0,
  total: 0,
  itemCount: 0,
  isOpen: false,

  setCart: (items, total, itemCount) => {
    const subtotal = calculateSubtotal(items);
    set({
      items,
      subtotal,
      total,
      itemCount,
    });
  },

  addItem: (item) => {
    const { items } = get();
    const existingItem = items.find((i) => i.id === item.id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }

    get().recalculateTotals();
  },

  updateItem: (itemId, quantity) => {
    const { items } = get();

    if (quantity <= 0) {
      set({ items: items.filter((i) => i.id !== itemId) });
    } else {
      set({
        items: items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      });
    }

    get().recalculateTotals();
  },

  removeItem: (itemId) => {
    const { items } = get();
    set({ items: items.filter((i) => i.id !== itemId) });
    get().recalculateTotals();
  },

  clearCart: () =>
    set({
      items: [],
      appliedCoupon: undefined,
      subtotal: 0,
      discount: 0,
      total: 0,
      itemCount: 0,
    }),

  applyCoupon: (coupon: AppliedCoupon) => {
    set({ appliedCoupon: coupon });
    get().recalculateTotals();
  },

  removeCoupon: () => {
    set({ appliedCoupon: undefined, discount: 0 });
    get().recalculateTotals();
  },

  recalculateTotals: () => {
    const { items, appliedCoupon } = get();
    const subtotal = calculateSubtotal(items);
    const discount = appliedCoupon?.discountAmount || 0;
    const total = calculateTotal(subtotal, discount);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

    set({ subtotal, discount, total, itemCount });
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));