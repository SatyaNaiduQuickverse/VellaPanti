'use client';

import { useEffect, useState } from 'react';
import { X, Tag, Gift, Zap, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import Link from 'next/link';
import { api } from '@/lib/api';

interface OfferPopupData {
  id: string;
  isActive: boolean;
  imageUrl?: string;
  title: string;
  subtitle: string;
  offer1Type: string;
  offer1Title: string;
  offer1Subtitle: string;
  offer1Code: string;
  offer1Badge: string;
  offer1BgColor: string;
  offer2Type: string;
  offer2Title: string;
  offer2Subtitle: string;
  offer2Code: string;
  offer2Badge: string;
  offer2BgColor: string;
  delaySeconds: number;
}

export function OfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState<OfferPopupData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch popup data from API
    const fetchPopupData = async () => {
      try {
        const response = await api.get('/products/offer-popup');
        if (response.data.success && response.data.data) {
          const data = response.data.data as OfferPopupData;
          setPopupData(data);

          // Check if popup should be shown
          if (data.isActive) {
            // Show popup after configured delay on every page load
            const timer = setTimeout(() => {
              setIsOpen(true);
            }, (data.delaySeconds || 2) * 1000);

            return () => clearTimeout(timer);
          }
        }
      } catch (error) {
        console.error('Failed to load offer popup:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopupData();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || !popupData || loading) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Popup Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 pointer-events-none overflow-y-auto">
        <div
          className="bg-black max-w-2xl w-full relative pointer-events-auto animate-scaleIn shadow-2xl overflow-hidden my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 bg-white text-black rounded-full p-1.5 hover:bg-gray-200 transition-all z-20 shadow-xl hover:scale-110"
            aria-label="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="grid lg:grid-cols-2">
            {/* Left Side - Fashion Image */}
            <div className="relative hidden lg:block">
              {/* Fashion Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: popupData.imageUrl
                    ? `url(${popupData.imageUrl})`
                    : 'url(/images/products/skull-beats-1.png)',
                  filter: 'grayscale(100%) contrast(1.1)'
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              {/* Branding Text */}
              <div className="absolute inset-0 flex flex-col justify-center p-6">
                <div className="transform -rotate-2">
                  <h3 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-3 drop-shadow-2xl">
                    VELLAPANTI
                  </h3>
                  <p className="text-white text-base sm:text-lg font-bold uppercase tracking-widest drop-shadow-xl">
                    STREET CULTURE
                  </p>
                  <div className="w-20 h-1 bg-white mt-3" />
                </div>
              </div>
            </div>

            {/* Right Side - Offers Content */}
            <div className="bg-white relative overflow-hidden">
              {/* Diagonal Stripe Pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, black, black 10px, transparent 10px, transparent 20px)'
                }}
              />

              <div className="relative p-3 sm:p-4 md:p-5 h-full flex flex-col">
                {/* Header */}
                <div className="text-center mb-3 sm:mb-4">
                  <div className="inline-block bg-black text-white px-2 py-1 mb-2">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4 inline-block mr-1" />
                    <span className="text-xs font-black uppercase tracking-wide">
                      {popupData.subtitle}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tighter text-black mb-1">
                    {popupData.title}
                  </h2>
                  <div className="w-12 h-0.5 bg-black mx-auto" />
                </div>

                {/* Offers Grid */}
                <div className="flex-1 grid gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {/* First Offer - 50% OFF */}
                  <div className="bg-black border-2 border-white p-2 sm:p-3 relative group hover:border-gray-300 transition-all">
                    <div className="absolute top-0 right-0 bg-white text-black px-1.5 py-0.5 text-xs font-black uppercase transform rotate-3 translate-x-1 -translate-y-1">
                      {popupData.offer1Badge}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-white text-black w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-black text-white mb-0.5 tracking-tighter">
                          {popupData.offer1Title}
                        </h3>
                        <p className="text-xs font-bold text-gray-300 uppercase">
                          {popupData.offer1Subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-2 mb-1.5">
                      <p className="text-xs font-bold text-center text-gray-700 mb-1 uppercase">
                        Code
                      </p>
                      <div className="bg-black text-white px-2 py-1.5 text-center border border-dashed border-gray-300">
                        <code className="text-base sm:text-lg font-black tracking-widest">
                          {popupData.offer1Code}
                        </code>
                      </div>
                    </div>

                    <p className="text-xs text-center text-gray-400 italic hidden sm:block">
                      Valid on all products
                    </p>
                  </div>

                  {/* Second Offer - BOGO */}
                  <div className="bg-white border-2 border-black p-2 sm:p-3 relative group hover:bg-gray-50 transition-all">
                    <div className="absolute top-0 right-0 bg-black text-white px-1.5 py-0.5 text-xs font-black uppercase transform rotate-3 translate-x-1 -translate-y-1">
                      {popupData.offer2Badge}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-black text-white w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-black text-black mb-0.5 tracking-tighter leading-tight">
                          {popupData.offer2Title}
                        </h3>
                        <p className="text-xs font-bold text-gray-700 uppercase">
                          {popupData.offer2Subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="bg-black p-2 mb-1.5 border-2 border-gray-800">
                      <p className="text-xs font-bold text-center text-white mb-1 uppercase">
                        Code
                      </p>
                      <div className="bg-white text-black px-2 py-1.5 text-center">
                        <code className="text-base sm:text-lg font-black tracking-widest">
                          {popupData.offer2Code}
                        </code>
                      </div>
                    </div>

                    <p className="text-xs text-center text-gray-600 italic hidden sm:block">
                      Buy any, get lowest free
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-1.5">
                  <Link href="/products" className="block" onClick={handleClose}>
                    <Button className="w-full bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider py-2 text-xs border-2 border-black hover:border-gray-600 transition-all">
                      <ShoppingBag className="h-3 w-3 mr-1.5" />
                      Shop Now
                    </Button>
                  </Link>
                  <Button
                    onClick={handleClose}
                    className="w-full bg-white text-black hover:bg-gray-100 font-black uppercase tracking-wider py-2 text-xs border-2 border-black"
                  >
                    Continue Browsing
                  </Button>
                </div>

                {/* Footer Note */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-1.5 text-black">
                    <Sparkles className="h-3 w-3" />
                    <p className="text-xs font-black uppercase">
                      Limited Time
                    </p>
                    <Sparkles className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
