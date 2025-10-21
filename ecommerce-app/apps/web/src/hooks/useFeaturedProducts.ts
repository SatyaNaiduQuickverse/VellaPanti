import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface FeaturedProductsParams {
  theme?: 'BLACK' | 'WHITE';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useFeaturedProducts(params: FeaturedProductsParams = {}) {
  return useQuery<ApiResponse<any>>({
    queryKey: ['featuredProducts', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.theme) {
        searchParams.append('theme', params.theme);
      }

      console.log('Fetching featured products with params:', params);
      const url = `/products/featured?${searchParams.toString()}`;
      console.log('Featured products URL:', url);

      const response = await api.get(url);
      console.log('Featured products response:', response.data);
      return response.data;
    },
    staleTime: 0, // Always refetch from server
    gcTime: 1000, // Keep in cache for 1 second only
  });
}