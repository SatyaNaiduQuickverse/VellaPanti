import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useCarousel() {
  return useQuery<ApiResponse<any>>({
    queryKey: ['carousel'],
    queryFn: async () => {
      const response = await api.get('/categories/carousel');
      return response.data;
    },
    staleTime: 0, // Always refetch from server
    gcTime: 1000, // Keep in cache for 1 second only
  });
}