'use client';

import { useState } from 'react';
import { Button } from '@ecommerce/ui';
import { useProductReviews } from '@/hooks/useReviews';
import { ReviewCard } from './review-card';
import { ReviewSummaryComponent } from './review-summary';
import { ReviewForm } from './review-form';

interface ReviewsListProps {
  productId: string;
}

export function ReviewsList({ productId }: ReviewsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [page, setPage] = useState(1);

  const { data: reviewsData, isLoading, error } = useProductReviews(productId, {
    page,
    limit: 10,
    sort,
  });

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
    { value: 'helpful', label: 'Most Helpful' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-2 border-black bg-white p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 w-1/3"></div>
            <div className="h-4 bg-gray-200 w-2/3"></div>
            <div className="h-4 bg-gray-200 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-500 bg-red-50 p-6 text-center">
        <p className="text-red-700 font-bold">
          Failed to load reviews. Please try again later.
        </p>
      </div>
    );
  }

  if (!reviewsData) {
    return null;
  }

  const { reviews, pagination, summary } = reviewsData;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <ReviewSummaryComponent summary={summary} />

      {/* Write Review Button */}
      <div className="text-center">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white hover:bg-white hover:text-black border border-black font-semibold py-2 px-4 text-xs uppercase tracking-wider transition-all"
          size="sm"
        >
          {showForm ? 'Hide Form' : 'Write Review'}
        </Button>
      </div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {/* Sort Controls */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-black text-sm uppercase tracking-wider">
              Reviews ({summary.totalReviews})
            </h3>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as any);
                setPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md font-medium text-xs focus:outline-none focus:ring-1 focus:ring-black"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outline"
                size="sm"
                className="border border-gray-300 font-medium text-xs"
              >
                Previous
              </Button>

              <span className="font-medium text-black text-xs">
                {page}/{pagination.pages}
              </span>

              <Button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                variant="outline"
                size="sm"
                className="border border-gray-300 font-medium text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No Reviews State */}
      {reviews.length === 0 && summary.totalReviews === 0 && (
        <div className="border border-gray-200 bg-gray-50 p-4 text-center rounded-lg">
          <h3 className="font-semibold text-black text-sm uppercase tracking-wider mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600 text-xs mb-3">
            Be the first to share your thoughts!
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-black text-white hover:bg-gray-800 font-medium py-2 px-4 text-xs uppercase tracking-wider transition-all"
            size="sm"
          >
            Write First Review
          </Button>
        </div>
      )}
    </div>
  );
}