'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useCreateReview } from '@/hooks/useReviews';
import { useAuthStore } from '@/stores/authStore';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { isAuthenticated } = useAuthStore();
  const createReview = useCreateReview();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      return;
    }

    if (!rating) {
      return;
    }

    createReview.mutate({
      productId,
      rating,
      title: title.trim() || undefined,
      comment: comment.trim() || undefined,
    }, {
      onSuccess: () => {
        setRating(0);
        setTitle('');
        setComment('');
        onSuccess?.();
      }
    });
  };

  if (!isAuthenticated()) {
    return (
      <div className="border-2 border-black bg-gray-50 p-6 text-center">
        <h3 className="font-black text-black text-lg uppercase tracking-wider mb-2">
          Write a Review
        </h3>
        <p className="text-gray-600 text-sm font-bold">
          Please log in to write a review for this product.
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white p-6">
      <h3 className="font-black text-black text-lg uppercase tracking-wider mb-6">
        Write a Review
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-bold text-gray-600">
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
            Review Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your review"
            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium text-sm"
            maxLength={100}
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
            Your Review (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience with this product..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium text-sm resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!rating || createReview.isPending}
          className="w-full bg-black text-white hover:bg-white hover:text-black border-2 border-black font-black py-3 transition-all duration-300 uppercase tracking-wider text-sm"
        >
          {createReview.isPending ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
        </Button>
      </form>
    </div>
  );
}