'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useAddToCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import type { Product } from '@ecommerce/types';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

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

  // Check if product is in wishlist
  const wishlistItems = wishlistData?.data || [];
  const isInWishlist = wishlistItems.some((item: any) => item.product.id === product.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (currentStock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    // For products with variants, just use the first variant
    // If user needs specific variant selection, they can go to product page
    const variantId = product.variants?.[0]?.id;

    addToCart.mutate({
      productId: product.id,
      productVariantId: variantId || undefined,
      quantity: 1,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the heart
    if (!mounted) return;

    if (!isAuthenticated()) {
      toast.error('Please login to save items to wishlist');
      return;
    }

    toggleWishlist.mutate(product.id);
  };

  // Get price from variants or base price
  const getDisplayPrice = () => {
    if (product.priceRange) {
      return product.priceRange.saleMin || product.priceRange.min;
    }
    if (product.variants?.[0]) {
      return product.variants[0].salePrice || product.variants[0].price;
    }
    return product.baseSalePrice || product.basePrice || 0;
  };

  const getOriginalPrice = () => {
    if (product.priceRange) {
      return product.priceRange.max;
    }
    if (product.variants?.[0]) {
      return product.variants[0].price;
    }
    return product.basePrice || 0;
  };

  const displayPrice = getDisplayPrice();
  const originalPrice = getOriginalPrice();

  // Calculate discount properly
  const hasDiscount = (() => {
    if (product.variants?.[0]) {
      return product.variants[0].salePrice && product.variants[0].salePrice < product.variants[0].price;
    }
    if (product.priceRange) {
      return product.priceRange.saleMin && product.priceRange.saleMin < product.priceRange.min;
    }
    return product.baseSalePrice && product.baseSalePrice < (product.basePrice || 0);
  })();

  const discountPercentage = hasDiscount ? (() => {
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
  })() : 0;

  const hasVariablePrice = product.priceRange?.hasVariablePrice;

  // Get stock from variants or total stock
  const getStock = () => {
    if (product.totalStock !== undefined) {
      return product.totalStock;
    }
    if (product.variants?.length) {
      return product.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return 0;
  };

  const currentStock = getStock();

  // Theme configuration
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

  const config = themeConfig[theme];

  return (
    <div className={`group ${config.cardBg} overflow-hidden transition-all duration-500 ${config.shadow} hover:-translate-y-1`}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-black">
          <Image
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&fit=crop&auto=format'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {hasDiscount && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 text-xs font-black uppercase tracking-wider">
              {discountPercentage}% OFF
            </div>
          )}

          {currentStock === 0 && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <span className="text-white font-black bg-red-600 px-6 py-2 text-sm uppercase tracking-wider">SOLD OUT</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="font-black text-sm uppercase tracking-wider mb-2">QUICK VIEW</p>
              <div className="w-8 h-0.5 bg-white mx-auto"></div>
            </div>
          </div>
        </div>
      </Link>

      <div className={`p-6 space-y-4 ${config.cardBg}`}>
        <Link href={`/products/${product.slug}`}>
          <h3 className={`font-black ${config.textPrimary} line-clamp-1 group-hover:opacity-75 transition-colors uppercase tracking-wider text-sm`}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.averageRating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-3 w-3 ${
                    index < Math.floor(product.averageRating!)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs ${config.textSecondary} font-bold`}>
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasVariablePrice ? (
            <span className={`text-xl font-black ${config.textPrimary} tracking-wider`}>
              ₹{displayPrice.toFixed(2)} - ₹{originalPrice.toFixed(2)}
            </span>
          ) : (
            <>
              <span className={`text-xl font-black ${config.textPrimary} tracking-wider`}>
                ₹{displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className={`text-sm ${config.textTertiary} line-through font-bold`}>
                  ₹{originalPrice.toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Delivery Info */}
        <div className="px-3 py-2 mb-3">
          <p className={`text-xs font-semibold text-center uppercase tracking-wider ${config.textSecondary}`}>
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!mounted || currentStock === 0 || addToCart.isPending}
            className={`flex-1 ${config.button.primary} font-black py-3 transition-all duration-300 uppercase tracking-wider text-xs hover:shadow-lg`}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {!mounted
              ? 'LOADING...'
              : currentStock === 0
              ? 'SOLD OUT'
              : addToCart.isPending
              ? 'ADDING...'
              : 'ADD TO CART'}
          </Button>

          {/* Wishlist Heart Button */}
          {mounted && (
            <Button
              onClick={handleToggleWishlist}
              disabled={toggleWishlist.isPending}
              variant="outline"
              size="sm"
              className={`p-3 transition-all duration-200 hover:scale-110 ${
                isInWishlist
                  ? config.button.wishlist.active
                  : config.button.wishlist.default
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`}
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}