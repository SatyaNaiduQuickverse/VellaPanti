import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface FeaturedCollectionsParams {
  theme?: 'BLACK' | 'WHITE';
}

export function useFeaturedCollections(params: FeaturedCollectionsParams = {}) {
  return useQuery({
    queryKey: ['featuredCollections', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.theme) {
        searchParams.append('theme', params.theme);
      }

      console.log('Fetching featured collections with params:', params);
      const url = `/categories/featured?${searchParams.toString()}`;
      console.log('Featured collections URL:', url);

      const response = await api.get(url);
      console.log('Featured collections response:', response.data);
      return response.data;
    },
    staleTime: 0, // Always refetch from server
    gcTime: 1000, // Keep in cache for 1 second only
  });
}