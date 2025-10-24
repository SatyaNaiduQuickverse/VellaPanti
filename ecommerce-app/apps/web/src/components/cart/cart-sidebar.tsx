'use client';

import { Fragment } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useCart, useRemoveFromCart, useUpdateCartItem, useClearCart } from '@/hooks/useCart';
import { Button } from '@ecommerce/ui';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';

export function CartSidebar() {
  const { items, total, itemCount, isOpen, closeCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const clearCart = useClearCart();

  // Load cart data if authenticated
  useCart();

  if (!isOpen) return null;

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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 border-l-2 border-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Your Cart ({itemCount})
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            className="border-2 border-black hover:bg-black hover:text-white"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isAuthenticated() ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Please Login</h3>
              <p className="text-gray-600 mb-6">You need to login to view your cart</p>
              <Link href="/auth/login" onClick={closeCart}>
                <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
                  Login
                </Button>
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Your Cart is Empty</h3>
              <p className="text-gray-600 mb-6">Add some products to get started</p>
              <Link href="/products" onClick={closeCart}>
                <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
                  Shop Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border-2 border-black p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 border border-gray-300 flex-shrink-0">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product?.name || 'Product image'}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">{item.product?.name || 'Product'}</h4>

                      {/* Variant Information */}
                      {item.productVariant && (
                        <div className="text-xs text-gray-600 mb-2 p-2 bg-gray-50 rounded border">
                          <div className="font-semibold text-black mb-1">Variant Details:</div>
                          <div className="grid grid-cols-2 gap-1">
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

                      {/* Price Information */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-black text-lg text-green-600">
                          ₹{(() => {
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
                              <span className="text-sm text-gray-500 line-through">
                                ₹{originalPrice.toFixed(2)}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      {/* Stock Information */}
                      {item.productVariant && typeof item.productVariant.stock === 'number' && (
                        <div className="text-xs text-gray-500 mb-2 p-1 bg-yellow-50 rounded">
                          <span className="font-semibold">Stock:</span> {item.productVariant.stock} available
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border-2 border-black">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="border-0 rounded-none h-8 w-8"
                            disabled={updateCartItem.isPending}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-3 py-1 font-bold text-sm min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="border-0 rounded-none h-8 w-8"
                            disabled={updateCartItem.isPending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart.mutate(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={removeFromCart.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              {items.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase tracking-wide"
                  disabled={clearCart.isPending}
                >
                  Clear Cart
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer - Total and Checkout */}
        {isAuthenticated() && items.length > 0 && (
          <div className="border-t-2 border-black p-6 bg-gray-50">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold uppercase tracking-wide">Subtotal:</span>
                <span className="text-2xl font-black">₹{total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600">Shipping and taxes calculated at checkout</p>
            </div>

            <div className="space-y-3">
              <Link href="/cart" onClick={closeCart}>
                <Button
                  variant="outline"
                  className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider"
                >
                  View Cart
                </Button>
              </Link>

              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
                  Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}