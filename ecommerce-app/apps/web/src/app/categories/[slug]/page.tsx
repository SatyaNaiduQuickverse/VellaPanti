'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@ecommerce/ui';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

// Create a hook to fetch category products
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, Category, PaginatedResponse } from '@ecommerce/types';

interface CategoryProductsResponse extends PaginatedResponse<Product> {
  category: Category;
}

function useCategoryProducts(slug: string, filters: any = {}) {
  return useQuery({
    queryKey: ['category-products', slug, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await api.get(`/categories/${slug}/products?${params.toString()}`);
      if (response.data.success) {
        return {
          data: response.data.data,
          pagination: response.data.pagination,
          category: response.data.category,
        };
      }
      throw new Error(response.data.error || 'Failed to fetch category products');
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    minPrice: '',
    maxPrice: '',
    search: '',
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useCategoryProducts(slug, filters);

  const products = data?.data || [];
  const category = data?.category;
  const pagination = data?.pagination;

  // Get theme-based styles
  const getThemeStyles = () => {
    if (category?.theme === 'BLACK') {
      return {
        bg: 'bg-black',
        text: 'text-white',
        accent: 'text-white',
        border: 'border-white',
        button: 'bg-white text-black hover:bg-gray-200'
      };
    } else if (category?.theme === 'WHITE') {
      return {
        bg: 'bg-white',
        text: 'text-black',
        accent: 'text-black',
        border: 'border-black',
        button: 'bg-black text-white hover:bg-gray-800'
      };
    } else {
      return {
        bg: 'bg-black',
        text: 'text-white',
        accent: 'text-white',
        border: 'border-white',
        button: 'bg-white text-black hover:bg-gray-200'
      };
    }
  };

  const styles = getThemeStyles();


  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to page 1 when filtering
    }));
  };

  const handleSortChange = (sort: string) => {
    const [sortField, sortOrder] = sort.split('-');
    handleFilterChange('sort', sortField);
    handleFilterChange('sortOrder', sortOrder);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-black mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
        <Link href="/categories">
          <Button>Browse All Categories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${styles.bg}`}>
      {/* Category Header */}
      <section className={`${styles.bg} ${styles.text} py-16`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {isLoading ? (
              <div className="animate-pulse">
                <div className={`h-12 ${category?.theme === 'WHITE' ? 'bg-gray-300' : 'bg-gray-700'} rounded w-64 mx-auto mb-4`}></div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight">
                  {category?.name}
                </h1>
                <div className={`inline-block border-b-4 ${styles.border} pb-2`}>
                  <span className="text-lg font-bold uppercase tracking-wide">
                    {category?.theme === 'BLACK' ? 'STREET • CULTURE • UNDERGROUND' : 'CLEAN • MINIMAL • PREMIUM'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="border-b-2 border-black bg-white sticky top-20 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Results count */}
            <div className="text-sm font-bold uppercase tracking-wide">
              {isLoading ? (
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              ) : (
                `${pagination?.total || 0} PRODUCTS FOUND`
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Sort dropdown */}
              <select
                value={`₹{filters.sort}-${filters.sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border-2 border-black px-4 py-2 font-bold uppercase tracking-wide text-sm bg-white focus:outline-none"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>

              {/* View mode toggle */}
              <div className="flex border-2 border-black">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="border-0 border-r-2 border-black rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="border-0 rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-2 border-black font-bold uppercase tracking-wide"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                FILTERS
              </Button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 p-4 border-2 border-black bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Search Products
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search..."
                    className="w-full border-2 border-black px-3 py-2 font-bold focus:outline-none"
                  />
                </div>

                {/* Price range */}
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="Min"
                      className="w-full border-2 border-black px-3 py-2 font-bold focus:outline-none"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="w-full border-2 border-black px-3 py-2 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Clear filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      page: 1,
                      limit: 12,
                      sort: 'createdAt',
                      sortOrder: 'desc',
                      minPrice: '',
                      maxPrice: '',
                      search: '',
                    })}
                    className="w-full border-2 border-black font-bold uppercase tracking-wide"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">
              No Products Found
            </h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your filters or search terms.
            </p>
            <Button
              onClick={() => setFilters({
                page: 1,
                limit: 12,
                sort: 'createdAt',
                sortOrder: 'desc',
                minPrice: '',
                maxPrice: '',
                search: '',
              })}
              className="bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-wide"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-4">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => handleFilterChange('page', pagination.page - 1)}
              className="border-2 border-black font-bold uppercase tracking-wide"
            >
              Previous
            </Button>
            
            <span className="text-sm font-bold uppercase tracking-wide">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handleFilterChange('page', pagination.page + 1)}
              className="border-2 border-black font-bold uppercase tracking-wide"
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}