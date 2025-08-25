import { useQuery } from '@tanstack/react-query';
import { api, handleApiResponse } from '@/lib/api';
import type { Product, ProductFilters, PaginatedResponse } from '@ecommerce/types';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await api.get(`/products?${params.toString()}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async (): Promise<Product> => {
      const response = await api.get(`/products/slug/${slug}`);
      return handleApiResponse<Product>(response);
    },
    enabled: !!slug,
  });
};