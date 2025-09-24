'use client';

import { useEffect, useState } from 'react';
import { Trash2, Edit, Plus, Package, DollarSign, Archive, AlertTriangle, Eye, Palette, Shirt } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useAuthStore } from '@/stores/authStore';

interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
  baseSalePrice?: number;
  images: string[];
  description?: string;
  slug: string;
  variants: ProductVariant[];
  totalStock: number;
  priceRange: {
    min: number;
    max: number;
    hasVariablePrice: boolean;
  };
  category: {
    name: string;
    id: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface VariantFormData {
  sku: string;
  size: string;
  color: string;
  material: string;
  price: string;
  salePrice: string;
  stock: string;
  images: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showVariants, setShowVariants] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variantFormData, setVariantFormData] = useState<VariantFormData>({
    sku: '',
    size: '',
    color: '',
    material: '',
    price: '',
    salePrice: '',
    stock: '',
    images: ''
  });
  const [variantLoading, setVariantLoading] = useState(false);
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== ADMIN PRODUCTS: Starting fetch ===');
        setLoading(true);
        setError(null);

        // Fetch products
        const productsResponse = await fetch('/api/products');
        console.log('Products response status:', productsResponse.status);

        if (!productsResponse.ok) {
          throw new Error(`HTTP ${productsResponse.status}: ${productsResponse.statusText}`);
        }

        const productsData = await productsResponse.json();
        console.log('Products response data:', productsData);

        if (productsData.success && productsData.data) {
          console.log('Setting products:', productsData.data.length, 'items');
          setProducts(productsData.data);
        }

        // Fetch categories for the create form
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          if (categoriesData.success && categoriesData.data) {
            setCategories(categoriesData.data);
          }
        }
      } catch (err) {
        console.error('Admin Products Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log('Current state:', { loading, error, productsCount: products.length });

  const handleCreateProduct = async (formData: FormData) => {
    setCreateLoading(true);
    try {
      const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        basePrice: parseFloat(formData.get('basePrice') as string),
        baseSalePrice: formData.get('baseSalePrice') ? parseFloat(formData.get('baseSalePrice') as string) : null,
        categoryId: formData.get('categoryId') as string,
        theme: formData.get('theme') as string,
        images: [formData.get('image') as string || 'https://via.placeholder.com/400x400?text=Product'],
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowCreateForm(false);
        window.location.reload();
      } else {
        alert(`Error creating product: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Create product error:', err);
      alert('Failed to create product');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateProduct = async (formData: FormData, productId: string) => {
    setUpdateLoading(true);
    try {
      const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        basePrice: parseFloat(formData.get('basePrice') as string),
        baseSalePrice: formData.get('baseSalePrice') ? parseFloat(formData.get('baseSalePrice') as string) : null,
        categoryId: formData.get('categoryId') as string,
        theme: formData.get('theme') as string,
        images: [formData.get('image') as string].filter(Boolean),
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEditingProduct(null);
        window.location.reload();
      } else {
        alert(`Error updating product: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Update product error:', err);
      alert('Failed to update product');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(productId);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        window.location.reload();
      } else {
        alert(`Error deleting product: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete product error:', err);
      alert('Failed to delete product');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    if (stock <= 5) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (stock <= 20) return { text: 'In Stock', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { text: 'Well Stocked', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const handleCreateVariant = async () => {
    if (!selectedProduct) return;
    setVariantLoading(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/products/${selectedProduct.id}/variants`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sku: variantFormData.sku,
          size: variantFormData.size || null,
          color: variantFormData.color || null,
          material: variantFormData.material || null,
          price: parseFloat(variantFormData.price),
          salePrice: variantFormData.salePrice ? parseFloat(variantFormData.salePrice) : null,
          stock: parseInt(variantFormData.stock),
          images: variantFormData.images ? [variantFormData.images] : [],
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setShowVariantForm(false);
        setVariantFormData({
          sku: '',
          size: '',
          color: '',
          material: '',
          price: '',
          salePrice: '',
          stock: '',
          images: ''
        });
        window.location.reload();
      } else {
        alert(`Error creating variant: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Create variant error:', err);
      alert('Failed to create variant');
    } finally {
      setVariantLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) return;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/products/variants/${variantId}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        window.location.reload();
      } else {
        alert(`Error deleting variant: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete variant error:', err);
      alert('Failed to delete variant');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">📦 Products Management</h1>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="font-bold">Loading products...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mt-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">📦 Products Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading products:</p>
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

  if (products.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">📦 Products Management</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">No products found</p>
          <p className="mt-2">The API returned no products. Check the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
            Product Management
          </h1>
          <p className="text-gray-600 mt-2 font-bold">
            Manage your inventory, stock levels, and product details
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Add Product'}
          </Button>
          {editingProduct && (
            <Button
              onClick={() => setEditingProduct(null)}
              variant="outline"
              className="border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-bold"
            >
              Cancel Edit
            </Button>
          )}
          {showVariants && (
            <Button
              onClick={() => {
                setShowVariants(false);
                setSelectedProduct(null);
                setShowVariantForm(false);
              }}
              variant="outline"
              className="border-2 border-blue-400 text-blue-700 hover:bg-blue-50 font-bold"
            >
              Close Variants
            </Button>
          )}
        </div>

        {/* Create Product Form */}
        {showCreateForm && (
          <div className="bg-white border-2 border-black p-6 mb-6">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">Add New Product</h2>
            <form action={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Category *</label>
                <select
                  name="categoryId"
                  required
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Base Price *</label>
                <input
                  type="number"
                  name="basePrice"
                  step="0.01"
                  min="0"
                  required
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Sale Price (Optional)</label>
                <input
                  type="number"
                  name="baseSalePrice"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="0.00"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="Enter product description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Image URL</label>
                <input
                  type="url"
                  name="image"
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="https://example.com/image.jpg (optional)"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider disabled:bg-gray-400"
                >
                  {createLoading ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Product Form */}
        {editingProduct && (
          <div className="bg-white border-2 border-black p-6 mb-6">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">Edit Product</h2>
            <form action={(formData) => handleUpdateProduct(formData, editingProduct.id)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingProduct.name}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Category *</label>
                <select
                  name="categoryId"
                  required
                  defaultValue={editingProduct.category.id}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Theme *</label>
                <select
                  name="theme"
                  required
                  defaultValue={(editingProduct as any).theme || 'BLACK'}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                >
                  <option value="BLACK">Black Theme (Street/Underground)</option>
                  <option value="WHITE">White Theme (Clean/Premium)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Base Price *</label>
                <input
                  type="number"
                  name="basePrice"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={editingProduct.basePrice}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Sale Price (Optional)</label>
                <input
                  type="number"
                  name="baseSalePrice"
                  step="0.01"
                  min="0"
                  defaultValue={editingProduct.baseSalePrice || ''}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="0.00"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingProduct.description}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="Enter product description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Image URL</label>
                <input
                  type="url"
                  name="image"
                  defaultValue={editingProduct.images[0] || ''}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black"
                  placeholder="https://example.com/image.jpg (optional)"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={updateLoading}
                  className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider disabled:bg-gray-400"
                >
                  {updateLoading ? 'Updating...' : 'Update Product'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Variant Management Modal */}
        {showVariants && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-black text-black uppercase tracking-tight">
                    Manage Variants: {selectedProduct.name}
                  </h2>
                  <Button
                    onClick={() => {
                      setShowVariants(false);
                      setSelectedProduct(null);
                      setShowVariantForm(false);
                    }}
                    variant="outline"
                    className="border-2 border-gray-400 text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </Button>
                </div>

                {/* Add Variant Button */}
                <div className="mb-6">
                  <Button
                    onClick={() => setShowVariantForm(!showVariantForm)}
                    className="bg-green-600 text-white hover:bg-green-700 font-black uppercase tracking-wider"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {showVariantForm ? 'Cancel' : 'Add Variant'}
                  </Button>
                </div>

                {/* Add Variant Form */}
                {showVariantForm && (
                  <div className="bg-gray-50 border-2 border-gray-300 p-6 mb-6">
                    <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Add New Variant</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">SKU *</label>
                        <input
                          type="text"
                          value={variantFormData.sku}
                          onChange={(e) => setVariantFormData({...variantFormData, sku: e.target.value})}
                          className="w-full p-3 border-2 border-gray-300 focus:border-black"
                          placeholder="SKU-001"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Size</label>
                        <input
                          type="text"
                          value={variantFormData.size}
                          onChange={(e) => setVariantFormData({...variantFormData, size: e.target.value})}
                          className="w-full p-3 border-2 border-gray-300 focus:border-black"
                          placeholder="S, M, L, XL"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Color</label>
                        <input
                          type="text"
                          value={variantFormData.color}
                          onChange={(e) => setVariantFormData({...variantFormData, color: e.target.value})}
                          className="w-full p-3 border-2 border-gray-300 focus:border-black"
                          placeholder="Red, Blue, Black"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Material</label>
                        <input
                          type="text"
                          value={variantFormData.material}
                          onChange={(e) => setVariantFormData({...variantFormData, material: e.target.value})}
                          className="w-full p-3 border-2 border-gray-300 focus:border-black"
                          placeholder="Cotton, Polyester"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variantFormData.price}
                          onChange={(e) => setVariantFormData({...variantFormData, price: e.target.value})}
                          className="w-full p-3 border-2 border-gray-300 focus:border-black"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Sale Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variantFormData.salePrice}
                          onChange={(e) => setVariantFormData({...variantFormData, salePrice: e.target.value})}
                          className="w-full p-3 border-2 border-gray-300 focus:border-black"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Stock *</label>
                        <input
                          type="number"
                          value={variantFormData.stock}
                          onChange={(e) => setVariantFormData({...variantFormData, stock: e.target.value})}
                          className="w-full p-3 border-2 border-gray-300 focus:border-black"
                          placeholder="0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-bold mb-2 uppercase tracking-wide text-sm text-gray-600">Image URL</label>
                        <input
                          type="url"
                          value={variantFormData.images}
                          onChange={(e) => setVariantFormData({...variantFormData, images: e.target.value})}
                          className="w-full p-3 border-2 border-gray-300 focus:border-black"
                          placeholder="https://example.com/variant-image.jpg"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Button
                          onClick={handleCreateVariant}
                          disabled={variantLoading || !variantFormData.sku || !variantFormData.price || !variantFormData.stock}
                          className="bg-green-600 text-white hover:bg-green-700 font-black uppercase tracking-wider disabled:bg-gray-400"
                        >
                          {variantLoading ? 'Creating...' : 'Create Variant'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Variants List */}
                <div className="space-y-4">
                  {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                    selectedProduct.variants.map((variant) => {
                      const variantStockStatus = getStockStatus(variant.stock);
                      return (
                        <div key={variant.id} className="bg-white border-2 border-gray-300 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Variant Image */}
                              <div className="w-16 h-16 bg-gray-100 border border-gray-300 flex-shrink-0">
                                {variant.images && variant.images.length > 0 ? (
                                  <img
                                    src={variant.images[0]}
                                    alt={`${variant.sku}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Palette className="h-6 w-6" />
                                  </div>
                                )}
                              </div>

                              {/* Variant Info */}
                              <div>
                                <h4 className="font-black text-lg">{variant.sku}</h4>
                                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                                  {variant.size && <div><span className="font-semibold">Size:</span> {variant.size}</div>}
                                  {variant.color && <div><span className="font-semibold">Color:</span> {variant.color}</div>}
                                  {variant.material && <div><span className="font-semibold">Material:</span> {variant.material}</div>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              {/* Price */}
                              <div className="text-center bg-gray-50 px-3 py-2 border border-gray-300">
                                <div className="font-black text-lg text-green-600">
                                  ${variant.salePrice || variant.price}
                                </div>
                                {variant.salePrice && (
                                  <div className="text-xs text-gray-500 line-through">
                                    ${variant.price}
                                  </div>
                                )}
                              </div>

                              {/* Stock */}
                              <div className={`text-center px-3 py-2 border ${variantStockStatus.color}`}>
                                <div className="font-black text-sm">{variant.stock}</div>
                                <div className="text-xs">{variantStockStatus.text}</div>
                              </div>

                              {/* Actions */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteVariant(variant.id)}
                                className="border-2 border-red-400 text-red-600 hover:bg-red-50 font-bold"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Shirt className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-bold">No variants found</p>
                      <p>Add variants to manage different sizes, colors, or materials</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid gap-4">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.totalStock || 0);
            return (
              <div key={product.id} className="bg-white border-2 border-black p-6">
                <div className="flex items-center justify-between">
                  {/* Product Details */}
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 border-2 border-gray-300 flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 className="text-xl font-black text-black uppercase tracking-tight">{product.name}</h3>
                      <p className="text-gray-600 font-bold">{product.category.name}</p>
                      {product.description && (
                        <p className="text-gray-600 mt-1 text-sm">{product.description.slice(0, 100)}{product.description.length > 100 ? '...' : ''}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">
                          {product.variants?.length || 0} Variants
                        </span>
                        {product.priceRange?.hasVariablePrice && (
                          <span className="text-green-600 font-bold">
                            ${product.priceRange.min} - ${product.priceRange.max}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price, Stock and Actions */}
                  <div className="flex items-center space-x-4">
                    {/* Base Price */}
                    <div className="text-center bg-gray-50 px-4 py-2 border-2 border-gray-300">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-600" />
                        <span className="font-black text-lg">${product.basePrice}</span>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-600">Base Price</div>
                    </div>

                    {/* Total Stock Status */}
                    <div className={`text-center px-4 py-2 border-2 ${stockStatus.color}`}>
                      <div className="flex items-center space-x-2">
                        {(product.totalStock || 0) === 0 ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                        <span className="font-black text-lg">{product.totalStock || 0}</span>
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wide">{stockStatus.text}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowVariants(true);
                        }}
                        className="border-2 border-blue-400 text-blue-700 hover:bg-blue-50 font-bold"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                        className="border-2 border-gray-400 text-gray-700 hover:bg-gray-50 font-bold"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        disabled={deleteLoading === product.id}
                        className="border-2 border-red-400 text-red-600 hover:bg-red-50 font-bold disabled:opacity-50"
                      >
                        {deleteLoading === product.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">{products.length}</div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Total Products</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              {products.filter(p => (p.totalStock || 0) === 0).length}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Out of Stock</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              {products.filter(p => (p.totalStock || 0) > 0 && (p.totalStock || 0) <= 5).length}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Low Stock</div>
          </div>
          <div className="bg-white border-2 border-black p-6">
            <div className="text-3xl font-black text-black">
              {products.reduce((sum, p) => sum + (p.variants?.length || 0), 0)}
            </div>
            <div className="text-gray-600 font-bold uppercase tracking-wide text-sm">Total Variants</div>
          </div>
        </div>
      </div>
    </div>
  );
}