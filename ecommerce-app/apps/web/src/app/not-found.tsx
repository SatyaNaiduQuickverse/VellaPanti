import { Button } from '@ecommerce/ui';
import { Search, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-black mb-4">404</div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            PAGE NOT FOUND
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-black text-white hover:bg-gray-800 font-black uppercase tracking-wider px-8 py-4">
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/products">
            <Button
              variant="outline"
              className="border-2 border-black text-black hover:bg-black hover:text-white font-black uppercase tracking-wider px-8 py-4"
            >
              <Search className="h-5 w-5 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-gray-500 mb-4">Popular pages:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/categories" className="text-black hover:underline font-bold">
              Collections
            </Link>
            <Link href="/products" className="text-black hover:underline font-bold">
              All Products
            </Link>
            <Link href="/cart" className="text-black hover:underline font-bold">
              Shopping Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
