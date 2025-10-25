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
            const hasSeenPopup = sessionStorage.getItem('offerPopupShown');

            if (!hasSeenPopup) {
              // Show popup after configured delay
              const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem('offerPopupShown', 'true');
              }, (data.delaySeconds || 2) * 1000);

              return () => clearTimeout(timer);
            }
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div
          className="bg-black max-w-5xl w-full relative pointer-events-auto animate-scaleIn shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-all z-20 shadow-xl hover:scale-110"
            aria-label="Close"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="grid lg:grid-cols-2 min-h-[500px] sm:min-h-[600px]">
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
              <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-12">
                <div className="transform -rotate-2">
                  <h3 className="text-white text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 drop-shadow-2xl">
                    VELLAPANTI
                  </h3>
                  <p className="text-white text-lg sm:text-xl font-bold uppercase tracking-widest drop-shadow-xl">
                    STREET CULTURE
                  </p>
                  <div className="w-24 h-1 bg-white mt-4" />
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

              <div className="relative p-6 sm:p-8 md:p-10 h-full flex flex-col">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-block bg-black text-white px-4 py-2 mb-4">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 inline-block mr-2" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                      {popupData.subtitle}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-2">
                    {popupData.title}
                  </h2>
                  <div className="w-20 h-1 bg-black mx-auto" />
                </div>

                {/* Offers Grid */}
                <div className="flex-1 grid gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* First Offer - 50% OFF */}
                  <div className="bg-black border-4 border-white p-6 relative group hover:border-gray-300 transition-all">
                    <div className="absolute top-0 right-0 bg-white text-black px-3 py-1 text-xs font-black uppercase transform rotate-3 translate-x-2 -translate-y-2">
                      {popupData.offer1Badge}
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-white text-black w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Tag className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-4xl sm:text-5xl font-black text-white mb-1 tracking-tighter">
                          {popupData.offer1Title}
                        </h3>
                        <p className="text-sm font-bold text-gray-300 uppercase tracking-wide">
                          {popupData.offer1Subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 mb-3">
                      <p className="text-xs font-bold text-center text-gray-700 mb-2 uppercase tracking-wide">
                        Coupon Code
                      </p>
                      <div className="bg-black text-white px-4 py-3 text-center border-2 border-dashed border-gray-300">
                        <code className="text-xl sm:text-2xl font-black tracking-widest">
                          {popupData.offer1Code}
                        </code>
                      </div>
                    </div>

                    <p className="text-xs text-center text-gray-400 italic">
                      Valid on all products • No minimum purchase
                    </p>
                  </div>

                  {/* Second Offer - BOGO */}
                  <div className="bg-white border-4 border-black p-6 relative group hover:bg-gray-50 transition-all">
                    <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-xs font-black uppercase transform rotate-3 translate-x-2 -translate-y-2">
                      {popupData.offer2Badge}
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-black text-white w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Gift className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl sm:text-3xl font-black text-black mb-1 tracking-tighter leading-tight">
                          {popupData.offer2Title}
                        </h3>
                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                          {popupData.offer2Subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="bg-black p-4 mb-3 border-4 border-gray-800">
                      <p className="text-xs font-bold text-center text-white mb-2 uppercase tracking-wide">
                        Coupon Code
                      </p>
                      <div className="bg-white text-black px-4 py-3 text-center">
                        <code className="text-xl sm:text-2xl font-black tracking-widest">
                          {popupData.offer2Code}
                        </code>
                      </div>
                    </div>

                    <p className="text-xs text-center text-gray-600 italic">
                      Buy any item, get lowest priced item free
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Link href="/products" className="block" onClick={handleClose}>
                    <Button className="w-full bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider py-4 text-base border-2 border-black hover:border-gray-600 transition-all">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Shop Now
                    </Button>
                  </Link>
                  <Button
                    onClick={handleClose}
                    className="w-full bg-white text-black hover:bg-gray-100 font-black uppercase tracking-wider py-4 text-base border-2 border-black"
                  >
                    Continue Browsing
                  </Button>
                </div>

                {/* Footer Note */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-black">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-xs font-black uppercase tracking-wide">
                      Limited Time Offers
                    </p>
                    <Sparkles className="h-4 w-4" />
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
