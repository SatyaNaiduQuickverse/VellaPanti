import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useHomepageSectionTexts() {
  return useQuery<ApiResponse<any>>({
    queryKey: ['homepageSectionTexts'],
    queryFn: async () => {
      const response = await api.get('/categories/homepage-section-texts');
      return response.data;
    },
    staleTime: 0,
    gcTime: 1000,
  });
}
