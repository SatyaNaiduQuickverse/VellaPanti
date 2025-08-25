'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useAddToCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import type { Product } from '@ecommerce/types';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const addToCart = useAddToCart();

  const handleAddToCart = () => {
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
    <div className="group bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
              Sale
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
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
          <span className="text-xl font-bold text-primary">
            ${displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || addToCart.isPending}
          className="w-full"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0
            ? 'Out of Stock'
            : addToCart.isPending
            ? 'Adding...'
            : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}