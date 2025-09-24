'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ecommerce/ui';
import { Star, Plus, Trash2, Save, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAuthStore } from '@/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function FeaturedProductsManagement() {
  const [blackFeaturedIds, setBlackFeaturedIds] = useState<string[]>([]);
  const [whiteFeaturedIds, setWhiteFeaturedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch black products
  const { data: blackProductsData } = useProducts({
    theme: 'BLACK',
    limit: 50,
  });

  // Fetch white products
  const { data: whiteProductsData } = useProducts({
    theme: 'WHITE',
    limit: 50,
  });

  const blackProducts = blackProductsData?.data || [];
  const whiteProducts = whiteProductsData?.data || [];
  const blackFeaturedProducts = blackProducts.filter(p => blackFeaturedIds.includes(p.id));
  const whiteFeaturedProducts = whiteProducts.filter(p => whiteFeaturedIds.includes(p.id));

  console.log('Black products:', blackProducts.length, blackProducts);
  console.log('White products:', whiteProducts.length, whiteProducts);
  console.log('Black featured IDs:', blackFeaturedIds);
  console.log('White featured IDs:', whiteFeaturedIds);

  // Load existing featured products
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      if (!accessToken) return;

      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/featured-products`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const blackIds = data.data
            .filter((fp: any) => fp.theme === 'BLACK')
            .map((fp: any) => fp.productId);
          const whiteIds = data.data
            .filter((fp: any) => fp.theme === 'WHITE')
            .map((fp: any) => fp.productId);

          setBlackFeaturedIds(blackIds);
          setWhiteFeaturedIds(whiteIds);
        }
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, [accessToken]);

  const addToBlackFeatured = (productId: string) => {
    if (!blackFeaturedIds.includes(productId) && blackFeaturedIds.length < 8) {
      setBlackFeaturedIds([...blackFeaturedIds, productId]);
    }
  };

  const addToWhiteFeatured = (productId: string) => {
    if (!whiteFeaturedIds.includes(productId) && whiteFeaturedIds.length < 8) {
      setWhiteFeaturedIds([...whiteFeaturedIds, productId]);
    }
  };

  const removeFromBlackFeatured = (productId: string) => {
    setBlackFeaturedIds(blackFeaturedIds.filter(id => id !== productId));
  };

  const removeFromWhiteFeatured = (productId: string) => {
    setWhiteFeaturedIds(whiteFeaturedIds.filter(id => id !== productId));
  };

  const saveChanges = async () => {
    if (!accessToken) {
      toast.error('Please log in to save changes');
      return;
    }

    console.log('Saving featured products:', { blackFeaturedIds, whiteFeaturedIds });
    setSaving(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/featured-products`;
      console.log('API URL:', url);
      console.log('Token:', accessToken);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          blackFeaturedIds,
          whiteFeaturedIds,
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        toast.success('Featured products updated successfully!');
        // Invalidate featured products cache to update homepage immediately
        queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
      } else {
        toast.error(responseData.error || 'Failed to update featured products');
      }
    } catch (error) {
      console.error('Failed to save featured products:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-black uppercase tracking-tight">
              FEATURED PRODUCTS
            </h1>
            <p className="text-gray-600 mt-2 font-bold">
              Select which products appear in the featured sections on your homepage
            </p>
          </div>
          <Button
            onClick={saveChanges}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Black Theme Featured Products */}
          <div className="bg-black text-white p-6">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              <Star className="h-6 w-6 inline mr-2" />
              STREET FEATURED ({blackFeaturedIds.length}/8)
            </h2>

            {/* Current Featured */}
            <div className="mb-6">
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">CURRENTLY FEATURED</h3>
              {blackFeaturedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {blackFeaturedProducts.map((product) => (
                    <div key={product.id} className="bg-white text-black p-4 rounded relative">
                      <Button
                        onClick={() => removeFromBlackFeatured(product.id)}
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white z-10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-black text-xs uppercase truncate">{product.name}</p>
                      <p className="text-xs text-gray-600">
                        ₹{(product.basePrice || 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-center py-8">No products featured yet</p>
              )}
            </div>

            {/* Available Products */}
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">AVAILABLE STREET PRODUCTS</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {blackProducts
                  .filter(p => !blackFeaturedIds.includes(p.id))
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between bg-white/10 p-3 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-sm">{product.name}</p>
                          <p className="text-xs text-gray-300">
                            ₹{(product.baseSalePrice || product.basePrice || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => addToBlackFeatured(product.id)}
                        size="sm"
                        disabled={blackFeaturedIds.length >= 8}
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* White Theme Featured Products */}
          <div className="bg-white text-black p-6 border-2 border-black">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              <Star className="h-6 w-6 inline mr-2" />
              PREMIUM FEATURED ({whiteFeaturedIds.length}/8)
            </h2>

            {/* Current Featured */}
            <div className="mb-6">
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">CURRENTLY FEATURED</h3>
              {whiteFeaturedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {whiteFeaturedProducts.map((product) => (
                    <div key={product.id} className="bg-gray-50 p-4 rounded relative border border-gray-200">
                      <Button
                        onClick={() => removeFromWhiteFeatured(product.id)}
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white z-10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-black text-xs uppercase truncate">{product.name}</p>
                      <p className="text-xs text-gray-600">
                        ₹{(product.basePrice || 0).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No products featured yet</p>
              )}
            </div>

            {/* Available Products */}
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">AVAILABLE PREMIUM PRODUCTS</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {whiteProducts
                  .filter(p => !whiteFeaturedIds.includes(p.id))
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">
                            ₹{(product.baseSalePrice || product.basePrice || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => addToWhiteFeatured(product.id)}
                        size="sm"
                        disabled={whiteFeaturedIds.length >= 8}
                        className="bg-black text-white hover:bg-gray-800"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white border-2 border-black p-6 mt-8">
          <h3 className="text-xl font-black uppercase tracking-wider mb-4">INSTRUCTIONS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-black uppercase mb-2">STREET SECTION</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Select up to 8 products for the black/street themed section</li>
                <li>• These products appear on the left side of the homepage</li>
                <li>• Only products with BLACK theme are available for selection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase mb-2">PREMIUM SECTION</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Select up to 8 products for the white/premium themed section</li>
                <li>• These products appear on the right side of the homepage</li>
                <li>• Only products with WHITE theme are available for selection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}