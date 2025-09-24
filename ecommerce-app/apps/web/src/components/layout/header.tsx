'use client';

import Link from 'next/link';
import { Search, ShoppingCart, User, LogOut, Settings, Package, Heart } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { NoSSR } from './no-ssr';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useCart } from '@/hooks/useCart';
import { useLogout } from '@/hooks/useAuth';
import { useWishlistCount } from '@/hooks/useWishlist';

export function Header() {
  return (
    <header className="bg-white sticky top-0 z-50">
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
            <Link href="/story" className="text-black hover:text-gray-600 font-black uppercase tracking-wider text-lg">
              STORY
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <NoSSR fallback={
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 animate-pulse border-2 border-black"></div>
                <div className="w-16 h-8 bg-gray-200 animate-pulse border-2 border-black"></div>
              </div>
            }>
              <HeaderActions />
            </NoSSR>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderActions() {
  const { user, isAuthenticated } = useAuthStore();
  const { itemCount, toggleCart } = useCartStore();
  const logout = useLogout();
  const { data: wishlistData } = useWishlistCount();

  // Load cart data if authenticated
  useCart();

  const wishlistCount = wishlistData?.count || 0;

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Wishlist Button */}
      {isAuthenticated() && (
        <Link href="/wishlist">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-black hover:text-white p-3"
          >
            <Heart className="h-6 w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Button>
        </Link>
      )}

      {/* Cart Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-black hover:text-white p-3"
        onClick={toggleCart}
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </Button>

      {/* Authentication Actions */}
      {isAuthenticated() ? (
        <div className="flex items-center space-x-2">
          {/* Admin Link - only show for admin users */}
          {user?.role === 'ADMIN' && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="font-black uppercase tracking-wider hover:bg-black hover:text-white px-4 py-2"
              >
                <Package className="h-4 w-4 mr-2" />
                ADMIN
              </Button>
            </Link>
          )}

          {/* User Menu */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="font-black uppercase tracking-wider hover:bg-black hover:text-white px-4 py-2"
            >
              <User className="h-4 w-4 mr-2" />
              {user?.name?.split(' ')[0] || 'USER'}
            </Button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <Link href="/profile" className="block px-4 py-2 text-sm font-bold uppercase tracking-wide text-black hover:bg-black hover:text-white">
                  <Settings className="h-4 w-4 inline mr-2" />
                  PROFILE
                </Link>
                <Link href="/orders" className="block px-4 py-2 text-sm font-bold uppercase tracking-wide text-black hover:bg-black hover:text-white">
                  <Package className="h-4 w-4 inline mr-2" />
                  TRACK ORDERS
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm font-bold uppercase tracking-wide text-black hover:bg-black hover:text-white"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="font-black uppercase tracking-wider hover:bg-black hover:text-white px-4 py-2">
              LOGIN
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-4 py-2">
              JOIN
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}