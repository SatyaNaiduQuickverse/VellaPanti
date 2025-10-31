import { useQuery } from '@tanstack/react-query';
import { api, handleApiResponse } from '@/lib/api';
import type { Product, ProductFilters, PaginatedResponse } from '@ecommerce/types';

const mockProducts: any[] = [
  // BLACK THEME PRODUCTS - Category 1: STREET WEAR
  {
    id: '1',
    name: 'STREET LEGENDS TEE',
    slug: 'street-legends-tee',
    description: 'Raw street aesthetics meets premium comfort. Oversized fit for that authentic underground vibe.',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 2999,
    baseSalePrice: 2499,
    totalStock: 25,
    categoryId: '1',
    theme: 'BLACK',
    averageRating: 4.8,
    reviewCount: 23,
    variants: [{ id: '1', productId: '1', name: 'Default', price: 2999, salePrice: 2499, stock: 25, sku: 'SLT-BLK-001' }],
    priceRange: { min: 2999, max: 2999, saleMin: 2499, hasVariablePrice: false }
  },
  {
    id: '2',
    name: 'UNDERGROUND GRAPHIC',
    slug: 'underground-graphic',
    description: 'Bold graphics that speak the language of the streets. 100% cotton heavyweight.',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 3299,
    totalStock: 18,
    categoryId: '1',
    theme: 'BLACK',
    averageRating: 4.7,
    reviewCount: 31,
    variants: [{ id: '2', productId: '2', name: 'Default', price: 3299, stock: 18, sku: 'UG-BLK-002' }],
    priceRange: { min: 3299, max: 3299, hasVariablePrice: false }
  },
  {
    id: '3',
    name: 'CULTURE CLASH TANK',
    slug: 'culture-clash-tank',
    description: 'Street culture meets high fashion. Drop shoulder cut for that authentic feel.',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 2799,
    baseSalePrice: 2399,
    totalStock: 32,
    categoryId: '1',
    theme: 'BLACK',
    averageRating: 4.6,
    reviewCount: 19,
    variants: [{ id: '3', productId: '3', name: 'Default', price: 2799, salePrice: 2399, stock: 32, sku: 'CCT-BLK-003' }],
    priceRange: { min: 2799, max: 2799, saleMin: 2399, hasVariablePrice: false }
  },

  // Category 2: HOODIES & SWEATS
  {
    id: '4',
    name: 'HEAVYWEIGHT HOODIE',
    slug: 'heavyweight-hoodie',
    description: 'Premium heavyweight hoodie with street credibility. Perfect for those late night sessions.',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 4999,
    totalStock: 18,
    categoryId: '2',
    theme: 'BLACK',
    averageRating: 4.9,
    reviewCount: 31,
    variants: [{ id: '4', productId: '4', name: 'Default', price: 4999, stock: 18, sku: 'HH-BLK-004' }],
    priceRange: { min: 4999, max: 4999, hasVariablePrice: false }
  },
  {
    id: '5',
    name: 'OVERSIZED SWEATSHIRT',
    slug: 'oversized-sweatshirt',
    description: 'Relaxed fit sweatshirt with that underground aesthetic. Brushed fleece interior.',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 3999,
    baseSalePrice: 3499,
    totalStock: 24,
    categoryId: '2',
    theme: 'BLACK',
    averageRating: 4.8,
    reviewCount: 27,
    variants: [{ id: '5', productId: '5', name: 'Default', price: 3999, salePrice: 3499, stock: 24, sku: 'OS-BLK-005' }],
    priceRange: { min: 3999, max: 3999, saleMin: 3499, hasVariablePrice: false }
  },

  // Category 3: RAP CULTURE
  {
    id: '6',
    name: 'RAP GAME STRONG',
    slug: 'rap-game-strong',
    description: 'Show the world your rap credentials. Limited edition design inspired by the culture.',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 3499,
    baseSalePrice: 2999,
    totalStock: 12,
    categoryId: '3',
    theme: 'BLACK',
    averageRating: 4.7,
    reviewCount: 18,
    variants: [{ id: '6', productId: '6', name: 'Default', price: 3499, salePrice: 2999, stock: 12, sku: 'RGS-BLK-006' }],
    priceRange: { min: 3499, max: 3499, saleMin: 2999, hasVariablePrice: false }
  },
  {
    id: '7',
    name: 'LYRICAL GENIUS TEE',
    slug: 'lyrical-genius-tee',
    description: 'For those who live and breathe hip-hop. Authentic street wear with attitude.',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 2899,
    totalStock: 28,
    categoryId: '3',
    theme: 'BLACK',
    averageRating: 4.5,
    reviewCount: 22,
    variants: [{ id: '7', productId: '7', name: 'Default', price: 2899, stock: 28, sku: 'LGT-BLK-007' }],
    priceRange: { min: 2899, max: 2899, hasVariablePrice: false }
  },

  // Category 4: URBAN FOOTWEAR
  {
    id: '8',
    name: 'FRESH KICKS V2',
    slug: 'fresh-kicks-v2',
    description: 'Street ready sneakers with that underground flex. Comfort meets style.',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 7999,
    totalStock: 8,
    categoryId: '4',
    theme: 'BLACK',
    averageRating: 4.6,
    reviewCount: 42,
    variants: [{ id: '8', productId: '8', name: 'Default', price: 7999, stock: 8, sku: 'FKV2-BLK-008' }],
    priceRange: { min: 7999, max: 7999, hasVariablePrice: false }
  },
  {
    id: '9',
    name: 'STREET RUNNERS',
    slug: 'street-runners',
    description: 'Made for the streets, built for comfort. All-day wearable with premium cushioning.',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 6999,
    baseSalePrice: 5999,
    totalStock: 15,
    categoryId: '4',
    theme: 'BLACK',
    averageRating: 4.7,
    reviewCount: 35,
    variants: [{ id: '9', productId: '9', name: 'Default', price: 6999, salePrice: 5999, stock: 15, sku: 'SR-BLK-009' }],
    priceRange: { min: 6999, max: 6999, saleMin: 5999, hasVariablePrice: false }
  },

  // Category 5: BLACK ACCESSORIES
  {
    id: '10',
    name: 'STREET CHAINS',
    slug: 'street-chains',
    description: 'Complete your street look with authentic chains. Premium stainless steel construction.',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 1999,
    totalStock: 45,
    categoryId: '5',
    theme: 'BLACK',
    averageRating: 4.4,
    reviewCount: 67,
    variants: [{ id: '10', productId: '10', name: 'Default', price: 1999, stock: 45, sku: 'SC-BLK-010' }],
    priceRange: { min: 1999, max: 1999, hasVariablePrice: false }
  },
  {
    id: '11',
    name: 'URBAN BACKPACK',
    slug: 'urban-backpack',
    description: 'Tactical-inspired backpack for street warriors. Multiple compartments and durable build.',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 4499,
    baseSalePrice: 3999,
    totalStock: 22,
    categoryId: '5',
    theme: 'BLACK',
    averageRating: 4.8,
    reviewCount: 34,
    variants: [{ id: '11', productId: '11', name: 'Default', price: 4499, salePrice: 3999, stock: 22, sku: 'UB-BLK-011' }],
    priceRange: { min: 4499, max: 4499, saleMin: 3999, hasVariablePrice: false }
  },

  // Category 6: DENIM & JEANS
  {
    id: '12',
    name: 'DISTRESSED DENIM',
    slug: 'distressed-denim',
    description: 'Premium denim with authentic street-ready distressing. Slim-fit cut with stretch.',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 5999,
    totalStock: 28,
    categoryId: '6',
    theme: 'BLACK',
    averageRating: 4.6,
    reviewCount: 41,
    variants: [{ id: '12', productId: '12', name: 'Default', price: 5999, stock: 28, sku: 'DD-BLK-012' }],
    priceRange: { min: 5999, max: 5999, hasVariablePrice: false }
  },
  {
    id: '13',
    name: 'RAW SELVEDGE',
    slug: 'raw-selvedge',
    description: 'Authentic Japanese selvedge denim. Premium quality that ages with your lifestyle.',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 8999,
    baseSalePrice: 7999,
    totalStock: 12,
    categoryId: '6',
    theme: 'BLACK',
    averageRating: 4.9,
    reviewCount: 29,
    variants: [{ id: '13', productId: '13', name: 'Default', price: 8999, salePrice: 7999, stock: 12, sku: 'RS-BLK-013' }],
    priceRange: { min: 8999, max: 8999, saleMin: 7999, hasVariablePrice: false }
  },

  // WHITE THEME PRODUCTS - Category 7: PREMIUM BASICS
  {
    id: '14',
    name: 'PREMIUM ESSENTIALS TEE',
    slug: 'premium-essentials-tee',
    description: 'Clean lines, premium materials. Elevated basics for the discerning individual.',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 3999,
    baseSalePrice: 3499,
    totalStock: 30,
    categoryId: '7',
    theme: 'WHITE',
    averageRating: 4.9,
    reviewCount: 67,
    variants: [{ id: '14', productId: '14', name: 'Default', price: 3999, salePrice: 3499, stock: 30, sku: 'PET-WHT-014' }],
    priceRange: { min: 3999, max: 3999, saleMin: 3499, hasVariablePrice: false }
  },
  {
    id: '15',
    name: 'ELEVATED HENLEY',
    slug: 'elevated-henley',
    description: 'Modern henley with premium cotton blend. Perfect for layering or standalone wear.',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 4499,
    totalStock: 25,
    categoryId: '7',
    theme: 'WHITE',
    averageRating: 4.7,
    reviewCount: 43,
    variants: [{ id: '15', productId: '15', name: 'Default', price: 4499, stock: 25, sku: 'EH-WHT-015' }],
    priceRange: { min: 4499, max: 4499, hasVariablePrice: false }
  },

  // Category 8: MINIMAL LUXURY
  {
    id: '16',
    name: 'LUXURY POLO',
    slug: 'luxury-polo',
    description: 'Timeless polo design with modern comfort. Perfect for any sophisticated occasion.',
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 5999,
    totalStock: 22,
    categoryId: '8',
    theme: 'WHITE',
    averageRating: 4.8,
    reviewCount: 28,
    variants: [{ id: '16', productId: '16', name: 'Default', price: 5999, stock: 22, sku: 'LP-WHT-016' }],
    priceRange: { min: 5999, max: 5999, hasVariablePrice: false }
  },
  {
    id: '17',
    name: 'REFINED BUTTON-DOWN',
    slug: 'refined-button-down',
    description: 'Classic button-down with contemporary cut. Wrinkle-resistant premium cotton.',
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 6999,
    baseSalePrice: 5999,
    totalStock: 18,
    categoryId: '8',
    theme: 'WHITE',
    averageRating: 4.9,
    reviewCount: 52,
    variants: [{ id: '17', productId: '17', name: 'Default', price: 6999, salePrice: 5999, stock: 18, sku: 'RBD-WHT-017' }],
    priceRange: { min: 6999, max: 6999, saleMin: 5999, hasVariablePrice: false }
  },

  // Category 9: CLEAN CUTS
  {
    id: '18',
    name: 'MINIMAL CREW NECK',
    slug: 'minimal-crew-neck',
    description: 'Less is more. Sophisticated minimalism for the modern wardrobe.',
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 3799,
    totalStock: 35,
    categoryId: '9',
    theme: 'WHITE',
    averageRating: 4.6,
    reviewCount: 39,
    variants: [{ id: '18', productId: '18', name: 'Default', price: 3799, stock: 35, sku: 'MCN-WHT-018' }],
    priceRange: { min: 3799, max: 3799, hasVariablePrice: false }
  },
  {
    id: '19',
    name: 'STRUCTURED BLAZER',
    slug: 'structured-blazer',
    description: 'Clean-lined blazer with modern tailoring. Versatile piece for any wardrobe.',
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 12999,
    baseSalePrice: 10999,
    totalStock: 8,
    categoryId: '9',
    theme: 'WHITE',
    averageRating: 4.8,
    reviewCount: 24,
    variants: [{ id: '19', productId: '19', name: 'Default', price: 12999, salePrice: 10999, stock: 8, sku: 'SB-WHT-019' }],
    priceRange: { min: 12999, max: 12999, saleMin: 10999, hasVariablePrice: false }
  },

  // Category 10: ESSENTIALS
  {
    id: '20',
    name: 'ESSENTIAL COMFORT TEE',
    slug: 'essential-comfort-tee',
    description: 'Your daily go-to. Comfort-first design without compromising on style.',
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 2199,
    baseSalePrice: 1899,
    totalStock: 38,
    categoryId: '10',
    theme: 'WHITE',
    averageRating: 4.5,
    reviewCount: 51,
    variants: [{ id: '20', productId: '20', name: 'Default', price: 2199, salePrice: 1899, stock: 38, sku: 'ECT-WHT-020' }],
    priceRange: { min: 2199, max: 2199, saleMin: 1899, hasVariablePrice: false }
  },
  {
    id: '21',
    name: 'EVERYDAY JOGGERS',
    slug: 'everyday-joggers',
    description: 'Comfortable joggers for daily wear. Premium cotton blend with tapered fit.',
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 3299,
    totalStock: 42,
    categoryId: '10',
    theme: 'WHITE',
    averageRating: 4.7,
    reviewCount: 73,
    variants: [{ id: '21', productId: '21', name: 'Default', price: 3299, stock: 42, sku: 'EJ-WHT-021' }],
    priceRange: { min: 3299, max: 3299, hasVariablePrice: false }
  },

  // Category 11: PREMIUM FOOTWEAR
  {
    id: '22',
    name: 'LUXURY SNEAKERS',
    slug: 'luxury-sneakers',
    description: 'Sophisticated footwear collection for the modern lifestyle. Italian craftsmanship.',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 15999,
    totalStock: 12,
    categoryId: '11',
    theme: 'WHITE',
    averageRating: 4.9,
    reviewCount: 67,
    variants: [{ id: '22', productId: '22', name: 'Default', price: 15999, stock: 12, sku: 'LS-WHT-022' }],
    priceRange: { min: 15999, max: 15999, hasVariablePrice: false }
  },
  {
    id: '23',
    name: 'MINIMALIST LOAFERS',
    slug: 'minimalist-loafers',
    description: 'Clean design meets premium comfort. Perfect for both casual and formal occasions.',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 8999,
    baseSalePrice: 7999,
    totalStock: 18,
    categoryId: '11',
    theme: 'WHITE',
    averageRating: 4.6,
    reviewCount: 34,
    variants: [{ id: '23', productId: '23', name: 'Default', price: 8999, salePrice: 7999, stock: 18, sku: 'ML-WHT-023' }],
    priceRange: { min: 8999, max: 8999, saleMin: 7999, hasVariablePrice: false }
  },

  // Category 12: REFINED ACCESSORIES
  {
    id: '24',
    name: 'PREMIUM LEATHER WALLET',
    slug: 'premium-leather-wallet',
    description: 'Carefully curated wallet to complement your clean aesthetic. Italian leather construction.',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 4999,
    totalStock: 25,
    categoryId: '12',
    theme: 'WHITE',
    averageRating: 4.8,
    reviewCount: 42,
    variants: [{ id: '24', productId: '24', name: 'Default', price: 4999, stock: 25, sku: 'PLW-WHT-024' }],
    priceRange: { min: 4999, max: 4999, hasVariablePrice: false }
  },
  {
    id: '25',
    name: 'MINIMALIST WATCH',
    slug: 'minimalist-watch',
    description: 'Clean design timepiece with premium Swiss movement. Understated elegance.',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format'],
    basePrice: 12999,
    baseSalePrice: 10999,
    totalStock: 15,
    categoryId: '12',
    theme: 'WHITE',
    averageRating: 4.9,
    reviewCount: 89,
    variants: [{ id: '25', productId: '25', name: 'Default', price: 12999, salePrice: 10999, stock: 15, sku: 'MW-WHT-025' }],
    priceRange: { min: 12999, max: 12999, saleMin: 10999, hasVariablePrice: false }
  }
];

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      try {
        const params = new URLSearchParams();

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, String(value));
            }
          });
        }

        const response = await api.get(`/products?${params.toString()}`);

        // If API returns data, use it
        if (response.data.data && response.data.data.length > 0) {
          return {
            data: response.data.data,
            pagination: response.data.pagination,
          };
        }
      } catch (error) {
        console.log('API error, falling back to mock products:', error);
      }

      // Fall back to mock products with filtering
      let filteredProducts = [...mockProducts];

      // Apply theme filter
      if (filters?.theme) {
        filteredProducts = filteredProducts.filter(product => product.theme === filters.theme);
      }

      // Apply category filter
      if (filters?.categoryId) {
        filteredProducts = filteredProducts.filter(product => product.categoryId === filters.categoryId);
      }

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
        );
      }

      // Apply price filters
      if (filters?.minPrice) {
        filteredProducts = filteredProducts.filter(product =>
          (product.baseSalePrice || product.basePrice || 0) >= filters.minPrice!
        );
      }

      if (filters?.maxPrice) {
        filteredProducts = filteredProducts.filter(product =>
          (product.baseSalePrice || product.basePrice || 0) <= filters.maxPrice!
        );
      }

      // Apply sorting
      if (filters?.sort) {
        filteredProducts.sort((a, b) => {
          let aValue: any, bValue: any;

          switch (filters.sort) {
            case 'name':
              aValue = a.name;
              bValue = b.name;
              break;
            case 'price':
              aValue = a.baseSalePrice || a.basePrice || 0;
              bValue = b.baseSalePrice || b.basePrice || 0;
              break;
            case 'rating':
              aValue = a.averageRating || 0;
              bValue = b.averageRating || 0;
              break;
            case 'createdAt':
            default:
              aValue = a.id;
              bValue = b.id;
              break;
          }

          if (filters.sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      // Apply pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        data: paginatedProducts,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / limit),
        },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors (product not found)
      if (error?.response?.status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors (network issues, etc.)
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};