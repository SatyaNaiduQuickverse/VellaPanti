'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useAddToCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import type { Product } from '@ecommerce/types';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const addToCart = useAddToCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    if (!mounted) return;
    
    if (!isAuthenticated()) {
      toast.error('Please login to add items to cart');
      return;
    }

    addToCart.mutate({
      productId: product.id,
      quantity: 1,
    });
  };

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <div className="group bg-white border-2 border-black hover:bg-black hover:text-white overflow-hidden transition-all duration-300 hover:-translate-y-1 transform hover:shadow-2xl">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-black">
          <Image
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=80&fit=crop&auto=format'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0 filter contrast-125"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-wider">
              SALE
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold bg-red-500 px-4 py-2 rounded-lg">OUT OF STOCK</span>
            </div>
          )}
          {!hasDiscount && product.stock > 0 && (
            <div className="absolute top-3 left-3 bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider">
              DROP
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-black text-lg group-hover:text-white transition-colors line-clamp-1 uppercase tracking-wide">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.averageRating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index < Math.floor(product.averageRating!)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-black group-hover:text-white transition-colors">
            ${displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 group-hover:text-gray-300 line-through transition-colors">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!mounted || product.stock === 0 || addToCart.isPending}
          className="w-full bg-black text-white group-hover:bg-white group-hover:text-black font-black py-3 transition-all uppercase tracking-wider border-2 border-black"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {!mounted
            ? 'LOADING...'
            : product.stock === 0
            ? 'SOLD OUT'
            : addToCart.isPending
            ? 'ADDING...'
            : 'COP NOW'}
        </Button>
      </div>
    </div>
  );
}