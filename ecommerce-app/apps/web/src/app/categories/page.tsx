'use client';

import { CategoryGrid } from '@/components/categories/category-grid';
import { useCategories } from '@/hooks/useCategories';

export default function CategoriesPage() {
  const { data: categoriesData, isLoading } = useCategories();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
          Shop by Category
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Explore our diverse collection across different categories. From everyday essentials to statement pieces, 
          find exactly what you're looking for in your style.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-primary mb-2">6+</div>
            <div className="text-sm text-gray-600 font-medium">Categories</div>
          </div>
          <div>
            <div className="text-3xl font-black text-primary mb-2">500+</div>
            <div className="text-sm text-gray-600 font-medium">Products</div>
          </div>
          <div>
            <div className="text-3xl font-black text-primary mb-2">24/7</div>
            <div className="text-sm text-gray-600 font-medium">New Arrivals</div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">All Categories</h2>
            <CategoryGrid />
          </div>

          {/* Featured Categories */}
          <div className="bg-gradient-to-br from-primary/10 to-yellow-500/10 rounded-3xl p-8 mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Trending This Season</h2>
              <p className="text-gray-700">Don't miss out on the latest fashion trends</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'featured-1',
                  name: 'Summer Collection',
                  slug: 't-shirts',
                  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&q=80',
                  description: 'Light & breezy for hot days'
                },
                {
                  id: 'featured-2', 
                  name: 'Streetwear',
                  slug: 'hoodies',
                  image: 'https://images.unsplash.com/photo-1583743814966-8936f37f3a40?w=400&h=300&q=80',
                  description: 'Urban style essentials'
                },
                {
                  id: 'featured-3',
                  name: 'Comfort Zone',
                  slug: 'jeans',
                  image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&q=80',
                  description: 'Perfect fit, all day comfort'
                }
              ].map((category) => (
                <div key={category.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-4">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                      <p className="text-sm text-white/90">{category.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}