'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Filter, Eye, Package, Truck, CheckCircle, XCircle, Clock, Edit, ChevronDown, ChevronUp, User, MapPin, Palette } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useAuthStore } from '@/stores/authStore';

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
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    variantSize?: string;
    variantColor?: string;
    variantMaterial?: string;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
    productVariant?: {
      id: string;
      sku: string;
      size?: string;
      color?: string;
      material?: string;
      images: string[];
    };
  }>;
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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const { accessToken, hasHydrated, isAuthenticated } = useAuthStore();

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
        console.log('=== ADMIN ORDERS: Starting fetch ===');
        console.log('Using access token:', accessToken ? 'Present' : 'Missing');
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch('/api/orders/all', {
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
        } else {
          throw new Error(data.error || 'No data returned');
        }
      } catch (err) {
        console.error('Admin Orders Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasHydrated, accessToken, isAuthenticated]);

  console.log('Orders state:', { loading, error, ordersCount: orders.length });

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">🛒 Orders Management</h1>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="font-bold">Loading orders...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mt-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">🛒 Orders Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading orders:</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">🛒 Orders Management</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">No orders found</p>
          <p className="mt-2">The API returned no orders. Check the database.</p>
        </div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
      case 'PROCESSING':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package };
      case 'SHIPPED':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck };
      case 'DELIVERED':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
      case 'CANCELLED':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock };
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change this order status to ${newStatus}?`)) {
      return;
    }

    setStatusUpdateLoading(orderId);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update the local state
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        alert(`Error updating order status: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Update order status error:', err);
      alert('Failed to update order status');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const orderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
            Order Management
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Track and manage customer orders and fulfillment
          </p>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedOrders.has(order.id);

            return (
              <div key={order.id} className="bg-white border-2 border-black p-6">
                <div className="flex items-center justify-between">
                  {/* Order Details */}
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 border-2 border-gray-300">
                      <ShoppingCart className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-black uppercase tracking-tight">
                        Order #{order.id.slice(-8)}
                      </h3>
                      <p className="text-gray-600 font-bold">{order.user?.name || 'Unknown Customer'}</p>
                      <p className="text-gray-600 text-sm">{order.user?.email}</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>

                  {/* Total, Status and Actions */}
                  <div className="flex items-center space-x-4">
                    {/* Order Total */}
                    <div className="text-center bg-gray-50 px-4 py-2 border-2 border-gray-300">
                      <div className="text-2xl font-black text-black">${order.total.toFixed(2)}</div>
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-600">Total</div>
                    </div>

                    {/* Status Badge and Management */}
                    <div className="flex items-center space-x-2">
                      <span className={`px-4 py-2 border-2 text-sm font-bold uppercase tracking-wide ${statusInfo.color}`}>
                        <StatusIcon className="h-4 w-4 inline mr-1" />
                        {order.status}
                      </span>

                      {/* Status Update Dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={statusUpdateLoading === order.id}
                        className="border-2 border-gray-400 text-gray-700 font-bold text-sm p-2 disabled:opacity-50"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {statusUpdateLoading === order.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                      )}
                    </div>

                    {/* Expand/Collapse Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="border-2 border-blue-400 text-blue-700 hover:bg-blue-50 font-bold"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Basic Order Items (Always Visible) */}
                {order.items && order.items.length > 0 && !isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-bold uppercase tracking-wide text-gray-600 mb-2">Order Items:</p>
                    <div className="grid gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 border border-gray-200">
                          <span className="font-bold">{item.product?.name || 'Product'}</span>
                          <span className="text-gray-600">×{item.quantity} @ ${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-sm text-gray-500 p-2">
                          ... and {order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Detailed Order Information (When Expanded) */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-6">
                    {/* Customer & Shipping Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Details */}
                      <div className="bg-blue-50 border-2 border-blue-200 p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <User className="h-5 w-5 text-blue-600" />
                          <h4 className="font-black text-blue-800 uppercase tracking-wide">Customer</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-bold">Name:</span> {order.user?.name}</div>
                          <div><span className="font-bold">Email:</span> {order.user?.email}</div>
                          <div><span className="font-bold">Customer ID:</span> {order.user?.id}</div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-green-50 border-2 border-green-200 p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <h4 className="font-black text-green-800 uppercase tracking-wide">Shipping Address</h4>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>{order.shippingStreet}</div>
                          <div>{order.shippingCity}, {order.shippingState} {order.shippingZipCode}</div>
                          <div>{order.shippingCountry}</div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Items List */}
                    <div>
                      <h4 className="font-black text-gray-800 uppercase tracking-wide mb-4">Order Items Details</h4>
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="bg-white border-2 border-gray-300 p-4">
                            <div className="flex items-start space-x-4">
                              {/* Product Image */}
                              <div className="w-16 h-16 bg-gray-100 border border-gray-300 flex-shrink-0">
                                {item.product?.images?.[0] || item.productVariant?.images?.[0] ? (
                                  <img
                                    src={item.productVariant?.images?.[0] || item.product?.images?.[0]}
                                    alt={item.product?.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Package className="h-6 w-6" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1">
                                <h5 className="font-bold text-lg">{item.product?.name}</h5>

                                {/* Variant Information */}
                                {(item.productVariant || item.variantSize || item.variantColor || item.variantMaterial) && (
                                  <div className="mt-2 flex items-center space-x-4 text-sm">
                                    <Palette className="h-4 w-4 text-gray-600" />
                                    <div className="flex flex-wrap gap-2">
                                      {(item.productVariant?.sku || item.variantSize || item.variantColor || item.variantMaterial) && (
                                        <>
                                          {item.productVariant?.sku && (
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">
                                              SKU: {item.productVariant.sku}
                                            </span>
                                          )}
                                          {(item.productVariant?.size || item.variantSize) && (
                                            <span className="bg-blue-100 px-2 py-1 rounded text-xs font-bold">
                                              Size: {item.productVariant?.size || item.variantSize}
                                            </span>
                                          )}
                                          {(item.productVariant?.color || item.variantColor) && (
                                            <span className="bg-green-100 px-2 py-1 rounded text-xs font-bold">
                                              Color: {item.productVariant?.color || item.variantColor}
                                            </span>
                                          )}
                                          {(item.productVariant?.material || item.variantMaterial) && (
                                            <span className="bg-purple-100 px-2 py-1 rounded text-xs font-bold">
                                              Material: {item.productVariant?.material || item.variantMaterial}
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Quantity and Price */}
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="text-lg font-bold">
                                    Quantity: {item.quantity}
                                  </div>
                                  <div className="text-lg font-bold text-green-600">
                                    ${item.price.toFixed(2)} each
                                  </div>
                                </div>
                                <div className="text-right text-xl font-black text-black">
                                  Total: ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">{orders.length}</div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Total Orders</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Total Revenue</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              {orders.filter(order => order.status === 'PENDING').length}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Pending Orders</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              {orders.filter(order => order.status === 'DELIVERED').length}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Delivered Orders</div>
          </div>
        </div>
      </div>
    </div>
  );
}