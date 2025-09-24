'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AdminLayoutContent = dynamic(() => import('./admin-layout-content'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
    </div>
  )
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    }>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </Suspense>
  );
}