'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, ChevronRight, Plus, Minus, Heart, Shield, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import { ReviewsList } from '@/components/reviews/reviews-list';
import { ProductCard } from '@/components/products/product-card';
import toast from 'react-hot-toast';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  const { data: product, isLoading, error, isError } = useProduct(params.slug);

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Product page state:', {
      slug: params.slug,
      isLoading,
      isError,
      hasProduct: !!product,
      error: error?.message
    });
  }
  const { data: recommendedData } = useProducts({ limit: 4, sort: 'createdAt', sortOrder: 'desc' });
  const { isAuthenticated } = useAuthStore();
  const addToCart = useAddToCart();

  const recommendedProducts = recommendedData?.data?.filter(p => p.id !== product?.id)?.slice(0, 4) || [];

  // Auto-select first available options if none selected
  useEffect(() => {
    if (product?.variants?.length && !selectedColor && !selectedSize) {
      const firstVariant = product.variants[0];
      setSelectedColor(firstVariant.color || '');
      setSelectedSize(firstVariant.size || '');
    }
  }, [product?.variants, selectedColor, selectedSize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-6">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-lg"></div>
                <div className="flex gap-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                </div>
                <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
                <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Product page error:', error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Find the current variant based on selected options
  const currentVariant = product.variants?.find(variant =>
    (!selectedColor || variant.color === selectedColor) &&
    (!selectedSize || variant.size === selectedSize)
  );

  // Get images to display (variant images if available, otherwise product images)
  const displayImages = currentVariant?.images?.length > 0
    ? currentVariant.images
    : product.images;

  // Get the current price and stock from variant or product base
  const getCurrentPrice = () => {
    if (currentVariant) {
      return currentVariant.salePrice || currentVariant.price || 0;
    }
    if (product.priceRange) {
      return product.priceRange.saleMin || product.priceRange.min || 0;
    }
    return product.baseSalePrice || product.basePrice || 0;
  };

  const getOriginalPrice = () => {
    if (currentVariant) {
      return currentVariant.price || 0;
    }
    if (product.priceRange) {
      return product.priceRange.max || 0;
    }
    return product.basePrice || 0;
  };

  const getCurrentStock = () => {
    if (currentVariant) {
      return currentVariant.stock;
    }
    return product.totalStock || 0;
  };

  const displayPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const currentStock = getCurrentStock();
  const hasDiscount = currentVariant?.salePrice && currentVariant.salePrice < currentVariant.price;
  const discountPercentage = hasDiscount
    ? Math.round(((currentVariant.price - currentVariant.salePrice!) / currentVariant.price) * 100)
    : 0;

  const handleVariantChange = (type: 'color' | 'size', value: string) => {
    // Reset image selection when variant changes
    setSelectedImage(0);

    if (type === 'color') {
      setSelectedColor(value);
      // Reset size if the new color doesn't have the current size
      if (selectedSize) {
        const hasSize = product.variants?.some(v => v.color === value && v.size === selectedSize);
        if (!hasSize) {
          setSelectedSize('');
        }
      }
    } else {
      setSelectedSize(value);
      // Reset color if the new size doesn't have the current color
      if (selectedColor) {
        const hasColor = product.variants?.some(v => v.size === value && v.color === selectedColor);
        if (!hasColor) {
          setSelectedColor('');
        }
      }
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      toast.error('Please login to add items to cart');
      return;
    }

    // Check if variant selection is required but not made
    if (product.variants?.length > 1 && !currentVariant) {
      toast.error('Please select all product options');
      return;
    }

    if (quantity > currentStock) {
      toast.error('Not enough stock available');
      return;
    }

    addToCart.mutate({
      productId: product.id,
      productVariantId: currentVariant?.id,
      quantity,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-4 bg-white rounded-lg px-4 py-2 shadow-sm border">
          <Link href="/" className="hover:text-black font-medium text-gray-600 transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link href="/products" className="hover:text-black font-medium text-gray-600 transition-colors">Products</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {product.category && (
            <>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-black font-medium text-gray-600 transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </>
          )}
          <span className="text-black font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg shadow-lg bg-white border">
              {(() => {
                const imageUrl = displayImages?.[selectedImage] || product.images?.[selectedImage];

                // Convert ibb.co sharing URLs to direct image URLs
                const getDirectImageUrl = (url: string) => {
                  if (!url) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=1200&q=95&fit=crop&auto=format';

                  // If it's already a direct ibb.co URL, use it
                  if (url.includes('i.ibb.co/')) {
                    return url;
                  }

                  // Convert ibb.co sharing URL to direct URL
                  if (url.includes('ibb.co/') && !url.includes('i.ibb.co/')) {
                    // Extract the image ID from URL like https://ibb.co/abcd123
                    const match = url.match(/ibb\.co\/([a-zA-Z0-9]+)/);
                    if (match && match[1]) {
                      // Convert to direct URL format: https://i.ibb.co/imageId/filename.jpg
                      // We'll use a generic filename since we don't have the original
                      return `https://i.ibb.co/${match[1]}/image.jpg`;
                    }
                  }

                  return url;
                };

                const finalUrl = getDirectImageUrl(imageUrl);

                return (
                  <img
                    src={finalUrl}
                    alt={`${product.name}${currentVariant ? ` - ${currentVariant.color} ${currentVariant.size}` : ''}`}
                    className="w-full h-full object-cover hover:scale-110 transition-all duration-700 ease-out"
                    style={{
                      imageRendering: 'auto',
                      filter: 'contrast(1.1) saturate(1.1) brightness(1.02)'
                    }}
                    onError={(e) => {
                      // Fallback to high-quality placeholder
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=1200&q=95&fit=crop&auto=format';
                    }}
                  />
                );
              })()}

              {/* Floating Elements */}
              {hasDiscount && (
                <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg animate-pulse">
                  {discountPercentage}% OFF
                </div>
              )}

              <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer">
                <Heart className="h-5 w-5 text-gray-700 hover:text-red-500 transition-colors" />
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                  <div className="text-center">
                    <span className="text-white text-2xl font-bold block">Out of Stock</span>
                    <span className="text-white/80 text-sm">Notify me when available</span>
                  </div>
                </div>
              )}
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 relative rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-black shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {(() => {
                      // Convert ibb.co sharing URLs to direct image URLs
                      const getDirectImageUrl = (url: string) => {
                        if (!url) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=95&fit=crop&auto=format';

                        // If it's already a direct ibb.co URL, use it
                        if (url.includes('i.ibb.co/')) {
                          return url;
                        }

                        // Convert ibb.co sharing URL to direct URL
                        if (url.includes('ibb.co/') && !url.includes('i.ibb.co/')) {
                          // Extract the image ID from URL like https://ibb.co/abcd123
                          const match = url.match(/ibb\.co\/([a-zA-Z0-9]+)/);
                          if (match && match[1]) {
                            // Convert to direct URL format: https://i.ibb.co/imageId/filename.jpg
                            // We'll use a generic filename since we don't have the original
                            return `https://i.ibb.co/${match[1]}/image.jpg`;
                          }
                        }

                        return url;
                      };

                      const thumbUrl = getDirectImageUrl(image);

                      return (
                        <img
                          src={thumbUrl}
                          alt={`${product.name} ${index + 1}${currentVariant ? ` - ${currentVariant.color}` : ''}`}
                          className="w-full h-full object-cover"
                          style={{
                            imageRendering: 'auto',
                            filter: 'contrast(1.1) saturate(1.1) brightness(1.02)'
                          }}
                          onError={(e) => {
                            // Fallback to high-quality placeholder
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&q=95&fit=crop&auto=format';
                          }}
                        />
                      );
                    })()}
                  </button>
                ))}
              </div>
            )}

            {/* Size Chart - Moved to left column */}
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 tracking-tight">Size Chart</h3>
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src="/size-chart.png"
                  alt="VellaPanti Size Chart - Measurements for T-shirts, Hoodies, Jeans and Shoes"
                  width={600}
                  height={400}
                  className="w-full h-auto max-w-full object-contain"
                  priority={false}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                All measurements are in inches. For the best fit, please measure yourself and compare with our size chart.
                If you&apos;re between sizes, we recommend sizing up for a comfortable fit.
              </p>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-md border">
              <h1 className="text-2xl font-semibold mb-3 text-gray-900 leading-tight tracking-tight">{product.name}</h1>
            
              {/* Rating */}
              {product.averageRating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < Math.floor(product.averageRating!)
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">{(product.averageRating || 0).toFixed(1)}</span>
                    <span className="text-gray-600 ml-1">({product.reviewCount || 0} reviews)</span>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  {product.priceRange?.hasVariablePrice ? (
                    <div>
                      <span className="text-2xl font-bold text-black">
                        ₹{(displayPrice || 0).toFixed(2)}
                      </span>
                      {!currentVariant && product.priceRange?.max && (
                        <span className="text-lg text-gray-600 ml-2">
                          - ₹{product.priceRange.max.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-black">
                      ₹{(displayPrice || 0).toFixed(2)}
                    </span>
                  )}
                  {hasDiscount && currentVariant && (
                    <div className="flex flex-col items-start">
                      <span className="text-lg text-gray-500 line-through">
                        ₹{(currentVariant.price || 0).toFixed(2)}
                      </span>
                      <div className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-md">
                        SAVE {discountPercentage}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Variant Options */}
              {product.variantOptions && (
                <div className="space-y-4">
                  {/* Color Selection */}
                  {product.variantOptions.colors.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-semibold mb-2 text-gray-900">
                        Color: {selectedColor && <span className="bg-black text-white px-2 py-1 rounded-md text-xs ml-2">{selectedColor}</span>}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.variantOptions.colors.map((color) => {
                          const isAvailable = product.variants?.some(v =>
                            v.color === color && (!selectedSize || v.size === selectedSize) && v.stock > 0
                          );
                          const isSelected = selectedColor === color;

                          return (
                            <button
                              key={color}
                              onClick={() => handleVariantChange('color', color)}
                              disabled={!isAvailable}
                              className={`px-6 py-3 border-2 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 ${
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
                  {product.variantOptions.sizes.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-semibold mb-2 text-gray-900">
                        Size: {selectedSize && <span className="bg-black text-white px-2 py-1 rounded-md text-xs ml-2">{selectedSize}</span>}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.variantOptions.sizes.map((size) => {
                          const isAvailable = product.variants?.some(v =>
                            v.size === size && (!selectedColor || v.color === selectedColor) && v.stock > 0
                          );
                          const isSelected = selectedSize === size;

                          return (
                            <button
                              key={size}
                              onClick={() => handleVariantChange('size', size)}
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
                </div>
              )}

              {/* Stock Status & Features */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                  {currentStock > 0 ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <span className="text-green-700 font-semibold block text-xs">In Stock</span>
                        <span className="text-green-600 text-xs">{currentStock} left</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-semibold text-xs">Out of Stock</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="text-blue-700 font-semibold block text-xs">Delivery</span>
                    <span className="text-blue-600 text-xs">By Oct 2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart - Moved above description */}
            {currentStock > 0 && (
              <div className="bg-white rounded-lg p-3 shadow-sm border space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 tracking-tight">Quantity</label>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg w-fit">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 rounded-lg border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all bg-white"
                    >
                      <Minus className="h-4 w-4 text-black hover:text-white" />
                    </Button>
                    <input
                      type="number"
                      min="1"
                      max={currentStock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(currentStock, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border-2 border-gray-300 rounded-lg py-2 text-sm font-semibold focus:border-black focus:outline-none transition-colors bg-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      disabled={quantity >= currentStock}
                      className="h-10 w-10 rounded-lg border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all bg-white"
                    >
                      <Plus className="h-4 w-4 text-black hover:text-white" />
                    </Button>
                  </div>
                </div>

                {/* Premium Features */}
                <div className="grid grid-cols-3 gap-2 py-2">
                  <div className="flex flex-col items-center gap-1 p-2 bg-blue-50 rounded-lg">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700 tracking-tight">Secure</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-green-50 rounded-lg">
                    <RefreshCw className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700 tracking-tight">Exchange</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-purple-50 rounded-lg">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700 tracking-tight">Quality</span>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending || (product.variants?.length > 1 && !currentVariant)}
                  className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition-all text-sm"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {addToCart.isPending
                    ? 'Adding...'
                    : (product.variants?.length > 1 && !currentVariant)
                    ? 'Select options first'
                    : `Add to Cart • ₹${((displayPrice || 0) * quantity).toFixed(2)}`
                  }
                </Button>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 tracking-tight">Description</h3>
              <p className="text-gray-700 leading-relaxed text-base font-normal">{product.description}</p>
            </div>


            {/* Product Details */}
            {(product.aboutItems || product.materialComposition || product.manufacturer) && (
              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <h3 className="text-sm font-medium mb-2 text-gray-900 tracking-tight">Product Details</h3>
                <div className="space-y-3">
                  {product.aboutItems && product.aboutItems.length > 0 && (
                    <div className="bg-gray-50 rounded-md p-2">
                      <h4 className="font-medium mb-1 text-xs text-gray-900 tracking-tight">About this item</h4>
                      <ul className="space-y-1">
                        {product.aboutItems.map((item, index) => (
                          <li key={index} className="text-xs text-gray-700 flex items-start font-normal">
                            <span className="w-1 h-1 bg-black rounded-full mr-2 mt-1 flex-shrink-0"></span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {product.materialComposition && (
                      <div className="bg-blue-50 p-2 rounded-md border border-blue-200">
                        <span className="font-medium text-blue-900 block text-xs tracking-tight">Material</span>
                        <span className="text-blue-700 text-xs font-normal">{product.materialComposition}</span>
                      </div>
                    )}
                    {product.fitType && (
                      <div className="bg-green-50 p-2 rounded-md border border-green-200">
                        <span className="font-medium text-green-900 block text-xs tracking-tight">Fit</span>
                        <span className="text-green-700 text-xs font-normal">{product.fitType}</span>
                      </div>
                    )}
                    {product.sleeveType && (
                      <div className="bg-purple-50 p-2 rounded-md border border-purple-200">
                        <span className="font-medium text-purple-900 block text-xs tracking-tight">Sleeve</span>
                        <span className="text-purple-700 text-xs font-normal">{product.sleeveType}</span>
                      </div>
                    )}
                    {product.collarStyle && (
                      <div className="bg-pink-50 p-2 rounded-md border border-pink-200">
                        <span className="font-medium text-pink-900 block text-xs tracking-tight">Collar</span>
                        <span className="text-pink-700 text-xs font-normal">{product.collarStyle}</span>
                      </div>
                    )}
                    {product.length && (
                      <div className="bg-yellow-50 p-2 rounded-md border border-yellow-200">
                        <span className="font-medium text-yellow-900 block text-xs tracking-tight">Length</span>
                        <span className="text-yellow-700 text-xs font-normal">{product.length}</span>
                      </div>
                    )}
                    {product.neckStyle && (
                      <div className="bg-indigo-50 p-2 rounded-md border border-indigo-200">
                        <span className="font-medium text-indigo-900 block text-xs tracking-tight">Neck</span>
                        <span className="text-indigo-700 text-xs font-normal">{product.neckStyle}</span>
                      </div>
                    )}
                    {product.countryOfOrigin && (
                      <div className="bg-red-50 p-2 rounded-md border border-red-200">
                        <span className="font-medium text-red-900 block text-xs tracking-tight">Origin</span>
                        <span className="text-red-700 text-xs font-normal">{product.countryOfOrigin}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  {(product.manufacturer || product.itemWeight || product.itemDimensions) && (
                    <div className="bg-gray-50 rounded-md p-2">
                      <h4 className="font-medium mb-1 text-xs text-gray-900 tracking-tight">Additional Info</h4>
                      <div className="space-y-1">
                        {product.manufacturer && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 text-xs tracking-tight">Manufacturer:</span>
                            <span className="text-gray-600 text-xs font-normal">{product.manufacturer}</span>
                          </div>
                        )}
                        {product.packer && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 text-xs tracking-tight">Packer:</span>
                            <span className="text-gray-600 text-xs font-normal">{product.packer}</span>
                          </div>
                        )}
                        {product.itemWeight && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 text-xs tracking-tight">Weight:</span>
                            <span className="text-gray-600 text-xs font-normal">{product.itemWeight}</span>
                          </div>
                        )}
                        {product.itemDimensions && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 text-xs tracking-tight">Dimensions:</span>
                            <span className="text-gray-600 text-xs font-normal">{product.itemDimensions}</span>
                          </div>
                        )}
                        {product.netQuantity && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 text-xs tracking-tight">Net Quantity:</span>
                            <span className="text-gray-600 text-xs font-normal">{product.netQuantity}</span>
                          </div>
                        )}
                        {product.genericName && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700 text-xs tracking-tight">Generic Name:</span>
                            <span className="text-gray-600 text-xs font-normal">{product.genericName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Reviews Section - Compact */}
        <div className="mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">Customer Reviews</h2>
            <div className="max-h-80 overflow-hidden">
              <ReviewsList productId={product.id} />
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="mt-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">You Might Also Like</h2>
              <p className="text-sm text-gray-600">Discover more from our collection</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="transform hover:scale-105 transition-all duration-300">
                  <ProductCard product={product} theme="light" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}