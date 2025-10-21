'use client';

import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { useAuthStore } from '@/stores/authStore';
import { ProductCard } from '@/components/products/product-card';
import { Button } from '@ecommerce/ui';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { data: wishlistData, isLoading, error } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login?redirect=/wishlist');
    }
  }, [isAuthenticated, router]);

  const wishlistItems = wishlistData?.data || [];

  const handleRemoveFromWishlist = (productId: string) => {
    toggleWishlist.mutate(productId);
  };

  if (!isAuthenticated()) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-gray-200 aspect-square rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-black mb-4 uppercase tracking-wider">Error Loading Wishlist</h1>
            <p className="text-gray-600 mb-8">Failed to load your wishlist. Please try again.</p>
            <Link href="/">
              <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-wider flex items-center justify-center gap-4">
              <Heart className="h-8 w-8 md:h-10 md:w-10" />
              MY WISHLIST
            </h1>
            <p className="text-lg text-gray-600 font-bold uppercase tracking-wide">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'ITEM' : 'ITEMS'} SAVED
            </p>
          </div>

          {/* Empty State */}
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-24 w-24 mx-auto mb-8 text-gray-300" />
              <h2 className="text-2xl font-black mb-4 uppercase tracking-wider">Your Wishlist is Empty</h2>
              <p className="text-gray-600 mb-8 font-bold uppercase tracking-wide">
                Save items you love to your wishlist
              </p>
              <div className="space-y-4">
                <Link href="/products">
                  <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-8 py-3">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Explore Products
                  </Button>
                </Link>
                <div className="block">
                  <Link href="/categories">
                    <Button variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider px-8 py-3">
                      Browse Collections
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Actions Bar */}
              <div className="flex justify-between items-center mb-8 p-4 border-2 border-black bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="font-black uppercase tracking-wider text-sm">
                    {wishlistItems.length} Items
                  </span>
                </div>
                <Link href="/products">
                  <Button variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item: any) => (
                  <div key={item.id} className="relative group">
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromWishlist(item.product.id)}
                      className="absolute top-2 right-2 z-10 bg-white border-2 border-black p-2 hover:bg-black hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      disabled={toggleWishlist.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Product Card */}
                    <ProductCard product={item.product} />

                    {/* Added Date */}
                    <div className="mt-2 text-xs text-gray-500 font-bold uppercase tracking-wide">
                      Added {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="mt-12 text-center border-t-2 border-black pt-8">
                <div className="space-y-4">
                  <Link href="/products">
                    <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-8 py-3">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                  <div className="block">
                    <Link href="/categories">
                      <Button variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider px-8 py-3">
                        Browse Collections
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}