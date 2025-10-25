'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useCart, useRemoveFromCart, useUpdateCartItem, useClearCart } from '@/hooks/useCart';
import { Button } from '@ecommerce/ui';
import { Minus, Plus, ShoppingBag, Trash2, ArrowLeft, Tag, X, Gift } from 'lucide-react';
import Link from 'next/link';
import { applyCoupon as applyCouponUtil } from '@/lib/couponUtils';
import type { Coupon } from '@ecommerce/types';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function CartPage() {
  const { items, subtotal, discount, total, itemCount, appliedCoupon, applyCoupon, removeCoupon } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const clearCart = useClearCart();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [bogoConfig, setBogoConfig] = useState({ bogoBuyQty: 1, bogoGetQty: 1 });

  // Load cart data if authenticated
  const { isLoading } = useCart();

  // Fetch BOGO configuration from offer popup
  useEffect(() => {
    const fetchBogoConfig = async () => {
      try {
        const response = await api.get('/products/offer-popup');
        if (response.data.success && response.data.data) {
          setBogoConfig({
            bogoBuyQty: response.data.data.bogoBuyQty || 1,
            bogoGetQty: response.data.data.bogoGetQty || 1,
          });
        }
      } catch (error) {
        console.error('Failed to fetch BOGO config:', error);
      }
    };

    fetchBogoConfig();
  }, []);

  // Mock coupons for testing (in production, fetch from API)
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      code: 'SAVE50',
      type: 'PERCENTAGE',
      discountPercentage: 50,
      applicability: 'ALL',
      status: 'ACTIVE',
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      code: 'BOGO2024',
      type: 'BOGO',
      applicability: 'ALL',
      status: 'ACTIVE',
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      code: 'FLAT50',
      type: 'PERCENTAGE',
      discountPercentage: 50,
      applicability: 'ALL',
      minPurchaseAmount: 500,
      status: 'ACTIVE',
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);

    // Find coupon (in production, call API)
    const coupon = mockCoupons.find(
      c => c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (!coupon) {
      toast.error('Invalid coupon code');
      setIsApplyingCoupon(false);
      return;
    }

    // Apply coupon using utility with BOGO configuration
    const result = applyCouponUtil(coupon, items, bogoConfig);

    if (result.success && result.appliedCoupon) {
      applyCoupon(result.appliedCoupon);
      toast.success(result.message);
      setCouponCode('');
    } else {
      toast.error(result.message);
    }

    setIsApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed');
  };

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/products" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-3 sm:mb-4 text-sm sm:text-base">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Shopping Cart ({itemCount})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <ShoppingBag className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-gray-400 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 uppercase tracking-wide">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">Add some products to get started</p>
            <Link href="/products">
              <Button className="bg-black text-white hover:bg-gray-800 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-black uppercase tracking-wider">
                Shop Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-black p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight">Items in Cart</h2>
                  <Button
                    variant="outline"
                    onClick={handleClearCart}
                    className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase tracking-wide text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
                    disabled={clearCart.isPending}
                  >
                    Clear Cart
                  </Button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="border-2 border-black p-3 sm:p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
                        {/* Product Image */}
                        <div className="w-full sm:w-24 md:w-32 h-48 sm:h-24 md:h-32 bg-gray-100 border border-gray-300 flex-shrink-0">
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
                          <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="flex-1">
                              <h3 className="text-base sm:text-lg md:text-xl font-black mb-1 sm:mb-2">{item.product?.name || 'Product'}</h3>
                              <p className="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base line-clamp-2">{item.product?.description}</p>

                              {/* Variant Information */}
                              {item.productVariant && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3">
                                  <div className="font-bold text-xs sm:text-sm text-black mb-1 sm:mb-2">Selected Variant:</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2 sm:ml-4 p-2"
                              disabled={removeFromCart.isPending}
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4">
                            {/* Price */}
                            <div>
                              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                <span className="text-xl sm:text-2xl font-black text-green-600">
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
                                      <span className="text-base sm:text-lg text-gray-500 line-through">
                                        ₹{originalPrice.toFixed(2)}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>

                              {/* Stock Information */}
                              {item.productVariant ? (
                                <p className="text-xs sm:text-sm font-bold text-green-600">
                                  Stock: {item.productVariant.stock || 0} available
                                </p>
                              ) : (
                                <p className="text-xs sm:text-sm font-bold text-green-600">
                                  Stock: Available
                                </p>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center border-2 border-black flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="border-0 rounded-none h-10 w-10 sm:h-12 sm:w-12"
                                disabled={updateCartItem.isPending}
                              >
                                <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                              </Button>
                              <span className="px-4 py-2 sm:px-6 sm:py-3 font-black text-base sm:text-lg min-w-[3rem] sm:min-w-[4rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="border-0 rounded-none h-10 w-10 sm:h-12 sm:w-12"
                                disabled={updateCartItem.isPending}
                              >
                                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <div className="bg-black text-white p-4 sm:p-5 md:p-6 lg:sticky lg:top-24">
                <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 uppercase tracking-tight">Order Summary</h2>

                {/* Coupon Section */}
                {!appliedCoupon ? (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-bold mb-2 text-gray-300">Have a Coupon?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 bg-white text-black font-bold border-2 border-white rounded uppercase"
                        disabled={isApplyingCoupon}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="bg-green-600 text-white hover:bg-green-700 font-black uppercase tracking-wider px-4"
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Try: SAVE50 (50% off) or BOGO2024 (Buy 1 Get 1)
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 sm:mb-6 bg-green-600 p-3 rounded border-2 border-green-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {appliedCoupon.coupon.type === 'BOGO' ? (
                          <Gift className="h-5 w-5" />
                        ) : (
                          <Tag className="h-5 w-5" />
                        )}
                        <div>
                          <p className="font-black text-sm">{appliedCoupon.coupon.code}</p>
                          <p className="text-xs">
                            {appliedCoupon.coupon.type === 'BOGO'
                              ? 'Buy 1 Get 1 Free'
                              : `${appliedCoupon.coupon.discountPercentage}% OFF`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveCoupon}
                        className="text-white hover:bg-green-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="font-bold">Subtotal ({itemCount} items):</span>
                    <span className="font-black">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span className="font-bold">Discount ({appliedCoupon.coupon.code}):</span>
                      <span className="font-black">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  {appliedCoupon?.freeItems && appliedCoupon.freeItems.length > 0 && (
                    <div className="bg-green-600/20 p-3 rounded border border-green-400">
                      <p className="font-bold text-green-400 mb-2 flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Free Items (BOGO):
                      </p>
                      {appliedCoupon.freeItems.map((item, index) => (
                        <p key={index} className="text-xs text-gray-300">
                          • {item.product?.name} x{item.quantity}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="font-bold">Shipping:</span>
                    <span className="font-black text-green-400">FREE</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 sm:pt-4">
                    <div className="flex justify-between text-lg sm:text-xl">
                      <span className="font-black">Total:</span>
                      <span className="font-black">₹{total.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && discount > 0 && (
                      <p className="text-xs text-green-400 mt-1 text-right">
                        You saved ₹{discount.toFixed(2)}!
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <Link href="/checkout" className="block">
                    <button className="w-full bg-white text-black hover:bg-gray-200 py-3 sm:py-4 text-base sm:text-lg font-black uppercase tracking-wider rounded transition-colors">
                      Proceed to Checkout
                    </button>
                  </Link>

                  <Link href="/products" className="block">
                    <button className="w-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-black font-black uppercase tracking-wider py-3 sm:py-4 text-sm sm:text-base rounded">
                      Continue Shopping
                    </button>
                  </Link>
                </div>

                {/* Security Notice */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/10 rounded">
                  <p className="mb-1 sm:mb-2 font-bold text-green-400 text-sm sm:text-base">Secure Checkout</p>
                  <p className="text-xs sm:text-sm">Your payment information is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}