'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, LogOut, Settings, Package, Heart, Menu, X } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { NoSSR } from './no-ssr';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useCart } from '@/hooks/useCart';
import { useLogout } from '@/hooks/useAuth';
import { useWishlistCount } from '@/hooks/useWishlist';
import { useState } from 'react';

export function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="VellaPanti Logo"
              width={40}
              height={40}
              className="md:w-12 md:h-12"
            />
            <span className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">
              VELLA<span className="border-b-2 border-black pb-1">PANTI</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="SEARCH DROPS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-10 pr-4 py-3 border-2 border-black bg-white focus:outline-none font-bold uppercase tracking-wide placeholder-gray-600"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link href="/products" className="text-black hover:text-gray-600 font-black uppercase tracking-wider text-base lg:text-lg whitespace-nowrap">
              DROPS
            </Link>
            <Link href="/categories" className="text-black hover:text-gray-600 font-black uppercase tracking-wider text-base lg:text-lg whitespace-nowrap">
              COLLECTIONS
            </Link>
            <Link href="/story" className="text-black hover:text-gray-600 font-black uppercase tracking-wider text-base lg:text-lg whitespace-nowrap">
              STORY
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-md"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>

            <NoSSR fallback={
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 animate-pulse border-2 border-black"></div>
                <div className="hidden sm:block w-16 h-8 bg-gray-200 animate-pulse border-2 border-black"></div>
              </div>
            }>
              <HeaderActions />
            </NoSSR>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="SEARCH DROPS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-10 pr-4 py-3 border-2 border-black bg-white focus:outline-none font-bold uppercase tracking-wide placeholder-gray-600 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t-2 border-black shadow-lg animate-in slide-in-from-top-2">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/products"
              className="block text-black hover:bg-black hover:text-white font-black uppercase tracking-wider text-lg py-3 px-4 border-2 border-black transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              DROPS
            </Link>
            <Link
              href="/categories"
              className="block text-black hover:bg-black hover:text-white font-black uppercase tracking-wider text-lg py-3 px-4 border-2 border-black transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              COLLECTIONS
            </Link>
            <Link
              href="/story"
              className="block text-black hover:bg-black hover:text-white font-black uppercase tracking-wider text-lg py-3 px-4 border-2 border-black transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              STORY
            </Link>
          </nav>
        </div>
      )}
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
            className="relative hover:bg-black hover:text-white p-2 md:p-3"
          >
            <Heart className="h-5 w-5 md:h-6 md:w-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-black text-white text-xs font-black rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
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
        className="relative hover:bg-black hover:text-white p-2 md:p-3"
        onClick={toggleCart}
      >
        <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-black text-white text-xs font-black rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </Button>

      {/* Authentication Actions */}
      {isAuthenticated() ? (
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Admin Link - only show for admin users */}
          {user?.role === 'ADMIN' && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="font-black uppercase tracking-wider hover:bg-black hover:text-white px-2 py-2 md:px-4 md:py-2 text-xs md:text-sm"
              >
                <Package className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">ADMIN</span>
              </Button>
            </Link>
          )}

          {/* User Menu */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="font-black uppercase tracking-wider hover:bg-black hover:text-white px-2 py-2 md:px-4 md:py-2 text-xs md:text-sm"
            >
              <User className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'USER'}</span>
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
        <div className="flex items-center space-x-1 md:space-x-2">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="font-black uppercase tracking-wider hover:bg-black hover:text-white px-2 py-2 md:px-4 md:py-2 text-xs md:text-sm">
              <span className="hidden sm:inline">LOGIN</span>
              <span className="sm:hidden">IN</span>
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-2 py-2 md:px-4 md:py-2 text-xs md:text-sm">
              JOIN
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}