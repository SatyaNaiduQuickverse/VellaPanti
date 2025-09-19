'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiResponse } from '@/lib/api';
import { Users, Search, Filter, Shield, User, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from '@ecommerce/ui';

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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const queryClient = useQueryClient();

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin-users', page, search, role],
    queryFn: async (): Promise<UsersResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(role !== 'all' && { role }),
      });
      const response = await api.get(`/users/all?${params.toString()}`);
      return handleApiResponse<UsersResponse>(response);
    },
  });

  const { data: users = [], pagination } = usersData || {};

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'USER' | 'ADMIN' }) => {
      const response = await api.put(`/users/${userId}/role`, { role: newRole });
      return handleApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const handleRoleChange = async (userId: string, currentRole: string, userName: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'promote' : 'demote';

    if (window.confirm(`Are you sure you want to ${action} "${userName}" to ${newRole}?`)) {
      updateUserRole.mutate({ userId, newRole });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg font-bold">Failed to load users</p>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
            USER MANAGEMENT
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="text-sm font-bold text-gray-700">
          Total Users: <span className="text-black">{pagination?.total || 0}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="SEARCH USERS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-black bg-white focus:outline-none font-bold uppercase tracking-wide placeholder-gray-600"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-3 border-2 border-black bg-white focus:outline-none font-bold uppercase tracking-wide"
          >
            <option value="all">ALL ROLES</option>
            <option value="USER">USERS</option>
            <option value="ADMIN">ADMINS</option>
          </select>
          <Button
            onClick={() => {
              setSearch('');
              setRole('all');
              setPage(1);
            }}
            variant="outline"
            className="border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-2 border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-black">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 mr-4">
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'ADMIN' ? (
                          <Shield className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-bold text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-900 font-bold">
                          <ShoppingBag className="h-4 w-4 mr-1 text-gray-400" />
                          {user._count.orders} orders
                        </div>
                        <div className="text-gray-500 text-xs">
                          {user._count.reviews} reviews • {user._count.addresses} addresses
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        onClick={() => handleRoleChange(user.id, user.role, user.name)}
                        disabled={updateUserRole.isPending}
                        className={`font-black uppercase tracking-wider ${
                          user.role === 'ADMIN'
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-bold text-gray-900">No users found</p>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t-2 border-black flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                variant="outline"
                className="border-2 border-black"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                variant="outline"
                className="border-2 border-black"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 font-bold">
                  Showing{' '}
                  <span className="font-black">{(page - 1) * pagination.limit + 1}</span>
                  {' '}to{' '}
                  <span className="font-black">
                    {Math.min(page * pagination.limit, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-black">{pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                    className="border-2 border-black"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                    variant="outline"
                    className="border-2 border-black"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}