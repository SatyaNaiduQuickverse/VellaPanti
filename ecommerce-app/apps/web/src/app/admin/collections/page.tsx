'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ecommerce/ui';
import { Star, Plus, Trash2, Save, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useAuthStore } from '@/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface FeaturedCollection {
  id: string;
  categoryId: string;
  theme: 'BLACK' | 'WHITE';
  position: number;
  category: {
    id: string;
    name: string;
    image?: string;
  };
}

export default function FeaturedCollectionsManagement() {
  const [blackFeaturedIds, setBlackFeaturedIds] = useState<string[]>([]);
  const [whiteFeaturedIds, setWhiteFeaturedIds] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch black categories
  const {
    data: blackCategoriesData,
    isLoading: isLoadingBlackCategories,
    error: blackCategoriesError,
  } = useCategories('BLACK');

  // Fetch white categories
  const {
    data: whiteCategoriesData,
    isLoading: isLoadingWhiteCategories,
    error: whiteCategoriesError,
  } = useCategories('WHITE');

  const blackCategories = blackCategoriesData?.data || [];
  const whiteCategories = whiteCategoriesData?.data || [];
  const blackFeaturedCategories = blackCategories.filter((c) => blackFeaturedIds.includes(c.id));
  const whiteFeaturedCategories = whiteCategories.filter((c) => whiteFeaturedIds.includes(c.id));

  // Load existing featured collections from API
  useEffect(() => {
    const loadFeaturedCollections = async () => {
      if (!accessToken) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/featured-collections`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load featured collections');
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          const blackIds = data.data
            .filter((fc: FeaturedCollection) => fc.theme === 'BLACK')
            .sort((a: FeaturedCollection, b: FeaturedCollection) => a.position - b.position)
            .map((fc: FeaturedCollection) => fc.categoryId);

          const whiteIds = data.data
            .filter((fc: FeaturedCollection) => fc.theme === 'WHITE')
            .sort((a: FeaturedCollection, b: FeaturedCollection) => a.position - b.position)
            .map((fc: FeaturedCollection) => fc.categoryId);

          setBlackFeaturedIds(blackIds);
          setWhiteFeaturedIds(whiteIds);
        }
      } catch (error) {
        console.error('Failed to load featured collections:', error);
        toast.error('Failed to load featured collections. Please refresh the page.');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadFeaturedCollections();
  }, [accessToken]);

  // Handle adding categories to featured lists
  const addToBlackFeatured = (categoryId: string) => {
    if (!blackFeaturedIds.includes(categoryId) && blackFeaturedIds.length < 6) {
      setBlackFeaturedIds([...blackFeaturedIds, categoryId]);
      setHasUnsavedChanges(true);
    } else if (blackFeaturedIds.length >= 6) {
      toast.error('Maximum 6 collections allowed in STREET section');
    }
  };

  const addToWhiteFeatured = (categoryId: string) => {
    if (!whiteFeaturedIds.includes(categoryId) && whiteFeaturedIds.length < 6) {
      setWhiteFeaturedIds([...whiteFeaturedIds, categoryId]);
      setHasUnsavedChanges(true);
    } else if (whiteFeaturedIds.length >= 6) {
      toast.error('Maximum 6 collections allowed in PREMIUM section');
    }
  };

  // Handle removing categories from featured lists
  const removeFromBlackFeatured = (categoryId: string) => {
    setBlackFeaturedIds(blackFeaturedIds.filter((id) => id !== categoryId));
    setHasUnsavedChanges(true);
  };

  const removeFromWhiteFeatured = (categoryId: string) => {
    setWhiteFeaturedIds(whiteFeaturedIds.filter((id) => id !== categoryId));
    setHasUnsavedChanges(true);
  };

  // Save changes to the API
  const saveChanges = async () => {
    if (!accessToken) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    if (blackFeaturedIds.length === 0 && whiteFeaturedIds.length === 0) {
      toast.error('Please select at least one collection to feature');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/featured-collections`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            blackFeaturedIds,
            whiteFeaturedIds,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update featured collections');
      }

      if (responseData.success) {
        toast.success(`Featured collections updated successfully! (${blackFeaturedIds.length} BLACK + ${whiteFeaturedIds.length} WHITE)`);
        setHasUnsavedChanges(false);

        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ['featuredCollections'] });
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
      } else {
        throw new Error(responseData.error || 'Update failed');
      }
    } catch (error) {
      console.error('Failed to save featured collections:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isInitialLoading || isLoadingBlackCategories || isLoadingWhiteCategories) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-lg font-bold">Loading featured collections...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (blackCategoriesError || whiteCategoriesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border-2 border-red-500 p-8 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-center mb-2">Failed to Load Categories</h2>
          <p className="text-gray-600 text-center mb-4">
            Unable to fetch categories. Please try refreshing the page.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-black text-white hover:bg-gray-800 font-black"
          >
            REFRESH PAGE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-black uppercase tracking-tight">
              FEATURED COLLECTIONS
            </h1>
            <p className="text-gray-600 mt-2 font-bold">
              Select which collections appear in the featured sections on your homepage
            </p>
            {hasUnsavedChanges && (
              <div className="mt-2 flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-bold">You have unsaved changes</span>
              </div>
            )}
          </div>
          <Button
            onClick={saveChanges}
            disabled={isSaving || !hasUnsavedChanges}
            className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                SAVING...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                SAVE CHANGES
              </>
            )}
          </Button>
        </div>

        {/* Success indicator */}
        {!hasUnsavedChanges && !isSaving && (blackFeaturedIds.length > 0 || whiteFeaturedIds.length > 0) && (
          <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-bold">All changes saved</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Black Theme Featured Collections */}
          <div className="bg-black text-white p-6">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              <Star className="h-6 w-6 inline mr-2" />
              STREET FEATURED ({blackFeaturedIds.length}/6)
            </h2>

            {/* Current Featured */}
            <div className="mb-6">
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">
                CURRENTLY FEATURED
              </h3>
              {blackFeaturedCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {blackFeaturedCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white text-black p-4 rounded relative"
                    >
                      <Button
                        onClick={() => removeFromBlackFeatured(category.id)}
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white z-10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-black text-xs uppercase truncate">
                        {category.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-300 text-center py-8 bg-white/5 rounded">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No collections featured yet</p>
                  <p className="text-sm mt-1">Add collections from the list below</p>
                </div>
              )}
            </div>

            {/* Available Collections */}
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">
                AVAILABLE STREET COLLECTIONS ({blackCategories.filter((c) => !blackFeaturedIds.includes(c.id)).length})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
                {blackCategories.filter((c) => !blackFeaturedIds.includes(c.id)).length > 0 ? (
                  blackCategories
                    .filter((c) => !blackFeaturedIds.includes(c.id))
                    .map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between bg-white/10 p-3 rounded hover:bg-white/20 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm truncate">{category.name}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => addToBlackFeatured(category.id)}
                          size="sm"
                          disabled={blackFeaturedIds.length >= 6}
                          className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                ) : (
                  <div className="text-gray-300 text-center py-8 bg-white/5 rounded">
                    <p>All collections are featured</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* White Theme Featured Collections */}
          <div className="bg-white text-black p-6 border-2 border-black">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
              <Star className="h-6 w-6 inline mr-2" />
              PREMIUM FEATURED ({whiteFeaturedIds.length}/6)
            </h2>

            {/* Current Featured */}
            <div className="mb-6">
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">
                CURRENTLY FEATURED
              </h3>
              {whiteFeaturedCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {whiteFeaturedCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-gray-50 p-4 rounded relative border border-gray-200"
                    >
                      <Button
                        onClick={() => removeFromWhiteFeatured(category.id)}
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white z-10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className="font-black text-xs uppercase truncate">
                        {category.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8 bg-gray-50 rounded border border-gray-200">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No collections featured yet</p>
                  <p className="text-sm mt-1">Add collections from the list below</p>
                </div>
              )}
            </div>

            {/* Available Collections */}
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">
                AVAILABLE PREMIUM COLLECTIONS ({whiteCategories.filter((c) => !whiteFeaturedIds.includes(c.id)).length})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
                {whiteCategories.filter((c) => !whiteFeaturedIds.includes(c.id)).length > 0 ? (
                  whiteCategories
                    .filter((c) => !whiteFeaturedIds.includes(c.id))
                    .map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm truncate">{category.name}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => addToWhiteFeatured(category.id)}
                          size="sm"
                          disabled={whiteFeaturedIds.length >= 6}
                          className="bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                ) : (
                  <div className="text-gray-500 text-center py-8 bg-gray-50 rounded border border-gray-200">
                    <p>All collections are featured</p>
                  </div>
                )}
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
                <li>• Select up to 6 collections for the black/street themed section</li>
                <li>• These collections appear on the left side of the homepage</li>
                <li>• Only collections with BLACK theme are available for selection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase mb-2">PREMIUM SECTION</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Select up to 6 collections for the white/premium themed section</li>
                <li>• These collections appear on the right side of the homepage</li>
                <li>• Only collections with WHITE theme are available for selection</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 font-bold">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Remember to click "SAVE CHANGES" after making modifications
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
