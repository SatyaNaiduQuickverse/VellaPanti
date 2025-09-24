'use client';

import { useEffect, useState } from 'react';
import { Trash2, Edit, Plus, Folder, Package } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useAuthStore } from '@/stores/authStore';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  _count: {
    products: number;
  };
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== ADMIN CATEGORIES: Starting fetch ===');
        setLoading(true);
        setError(null);

        const response = await fetch('/api/categories');
        console.log('Categories response status:', response.status);
        console.log('Categories response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Categories response data:', data);

        if (data.success && data.data) {
          console.log('Setting categories:', data.data.length, 'items');
          setCategories(data.data);
        } else {
          throw new Error(data.error || 'No data returned');
        }
      } catch (err) {
        console.error('Admin Categories Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log('Categories state:', { loading, error, categoriesCount: categories.length });

  const handleCreateCategory = async (formData: FormData) => {
    setCreateLoading(true);
    try {
      const categoryData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        image: formData.get('image') as string || null,
        theme: formData.get('theme') as string,
        slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowCreateForm(false);
        window.location.reload();
      } else {
        alert(`Error creating category: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Create category error:', err);
      alert('Failed to create category');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(categoryId);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        window.location.reload();
      } else {
        alert(`Error deleting category: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete category error:', err);
      alert('Failed to delete category');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">📁 Categories Management</h1>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="font-bold">Loading categories...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mt-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">📁 Categories Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading categories:</p>
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

  if (categories.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">📁 Categories Management</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">No categories found</p>
          <p className="mt-2">The API returned no categories. Check the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
            Category Management
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Manage product categories and organize your inventory
          </p>
        </div>

        {/* Create Category Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Add Category'}
          </Button>
        </div>

        {/* Create Category Form */}
        {showCreateForm && (
          <div className="bg-white border-2 border-black p-6 mb-6">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">Add New Category</h2>
            <form action={handleCreateCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Theme *</label>
                <select
                  name="theme"
                  required
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  defaultValue="BLACK"
                >
                  <option value="BLACK">Black Theme (Street/Underground)</option>
                  <option value="WHITE">White Theme (Clean/Premium)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="Enter category description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Image URL</label>
                <input
                  type="url"
                  name="image"
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="https://example.com/category-image.jpg (optional)"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider disabled:bg-gray-400"
                >
                  {createLoading ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-white border-2 border-black p-6">
              <div className="flex items-center justify-between">
                {/* Category Details */}
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 border-2 border-gray-300 w-16 h-16 flex items-center justify-center">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <Folder className="h-6 w-6 text-gray-600" />
                    )}
                    {category.image && (
                      <Folder className="h-6 w-6 text-gray-600 hidden" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black uppercase tracking-tight">{category.name}</h3>
                    <p className="text-gray-600 font-bold">/{category.slug}</p>
                    {category.description && (
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions and Stats */}
                <div className="flex items-center space-x-4">
                  {/* Product Count */}
                  <div className="text-center bg-gray-50 px-4 py-2 border-2 border-gray-300">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-600" />
                      <span className="font-black text-lg">{category._count.products}</span>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wide text-gray-600">Products</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-bold"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      disabled={deleteLoading === category.id}
                      className="border-2 border-red-400 text-red-600 hover:bg-red-50 font-bold disabled:opacity-50"
                    >
                      {deleteLoading === category.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
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
            <div className="text-3xl font-black text-black">{categories.length}</div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Total Categories</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              {categories.reduce((sum, cat) => sum + cat._count.products, 0)}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Total Products</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              {categories.filter(cat => cat._count.products === 0).length}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Empty Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
}