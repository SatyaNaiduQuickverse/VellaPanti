'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCategories } from '@/hooks/useCategories';
import { useState, useEffect } from 'react';

interface CategoryGridProps {
  limit?: number;
}

export function CategoryGrid({ limit }: CategoryGridProps) {
  const { data: categoriesData, isLoading } = useCategories();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const categories = limit 
    ? (categoriesData?.data || []).slice(0, limit) 
    : categoriesData?.data || [];

  const mockCategories = [
    {
      id: '1',
      name: 'T-Shirts',
      slug: 't-shirts',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&fit=crop&auto=format',
      description: 'Comfortable cotton t-shirts'
    },
    {
      id: '2', 
      name: 'Hoodies',
      slug: 'hoodies',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&q=80&fit=crop&auto=format',
      description: 'Cozy hoodies for all seasons'
    },
    {
      id: '3',
      name: 'Jeans',
      slug: 'jeans', 
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&q=80&fit=crop&auto=format',
      description: 'Premium denim collection'
    },
    {
      id: '4',
      name: 'Sneakers',
      slug: 'sneakers',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&q=80&fit=crop&auto=format', 
      description: 'Trendy sneakers and footwear'
    },
    {
      id: '5',
      name: 'Accessories',
      slug: 'accessories',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&q=80&fit=crop&auto=format',
      description: 'Bags, watches, and more'
    },
    {
      id: '6',
      name: 'Winter Wear',
      slug: 'winter-wear',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&q=80&fit=crop&auto=format',
      description: 'Jackets, coats, and winter essentials'
    }
  ];

  const displayCategories = mounted && categories.length > 0 ? categories : mockCategories;

  if (!mounted || isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(limit || 5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {displayCategories.map((category) => (
        <Link 
          key={category.id} 
          href={`/categories/${category.slug}`}
          className="group cursor-pointer"
        >
          <div className="relative overflow-hidden bg-black aspect-square mb-3 group-hover:bg-white group-hover:shadow-2xl transition-all duration-300 border-2 border-black">
            <Image
              src={category.image || '/placeholder-category.svg'}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0 filter contrast-125"
              loading="lazy"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-white/90 transition-all duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white group-hover:text-black font-black text-sm md:text-base text-center px-2 uppercase tracking-wider transition-colors">
                {category.name}
              </h3>
            </div>
          </div>
          {category.description && (
            <p className="text-xs text-gray-800 text-center group-hover:text-black transition-colors font-bold uppercase tracking-wide">
              {category.description}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}