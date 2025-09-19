'use client';

import { useState } from 'react';
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
  description?: string;
  image?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
  image?: File;
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentId: '',
    image: undefined,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return handleApiResponse<{ data: Category[] }>(response);
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.name);
      formDataToSend.append('description', data.description);
      if (data.parentId) {
        formDataToSend.append('parentId', data.parentId);
      }
      if (data.image) {
        formDataToSend.append('image', data.image);
      }

      const response = await api.post('/categories', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse(response);
    },
    onSuccess: () => {
      router.push('/admin/categories');
    },
    onError: (error: any) => {
      console.error('Error creating category:', error);
      setErrors({ submit: 'Failed to create category. Please try again.' });
    },
  });

  const categories = categoriesData?.data || [];
  // Only show root categories as parent options
  const rootCategories = categories.filter((cat: Category) => !cat.parentId);

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setFormData(prev => ({ ...prev, image: undefined }));
    setImagePreview('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createCategory.mutate(formData);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
            <p className="mt-4 text-lg font-bold">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/categories" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight">Add New Category</h1>
        <p className="text-gray-600 mt-2 font-bold">
          Create a new category to organize your products
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-xl font-black mb-4 uppercase tracking-tight">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                  placeholder="Enter category name"
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
                  placeholder="Enter category description"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1 font-bold">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                  Parent Category (Optional)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => handleInputChange('parentId', e.target.value)}
                  className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none"
                >
                  <option value="">None (Root Category)</option>
                  {rootCategories.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  Select a parent category to create a subcategory
                </p>
              </div>
            </div>
          </div>

          {/* Category Image */}
          <div className="bg-white border-2 border-black p-6">
            <h2 className="text-xl font-black mb-4 uppercase tracking-tight">Category Image</h2>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Upload Image (Optional)
              </label>
              <div className="border-2 border-dashed border-black p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="font-bold text-gray-600">
                    Click to upload category image
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    PNG, JPG up to 10MB
                  </span>
                </label>
              </div>
              {errors.image && (
                <p className="text-red-600 text-sm mt-1 font-bold">{errors.image}</p>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview ? (
              <div>
                <h3 className="font-bold mb-3 uppercase tracking-wide">Image Preview</h3>
                <div className="relative w-64 h-64 border-2 border-black">
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-gray-200 bg-gray-50">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-bold">No image uploaded yet</p>
              </div>
            )}
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
            disabled={createCategory.isPending}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-8 py-4"
          >
            <Save className="h-5 w-5 mr-2" />
            {createCategory.isPending ? 'Creating...' : 'Create Category'}
          </Button>

          <Link href="/admin/categories">
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