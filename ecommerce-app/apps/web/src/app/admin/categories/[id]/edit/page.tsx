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
  description: string;
  parentId?: string;
  image?: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
  newImage?: File;
  existingImage?: string;
}

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentId: '',
    newImage: undefined,
    existingImage: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', params.id],
    queryFn: async () => {
      const response = await api.get(`/categories/${params.id}`);
      return handleApiResponse<{ data: Category }>(response);
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
    if (categoryData?.data) {
      const category = categoryData.data;
      setFormData({
        name: category.name,
        description: category.description,
        parentId: category.parentId || '',
        existingImage: category.image || '',
      });
    }
  }, [categoryData]);

  const updateCategory = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.name);
      formDataToSend.append('description', data.description);
      if (data.parentId) {
        formDataToSend.append('parentId', data.parentId);
      }
      if (data.existingImage) {
        formDataToSend.append('existingImage', data.existingImage);
      }
      if (data.newImage) {
        formDataToSend.append('image', data.newImage);
      }

      const response = await api.put(`/categories/${params.id}`, formDataToSend, {
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
      console.error('Error updating category:', error);
      setErrors({ submit: 'Failed to update category. Please try again.' });
    },
  });

  const categories = categoriesData?.data || [];
  const category = categoryData?.data;

  // Only show root categories as parent options, excluding current category and its children
  const rootCategories = categories.filter((cat: Category) =>
    !cat.parentId && cat.id !== params.id
  );

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, newImage: file }));
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeExistingImage = () => {
    setFormData(prev => ({ ...prev, existingImage: '' }));
  };

  const removeNewImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setFormData(prev => ({ ...prev, newImage: undefined }));
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
      updateCategory.mutate(formData);
    }
  };

  if (categoryLoading || categoriesLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
            <p className="mt-4 text-lg font-bold">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Category Not Found</h2>
          <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
          <Link href="/admin/categories">
            <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider">
              Back to Categories
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
        <Link href="/admin/categories" className="inline-flex items-center text-black hover:text-gray-600 font-bold uppercase tracking-wide mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight">Edit Category</h1>
        <p className="text-gray-600 mt-2 font-bold">
          Update category information and image
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
                  {rootCategories.map((cat: Category) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
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

            {/* Current Image */}
            {formData.existingImage && (
              <div className="mb-6">
                <h3 className="font-bold mb-3 uppercase tracking-wide">Current Image</h3>
                <div className="relative w-64 h-64 border-2 border-black">
                  <img
                    src={formData.existingImage}
                    alt="Current category image"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeExistingImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                {formData.existingImage ? 'Replace Image' : 'Upload Image (Optional)'}
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
                    Click to upload new image
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

            {/* New Image Preview */}
            {imagePreview && (
              <div>
                <h3 className="font-bold mb-3 uppercase tracking-wide">New Image Preview</h3>
                <div className="relative w-64 h-64 border-2 border-black">
                  <img
                    src={imagePreview}
                    alt="New category preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {!formData.existingImage && !imagePreview && (
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
            disabled={updateCategory.isPending}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-8 py-4"
          >
            <Save className="h-5 w-5 mr-2" />
            {updateCategory.isPending ? 'Updating...' : 'Update Category'}
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