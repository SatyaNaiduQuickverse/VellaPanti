import { useEffect } from 'react';

/**
 * Custom hook to preload images into browser cache
 * This improves subsequent page loads by caching images in advance
 */
export function useImagePreloader(imageUrls: string[], enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const preloadImages = async () => {
      const imagePromises = imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(url);
          img.onerror = () => reject(url);
          img.src = url;
        });
      });

      try {
        await Promise.allSettled(imagePromises);
        console.log(`✅ Preloaded ${imageUrls.length} images into cache`);
      } catch (error) {
        console.warn('Some images failed to preload:', error);
      }
    };

    // Use requestIdleCallback to preload during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => preloadImages());
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(preloadImages, 1000);
    }
  }, [imageUrls, enabled]);
}

/**
 * Cache images and data in localStorage for offline access
 */
export function cacheInLocalStorage(key: string, data: any, expiryDays = 7) {
  if (typeof window === 'undefined') return;

  try {
    const item = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiryDays * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn('Failed to cache in localStorage:', error);
  }
}

/**
 * Retrieve cached data from localStorage
 */
export function getCachedFromLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);

    // Check if expired
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data as T;
  } catch (error) {
    console.warn('Failed to retrieve from localStorage:', error);
    return null;
  }
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache() {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('vellapanti-cache-')) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (Date.now() > parsed.expiry) {
            localStorage.removeItem(key);
          }
        }
      }
    });
    console.log('✅ Cleared expired cache entries');
  } catch (error) {
    console.warn('Failed to clear expired cache:', error);
  }
}
