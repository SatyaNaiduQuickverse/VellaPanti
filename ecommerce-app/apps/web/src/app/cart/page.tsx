'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useCart, useRemoveFromCart, useUpdateCartItem, useClearCart } from '@/hooks/useCart';
import { Button } from '@ecommerce/ui';
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, total, itemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const clearCart = useClearCart();

  // Load cart data if authenticated
  const { isLoading } = useCart();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart.mutate(itemId);
    } else {
      updateCartItem.mutate({ id: itemId, data: { quantity: newQuantity } });
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart.mutate();
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
          <p className="mt-4 text-lg font-bold">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Shopping Cart ({itemCount})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-4 uppercase tracking-wide">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8 text-lg">Add some products to get started</p>
            <Link href="/products">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-black uppercase tracking-wider">
                Shop Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-black p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight">Items in Cart</h2>
                  <Button
                    variant="outline"
                    onClick={handleClearCart}
                    className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase tracking-wide"
                    disabled={clearCart.isPending}
                  >
                    Clear Cart
                  </Button>
                </div>

                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="border-2 border-black p-6">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="w-32 h-32 bg-gray-100 border border-gray-300 flex-shrink-0">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ShoppingBag className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-black mb-2">{item.product?.name || 'Product'}</h3>
                              <p className="text-gray-600 mb-3">{item.product?.description}</p>

                              {/* Variant Information */}
                              {item.productVariant && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                                  <div className="font-bold text-sm text-black mb-2">Selected Variant:</div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    {item.productVariant.size && (
                                      <div><span className="text-gray-700">Size:</span> <span className="font-semibold">{item.productVariant.size}</span></div>
                                    )}
                                    {item.productVariant.color && (
                                      <div><span className="text-gray-700">Color:</span> <span className="font-semibold">{item.productVariant.color}</span></div>
                                    )}
                                    {item.productVariant.material && (
                                      <div><span className="text-gray-700">Material:</span> <span className="font-semibold">{item.productVariant.material}</span></div>
                                    )}
                                    {item.productVariant.sku && (
                                      <div className="col-span-2"><span className="text-gray-700">SKU:</span> <span className="font-semibold text-xs">{item.productVariant.sku}</span></div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart.mutate(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                              disabled={removeFromCart.isPending}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          <div className="flex justify-between items-end">
                            {/* Price */}
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl font-black text-green-600">
                                  ${(() => {
                                    let price = 0;
                                    if (item.productVariant) {
                                      price = item.productVariant.salePrice || item.productVariant.price || 0;
                                    } else if (item.product) {
                                      price = item.product.baseSalePrice || item.product.basePrice || 0;
                                    }
                                    return price.toFixed(2);
                                  })()}
                                </span>
                                {(() => {
                                  let hasDiscount = false;
                                  let originalPrice = 0;

                                  if (item.productVariant) {
                                    hasDiscount = !!(item.productVariant.salePrice && item.productVariant.salePrice < item.productVariant.price);
                                    originalPrice = item.productVariant.price || 0;
                                  } else if (item.product) {
                                    hasDiscount = !!(item.product.baseSalePrice && item.product.baseSalePrice < (item.product.basePrice || 0));
                                    originalPrice = item.product.basePrice || 0;
                                  }

                                  if (hasDiscount && originalPrice > 0) {
                                    return (
                                      <span className="text-lg text-gray-500 line-through">
                                        ₹{originalPrice.toFixed(2)}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>

                              {/* Stock Information */}
                              {item.productVariant ? (
                                <p className="text-sm font-bold text-green-600">
                                  Stock: {item.productVariant.stock || 0} available
                                </p>
                              ) : (
                                <p className="text-sm font-bold text-green-600">
                                  Stock: Available
                                </p>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center border-2 border-black">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="border-0 rounded-none h-12 w-12"
                                disabled={updateCartItem.isPending}
                              >
                                <Minus className="h-5 w-5" />
                              </Button>
                              <span className="px-6 py-3 font-black text-lg min-w-[4rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="border-0 rounded-none h-12 w-12"
                                disabled={updateCartItem.isPending}
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-black text-white p-6 sticky top-24">
                <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold">Subtotal ({itemCount} items):</span>
                    <span className="font-black">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Shipping:</span>
                    <span className="font-black text-green-400">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Tax:</span>
                    <span className="font-black">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between text-xl">
                      <span className="font-black">Total:</span>
                      <span className="font-black">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link href="/checkout">
                    <Button className="w-full bg-white text-black hover:bg-gray-200 py-4 text-lg font-black uppercase tracking-wider">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Link href="/products">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-white text-white hover:bg-white hover:text-black font-black uppercase tracking-wider"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-white/10 rounded">
                  <p className="mb-2 font-bold text-green-400">Secure Checkout</p>
                  <p className="text-sm">Your payment information is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}