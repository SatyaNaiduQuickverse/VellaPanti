import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api, handleApiResponse, handleApiError } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import type { CartItem, AddToCartRequest, UpdateCartItemRequest } from '@ecommerce/types';

interface CartData {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export const useCart = () => {
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  return useQuery({
    queryKey: ['cart'],
    queryFn: async (): Promise<CartData> => {
      const response = await api.get('/cart');
      const data = handleApiResponse<CartData>(response);
      setCart(data.items, data.total, data.itemCount);
      return data;
    },
    enabled: isAuthenticated(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { addItem, openCart } = useCartStore();

  return useMutation({
    mutationFn: async (data: AddToCartRequest): Promise<CartItem> => {
      const response = await api.post('/cart', data);
      return handleApiResponse<CartItem>(response);
    },
    onSuccess: (data) => {
      addItem(data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!');
      openCart();
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast.error(message);
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { updateItem } = useCartStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCartItemRequest }): Promise<CartItem> => {
      const response = await api.put(`/cart/${id}`, data);
      return handleApiResponse<CartItem>(response);
    },
    onSuccess: (data) => {
      updateItem(data.id, data.quantity);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast.error(message);
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const { removeItem } = useCartStore();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await api.delete(`/cart/${id}`);
      return handleApiResponse<void>(response);
    },
    onSuccess: (_, id) => {
      removeItem(id);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast.error(message);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await api.delete('/cart');
      return handleApiResponse<void>(response);
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
    onError: (error) => {
      const message = handleApiError(error);
      toast.error(message);
    },
  });
};