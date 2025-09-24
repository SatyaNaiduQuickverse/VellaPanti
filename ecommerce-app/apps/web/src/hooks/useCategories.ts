import { useQuery } from '@tanstack/react-query';
import { api, handleApiResponse } from '@/lib/api';
import type { Category } from '@ecommerce/types';

const mockCategories: Category[] = [
  // Black Theme Categories
  {
    id: '1',
    name: 'STREET WEAR',
    slug: 'street-wear',
    description: 'Raw street aesthetics meets premium comfort. Oversized fit for that authentic underground vibe.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'BLACK',
    _count: { products: 12 }
  },
  {
    id: '2',
    name: 'HOODIES & SWEATS',
    slug: 'hoodies-sweats',
    description: 'Premium heavyweight hoodies with street credibility. Perfect for those late night sessions.',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'BLACK',
    _count: { products: 8 }
  },
  {
    id: '3',
    name: 'RAP CULTURE',
    slug: 'rap-culture',
    description: 'Show the world your rap credentials. Limited edition design inspired by the culture.',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'BLACK',
    _count: { products: 15 }
  },
  {
    id: '4',
    name: 'URBAN FOOTWEAR',
    slug: 'urban-footwear',
    description: 'Street ready sneakers with that underground flex. Comfort meets style.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'BLACK',
    _count: { products: 6 }
  },
  {
    id: '5',
    name: 'ACCESSORIES',
    slug: 'black-accessories',
    description: 'Complete your street look with our underground accessories collection.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'BLACK',
    _count: { products: 10 }
  },
  {
    id: '6',
    name: 'DENIM & JEANS',
    slug: 'denim-jeans',
    description: 'Premium denim with street-ready cuts and authentic washes.',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'BLACK',
    _count: { products: 9 }
  },
  // White Theme Categories
  {
    id: '7',
    name: 'PREMIUM BASICS',
    slug: 'premium-basics',
    description: 'Clean lines, premium materials. Elevated basics for the discerning individual.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'WHITE',
    _count: { products: 18 }
  },
  {
    id: '8',
    name: 'MINIMAL LUXURY',
    slug: 'minimal-luxury',
    description: 'Timeless design with modern comfort. Perfect for any occasion.',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'WHITE',
    _count: { products: 14 }
  },
  {
    id: '9',
    name: 'CLEAN CUTS',
    slug: 'clean-cuts',
    description: 'Less is more. Sophisticated minimalism for the modern wardrobe.',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'WHITE',
    _count: { products: 11 }
  },
  {
    id: '10',
    name: 'ESSENTIALS',
    slug: 'essentials',
    description: 'Your daily go-to. Comfort-first design without compromising on style.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'WHITE',
    _count: { products: 16 }
  },
  {
    id: '11',
    name: 'PREMIUM FOOTWEAR',
    slug: 'premium-footwear',
    description: 'Sophisticated footwear collection for the modern lifestyle.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'WHITE',
    _count: { products: 7 }
  },
  {
    id: '12',
    name: 'REFINED ACCESSORIES',
    slug: 'refined-accessories',
    description: 'Carefully curated accessories to complement your clean aesthetic.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
    theme: 'WHITE',
    _count: { products: 8 }
  }
];

export const useCategories = (theme?: 'BLACK' | 'WHITE' | null) => {
  return useQuery({
    queryKey: ['categories', theme],
    queryFn: async (): Promise<{ data: Category[] }> => {
      try {
        const params = theme ? { theme } : {};
        const response = await api.get('/categories', { params });

        // If API returns data, use it
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          return response.data;
        }
      } catch (error) {
        console.log('API error, falling back to mock categories:', error);
      }

      // Fall back to mock categories, filtered by theme
      let filteredCategories = mockCategories;
      if (theme) {
        filteredCategories = mockCategories.filter(cat => cat.theme === theme);
      }
      return { data: filteredCategories };
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