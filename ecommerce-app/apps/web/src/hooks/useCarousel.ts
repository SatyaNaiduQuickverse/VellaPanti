import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCarousel() {
  return useQuery({
    queryKey: ['carousel'],
    queryFn: async () => {
      const response = await api.get('/categories/carousel');
      return response.data;
    },
    staleTime: 0, // Always refetch from server
    cacheTime: 1000, // Keep in cache for 1 second only
  });
}