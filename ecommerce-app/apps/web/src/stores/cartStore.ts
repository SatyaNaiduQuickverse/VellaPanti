import { create } from 'zustand';
import type { CartItem } from '@ecommerce/types';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
  setCart: (items: CartItem[], total: number, itemCount: number) => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  setCart: (items, total, itemCount) =>
    set({
      items,
      total,
      itemCount,
    }),
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
    
    // Recalculate totals
    const newItems = get().items;
    const newTotal = newItems.reduce((sum, i) => {
      const price = (i.product as any)?.salePrice || (i.product as any)?.basePrice || (i.product as any)?.price || 0;
      return sum + (price * i.quantity);
    }, 0);
    const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
    
    set({ total: newTotal, itemCount: newItemCount });
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
    
    // Recalculate totals
    const newItems = get().items;
    const newTotal = newItems.reduce((sum, i) => {
      const price = (i.product as any)?.salePrice || (i.product as any)?.basePrice || (i.product as any)?.price || 0;
      return sum + (price * i.quantity);
    }, 0);
    const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
    
    set({ total: newTotal, itemCount: newItemCount });
  },
  removeItem: (itemId) => {
    const { items } = get();
    const newItems = items.filter((i) => i.id !== itemId);
    const newTotal = newItems.reduce((sum, i) => {
      const price = (i.product as any)?.salePrice || (i.product as any)?.basePrice || (i.product as any)?.price || 0;
      return sum + (price * i.quantity);
    }, 0);
    const newItemCount = newItems.reduce((sum, i) => sum + i.quantity, 0);
    
    set({
      items: newItems,
      total: newTotal,
      itemCount: newItemCount,
    });
  },
  clearCart: () =>
    set({
      items: [],
      total: 0,
      itemCount: 0,
    }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));