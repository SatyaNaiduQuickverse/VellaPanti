'use client';

import { Star, ThumbsUp, Shield } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useMarkReviewHelpful } from '@/hooks/useReviews';
import { useAuthStore } from '@/stores/authStore';
import type { Review } from '@/hooks/useReviews';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { isAuthenticated } = useAuthStore();
  const markHelpful = useMarkReviewHelpful();

  const handleMarkHelpful = () => {
    if (!isAuthenticated()) {
      return;
    }
    markHelpful.mutate(review.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 bg-white p-4 space-y-3 rounded-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 text-white flex items-center justify-center font-semibold text-sm rounded-full">
            {review.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-black text-sm">
              {review.user.name}
            </h4>
            <p className="text-xs text-gray-500">
              {formatDate(review.createdAt)}
            </p>
          </div>
          {review.isVerified && (
            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 text-xs font-medium rounded-md">
              <Shield className="h-3 w-3" />
              Verified
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < review.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h5 className="font-semibold text-black text-sm">
          {review.title}
        </h5>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 text-xs leading-relaxed">
          {review.comment}
        </p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="w-16 h-16 object-cover border border-gray-200 rounded-md"
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <Button
          onClick={handleMarkHelpful}
          variant="outline"
          size="sm"
          disabled={!isAuthenticated() || markHelpful.isPending}
          className="flex items-center gap-1 text-xs font-medium border-gray-300 hover:bg-gray-100"
        >
          <ThumbsUp className="h-3 w-3" />
          Helpful ({review.isHelpful})
        </Button>

        {!isAuthenticated() && (
          <p className="text-xs text-gray-400">Login to mark helpful</p>
        )}
      </div>
    </div>
  );
}