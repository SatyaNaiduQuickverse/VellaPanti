'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@ecommerce/ui';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard } from '@/components/products/product-card';
import { CategoryGrid } from '@/components/categories/category-grid';
import { Suspense, lazy } from 'react';

export default function HomePage() {
  // Prefetch limited data for faster initial load
  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 6, // Reduced from 8 for faster loading
    sort: 'createdAt',
    sortOrder: 'desc',
  });
  
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const featuredProducts = productsData?.data || [];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-black text-white relative overflow-hidden">
        {/* Graffiti-style background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-white/20 text-6xl font-black transform -rotate-12">STREET</div>
          <div className="absolute bottom-20 right-20 text-white/20 text-4xl font-black transform rotate-12">CULTURE</div>
          <div className="absolute top-1/2 left-1/4 text-white/20 text-2xl font-black transform -rotate-45">GEN Z</div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
                <span className="block text-white">VELLA</span>
                <span className="block text-white border-b-4 border-white inline-block pb-2">PANTI</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-300 font-bold uppercase tracking-wide">
                STREET CULTURE • RAP AESTHETICS • GEN Z VIBES<br/>
                AUTHENTIC • BOLD • UNAPOLOGETIC
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg font-black uppercase tracking-wider border-2 border-white">
                    SHOP NOW
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-black uppercase tracking-wider">
                    EXPLORE
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-4 aspect-[3/4] transform hover:scale-105 transition-transform">
                    <Image
                      src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&q=80&fit=crop&auto=format"
                      alt="Street Wear Collection"
                      width={300}
                      height={400}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all filter contrast-125"
                    />
                    <div className="absolute inset-0 bg-black/30 hover:bg-transparent transition-all"></div>
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-4 aspect-[3/4] transform hover:scale-105 transition-transform">
                    <Image
                      src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=400&q=80&fit=crop&auto=format"
                      alt="Urban Style Collection"
                      width={300}
                      height={400}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all filter contrast-125"
                    />
                    <div className="absolute inset-0 bg-black/30 hover:bg-transparent transition-all"></div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-white rotate-45"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-2 border-white rotate-12"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Find exactly what you're looking for. From casual wear to statement pieces.
          </p>
        </div>
        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        }>
          <CategoryGrid limit={5} />
        </Suspense>
      </section>

      {/* Features Section */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-white/20 hover:bg-white/5 transition-all">
              <div className="w-20 h-20 border-2 border-white flex items-center justify-center mx-auto mb-6 transform rotate-45">
                <svg className="w-10 h-10 text-white transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <h3 className="text-xl font-black mb-3 uppercase tracking-wide">FREE SHIPPING</h3>
              <p className="text-gray-300 font-bold">FREE WORLDWIDE • NO LIMITS • NO BS</p>
            </div>
            
            <div className="text-center p-8 border border-white/20 hover:bg-white/5 transition-all">
              <div className="w-20 h-20 border-2 border-white flex items-center justify-center mx-auto mb-6 transform rotate-45">
                <svg className="w-10 h-10 text-white transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black mb-3 uppercase tracking-wide">AUTHENTICITY</h3>
              <p className="text-gray-300 font-bold">100% REAL • 100% STREET • 100% YOU</p>
            </div>
            
            <div className="text-center p-8 border border-white/20 hover:bg-white/5 transition-all">
              <div className="w-20 h-20 border-2 border-white flex items-center justify-center mx-auto mb-6 transform rotate-45">
                <svg className="w-10 h-10 text-white transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-black mb-3 uppercase tracking-wide">COMMUNITY</h3>
              <p className="text-gray-300 font-bold">24/7 CULTURE • ALWAYS CONNECTED</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white text-black py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight">
              <span className="border-b-4 border-black pb-2">FEATURED DROPS</span>
            </h2>
            <p className="text-gray-800 max-w-2xl mx-auto text-lg font-bold uppercase tracking-wide">
              HANDPICKED HEAT • STREET APPROVED • LIMITED STOCK
            </p>
          </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No products available at the moment.</p>
          </div>
        )}

          <div className="text-center mt-16">
            <Link href="/products">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-12 py-4 text-xl font-black uppercase tracking-wider border-2 border-black">
                ALL DROPS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight">
              JOIN THE <span className="border-b-4 border-white pb-2">CULTURE</span>
            </h2>
            <p className="text-gray-300 mb-12 text-lg font-bold uppercase tracking-wide">
              FIRST ACCESS • EXCLUSIVE DROPS • STREET INTEL
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="YOUR EMAIL"
                className="flex-1 px-6 py-4 bg-white text-black border-2 border-white focus:outline-none focus:ring-0 text-lg font-bold uppercase tracking-wide placeholder-gray-500"
              />
              <Button className="bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg font-black uppercase tracking-wider border-2 border-white">
                SUBSCRIBE
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}