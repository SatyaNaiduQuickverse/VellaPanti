import { useQuery } from '@tanstack/react-query';
import { api, handleApiResponse } from '@/lib/api';
import type { Category } from '@ecommerce/types';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const response = await api.get('/categories');
      return handleApiResponse<Category[]>(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  });
};