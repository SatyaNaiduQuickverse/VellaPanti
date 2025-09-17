'use client';

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Button } from '@ecommerce/ui';
import { NoSSR } from './no-ssr';

export function Header() {
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
            <NoSSR fallback={
              <div className="w-12 h-12 bg-gray-200 animate-pulse border-2 border-black"></div>
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
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative border-2 border-black hover:bg-black hover:text-white p-3"
      >
        <ShoppingCart className="h-6 w-6" />
      </Button>

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
    </>
  );
}