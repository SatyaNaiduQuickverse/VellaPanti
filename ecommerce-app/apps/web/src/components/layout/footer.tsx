'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Footer() {
  const [footerDescription, setFooterDescription] = useState('STREET CULTURE • RAP AESTHETICS • GEN Z VIBES\nAUTHENTIC • BOLD • UNAPOLOGETIC');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.footerDescription) {
            setFooterDescription(data.data.footerDescription);
          }
        }
      } catch (error) {
        // Silently fail - using default footer description
        // This can happen during development with React strict mode double-rendering
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              VELLA<span className="border-b-2 border-white pb-1">PANTI</span>
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm font-bold uppercase tracking-wide whitespace-pre-line">
              {footerDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-black uppercase tracking-wider text-white text-sm sm:text-base">QUICK LINKS</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  DROPS
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  COLLECTIONS
                </Link>
              </li>
              <li>
                <Link href="/story" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  ABOUT
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  CONTACT
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-black uppercase tracking-wider text-white text-sm sm:text-base">SUPPORT</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  HELP
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  SHIPPING
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  RETURNS
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-black uppercase tracking-wider text-white text-sm sm:text-base">MY ACCOUNT</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  PROFILE
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  ORDERS
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  WISHLIST
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-300 hover:text-white transition-colors font-bold uppercase tracking-wide">
                  CART
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-white mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-white">
          <p className="font-black uppercase tracking-wider">&copy; 2024 VELLAPANTI. ALL RIGHTS RESERVED.<br className="sm:hidden"/> <span className="hidden sm:inline">|</span> STREET CULTURE • AUTHENTIC STYLE</p>
        </div>
      </div>
    </footer>
  );
}