'use client';

import { useState, useEffect } from 'react';
import { Button } from '@ecommerce/ui';
import { Image, Plus, Trash2, Save, Upload, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { api } from '@/lib/api';

interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

interface HomepageBanner {
  id: string;
  theme: 'BLACK' | 'WHITE';
  src: string;
  alt: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
}

export default function HomepageManagement() {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [homepageBanners, setHomepageBanners] = useState<HomepageBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) return;

      setLoading(true);
      try {
        // Load carousel images
        const carouselResponse = await api.get("/admin/carousel-images");
        if (carouselResponse.data.success) {
          setCarouselImages(carouselResponse.data.data || []);
        }

        // Load homepage banners
        const bannersResponse = await api.get("/admin/homepage-banners");
        if (bannersResponse.data.success) {
          setHomepageBanners(bannersResponse.data.data || []);
        }
      } catch (error) {
        console.error('Failed to load homepage data:', error);
        toast.error('Failed to load homepage data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accessToken]);

  const addImage = () => {
    const newImage: CarouselImage = {
      id: Date.now().toString(),
      src: '',
      alt: '',
      title: '',
      description: ''
    };
    setCarouselImages([...carouselImages, newImage]);
  };

  const updateImage = (id: string, field: keyof CarouselImage, value: string) => {
    // Validate image URLs to prevent crashes
    if (field === 'src' && value) {
      try {
        const url = new URL(value);
        // Check if it's a supported hostname
        const supportedHosts = ['images.unsplash.com', 'unsplash.com', 'i.postimg.cc', 'localhost'];
        if (!supportedHosts.includes(url.hostname)) {
          toast.error(`Unsupported image host: ${url.hostname}. Please use images.unsplash.com, i.postimg.cc, or localhost.`);
          return;
        }
      } catch (error) {
        if (value.trim() !== '') {
          toast.error('Invalid URL format. Please enter a valid image URL.');
          return;
        }
      }
    }

    setCarouselImages(carouselImages.map(img =>
      img.id === id ? { ...img, [field]: value } : img
    ));
  };

  const deleteImage = (id: string) => {
    setCarouselImages(carouselImages.filter(img => img.id !== id));
  };

  // Homepage Banner Management
  const updateBanner = (theme: 'BLACK' | 'WHITE', field: keyof Omit<HomepageBanner, 'id' | 'theme'>, value: string | boolean) => {
    // Validate image URLs to prevent crashes
    if (field === 'src' && typeof value === 'string' && value) {
      try {
        const url = new URL(value);
        // Check if it's a supported hostname
        const supportedHosts = ['images.unsplash.com', 'unsplash.com', 'i.postimg.cc', 'localhost'];
        if (!supportedHosts.includes(url.hostname)) {
          toast.error(`Unsupported image host: ${url.hostname}. Please use images.unsplash.com, i.postimg.cc, or localhost.`);
          return;
        }
      } catch (error) {
        if (value.toString().trim() !== '') {
          toast.error('Invalid URL format. Please enter a valid image URL.');
          return;
        }
      }
    }

    setHomepageBanners(prevBanners => {
      const existingBanner = prevBanners.find(b => b.theme === theme);
      if (existingBanner) {
        // Update existing banner
        return prevBanners.map(b =>
          b.theme === theme ? { ...b, [field]: value } : b
        );
      } else {
        // Create new banner
        const newBanner: HomepageBanner = {
          id: Date.now().toString(),
          theme,
          src: '',
          alt: '',
          title: '',
          description: '',
          buttonText: '',
          buttonLink: '',
          isActive: true,
          [field]: value,
        };
        return [...prevBanners, newBanner];
      }
    });
  };

  const saveChanges = async () => {
    if (!accessToken) {
      toast.error('Please log in to save changes');
      return;
    }

    setSaving(true);
    try {
      // Save carousel images
      const carouselResponse = await api.put("/admin/carousel-images", {
        images: carouselImages.filter(img => img.src && img.alt),
      });

      if (!carouselResponse.data.success) {
        throw new Error(carouselResponse.data.error || 'Failed to update carousel');
      }

      // Save homepage banners
      const blackBanner = homepageBanners.find(b => b.theme === 'BLACK');
      const whiteBanner = homepageBanners.find(b => b.theme === 'WHITE');

      const bannersResponse = await api.put("/admin/homepage-banners", {
        blackBanner: blackBanner && blackBanner.src ? blackBanner : null,
        whiteBanner: whiteBanner && whiteBanner.src ? whiteBanner : null,
      });

      if (!bannersResponse.data.success) {
        throw new Error(bannersResponse.data.error || 'Failed to update homepage banners');
      }

      toast.success('Homepage updated successfully!');

      // Invalidate caches to update homepage immediately
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
      queryClient.invalidateQueries({ queryKey: ['homepageBanners'] });

    } catch (error: any) {
      console.error('Failed to save homepage data:', error);
      toast.error(error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-black uppercase tracking-tight">
              HOMEPAGE MANAGEMENT
            </h1>
            <p className="text-gray-600 mt-2 font-bold">
              Manage the main carousel images and content for your homepage
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

        {/* Carousel Images Section */}
        <div className="bg-white border-2 border-black p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">
              <Image className="h-6 w-6 inline mr-2" />
              HERO CAROUSEL IMAGES
            </h2>
            <Button
              onClick={addImage}
              className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider"
            >
              <Plus className="h-4 w-4 mr-2" />
              ADD IMAGE
            </Button>
          </div>

          <div className="space-y-6">
            {carouselImages.map((image, index) => (
              <div key={image.id} className="border-2 border-gray-200 p-6 hover:border-black transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-black uppercase tracking-wider">
                    IMAGE #{index + 1}
                  </h3>
                  <Button
                    onClick={() => deleteImage(image.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Preview */}
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                      {image.src ? (
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <Upload className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-bold">No image selected</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                        IMAGE URL
                      </label>
                      <input
                        type="url"
                        value={image.src}
                        onChange={(e) => updateImage(image.id, 'src', e.target.value)}
                        placeholder="https://images.unsplash.com/photo-example or https://i.postimg.cc/example"
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                        ALT TEXT
                      </label>
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(e) => updateImage(image.id, 'alt', e.target.value)}
                        placeholder="Descriptive text for accessibility"
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                        TITLE (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        value={image.title || ''}
                        onChange={(e) => updateImage(image.id, 'title', e.target.value)}
                        placeholder="MAIN HEADLINE"
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                        DESCRIPTION (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        value={image.description || ''}
                        onChange={(e) => updateImage(image.id, 'description', e.target.value)}
                        placeholder="SUBTITLE OR DESCRIPTION"
                        className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {carouselImages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold">No carousel images configured</p>
              <p className="text-sm">Add your first image to get started</p>
            </div>
          )}
        </div>

        {/* Homepage Banner Images Section */}
        <div className="bg-white border-2 border-black p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-2">
              <Image className="h-6 w-6 inline mr-2" />
              HOMEPAGE BANNER IMAGES
            </h2>
            <p className="text-gray-600 font-bold">
              Configure the banner images that appear below the main carousel (one for each theme)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Black Theme Banner */}
            <div className="border-2 border-gray-200 p-6 hover:border-black transition-colors">
              <div className="mb-4">
                <h3 className="text-lg font-black uppercase tracking-wider bg-black text-white px-4 py-2">
                  BLACK THEME BANNER
                </h3>
              </div>

              {(() => {
                const blackBanner = homepageBanners.find(b => b.theme === 'BLACK');
                return (
                  <>
                    {/* Image Preview */}
                    <div className="aspect-video bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden mb-4">
                      {blackBanner?.src ? (
                        <img
                          src={blackBanner.src}
                          alt={blackBanner.alt || 'Black Theme Banner'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <Upload className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-bold">No image selected</p>
                        </div>
                      )}
                    </div>

                    {/* Banner Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          IMAGE URL
                        </label>
                        <input
                          type="url"
                          value={blackBanner?.src || ''}
                          onChange={(e) => updateBanner('BLACK', 'src', e.target.value)}
                          placeholder="https://images.unsplash.com/photo-example"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          ALT TEXT
                        </label>
                        <input
                          type="text"
                          value={blackBanner?.alt || ''}
                          onChange={(e) => updateBanner('BLACK', 'alt', e.target.value)}
                          placeholder="Descriptive text for accessibility"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          TITLE (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={blackBanner?.title || ''}
                          onChange={(e) => updateBanner('BLACK', 'title', e.target.value)}
                          placeholder="BANNER HEADLINE"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          DESCRIPTION (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={blackBanner?.description || ''}
                          onChange={(e) => updateBanner('BLACK', 'description', e.target.value)}
                          placeholder="BANNER DESCRIPTION"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          BUTTON TEXT (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={blackBanner?.buttonText || ''}
                          onChange={(e) => updateBanner('BLACK', 'buttonText', e.target.value)}
                          placeholder="CALL TO ACTION"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          BUTTON LINK (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={blackBanner?.buttonLink || ''}
                          onChange={(e) => updateBanner('BLACK', 'buttonLink', e.target.value)}
                          placeholder="/products or https://example.com"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* White Theme Banner */}
            <div className="border-2 border-gray-200 p-6 hover:border-black transition-colors">
              <div className="mb-4">
                <h3 className="text-lg font-black uppercase tracking-wider bg-white text-black border-2 border-black px-4 py-2">
                  WHITE THEME BANNER
                </h3>
              </div>

              {(() => {
                const whiteBanner = homepageBanners.find(b => b.theme === 'WHITE');
                return (
                  <>
                    {/* Image Preview */}
                    <div className="aspect-video bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden mb-4">
                      {whiteBanner?.src ? (
                        <img
                          src={whiteBanner.src}
                          alt={whiteBanner.alt || 'White Theme Banner'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <Upload className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-bold">No image selected</p>
                        </div>
                      )}
                    </div>

                    {/* Banner Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          IMAGE URL
                        </label>
                        <input
                          type="url"
                          value={whiteBanner?.src || ''}
                          onChange={(e) => updateBanner('WHITE', 'src', e.target.value)}
                          placeholder="https://images.unsplash.com/photo-example"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          ALT TEXT
                        </label>
                        <input
                          type="text"
                          value={whiteBanner?.alt || ''}
                          onChange={(e) => updateBanner('WHITE', 'alt', e.target.value)}
                          placeholder="Descriptive text for accessibility"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          TITLE (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={whiteBanner?.title || ''}
                          onChange={(e) => updateBanner('WHITE', 'title', e.target.value)}
                          placeholder="BANNER HEADLINE"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          DESCRIPTION (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={whiteBanner?.description || ''}
                          onChange={(e) => updateBanner('WHITE', 'description', e.target.value)}
                          placeholder="BANNER DESCRIPTION"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          BUTTON TEXT (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={whiteBanner?.buttonText || ''}
                          onChange={(e) => updateBanner('WHITE', 'buttonText', e.target.value)}
                          placeholder="CALL TO ACTION"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black uppercase tracking-wider text-gray-700 mb-2">
                          BUTTON LINK (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={whiteBanner?.buttonLink || ''}
                          onChange={(e) => updateBanner('WHITE', 'buttonLink', e.target.value)}
                          placeholder="/products or https://example.com"
                          className="w-full px-3 py-2 border-2 border-black focus:outline-none font-medium"
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white border-2 border-black p-6">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-6">
            PREVIEW
          </h2>
          <div className="aspect-video bg-gray-900 relative overflow-hidden border-2 border-black">
            {carouselImages.length > 0 && carouselImages[0].src ? (
              <>
                <img
                  src={carouselImages[0].src}
                  alt={carouselImages[0].alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    {carouselImages[0].title && (
                      <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-wider">
                        {carouselImages[0].title}
                      </h1>
                    )}
                    {carouselImages[0].description && (
                      <p className="text-sm md:text-lg font-bold tracking-wider">
                        {carouselImages[0].description}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-bold">No preview available</p>
                  <p className="text-sm opacity-75">Add images to see preview</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-bold">
            * This shows how the first image will appear on your homepage
          </p>
        </div>
      </div>
    </div>
  );
}