'use client';

import { X } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import type { Product } from '@ecommerce/types';
import { useState, useEffect, useMemo, memo } from 'react';

interface SizeSelectionModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (variantId: string) => void;
  isLoading?: boolean;
}

const SizeSelectionModalComponent = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isLoading = false,
}: SizeSelectionModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Memoize available variants calculation - MUST be before early return
  const availableVariants = useMemo(() => {
    if (!product.variants) return [];
    return product.variants.filter(v => v.stock > 0);
  }, [product.variants]);

  const hasColors = product.variantOptions?.colors && product.variantOptions.colors.length > 0;
  const hasSizes = product.variantOptions?.sizes && product.variantOptions.sizes.length > 0;

  useEffect(() => {
    if (isOpen) {
      // Reset selections when modal opens
      setSelectedSize('');
      setSelectedColor('');
      // Lock body scroll and prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Unlock body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Check if a size is available based on selected color
  const isSizeAvailable = (size: string) => {
    if (!selectedColor) {
      return availableVariants.some(v => v.size === size);
    }
    return availableVariants.some(v => v.size === size && v.color === selectedColor);
  };

  // Check if a color is available based on selected size
  const isColorAvailable = (color: string) => {
    if (!selectedSize) {
      return availableVariants.some(v => v.color === color);
    }
    return availableVariants.some(v => v.color === color && v.size === selectedSize);
  };

  // Get the selected variant ID
  const getSelectedVariantId = () => {
    if (!product.variants) return null;

    if (hasColors && hasSizes) {
      // Both color and size required
      if (!selectedColor || !selectedSize) return null;
      const variant = product.variants.find(
        v => v.color === selectedColor && v.size === selectedSize && v.stock > 0
      );
      return variant?.id || null;
    } else if (hasSizes) {
      // Only size required
      if (!selectedSize) return null;
      const variant = product.variants.find(v => v.size === selectedSize && v.stock > 0);
      return variant?.id || null;
    } else if (hasColors) {
      // Only color required
      if (!selectedColor) return null;
      const variant = product.variants.find(v => v.color === selectedColor && v.stock > 0);
      return variant?.id || null;
    }

    return null;
  };

  const selectedVariantId = getSelectedVariantId();

  const handleAddToCart = () => {
    if (!selectedVariantId) return;
    onAddToCart(selectedVariantId);
  };

  // Handle click on backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      style={{
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 sm:p-5 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
            Select Options
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Product Info */}
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                {product.name}
              </h3>
              <p className="text-lg font-bold text-gray-900 mt-1">
                ₹{(() => {
                  if (product.variants?.[0]) {
                    return (product.variants[0].salePrice || product.variants[0].price || 0).toFixed(2);
                  }
                  return (product.baseSalePrice || product.basePrice || 0).toFixed(2);
                })()}
              </p>
            </div>
          </div>

          {/* Color Selection */}
          {hasColors && (
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-900">
                Color: {selectedColor && <span className="bg-black text-white px-2 py-1 rounded-md text-xs ml-2">{selectedColor}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {(product.variantOptions?.colors ?? []).map((color) => {
                  const isAvailable = isColorAvailable(color);
                  const isSelected = selectedColor === color;

                  return (
                    <button
                      key={color}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedColor(color);
                          // Reset size if current size is not available with new color
                          if (selectedSize && !availableVariants.some(v => v.color === color && v.size === selectedSize)) {
                            setSelectedSize('');
                          }
                        }
                      }}
                      disabled={!isAvailable}
                      className={`px-4 py-2 border-2 rounded-xl text-sm font-bold transition-all duration-300 min-w-[5rem] ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-lg transform scale-105'
                          : isAvailable
                          ? 'border-gray-300 bg-white text-gray-900 hover:border-black hover:shadow-md'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {hasSizes && (
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-900">
                Size: {selectedSize && <span className="bg-black text-white px-2 py-1 rounded-md text-xs ml-2">{selectedSize}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {(product.variantOptions?.sizes ?? []).map((size) => {
                  const isAvailable = isSizeAvailable(size);
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSize(size);
                          // Reset color if current color is not available with new size
                          if (selectedColor && !availableVariants.some(v => v.size === size && v.color === selectedColor)) {
                            setSelectedColor('');
                          }
                        }
                      }}
                      disabled={!isAvailable}
                      className={`px-6 py-3 border-2 rounded-2xl text-sm font-bold transition-all duration-300 min-w-[4rem] hover:scale-105 ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-lg transform scale-105'
                          : isAvailable
                          ? 'border-gray-300 bg-white text-gray-900 hover:border-black hover:shadow-md'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No variants case */}
          {!hasColors && !hasSizes && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                This product has no size or color options.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-5 rounded-b-2xl">
          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariantId || isLoading}
            className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-3 sm:py-4 transition-all duration-300 uppercase tracking-wide text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            {isLoading ? 'ADDING TO CART...' : 'ADD TO CART'}
          </Button>
          {(hasColors || hasSizes) && !selectedVariantId && (
            <p className="text-xs sm:text-sm text-red-600 text-center mt-2 font-medium">
              Please select {hasColors && !selectedColor ? 'a color' : ''}{hasColors && hasSizes && (!selectedColor || !selectedSize) ? ' and ' : ''}{hasSizes && !selectedSize ? 'a size' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export const SizeSelectionModal = memo(SizeSelectionModalComponent);
