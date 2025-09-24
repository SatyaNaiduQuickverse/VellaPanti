'use client';

import Link from 'next/link';
import { Button } from '@ecommerce/ui';
import { useProducts } from '@/hooks/useProducts';
import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCarousel } from '@/hooks/useCarousel';
import { useHomepageBanners } from '@/hooks/useHomepageBanners';
import { ProductCard } from '@/components/products/product-card';
import { CategoryGrid } from '@/components/categories/category-grid';
import { ImageCarousel } from '@/components/carousel/image-carousel';
import { Suspense } from 'react';

// All Products Grid Component
function AllProductsGrid({ theme, limit = 12 }: { theme?: 'BLACK' | 'WHITE', limit?: number }) {
  const { data: productsData, isLoading } = useProducts({
    ...(theme && { theme }),
    limit,
    sort: 'createdAt',
    sortOrder: 'desc',
  });

  const products = productsData?.data || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className={`${theme === 'BLACK' ? 'bg-gray-700' : 'bg-gray-200'} aspect-square rounded mb-3`}></div>
            <div className={`h-3 ${theme === 'BLACK' ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`}></div>
            <div className={`h-3 ${theme === 'BLACK' ? 'bg-gray-700' : 'bg-gray-200'} rounded w-2/3`}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.slice(0, limit).map((product) => (
        <ProductCard key={product.id} product={product} theme="light" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 8,
    sort: 'createdAt',
    sortOrder: 'desc',
  });

  // Get featured products for each theme
  const { data: blackFeaturedData, isLoading: blackFeaturedLoading } = useFeaturedProducts({
    theme: 'BLACK',
  });

  const { data: whiteFeaturedData, isLoading: whiteFeaturedLoading } = useFeaturedProducts({
    theme: 'WHITE',
  });

  // Get carousel images from admin
  const { data: carouselData, isLoading: carouselLoading } = useCarousel();

  // Get homepage banners
  const { data: homepageBannersData, isLoading: homepageBannersLoading } = useHomepageBanners();

  const featuredProducts = productsData?.data || [];
  const blackFeaturedProducts = blackFeaturedData?.data || [];
  const whiteFeaturedProducts = whiteFeaturedData?.data || [];
  const carouselImages = carouselData?.data || [];
  const homepageBanners = homepageBannersData?.data || [];

  // Use carousel images from admin or fallback to default
  const heroCarouselImages = carouselImages.length > 0 ? carouselImages : [
    {
      id: '1',
      src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=800&q=80&fit=crop&auto=format',
      alt: 'VellaPanti Collection',
      description: 'STREET CULTURE • PREMIUM FASHION • AUTHENTIC STYLE'
    },
    {
      id: '2',
      src: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&h=800&q=80&fit=crop&auto=format',
      alt: 'Urban Collection',
      title: 'URBAN VIBES',
      description: 'BOLD • MINIMALIST • TRENDSETTING'
    },
    {
      id: '3',
      src: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&h=800&q=80&fit=crop&auto=format',
      alt: 'Premium Collection',
      title: 'PREMIUM DROPS',
      description: 'LIMITED EDITION • EXCLUSIVE DESIGN'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Single Hero Carousel */}
      <section className="h-96 md:h-[500px] lg:h-[600px] relative overflow-hidden">
        {carouselLoading ? (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        ) : (
          <ImageCarousel
            images={heroCarouselImages}
            theme="black"
            className="h-full"
            showOverlay={heroCarouselImages.some(img => img.title || img.description)}
          />
        )}

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-wider">
              VELLA PANTI
            </h1>
            <p className="text-lg md:text-xl mb-8 font-bold tracking-wider">
              STREET CULTURE • PREMIUM FASHION • AUTHENTIC STYLE
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/categories">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-sm font-black uppercase tracking-wider">
                  EXPLORE COLLECTIONS
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" className="bg-white text-black border-2 border-white hover:bg-gray-100 hover:text-black px-8 py-3 text-sm font-black uppercase tracking-wider">
                  SHOP NOW
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Homepage Banner Images */}
      <section className="flex h-96 relative overflow-hidden">
        {homepageBannersLoading ? (
          <div className="w-full h-full bg-gray-500 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        ) : (
          <>
            {/* Black Side Banner */}
            <div className="w-1/2 relative overflow-hidden">
              {(() => {
                const blackBanner = homepageBanners.find(b => b.theme === 'BLACK');
                if (blackBanner?.src) {
                  return (
                    <div className="relative h-full">
                      <img
                        src={blackBanner.src}
                        alt={blackBanner.alt || 'Black Theme Banner'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=400&q=80&fit=crop&auto=format';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/70" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                        {blackBanner.title && (
                          <h3 className="text-2xl md:text-4xl font-black mb-4 text-center tracking-wider uppercase">
                            {blackBanner.title}
                          </h3>
                        )}
                        {blackBanner.description && (
                          <p className="text-lg md:text-xl font-bold mb-6 text-center tracking-wide">
                            {blackBanner.description}
                          </p>
                        )}
                        {blackBanner.buttonText && blackBanner.buttonLink && (
                          <Link href={blackBanner.buttonLink}>
                            <Button className="bg-white text-black hover:bg-gray-100 font-black py-3 px-8 text-sm uppercase tracking-wider">
                              {blackBanner.buttonText}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <div className="text-white text-center">
                        <h3 className="text-2xl font-black mb-2">BLACK BANNER</h3>
                        <p className="text-sm">Configure in admin panel</p>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

            {/* White Side Banner */}
            <div className="w-1/2 relative overflow-hidden border-l border-gray-300">
              {(() => {
                const whiteBanner = homepageBanners.find(b => b.theme === 'WHITE');
                if (whiteBanner?.src) {
                  return (
                    <div className="relative h-full">
                      <img
                        src={whiteBanner.src}
                        alt={whiteBanner.alt || 'White Theme Banner'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=400&q=80&fit=crop&auto=format';
                        }}
                      />
                      <div className="absolute inset-0 bg-white/70" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-black p-8">
                        {whiteBanner.title && (
                          <h3 className="text-2xl md:text-4xl font-black mb-4 text-center tracking-wider uppercase">
                            {whiteBanner.title}
                          </h3>
                        )}
                        {whiteBanner.description && (
                          <p className="text-lg md:text-xl font-bold mb-6 text-center tracking-wide">
                            {whiteBanner.description}
                          </p>
                        )}
                        {whiteBanner.buttonText && whiteBanner.buttonLink && (
                          <Link href={whiteBanner.buttonLink}>
                            <Button className="bg-black text-white hover:bg-gray-800 font-black py-3 px-8 text-sm uppercase tracking-wider">
                              {whiteBanner.buttonText}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="w-full h-full bg-white flex items-center justify-center">
                      <div className="text-black text-center">
                        <h3 className="text-2xl font-black mb-2">WHITE BANNER</h3>
                        <p className="text-sm">Configure in admin panel</p>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          </>
        )}
      </section>

      {/* Split Screen Section - Extended to full page */}
      <section className="flex relative z-10">
        {/* Black Side */}
        <div className="w-1/2 bg-black text-white relative">
          <div className="p-8 lg:p-16 min-h-screen flex flex-col">
            <div className="mb-12">
              <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-wider">
                STREET
              </h2>
              <p className="text-xl font-bold tracking-wider text-gray-300">
                CULTURE • AUTHENTIC • UNDERGROUND
              </p>
            </div>

            {/* Categories Grid */}
            <div className="mb-12">
              <h3 className="text-2xl font-black mb-6 tracking-wider">COLLECTIONS</h3>
              <Suspense fallback={
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-700 aspect-square rounded mb-3"></div>
                      <div className="h-3 bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              }>
                <CategoryGrid limit={6} theme="BLACK" featured={true} />
              </Suspense>
            </div>

            {/* Featured Street Products */}
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-6 tracking-wider">FEATURED STREET</h3>
              {blackFeaturedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-700 aspect-square rounded mb-3"></div>
                      <div className="h-3 bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : blackFeaturedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {blackFeaturedProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product} theme="dark" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-300">
                  <p className="text-lg font-bold">No featured street products selected</p>
                  <p className="text-sm">Configure featured products in admin panel</p>
                </div>
              )}
            </div>


            {/* View All Street Products Button */}
            <div className="text-center mb-12">
              <Link href="/products?theme=BLACK&limit=30">
                <Button variant="outline" className="border-2 border-gray-600 text-white hover:bg-white hover:text-black font-black py-3 px-8 text-sm uppercase tracking-wider transition-all duration-300">
                  View All Street Products
                </Button>
              </Link>
            </div>

            <div className="mt-auto">
              <div className="border-t border-gray-700 pt-8 mb-8">
                <h4 className="text-lg font-black mb-6 text-center tracking-wider text-gray-300">
                  DISCOVER STREET CULTURE
                </h4>
              </div>
              <div className="space-y-3">
                <Link href="/categories?theme=BLACK" className="group block">
                  <Button className="w-full bg-white text-black hover:bg-gray-900 hover:text-white font-black py-4 px-6 text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-2 border-white hover:border-gray-900">
                    <span className="flex items-center justify-center">
                      EXPLORE STREET
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </Button>
                </Link>
                <Link href="/products?theme=BLACK" className="group block">
                  <Button variant="outline" className="w-full border-2 border-white text-white hover:bg-white hover:text-black font-black py-4 px-6 text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-transparent backdrop-blur-sm">
                    <span className="flex items-center justify-center">
                      SHOP COLLECTION
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* White Side */}
        <div className="w-1/2 bg-white text-black">
          <div className="p-8 lg:p-16 min-h-screen flex flex-col">
            <div className="mb-12">
              <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-wider">
                PREMIUM
              </h2>
              <p className="text-xl font-bold tracking-wider text-gray-600">
                CLEAN • MINIMAL • REFINED
              </p>
            </div>

            {/* Categories Grid */}
            <div className="mb-12">
              <h3 className="text-2xl font-black mb-6 tracking-wider">COLLECTIONS</h3>
              <Suspense fallback={
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              }>
                <CategoryGrid limit={6} theme="WHITE" featured={true} />
              </Suspense>
            </div>

            {/* Featured Premium Products */}
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-6 tracking-wider">FEATURED PREMIUM</h3>
              {whiteFeaturedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : whiteFeaturedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {whiteFeaturedProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-bold">No featured premium products selected</p>
                  <p className="text-sm">Configure featured products in admin panel</p>
                </div>
              )}
            </div>


            {/* View All Premium Products Button */}
            <div className="text-center mb-12">
              <Link href="/products?theme=WHITE&limit=30">
                <Button variant="outline" className="border-2 border-gray-400 text-black hover:bg-black hover:text-white font-black py-3 px-8 text-sm uppercase tracking-wider transition-all duration-300">
                  View All Premium Products
                </Button>
              </Link>
            </div>

            <div className="mt-auto">
              <div className="border-t border-gray-300 pt-8 mb-8">
                <h4 className="text-lg font-black mb-6 text-center tracking-wider text-gray-600">
                  PREMIUM EXPERIENCE
                </h4>
              </div>
              <div className="space-y-3">
                <Link href="/categories?theme=WHITE" className="group block">
                  <Button className="w-full bg-black text-white hover:bg-white hover:text-black font-black py-4 px-6 text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-2 border-black hover:border-gray-300">
                    <span className="flex items-center justify-center">
                      EXPLORE PREMIUM
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </Button>
                </Link>
                <Link href="/products?theme=WHITE" className="group block">
                  <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black py-4 px-6 text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-transparent backdrop-blur-sm">
                    <span className="flex items-center justify-center">
                      SHOP COLLECTION
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section className="py-16 px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-wider text-black">
              ALL PRODUCTS
            </h2>
            <p className="text-xl font-bold tracking-wider text-gray-600">
              DISCOVER OUR COMPLETE COLLECTION
            </p>
            <div className="w-24 h-1 bg-black mx-auto mt-6"></div>
          </div>

          <div className="mb-12">
            <AllProductsGrid limit={16} />
          </div>

          <div className="text-center">
            <Link href="/products">
              <Button size="lg" className="bg-black text-white hover:bg-white hover:text-black border-2 border-black font-black py-4 px-12 text-lg uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl">
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}