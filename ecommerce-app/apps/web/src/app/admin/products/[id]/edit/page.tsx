'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, handleApiResponse } from '@/lib/api';
import { Button } from '@ecommerce/ui';
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Save,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  categoryId: string;
  images: string[];
  category: Category;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  categoryId: string;
  newImages: File[];
  existingImages: string[];
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    salePrice: undefined,
    stock: 0,
    categoryId: '',
    newImages: [],
    existingImages: [],
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: async () => {
      const response = await api.get(`/products/${params.id}`);
      return handleApiResponse<{ data: Product }>(response);
    },
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return handleApiResponse<{ data: Category[] }>(response);
    },
  });

  useEffect(() => {
    if (productData?.data) {
      const product = productData.data;
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        categoryId: product.categoryId,
        newImages: [],
        existingImages: product.images,
      });
    }
  }, [productData]);

  const updateProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.name);
      formDataToSend.append('description', data.description);
      formDataToSend.append('price', data.price.toString());
      if (data.salePrice) {
        formDataToSend.append('salePrice', data.salePrice.toString());
      }
      formDataToSend.append('stock', data.stock.toString());
      formDataToSend.append('categoryId', data.categoryId);

      // Send existing images to keep
      data.existingImages.forEach((imageUrl) => {
        formDataToSend.append('existingImages', imageUrl);
      });

      // Send new images to upload
      data.newImages.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await api.put(`/products/${params.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    },
    onSuccess: () => {
      router.push('/admin/products');
    },
    onError: (error: any) => {
      console.error('Error updating product:', error);
      setErrors({ submit: 'Failed to update product. Please try again.' });
    },
  });

  const categories = categoriesData?.data || [];
  const product = productData?.data;

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = formData.existingImages.length + formData.newImages.length + files.length;

    if (totalImages > 5) {
      setErrors({ images: 'Maximum 5 images allowed' });
      return;
    }

    const newImages = [...formData.newImages, ...files];
    setFormData(prev => ({ ...prev, newImages }));

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);

    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeExistingImage = (imageUrl: string) => {
    const newExistingImages = formData.existingImages.filter(img => img !== imageUrl);
    setFormData(prev => ({ ...prev, existingImages: newExistingImages }));
  };

  const removeNewImage = (index: number) => {
    const newImages = formData.newImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreview[index]);

    setFormData(prev => ({ ...prev, newImages }));
    setImagePreview(newPreviews);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (formData.salePrice && formData.salePrice >= formData.price) {
      newErrors.salePrice = 'Sale price must be less than regular price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateProduct.mutate(formData);
    }
  };

  if (productLoading || categoriesLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
            <p className="mt-4 text-lg font-bold">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/admin/products">
            <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/products" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight">Edit Product</h1>
        <p className="text-gray-600 mt-2 font-bold">
          Update product information and images
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Product Name */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-xl font-black mb-4 uppercase tracking-tight">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1 font-bold">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none resize-none"
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1 font-bold">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category: Category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-600 text-sm mt-1 font-bold">{errors.categoryId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-xl font-black mb-4 uppercase tracking-tight">Pricing & Inventory</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Regular Price * ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-red-600 text-sm mt-1 font-bold">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Sale Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salePrice || ''}
                    onChange={(e) => handleInputChange('salePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="0.00"
                  />
                  {errors.salePrice && (
                    <p className="text-red-600 text-sm mt-1 font-bold">{errors.salePrice}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="text-red-600 text-sm mt-1 font-bold">{errors.stock}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-xl font-black mb-4 uppercase tracking-tight">Product Images</h2>

              {/* Existing Images */}
              {formData.existingImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3 uppercase tracking-wide">Current Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square border-2 border-black">
                          <img
                            src={imageUrl}
                            alt={`Current ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imageUrl)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Add More Images (Max 5 total)
                </label>
                <div className="border-2 border-dashed border-black p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={formData.existingImages.length + formData.newImages.length >= 5}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center ${
                      formData.existingImages.length + formData.newImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="font-bold text-gray-600">
                      {formData.existingImages.length + formData.newImages.length >= 5 ? 'Maximum images reached' : 'Click to upload more images'}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      PNG, JPG up to 10MB each
                    </span>
                  </label>
                </div>
                {errors.images && (
                  <p className="text-red-600 text-sm mt-1 font-bold">{errors.images}</p>
                )}
              </div>

              {/* New Image Preview */}
              {imagePreview.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 uppercase tracking-wide">New Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square border-2 border-black">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <p className="text-red-600 font-bold">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <Button
            type="submit"
            disabled={updateProduct.isPending}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-8 py-4"
          >
            <Save className="h-5 w-5 mr-2" />
            {updateProduct.isPending ? 'Updating...' : 'Update Product'}
          </Button>

          <Link href="/admin/products">
            <Button
              type="button"
              variant="outline"
              className="border-2 border-black font-black uppercase tracking-wider px-8 py-4"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}