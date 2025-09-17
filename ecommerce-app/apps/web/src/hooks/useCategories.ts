import { useQuery } from '@tanstack/react-query';
import { api, handleApiResponse } from '@/lib/api';
import type { Category } from '@ecommerce/types';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<{ data: Category[] }> => {
      const response = await api.get('/categories');
      return response.data.success ? response.data : { data: [] };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async (): Promise<Category> => {
      const response = await api.get(`/categories/${slug}`);
      return handleApiResponse<Category>(response);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};