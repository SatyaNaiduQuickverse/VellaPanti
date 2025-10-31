'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { api, handleApiResponse } from '@/lib/api';
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, Eye, Image, Star, Tag, BookOpen } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  monthlyRevenue: number;
}

interface RecentOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    product: {
      name: string;
    };
  }>;
}

interface TopProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  _count: {
    orderItems: number;
  };
}

interface LowStockVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  stock: number;
  price: number;
  salePrice?: number;
  product: {
    id: string;
    name: string;
    basePrice: number;
    category: {
      name: string;
      slug: string;
    };
  };
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockVariant[];
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const response = await api.get('/admin/dashboard/stats');
      return handleApiResponse<DashboardData>(response);
    },
    enabled: isAuthenticated() && user?.role === 'ADMIN',
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!isAuthenticated() || user?.role !== 'ADMIN') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
          <p className="mt-4 text-lg font-bold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Dashboard error:', error);
    // Show dashboard with default values instead of error screen
    const defaultData = {
      stats: {
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        totalUsers: 0,
        monthlyRevenue: 0,
      },
      recentOrders: [],
      topProducts: [],
      lowStockProducts: [],
    };

    return (
      <DashboardContent
        dashboardData={defaultData}
        user={user}
        error={error}
      />
    );
  }

  return (
    <DashboardContent
      dashboardData={dashboardData || {
        stats: { totalProducts: 0, totalCategories: 0, totalOrders: 0, totalUsers: 0, monthlyRevenue: 0 },
        recentOrders: [],
        topProducts: [],
        lowStockProducts: [],
      }}
      user={user}
    />
  );
}

function DashboardContent({ dashboardData, user, error }: {
  dashboardData: DashboardData;
  user: any;
  error?: any;
}) {
  const { stats, recentOrders, topProducts, lowStockProducts } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
            ADMIN DASHBOARD
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Welcome back, {user?.name}. Here's what's happening with your store.
          </p>
          {error && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
              <p className="text-yellow-800 font-bold">Warning: Unable to load live data. Showing cached/default values.</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white border-2 border-black p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-black" />
              <div className="ml-4">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-600">Products</p>
                <p className="text-2xl font-black text-black">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-black" />
              <div className="ml-4">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-600">Users</p>
                <p className="text-2xl font-black text-black">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-black" />
              <div className="ml-4">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-600">Orders</p>
                <p className="text-2xl font-black text-black">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-black" />
              <div className="ml-4">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-600">Revenue</p>
                <p className="text-2xl font-black text-black">₹{(stats?.monthlyRevenue || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-bold uppercase tracking-wide text-gray-600">Low Stock</p>
                <p className="text-2xl font-black text-red-600">{lowStockProducts?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-2 border-black p-6 mb-8">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/products/new">
              <Button className="w-full bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
                <Package className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider">
                <Eye className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Orders
              </Button>
            </Link>
            <Link href="/admin/homepage">
              <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider">
                <Image className="h-4 w-4 mr-2" />
                Homepage Setup
              </Button>
            </Link>
            <Link href="/admin/story">
              <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider">
                <BookOpen className="h-4 w-4 mr-2" />
                Edit Story Page
              </Button>
            </Link>
            <Link href="/admin/featured">
              <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider">
                <Star className="h-4 w-4 mr-2" />
                Featured Products
              </Button>
            </Link>
            <Link href="/admin/offer-popup">
              <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider">
                <Tag className="h-4 w-4 mr-2" />
                Offer Popup
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm">#{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">{order.user.name}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">₹{order.total.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No recent orders</p>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
              <AlertTriangle className="h-6 w-6 inline mr-2 text-red-600" />
              Low Stock Alerts
            </h2>
            <div className="space-y-4">
              {lowStockProducts && lowStockProducts.length > 0 ? (
                lowStockProducts.map((variant) => (
                  <div key={variant.id} className="border border-red-200 p-4 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm">{variant.product?.name || 'Unknown Product'}</p>
                        <div className="text-xs text-gray-600 mb-1">
                          {variant.size && <span>Size: {variant.size} • </span>}
                          {variant.color && <span>Color: {variant.color} • </span>}
                          {variant.material && <span>Material: {variant.material} • </span>}
                          {variant.sku && <span>SKU: {variant.sku}</span>}
                        </div>
                        <p className="text-sm text-gray-600">{variant.product?.category?.name || 'Unknown Category'}</p>
                        <p className="text-sm font-bold text-red-600">Only {variant.stock} left</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">₹{(variant.salePrice || variant.price || 0).toFixed(2)}</p>
                        <Link href={`/admin/products/${variant.product?.id || ''}`}>
                          <Button size="sm" className="bg-red-600 text-white hover:bg-red-700 font-bold uppercase">
                            Restock
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">All variants are well stocked</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border-2 border-black p-6 mt-8">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">Top Selling Products Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100 mb-3 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <p className="font-bold text-sm mb-1">{product.name || 'Unknown Product'}</p>
                  <p className="text-sm text-gray-600">₹{(product.price || 0).toFixed(2)}</p>
                  <p className="text-xs font-bold text-green-600">{product._count?.orderItems || 0} sold</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8 col-span-full">No sales data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}