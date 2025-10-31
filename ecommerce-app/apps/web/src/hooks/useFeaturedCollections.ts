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

      const url = `/categories/featured?${searchParams.toString()}`;
      const response = await api.get(url);
      return response.data;
    },
    staleTime: 0, // Always refetch from server
    gcTime: 1000, // Keep in cache for 1 second only
  });
}