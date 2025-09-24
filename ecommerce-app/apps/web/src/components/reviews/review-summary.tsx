'use client';

import { Star } from 'lucide-react';
import type { ReviewSummary } from '@/hooks/useReviews';

interface ReviewSummaryProps {
  summary: ReviewSummary;
}

export function ReviewSummaryComponent({ summary }: ReviewSummaryProps) {
  const { averageRating, totalReviews, distribution } = summary;

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  if (totalReviews === 0) {
    return (
      <div className="border-2 border-black bg-white p-6 text-center">
        <h3 className="font-black text-black text-lg uppercase tracking-wider mb-2">
          No Reviews Yet
        </h3>
        <p className="text-gray-600 text-sm font-bold">
          Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white p-6">
      <h3 className="font-black text-black text-lg uppercase tracking-wider mb-6">
        Customer Reviews
      </h3>

      <div className="flex items-start gap-8">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-4xl font-black text-black mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`h-5 w-5 ${
                  index < Math.floor(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : index < averageRating
                    ? 'fill-yellow-200 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm font-bold text-gray-600">
            Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars as keyof typeof distribution];
            const percentage = getPercentage(count);

            return (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="font-bold text-black w-6">
                  {stars}
                </span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 h-2 relative">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="font-bold text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}