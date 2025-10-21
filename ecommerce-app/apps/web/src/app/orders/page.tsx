'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@ecommerce/ui';
import { Package, ArrowLeft, Calendar, CreditCard, MapPin, Download } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  variantSize?: string;
  variantColor?: string;
  variantMaterial?: string;
  product: {
    id: string;
    name: string;
    images: string[];
    slug: string;
  };
  productVariant?: {
    id: string;
    sku: string;
    size?: string;
    color?: string;
    material?: string;
    images: string[];
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
}


interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function OrdersPage() {
  const { accessToken, hasHydrated, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!hasHydrated) {
      console.log('Auth not hydrated yet, waiting...');
      return;
    }

    if (!isAuthenticated()) {
      setError('Not authenticated. Please login first.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log('=== USER ORDERS: Starting fetch ===');
        console.log('Using access token:', accessToken ? 'Present' : 'Missing');
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/orders?page=${page}&limit=10`, {
          method: 'GET',
          headers,
        });

        console.log('Orders response status:', response.status);
        console.log('Orders response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Orders response data:', data);

        if (data.success && data.data) {
          console.log('Setting orders:', data.data.length, 'items');
          setOrders(data.data);
          setPagination(data.pagination);
        } else {
          throw new Error(data.error || 'No data returned');
        }
      } catch (err) {
        console.error('User Orders Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasHydrated, accessToken, isAuthenticated, page]);

  console.log('Orders state:', { loading, error, ordersCount: orders.length });

  if (!hasHydrated || !isAuthenticated()) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Order received and being processed';
      case 'PROCESSING':
        return 'Order is being prepared for shipment';
      case 'SHIPPED':
        return 'Order has been shipped and is on the way';
      case 'DELIVERED':
        return 'Order has been successfully delivered';
      case 'CANCELLED':
        return 'Order has been cancelled';
      default:
        return 'Order status unknown';
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const generateTrackingEvents = (order: Order) => {
    const events = [];
    const orderDate = new Date(order.createdAt);

    // Always add order placed event
    events.push({
      status: 'ORDER_PLACED',
      message: 'Order has been placed and confirmed',
      timestamp: order.createdAt,
      location: 'Online',
    });

    // Add events based on current status
    if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      events.push({
        status: 'PROCESSING',
        message: 'Order is being prepared for shipment',
        timestamp: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        location: 'Warehouse',
      });
    }

    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      events.push({
        status: 'SHIPPED',
        message: 'Package has been shipped and is on the way',
        timestamp: new Date(orderDate.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        location: 'Distribution Center',
      });
    }

    if (order.status === 'DELIVERED') {
      events.push({
        status: 'DELIVERED',
        message: 'Package has been delivered successfully',
        timestamp: new Date(orderDate.getTime() + 72 * 60 * 60 * 1000).toISOString(),
        location: `₹{order.shippingCity}, ${order.shippingState}`,
      });
    }

    return events;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
          <p className="mt-4 text-lg font-bold">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-bold">Failed to load orders</p>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Track and manage your order history
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-4 uppercase tracking-wide">No Orders Yet</h2>
            <p className="text-gray-600 mb-8 text-lg">You haven't placed any orders yet</p>
            <Link href="/products">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-black uppercase tracking-wider">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const trackingEvents = generateTrackingEvents(order);

              return (
                <div key={order.id} className="bg-white border-2 border-black">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-black mb-2">Order #{order.id.slice(-8)}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            ₹{order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`inline-flex px-3 py-1 text-sm font-bold rounded uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide"
                        >
                          {isExpanded ? 'Hide Tracking' : 'Track Order'}
                        </Button>
                      </div>
                    </div>

                    {/* Status Message and Key Info */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                      <p className="text-sm font-bold text-gray-700 mb-2">
                        {getStatusMessage(order.status)}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                        {order.trackingNumber && (
                          <span className="font-mono bg-white px-2 py-1 rounded border">
                            Tracking: {order.trackingNumber}
                          </span>
                        )}
                        {order.estimatedDelivery && (
                          <span className="bg-white px-2 py-1 rounded border">
                            Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </span>
                        )}
                        <span className="bg-white px-2 py-1 rounded border">
                          {order.shippingCity}, {order.shippingState}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Basic Order Items Preview */}
                  <div className="p-6">
                    <h4 className="font-black uppercase tracking-wide mb-4">Items Ordered ({order.items.length}):</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 border border-gray-200 rounded">
                          <div className="w-16 h-16 bg-gray-100 border border-gray-300 flex-shrink-0">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm truncate">{item.product.name}</h5>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <p className="text-sm font-bold">₹{item.price.toFixed(2)} each</p>
                            {(item.variantSize || item.variantColor || item.variantMaterial) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {[item.variantSize, item.variantColor, item.variantMaterial].filter(Boolean).join(' • ')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6">
                        {/* Detailed Order Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          {/* Order Details */}
                          <div>
                            <h4 className="text-lg font-black uppercase tracking-wide mb-4">Order Information</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="font-bold">Order ID:</span>
                                <span className="font-mono">{order.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-bold">Order Date:</span>
                                <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-bold">Order Total:</span>
                                <span className="font-black text-lg">₹{order.total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-bold">Status:</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-bold rounded uppercase ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              {order.trackingNumber && (
                                <div className="flex justify-between">
                                  <span className="font-bold">Tracking Number:</span>
                                  <span className="font-mono">{order.trackingNumber}</span>
                                </div>
                              )}
                              {order.estimatedDelivery && (
                                <div className="flex justify-between">
                                  <span className="font-bold">Estimated Delivery:</span>
                                  <span>{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div>
                            <h4 className="text-lg font-black uppercase tracking-wide mb-4">Shipping Address</h4>
                            <div className="text-sm space-y-1 p-4 bg-white border border-gray-200 rounded">
                              <div className="font-bold">{order.shippingStreet}</div>
                              <div>{order.shippingCity}, {order.shippingState} {order.shippingZipCode}</div>
                              <div>{order.shippingCountry}</div>
                            </div>
                          </div>
                        </div>

                        {/* Package Tracking Timeline */}
                        <div className="mb-8">
                          <h4 className="text-lg font-black uppercase tracking-wide mb-4">Package Tracking</h4>
                          <div className="bg-white border border-gray-200 rounded p-6">
                            <div className="space-y-6">
                              {trackingEvents.map((event, index) => (
                                <div key={index} className="flex gap-4">
                                  <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                                    {event.status === 'DELIVERED' ? (
                                      <Package className="h-5 w-5" />
                                    ) : event.status === 'SHIPPED' ? (
                                      <Package className="h-5 w-5" />
                                    ) : event.status === 'PROCESSING' ? (
                                      <Package className="h-5 w-5" />
                                    ) : (
                                      <Package className="h-5 w-5" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="font-bold text-sm uppercase tracking-wide">
                                          {event.status.replace('_', ' ')}
                                        </h5>
                                        <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                                        {event.location && (
                                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {event.location}
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(event.timestamp).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Detailed Item Information */}
                        <div className="mb-6">
                          <h4 className="text-lg font-black uppercase tracking-wide mb-4">Detailed Item Information</h4>
                          <div className="space-y-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="bg-white border border-gray-200 rounded p-4">
                                <div className="flex gap-4">
                                  <div className="w-24 h-24 bg-gray-100 border border-gray-300 flex-shrink-0">
                                    {item.product.images && item.product.images.length > 0 ? (
                                      <img
                                        src={item.product.images[0]}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <Package className="h-8 w-8 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-bold text-lg mb-2">{item.product.name}</h5>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-bold">Quantity:</span> {item.quantity}
                                      </div>
                                      <div>
                                        <span className="font-bold">Unit Price:</span> ₹{item.price.toFixed(2)}
                                      </div>
                                      <div>
                                        <span className="font-bold">Total:</span> ₹{(item.price * item.quantity).toFixed(2)}
                                      </div>
                                      {item.productVariant?.sku && (
                                        <div>
                                          <span className="font-bold">SKU:</span> <span className="font-mono text-xs">{item.productVariant.sku}</span>
                                        </div>
                                      )}
                                      {item.variantSize && (
                                        <div>
                                          <span className="font-bold">Size:</span> {item.variantSize}
                                        </div>
                                      )}
                                      {item.variantColor && (
                                        <div>
                                          <span className="font-bold">Color:</span> {item.variantColor}
                                        </div>
                                      )}
                                      {item.variantMaterial && (
                                        <div>
                                          <span className="font-bold">Material:</span> {item.variantMaterial}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-black text-black hover:bg-black hover:text-white font-bold uppercase tracking-wide"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Invoice
                          </Button>
                          {order.status === 'DELIVERED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-bold uppercase tracking-wide"
                            >
                              Leave Review
                            </Button>
                          )}
                          {order.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold uppercase tracking-wide"
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-4">
                <Button
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(prev => prev - 1)}
                  className="border-2 border-black font-bold uppercase tracking-wide"
                >
                  Previous
                </Button>

                <span className="text-sm font-bold uppercase tracking-wide">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage(prev => prev + 1)}
                  className="border-2 border-black font-bold uppercase tracking-wide"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}