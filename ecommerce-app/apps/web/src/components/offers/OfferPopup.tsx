'use client';

import { useEffect, useState } from 'react';
import { X, Tag, Gift, Sparkles, ShoppingBag } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import Link from 'next/link';

export function OfferPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if popup has been shown in this session
    const hasSeenPopup = sessionStorage.getItem('offerPopupShown');

    if (!hasSeenPopup) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('offerPopupShown', 'true');
      }, 1500); // Show after 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Popup Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white border-4 border-black max-w-2xl w-full relative pointer-events-auto animate-scaleIn shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 bg-black text-white rounded-full p-2 hover:bg-gray-800 transition-colors z-10 border-4 border-white shadow-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header Banner */}
          <div className="bg-black text-white p-4 sm:p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse" />
            <div className="relative">
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 sm:mb-3 text-yellow-400 animate-bounce" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider mb-1 sm:mb-2">
                EXCLUSIVE OFFERS!
              </h2>
              <p className="text-sm sm:text-base font-bold text-yellow-400 uppercase tracking-wide">
                Limited Time Only
              </p>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="p-4 sm:p-6 md:p-8 grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* 50% OFF Offer */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-4 border-red-600 p-4 sm:p-6 relative overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-xs font-black uppercase transform rotate-12 translate-x-2 -translate-y-1">
                HOT
              </div>

              <div className="relative z-10">
                <div className="bg-red-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Tag className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-red-600 mb-2 text-center">
                  50% OFF
                </h3>

                <p className="text-base sm:text-lg font-bold text-center text-gray-800 mb-3 sm:mb-4 uppercase tracking-wide">
                  On All Products
                </p>

                <div className="bg-white border-2 border-red-600 p-3 rounded mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-bold text-center text-gray-700 mb-2">
                    USE COUPON CODE:
                  </p>
                  <div className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded text-center">
                    <code className="text-base sm:text-lg md:text-xl font-black tracking-wider">
                      SAVE50
                    </code>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-600 italic">
                  Apply at checkout to get 50% discount
                </p>
              </div>
            </div>

            {/* BOGO Offer */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-600 p-4 sm:p-6 relative overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 text-xs font-black uppercase transform rotate-12 translate-x-2 -translate-y-1">
                NEW
              </div>

              <div className="relative z-10">
                <div className="bg-green-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Gift className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-green-600 mb-2 text-center leading-tight">
                  BUY 1 GET 1
                  <br />
                  <span className="text-3xl sm:text-4xl md:text-5xl">FREE!</span>
                </h3>

                <p className="text-base sm:text-lg font-bold text-center text-gray-800 mb-3 sm:mb-4 uppercase tracking-wide">
                  Double Your Purchase
                </p>

                <div className="bg-white border-2 border-green-600 p-3 rounded mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-bold text-center text-gray-700 mb-2">
                    USE COUPON CODE:
                  </p>
                  <div className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded text-center">
                    <code className="text-base sm:text-lg md:text-xl font-black tracking-wider">
                      BOGO2024
                    </code>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-600 italic">
                  Buy any item and get another one free!
                </p>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-gray-100 p-4 sm:p-6 border-t-4 border-black">
            <h4 className="text-base sm:text-lg font-black uppercase text-center mb-3 sm:mb-4 text-black">
              How to Redeem:
            </h4>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center">
                <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 font-black">
                  1
                </div>
                <p className="text-xs sm:text-sm font-bold">Add items to cart</p>
              </div>
              <div className="text-center">
                <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 font-black">
                  2
                </div>
                <p className="text-xs sm:text-sm font-bold">Enter coupon code</p>
              </div>
              <div className="text-center">
                <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 font-black">
                  3
                </div>
                <p className="text-xs sm:text-sm font-bold">Enjoy your savings!</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/products" className="flex-1" onClick={handleClose}>
                <Button className="w-full bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider py-3 sm:py-4 text-sm sm:text-base">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Shop Now
                </Button>
              </Link>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider py-3 sm:py-4 text-sm sm:text-base"
              >
                Maybe Later
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-black text-white p-2 sm:p-3 text-center">
            <p className="text-xs sm:text-sm font-bold">
              ⚡ Hurry! These offers won't last forever
            </p>
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
