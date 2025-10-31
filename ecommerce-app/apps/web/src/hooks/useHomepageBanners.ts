import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useHomepageBanners() {
  return useQuery<ApiResponse<any>>({
    queryKey: ['homepageBanners'],
    queryFn: async () => {
      const response = await api.get('/categories/homepage-banners');
      return response.data;
    },
    staleTime: 0,
    gcTime: 1000,
  });
}