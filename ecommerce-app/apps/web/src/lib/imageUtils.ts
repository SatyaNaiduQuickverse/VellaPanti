/**
 * Utility functions for handling image URLs
 */

/**
 * Convert relative upload paths to absolute URLs pointing to the API server
 * Also handles ibb.co URLs and other external images
 */
export function getImageUrl(url: string | undefined | null): string {
  // Fallback image
  const fallbackImage = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=1200&q=95&fit=crop&auto=format';

  if (!url) return fallbackImage;

  // If it's a relative path to uploads, prepend API URL
  if (url.startsWith('/uploads/') || url.startsWith('/images/')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vellapanti.co.in/api';
    // Remove '/api' from the end if present since we'll add the path
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${url}`;
  }

  // If it's already a direct ibb.co URL, use it
  if (url.includes('i.ibb.co/')) {
    return url;
  }

  // Convert ibb.co sharing URL to direct URL
  if (url.includes('ibb.co/') && !url.includes('i.ibb.co/')) {
    // Extract the image ID from URL like https://ibb.co/abcd123
    const match = url.match(/ibb\.co\/([a-zA-Z0-9]+)/);
    if (match && match[1]) {
      // Convert to direct URL format: https://i.ibb.co/imageId/image.jpg
      return `https://i.ibb.co/${match[1]}/image.jpg`;
    }
  }

  // For any other URL (external images), return as-is
  return url;
}
