import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useHomepageBanners() {
  return useQuery({
    queryKey: ['homepageBanners'],
    queryFn: async () => {
      console.log('Fetching homepage banners');
      const response = await api.get('/categories/homepage-banners');
      console.log('Homepage banners response:', response.data);
      return response.data;
    },
    staleTime: 0,
    cacheTime: 1000,
  });
}