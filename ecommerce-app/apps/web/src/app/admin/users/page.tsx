'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Filter, Shield, User, Calendar, ShoppingBag, UserCog, Crown } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useAuthStore } from '@/stores/authStore';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    addresses: number;
    reviews: number;
  };
}

interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState<string | null>(null);
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
        console.log('=== ADMIN USERS: Starting fetch ===');
        console.log('Using access token:', accessToken ? 'Present' : 'Missing');
        setLoading(true);
        setError(null);

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch('/api/users/all', {
          method: 'GET',
          headers,
        });

        console.log('Users response status:', response.status);
        console.log('Users response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Users response data:', data);

        if (data.success && data.data) {
          console.log('Setting users:', data.data.length, 'items');
          setUsers(data.data);
        } else {
          throw new Error(data.error || 'No data returned');
        }
      } catch (err) {
        console.error('Admin Users Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasHydrated, accessToken, isAuthenticated]);

  console.log('Users state:', { loading, error, usersCount: users.length });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRoleUpdate = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    setRoleUpdateLoading(userId);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update the local state
        setUsers(users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        alert(`Error updating user role: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Update user role error:', err);
      alert('Failed to update user role');
    } finally {
      setRoleUpdateLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">👥 Users Management</h1>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="font-bold">Loading users...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mt-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">👥 Users Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading users:</p>
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

  if (users.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">👥 Users Management</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">No users found</p>
          <p className="mt-2">The API returned no users. Check the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
            User Management
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Manage user accounts, roles, and access permissions
          </p>
        </div>

        {/* Users Grid */}
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white border-2 border-black p-6">
              <div className="flex items-center justify-between">
                {/* User Details */}
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-3 border-2 border-gray-300">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black uppercase tracking-tight">{user.name}</h3>
                    <p className="text-gray-600 font-bold">{user.email}</p>
                    <p className="text-gray-600 text-sm">
                      Member since {formatDate(user.createdAt)}
                    </p>
                    {user._count && (
                      <p className="text-gray-600 text-sm">
                        {user._count.orders || 0} orders • {user._count.reviews || 0} reviews
                      </p>
                    )}
                  </div>
                </div>

                {/* Role and Actions */}
                <div className="flex items-center space-x-4">
                  {/* Activity Stats */}
                  <div className="text-center bg-gray-50 px-4 py-2 border-2 border-gray-300">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-4 w-4 text-gray-600" />
                      <span className="font-black text-lg">{user._count?.orders || 0}</span>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wide text-gray-600">Orders</div>
                  </div>

                  {/* Role Badge and Management */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-4 py-2 border-2 text-sm font-bold uppercase tracking-wide ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {user.role === 'ADMIN' ? (
                        <>
                          <Crown className="h-4 w-4 inline mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 inline mr-1" />
                          User
                        </>
                      )}
                    </span>

                    {/* Role Toggle Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleUpdate(
                        user.id,
                        user.role === 'ADMIN' ? 'USER' : 'ADMIN'
                      )}
                      disabled={roleUpdateLoading === user.id}
                      className="border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-bold disabled:opacity-50"
                    >
                      {roleUpdateLoading === user.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                      ) : (
                        <UserCog className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">{users.length}</div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Total Users</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              {users.filter(user => user.role === 'ADMIN').length}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Admin Users</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              {users.reduce((sum, user) => sum + (user._count?.orders || 0), 0)}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Total Orders</div>
          </div>
        </div>
      </div>
    </div>
  );
}