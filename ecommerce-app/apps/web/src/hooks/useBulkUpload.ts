import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export interface BulkUploadResult {
  success: boolean;
  message: string;
  data: {
    createdProducts: number;
    totalProcessed: number;
    errors: string[];
  };
  products: Array<{
    id: string;
    name: string;
    category: string;
    variants: number;
  }>;
}

export function useBulkUploadProducts() {
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: async (file: File): Promise<BulkUploadResult> => {
      if (!accessToken) throw new Error('Please log in to upload products');

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/bulk-upload/products', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Successfully uploaded ${data.data.createdProducts} products!`);
      } else {
        toast.error('Upload completed with errors. Please check the results.');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to upload products';
      toast.error(message);
    },
  });
}

export function useDownloadTemplate() {
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<Blob> => {
      if (!accessToken) throw new Error('Please log in to download template');

      const response = await api.get('/bulk-upload/template', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'blob',
      });

      return response.data;
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'product-upload-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to download template';
      toast.error(message);
    },
  });
}