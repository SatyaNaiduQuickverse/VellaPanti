import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

// Get user's wishlist
export function useWishlist() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!accessToken) return { data: [] };

      const response = await api.get('/wishlist', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    enabled: !!accessToken,
    staleTime: 30000, // 30 seconds
  });
}

// Get wishlist count
export function useWishlistCount() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['wishlistCount'],
    queryFn: async () => {
      if (!accessToken) return { count: 0 };

      const response = await api.get('/wishlist/count', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    enabled: !!accessToken,
    staleTime: 30000, // 30 seconds
  });
}

// Check if a product is in wishlist
export function useWishlistStatus(productId: string) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['wishlistStatus', productId],
    queryFn: async () => {
      if (!accessToken || !productId) return { inWishlist: false };

      const response = await api.get(`/wishlist/status/${productId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    enabled: !!accessToken && !!productId,
    staleTime: 30000, // 30 seconds
  });
}

// Toggle product in wishlist
export function useToggleWishlist() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!accessToken) throw new Error('Please log in to manage wishlist');

      const response = await api.post('/wishlist/toggle',
        { productId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    },
    onSuccess: (data, productId) => {
      // Update wishlist queries more efficiently
      queryClient.setQueryData(['wishlist'], (oldData: any) => {
        if (!oldData?.data) return oldData;

        if (data.action === 'added') {
          // Add optimistic update for new item
          return {
            ...oldData,
            data: [...oldData.data, { product: { id: productId } }]
          };
        } else {
          // Remove item optimistically
          return {
            ...oldData,
            data: oldData.data.filter((item: any) => item.product.id !== productId)
          };
        }
      });

      // Update count optimistically
      queryClient.setQueryData(['wishlistCount'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          count: data.action === 'added' ? oldData.count + 1 : oldData.count - 1
        };
      });

      // Show toast notification
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to update wishlist';
      toast.error(message);

      // Invalidate queries on error to refresh state
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistCount'] });
    },
    // Add retry configuration
    retry: 1,
    retryDelay: 1000,
  });
}

// Add to wishlist
export function useAddToWishlist() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!accessToken) throw new Error('Please log in to add to wishlist');

      const response = await api.post('/wishlist/add',
        { productId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    },
    onSuccess: (data, productId) => {
      // Update wishlist queries
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistCount'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistStatus', productId] });

      // Show toast notification
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to add to wishlist';
      toast.error(message);
    },
  });
}

// Remove from wishlist
export function useRemoveFromWishlist() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!accessToken) throw new Error('Please log in to remove from wishlist');

      const response = await api.delete(`/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    },
    onSuccess: (data, productId) => {
      // Update wishlist queries
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistCount'] });
      queryClient.invalidateQueries({ queryKey: ['wishlistStatus', productId] });

      // Show toast notification
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to remove from wishlist';
      toast.error(message);
    },
  });
}