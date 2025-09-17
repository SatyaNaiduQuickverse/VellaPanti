'use client';

import dynamic from 'next/dynamic';

const HeaderComponent = dynamic(() => import('./header-inner'), {
  ssr: false,
  loading: () => (
    <header className="border-b-2 border-black bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="text-3xl font-black text-black uppercase tracking-tight">
            VELLA<span className="border-b-2 border-black pb-1">PANTI</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-10 bg-gray-200 animate-pulse"></div>
            <div className="w-16 h-10 bg-gray-200 animate-pulse"></div>
            <div className="w-12 h-10 bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  ),
});

export function Header() {
  return <HeaderComponent />;
}