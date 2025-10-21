'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useCart } from '@/hooks/useCart';
import { api, handleApiResponse } from '@/lib/api';
import { Button } from '@ecommerce/ui';
import { ArrowLeft, CreditCard, Truck, Shield, Package } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, itemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Load cart data if authenticated
  const { isLoading } = useCart();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated() && !isLoading && items.length === 0) {
      router.push('/cart');
    }
  }, [isAuthenticated, isLoading, items.length, router]);

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      // Get form data
      const formData = new FormData(document.getElementById('checkout-form') as HTMLFormElement);

      const shippingAddress = {
        street: `${formData.get('address')}, ${formData.get('firstName')} ${formData.get('lastName')}`,
        city: formData.get('city') as string,
        state: formData.get('state') || formData.get('city') as string, // Use city as state for now
        zipCode: formData.get('zipCode') as string,
        country: 'India', // Default country
      };

      const orderData = {
        shippingAddress,
        items: items.map(item => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
      };

      const response = await api.post('/orders', orderData);
      const result = handleApiResponse<{ id: string }>(response);

      // Clear cart and redirect to success page
      router.push(`/order-success?orderId=${result.id}`);
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
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
          <p className="mt-4 text-lg font-bold">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const tax = total * 0.08; // 8% tax
  const shipping: number = 0; // Free shipping
  const finalTotal = total + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Checkout
          </h1>
        </div>

        <form id="checkout-form" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Forms */}
          <div className="space-y-8">
            {/* Shipping Information */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center">
                <Truck className="h-6 w-6 mr-3" />
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="123 Street Name, Area, Landmark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">PIN Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    pattern="[0-9]{6}"
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="400001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    pattern="[0-9]{10}"
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center">
                <CreditCard className="h-6 w-6 mr-3" />
                Payment Method
              </h2>

              <div className="space-y-4">
                <div className="border-2 border-green-600 bg-green-50 p-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="CASH_ON_DELIVERY"
                      defaultChecked
                      className="mr-3"
                    />
                    <label htmlFor="cod" className="font-bold text-green-800 uppercase tracking-wide">
                      Cash on Delivery (COD)
                    </label>
                  </div>
                  <p className="text-sm text-green-600 mt-2 ml-6">
                    Pay when your order is delivered to your doorstep
                  </p>
                </div>

                <div className="border-2 border-gray-300 bg-gray-100 p-4 opacity-50">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="online"
                      name="paymentMethod"
                      value="ONLINE"
                      disabled
                      className="mr-3"
                    />
                    <label htmlFor="online" className="font-bold text-gray-600 uppercase tracking-wide">
                      Online Payment
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 ml-6">
                    Credit/Debit Card, UPI, Net Banking (Coming Soon)
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border-2 border-green-200 p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-bold text-green-800">Secure Checkout</p>
                  <p className="text-sm text-green-600">Your payment information is encrypted and secure</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-black text-white p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Order Summary</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-700 flex-shrink-0">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{item.product?.name}</h4>
                      {/* Variant Information */}
                      {item.productVariant && (
                        <div className="text-xs text-gray-400 mb-1">
                          {item.productVariant.size && <span>Size: {item.productVariant.size} • </span>}
                          {item.productVariant.color && <span>Color: {item.productVariant.color} • </span>}
                          {item.productVariant.material && <span>Material: {item.productVariant.material} • </span>}
                          {item.productVariant.sku && <span>SKU: {item.productVariant.sku}</span>}
                        </div>
                      )}
                      <p className="text-sm text-gray-300">Qty: {item.quantity}</p>
                      <p className="font-bold">
                        ₹{(() => {
                          const price = item.productVariant
                            ? (item.productVariant.salePrice || item.productVariant.price || 0)
                            : (item.product?.baseSalePrice || item.product?.basePrice || 0);
                          return (price * item.quantity).toFixed(2);
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6 pt-6 border-t border-white/20">
                <div className="flex justify-between">
                  <span className="font-bold">Subtotal ({itemCount} items):</span>
                  <span className="font-black">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Shipping:</span>
                  <span className="font-black text-green-400">
                    {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Tax:</span>
                  <span className="font-black">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-xl">
                    <span className="font-black">Total:</span>
                    <span className="font-black">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-white text-black hover:bg-gray-200 py-4 text-lg font-black uppercase tracking-wider disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : `Complete Order - ₹${finalTotal.toFixed(2)}`}
              </Button>

              <p className="text-sm text-gray-300 mt-4 text-center">
                By completing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}