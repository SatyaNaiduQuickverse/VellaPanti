'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCategories } from '@/hooks/useCategories';
import { useFeaturedCollections } from '@/hooks/useFeaturedCollections';
import { useState, useEffect } from 'react';

interface CategoryGridProps {
  limit?: number;
  theme?: 'BLACK' | 'WHITE' | null;
  featured?: boolean; // Use featured collections instead of all categories
}

export function CategoryGrid({ limit, theme, featured = false }: CategoryGridProps) {
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(featured ? null : theme);
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedCollections(featured ? { theme: theme || undefined } : {});
  const [mounted, setMounted] = useState(false);

  const isLoading = featured ? featuredLoading : categoriesLoading;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the appropriate data source
  const sourceData = featured ? (featuredData as any)?.data : (categoriesData as any)?.data;
  const categories = limit
    ? (sourceData || []).slice(0, limit)
    : sourceData || [];

  const mockCategories = [
    // Black Theme Categories
    {
      id: '1',
      name: 'STREET WEAR',
      slug: 'street-wear',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK'
    },
    {
      id: '2',
      name: 'HOODIES & SWEATS',
      slug: 'hoodies-sweats',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK'
    },
    {
      id: '3',
      name: 'RAP CULTURE',
      slug: 'rap-culture',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK'
    },
    {
      id: '4',
      name: 'URBAN FOOTWEAR',
      slug: 'urban-footwear',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK'
    },
    {
      id: '5',
      name: 'ACCESSORIES',
      slug: 'black-accessories',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK'
    },
    {
      id: '6',
      name: 'DENIM & JEANS',
      slug: 'denim-jeans',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'BLACK'
    },
    // White Theme Categories
    {
      id: '7',
      name: 'PREMIUM BASICS',
      slug: 'premium-basics',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE'
    },
    {
      id: '8',
      name: 'MINIMAL LUXURY',
      slug: 'minimal-luxury',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE'
    },
    {
      id: '9',
      name: 'CLEAN CUTS',
      slug: 'clean-cuts',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE'
    },
    {
      id: '10',
      name: 'ESSENTIALS',
      slug: 'essentials',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE'
    },
    {
      id: '11',
      name: 'PREMIUM FOOTWEAR',
      slug: 'premium-footwear',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE'
    },
    {
      id: '12',
      name: 'REFINED ACCESSORIES',
      slug: 'refined-accessories',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
      theme: 'WHITE'
    }
  ];

  const filterCategoriesByTheme = (categoriesList: any[]) => {
    if (!theme) return categoriesList;
    return categoriesList.filter(category => category.theme === theme);
  };

  const sortCategoriesByTheme = (categoriesList: any[]) => {
    // If no theme filter, sort so BLACK categories appear first (left side), then WHITE (right side)
    if (!theme) {
      return [...categoriesList].sort((a, b) => {
        if (a.theme === 'BLACK' && b.theme === 'WHITE') return -1;
        if (a.theme === 'WHITE' && b.theme === 'BLACK') return 1;
        return 0;
      });
    }
    return categoriesList;
  };

  // For featured mode, show empty state if no categories, otherwise use fallback
  const displayCategories = featured
    ? (mounted && categories.length > 0 ? sortCategoriesByTheme(categories) : [])
    : (mounted && categories.length > 0 ? sortCategoriesByTheme(categories) : sortCategoriesByTheme(filterCategoriesByTheme(mockCategories)));

  if (!mounted || isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {[...Array(Math.min(limit || 6, 6))].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-700 aspect-[4/3] border border-black rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Show empty state for featured mode when no collections are configured
  if (featured && displayCategories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className={`text-lg font-bold ${theme === 'BLACK' ? 'text-white' : 'text-black'}`}>
          No featured collections selected
        </p>
        <p className={`text-sm ${theme === 'BLACK' ? 'text-gray-300' : 'text-gray-600'}`}>
          Configure featured collections in admin panel
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6">
      {displayCategories.map((category: any) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}?theme=${category.theme || ''}`}
          className="group cursor-pointer"
        >
          <div className={`relative overflow-hidden bg-black aspect-[4/3] group-hover:bg-white group-hover:shadow-2xl transition-all duration-300 rounded-lg ${theme === 'BLACK' ? 'border border-white/30' : 'border border-black'}`}>
            <Image
              src={category.image || '/placeholder-category.svg'}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0 filter contrast-125 rounded-lg"
              loading="lazy"
              sizes="(max-width: 768px) 50vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-white/90 transition-all duration-300 rounded-lg" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white group-hover:text-black font-black text-sm sm:text-base md:text-lg lg:text-xl text-center px-3 sm:px-4 uppercase tracking-wider transition-colors leading-tight">
                {category.name}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}