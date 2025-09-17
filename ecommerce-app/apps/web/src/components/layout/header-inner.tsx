'use client';

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useLogout } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export default function HeaderInner() {
  const { user, isAuthenticated } = useAuthStore();
  const { itemCount, toggleCart } = useCartStore();
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b-2 border-black bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-3xl font-black text-black hover:text-gray-800 transition-colors uppercase tracking-tight">
            VELLA<span className="border-b-2 border-black pb-1">PANTI</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="SEARCH DROPS..."
                className="w-full pl-10 pr-4 py-3 border-2 border-black bg-white focus:outline-none font-bold uppercase tracking-wide placeholder-gray-600"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-black hover:text-gray-600 font-black uppercase tracking-wider text-lg">
              DROPS
            </Link>
            <Link href="/categories" className="text-black hover:text-gray-600 font-black uppercase tracking-wider text-lg">
              COLLECTIONS
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative border-2 border-black hover:bg-black hover:text-white p-3"
            >
              <ShoppingCart className="h-6 w-6" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-black h-6 w-6 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            {mounted ? (
              isAuthenticated() ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" className="border-2 border-black hover:bg-black hover:text-white p-3">
                      <User className="h-6 w-6" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="text-sm font-black uppercase tracking-wider border-2 border-black hover:bg-black hover:text-white px-4 py-2"
                  >
                    LOGOUT
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="font-black uppercase tracking-wider border-2 border-black hover:bg-black hover:text-white px-4 py-2">
                      LOGIN
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-4 py-2">
                      JOIN
                    </Button>
                  </Link>
                </div>
              )
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-16 h-10 bg-gray-200 animate-pulse"></div>
                <div className="w-12 h-10 bg-gray-200 animate-pulse"></div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="SEARCH DROPS..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-black bg-white focus:outline-none font-bold uppercase tracking-wide placeholder-gray-600"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link
                  href="/products"
                  className="block px-3 py-3 text-black hover:text-gray-600 font-black uppercase tracking-wider text-lg border-b border-black/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  DROPS
                </Link>
                <Link
                  href="/categories"
                  className="block px-3 py-3 text-black hover:text-gray-600 font-black uppercase tracking-wider text-lg border-b border-black/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  COLLECTIONS
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}