'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard } from '@/components/products/product-card';
import type { ProductFilters, ThemeLabel } from '@ecommerce/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme') as ThemeLabel | null;
  const limit = parseInt(searchParams.get('limit') || '12');
  const searchParam = searchParams.get('search') || '';

  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: limit,
    sort: 'createdAt',
    sortOrder: 'desc',
    theme: theme || undefined,
    search: searchParam || undefined,
  });

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      theme: theme || undefined,
      limit: limit,
      search: searchParam || undefined,
      page: 1 // Reset to first page when filters change
    }));
  }, [theme, limit, searchParam]);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParam);

  const { data: productsData, isLoading } = useProducts(filters);
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];

  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSearch = () => {
    handleFilterChange({ search: searchQuery });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getThemeStyles = () => {
    if (theme === 'BLACK') {
      return {
        bg: 'bg-black',
        text: 'text-white',
        accent: 'text-white',
        border: 'border-white',
        button: 'bg-white text-black hover:bg-gray-200'
      };
    } else if (theme === 'WHITE') {
      return {
        bg: 'bg-white',
        text: 'text-black',
        accent: 'text-black',
        border: 'border-black',
        button: 'bg-black text-white hover:bg-gray-800'
      };
    } else {
      return {
        bg: 'bg-white',
        text: 'text-black',
        accent: 'text-black',
        border: 'border-black',
        button: 'bg-black text-white hover:bg-gray-800'
      };
    }
  };

  const styles = getThemeStyles();

  const getTitle = () => {
    if (theme === 'BLACK') return 'BLACK DROPS';
    if (theme === 'WHITE') return 'WHITE DROPS';
    return 'ALL PRODUCTS';
  };

  const getSubtitle = () => {
    if (theme === 'BLACK') return 'RAW • BOLD • UNFILTERED';
    if (theme === 'WHITE') return 'CLEAN • FRESH • ELEVATED';
    return 'DISCOVER YOUR PERFECT STYLE';
  };

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight">
            <span className={`border-b-4 ${styles.border} pb-2`}>{getTitle()}</span>
          </h1>
          <p className={`text-lg font-bold uppercase tracking-wide ${styles.text} mb-8`}>
            {getSubtitle()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search for your style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          <Button onClick={handleSearch} className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold">
            Search
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-2 border-gray-200 hover:border-primary px-6 py-3 rounded-xl font-semibold"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange({ categoryId: e.target.value || undefined })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Min Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Any"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={`${filters.sort}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sort, sortOrder] = e.target.value.split('-');
                    handleFilterChange({ sort: sort as any, sortOrder: sortOrder as any });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low to High</option>
                  <option value="price-desc">Price High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  theme={theme === 'BLACK' ? 'dark' : 'light'}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>

                  {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                    const page = Math.max(1, pagination.page - 2) + index;
                    if (page > pagination.totalPages) return null;

                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? 'default' : 'outline'}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
            <Button onClick={() => {
              setFilters({
                page: 1,
                limit: 12,
                sort: 'createdAt',
                sortOrder: 'desc',
              });
              setSearchQuery('');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}