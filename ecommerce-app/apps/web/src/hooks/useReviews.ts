import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isHelpful: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: ReviewSummary;
}

// Get reviews for a product
export function useProductReviews(productId: string, options?: {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}) {
  const { page = 1, limit = 10, sort = 'newest' } = options || {};

  return useQuery({
    queryKey: ['productReviews', productId, page, limit, sort],
    queryFn: async (): Promise<ReviewsResponse> => {
      const response = await api.get(`/reviews/product/${productId}`, {
        params: { page, limit, sort }
      });
      return response.data.data;
    },
    enabled: !!productId,
    staleTime: 30000, // 30 seconds
  });
}

// Create a review
export function useCreateReview() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: {
      productId: string;
      rating: number;
      title?: string;
      comment?: string;
      images?: string[];
    }) => {
      if (!accessToken) throw new Error('Please log in to write a review');

      console.log('Sending review data:', reviewData);
      console.log('Access token:', accessToken);

      const response = await api.post('/reviews', reviewData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate product reviews
      queryClient.invalidateQueries({ queryKey: ['productReviews', variables.productId] });

      // Show success message
      toast.success('Review submitted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to submit review';
      toast.error(message);
    },
  });
}

// Update a review
export function useUpdateReview() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, ...reviewData }: {
      reviewId: string;
      rating?: number;
      title?: string;
      comment?: string;
      images?: string[];
    }) => {
      if (!accessToken) throw new Error('Please log in to update review');

      const response = await api.put(`/reviews/${reviewId}`, reviewData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });

      toast.success('Review updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update review';
      toast.error(message);
    },
  });
}

// Delete a review
export function useDeleteReview() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!accessToken) throw new Error('Please log in to delete review');

      const response = await api.delete(`/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate reviews queries
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });

      toast.success('Review deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete review';
      toast.error(message);
    },
  });
}

// Mark review as helpful
export function useMarkReviewHelpful() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!accessToken) throw new Error('Please log in to mark reviews as helpful');

      const response = await api.post(`/reviews/${reviewId}/helpful`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate reviews to refresh helpful counts
      queryClient.invalidateQueries({ queryKey: ['productReviews'] });

      toast.success('Thank you for your feedback!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to mark review as helpful';
      toast.error(message);
    },
  });
}