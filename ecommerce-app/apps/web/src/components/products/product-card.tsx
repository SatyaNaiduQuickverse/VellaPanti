'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useAddToCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import type { Product } from '@ecommerce/types';
import toast from 'react-hot-toast';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { SizeSelectionModal } from './size-selection-modal';

interface ProductCardProps {
  product: Product;
  theme?: 'light' | 'dark';
}

export function ProductCard({ product, theme = 'light' }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const addToCart = useAddToCart();
  const { data: wishlistData } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if product is in wishlist - memoized to prevent recalculation
  const isInWishlist = useMemo(() => {
    const wishlistItems = wishlistData?.data || [];
    return wishlistItems.some((item: any) => item.product.id === product.id);
  }, [wishlistData?.data, product.id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize stock calculation - must be defined before handlers that use it
  const currentStock = useMemo(() => {
    if (product.totalStock !== undefined) {
      return product.totalStock;
    }
    if (product.variants?.length) {
      return product.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return 0;
  }, [product.totalStock, product.variants]);

  // Memoize price calculations to prevent unnecessary recalculations
  const displayPrice = useMemo(() => {
    if (product.priceRange) {
      return product.priceRange.saleMin || product.priceRange.min || 0;
    }
    if (product.variants?.[0]) {
      return product.variants[0].salePrice || product.variants[0].price || 0;
    }
    return product.baseSalePrice || product.basePrice || 0;
  }, [product.priceRange, product.variants, product.baseSalePrice, product.basePrice]);

  const originalPrice = useMemo(() => {
    if (product.priceRange) {
      return product.priceRange.max || 0;
    }
    if (product.variants?.[0]) {
      return product.variants[0].price || 0;
    }
    return product.basePrice || 0;
  }, [product.priceRange, product.variants, product.basePrice]);

  // Memoize discount calculation
  const hasDiscount = useMemo(() => {
    if (product.variants?.[0]) {
      return product.variants[0].salePrice && product.variants[0].salePrice < product.variants[0].price;
    }
    if (product.priceRange) {
      return product.priceRange.saleMin && product.priceRange.saleMin < product.priceRange.min;
    }
    return product.baseSalePrice && product.baseSalePrice < (product.basePrice || 0);
  }, [product.variants, product.priceRange, product.baseSalePrice, product.basePrice]);

  const discountPercentage = useMemo(() => {
    if (!hasDiscount) return 0;

    if (product.variants?.[0] && product.variants[0].salePrice) {
      return Math.round(((product.variants[0].price - product.variants[0].salePrice) / product.variants[0].price) * 100);
    }
    if (product.priceRange?.saleMin && product.priceRange.min) {
      return Math.round(((product.priceRange.min - product.priceRange.saleMin) / product.priceRange.min) * 100);
    }
    if (product.baseSalePrice && product.basePrice) {
      return Math.round(((product.basePrice - product.baseSalePrice) / product.basePrice) * 100);
    }
    return 0;
  }, [hasDiscount, product.variants, product.priceRange, product.baseSalePrice, product.basePrice]);

  const hasVariablePrice = product.priceRange?.hasVariablePrice;

  // Handler functions - defined after all values they depend on
  const handleAddToCart = useCallback(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (currentStock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    // Check if product has variants (sizes/colors)
    const hasVariants = product.variants && product.variants.length > 0 &&
      ((product.variantOptions?.sizes?.length ?? 0) > 0 || (product.variantOptions?.colors?.length ?? 0) > 0);

    if (hasVariants) {
      // Show modal for size/color selection
      setIsModalOpen(true);
    } else {
      // No variants, add directly
      const variantId = product.variants?.[0]?.id;
      addToCart.mutate({
        productId: product.id,
        productVariantId: variantId || undefined,
        quantity: 1,
      });
    }
  }, [mounted, isAuthenticated, currentStock, product, addToCart]);

  const handleAddToCartFromModal = useCallback((variantId: string) => {
    addToCart.mutate({
      productId: product.id,
      productVariantId: variantId,
      quantity: 1,
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
      }
    });
  }, [addToCart, product.id]);

  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the heart
    if (!mounted) return;

    if (!isAuthenticated()) {
      toast.error('Please login to save items to wishlist');
      return;
    }

    toggleWishlist.mutate(product.id);
  }, [mounted, isAuthenticated, toggleWishlist, product.id]);

  // Memoize theme configuration to prevent recreation on every render
  const config = useMemo(() => {
    const themeConfig = {
      light: {
        cardBg: 'bg-white',
        textPrimary: 'text-black',
        textSecondary: 'text-gray-600',
        textTertiary: 'text-gray-500',
        button: {
          primary: 'bg-black text-white hover:bg-gray-800',
          wishlist: {
            default: 'bg-white text-black hover:bg-black hover:text-white',
            active: 'bg-red-500 text-white hover:bg-red-600'
          }
        },
        shadow: 'hover:shadow-2xl hover:shadow-black/20'
      },
      dark: {
        cardBg: 'bg-transparent',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-300',
        textTertiary: 'text-gray-400',
        button: {
          primary: 'bg-white text-black hover:bg-gray-200',
          wishlist: {
            default: 'bg-transparent text-white hover:bg-white hover:text-black border border-gray-600',
            active: 'bg-red-500 text-white hover:bg-red-600'
          }
        },
        shadow: 'hover:shadow-none'
      }
    };
    return themeConfig[theme];
  }, [theme]);

  return (
    <div className={`group ${config.cardBg} overflow-hidden transition-all duration-500 ${config.shadow} hover:-translate-y-1 flex flex-col h-full`}>
      <Link href={`/products/${product.slug}`} className="block" prefetch={false}>
        <div className={`aspect-square relative overflow-hidden bg-black ${theme === 'dark' ? 'border border-white/30' : ''}`}>
          {(() => {
            const imageUrl = product.images?.[0];

            // Convert ibb.co sharing URLs to direct image URLs
            const getDirectImageUrl = (url: string) => {
              if (!url) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=1200&q=95&fit=crop&auto=format';

              // If it's already a direct ibb.co URL, use it
              if (url.includes('i.ibb.co/')) {
                return url;
              }

              // Convert ibb.co sharing URL to direct URL
              if (url.includes('ibb.co/') && !url.includes('i.ibb.co/')) {
                // Extract the image ID from URL like https://ibb.co/abcd123
                const match = url.match(/ibb\.co\/([a-zA-Z0-9]+)/);
                if (match && match[1]) {
                  // Convert to direct URL format: https://i.ibb.co/imageId/filename.jpg
                  // We'll use a generic filename since we don't have the original
                  return `https://i.ibb.co/${match[1]}/image.jpg`;
                }
              }

              return url;
            };

            const finalImageUrl = getDirectImageUrl(imageUrl);

            return (
              <img
                src={finalImageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                style={{
                  imageRendering: 'auto',
                  filter: 'contrast(1.1) saturate(1.1) brightness(1.02)'
                }}
                loading="lazy"
                onError={(e) => {
                  // Fallback to high-quality placeholder
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=1200&q=95&fit=crop&auto=format';
                }}
              />
            );
          })()}
          {hasDiscount && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              {discountPercentage}% OFF
            </div>
          )}

          {currentStock === 0 && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <span className="text-white font-semibold bg-red-600 px-6 py-2 text-sm uppercase tracking-wide">SOLD OUT</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="font-semibold text-sm uppercase tracking-wide mb-2">QUICK VIEW</p>
              <div className="w-8 h-0.5 bg-white mx-auto"></div>
            </div>
          </div>
        </div>
      </Link>

      <div className={`p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2 lg:space-y-3 ${config.cardBg} flex flex-col flex-1`}>
        <Link href={`/products/${product.slug}`} prefetch={false}>
          <h3 className={`font-semibold ${config.textPrimary} line-clamp-1 group-hover:opacity-75 transition-colors uppercase tracking-wide text-xs sm:text-sm lg:text-sm leading-tight`}>
            {product.name}
          </h3>
        </Link>


        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasVariablePrice ? (
            <span className={`text-xl font-semibold ${config.textPrimary} tracking-wide`}>
              ₹{(displayPrice || 0).toFixed(2)} - ₹{(originalPrice || 0).toFixed(2)}
            </span>
          ) : (
            <>
              <span className={`text-sm sm:text-base lg:text-lg font-semibold ${config.textPrimary} tracking-wide`}>
                ₹{(displayPrice || 0).toFixed(2)}
              </span>
              {hasDiscount && (
                <span className={`text-sm ${config.textTertiary} line-through font-bold`}>
                  ₹{(originalPrice || 0).toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Delivery Info */}
        <div className="hidden sm:block px-3 py-2">
          <p className={`text-xs font-semibold text-center uppercase tracking-wide ${config.textSecondary}`}>
            Delivery by {(() => {
              const deliveryDate = new Date();
              deliveryDate.setDate(deliveryDate.getDate() + 5);
              return deliveryDate.toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
            })()}
          </p>
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1"></div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!mounted || currentStock === 0 || addToCart.isPending}
            className={`flex-1 ${config.button.primary} font-semibold py-1.5 sm:py-2 lg:py-2.5 transition-all duration-300 uppercase tracking-wide text-xs hover:shadow-lg`}
            size="sm"
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="sm:hidden">
              {!mounted
                ? 'LOADING'
                : currentStock === 0
                ? 'SOLD OUT'
                : addToCart.isPending
                ? 'ADDING'
                : 'ADD'}
            </span>
            <span className="hidden sm:inline">
              {!mounted
                ? 'LOADING...'
                : currentStock === 0
                ? 'SOLD OUT'
                : addToCart.isPending
                ? 'ADDING...'
                : 'ADD TO CART'}
            </span>
          </Button>

          {/* Wishlist Heart Button */}
          {mounted && (
            <Button
              onClick={handleToggleWishlist}
              disabled={toggleWishlist.isPending}
              variant="outline"
              size="sm"
              className={`p-1.5 sm:p-2 lg:p-2.5 transition-all duration-200 hover:scale-110 ${
                isInWishlist
                  ? config.button.wishlist.active
                  : config.button.wishlist.default
              }`}
            >
              <Heart
                className={`h-3 w-3 sm:h-4 sm:w-4 ${isInWishlist ? 'fill-current' : ''}`}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Size Selection Modal */}
      <SizeSelectionModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCartFromModal}
        isLoading={addToCart.isPending}
      />
    </div>
  );
}