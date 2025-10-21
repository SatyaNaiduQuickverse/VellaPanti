'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, handleApiResponse } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@ecommerce/ui';
import {
  CheckCircle,
  Package,
  Truck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ArrowLeft,
  Home
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  }>;
}

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order-success', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const response = await api.get(`/orders/${orderId}/success`);
      return handleApiResponse<Order>(response);
    },
    enabled: !!orderId && isAuthenticated(),
    retry: 1,
    retryDelay: 1000,
  });

  if (!isAuthenticated()) {
    return null;
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-bold">Invalid order</p>
          <Link href="/">
            <Button className="mt-4 bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
          <p className="mt-4 text-lg font-bold">Loading order details...</p>
        </div>
      </div>
    );
  }

  const order = orderData;

  if (error) {
    console.error('Order fetch error:', error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-bold">Error loading order details</p>
          <p className="text-gray-600 mt-2">
            {error instanceof Error ? error.message : 'Unable to load order information'}
          </p>
          <div className="mt-4 space-x-4">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-2 border-black font-black uppercase tracking-wider"
            >
              Try Again
            </Button>
            <Link href="/">
              <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-bold">Order not found</p>
          <Link href="/">
            <Button className="mt-4 bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <CheckCircle className="h-24 w-24 text-green-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 font-bold mb-2">
            Thank you for your order
          </p>
          <p className="text-lg text-gray-500">
            Order #{order.id.slice(-8)} • Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Details */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center">
                <Package className="h-6 w-6 mr-3" />
                Order Summary
              </h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 border border-gray-300">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="font-bold">₹{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-black mt-6 pt-4">
                <div className="flex justify-between text-xl">
                  <span className="font-black">Total:</span>
                  <span className="font-black">₹{order.total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Payment Method: Cash on Delivery (COD)
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center">
                <MapPin className="h-6 w-6 mr-3" />
                Shipping Address
              </h2>

              <div className="space-y-2">
                <p className="font-bold">{order.shippingStreet}</p>
                <p>{order.shippingCity}, {order.shippingState}</p>
                <p>{order.shippingZipCode}, {order.shippingCountry}</p>
              </div>
            </div>
          </div>

          {/* Order Status & Next Steps */}
          <div className="space-y-8">
            {/* Order Status */}
            <div className="bg-black text-white p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">
                Order Status
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-400 mr-4"></div>
                  <div>
                    <p className="font-bold">Order Confirmed</p>
                    <p className="text-sm text-gray-300">We've received your order</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 mr-4"></div>
                  <div>
                    <p className="font-bold">Processing</p>
                    <p className="text-sm text-gray-300">We're preparing your order</p>
                  </div>
                </div>
                <div className="flex items-center opacity-50">
                  <div className="w-4 h-4 rounded-full bg-gray-400 mr-4"></div>
                  <div>
                    <p className="font-bold">Shipped</p>
                    <p className="text-sm text-gray-300">Your order is on the way</p>
                  </div>
                </div>
                <div className="flex items-center opacity-50">
                  <div className="w-4 h-4 rounded-full bg-gray-400 mr-4"></div>
                  <div>
                    <p className="font-bold">Delivered</p>
                    <p className="text-sm text-gray-300">Order delivered successfully</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/10 rounded">
                <p className="font-bold text-yellow-400">Estimated Delivery</p>
                <p className="text-lg">3-5 Business Days</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">
                Need Help?
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-gray-600" />
                  <div>
                    <p className="font-bold">Call Us</p>
                    <p className="text-sm text-gray-600">+91 9876543210</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-gray-600" />
                  <div>
                    <p className="font-bold">Email Support</p>
                    <p className="text-sm text-gray-600">support@vellapanti.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/orders">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-black font-black uppercase tracking-wider mb-3"
                  >
                    Track This Order
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
                    <Home className="h-5 w-5 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
    </div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}