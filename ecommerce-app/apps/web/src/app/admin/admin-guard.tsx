'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, hasHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated()) {
      // Redirect to login if not authenticated
      router.push('/auth/login?redirect=/admin');
    } else if (hasHydrated && user && user.role !== 'ADMIN') {
      // Redirect to home if not admin
      router.push('/');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated() || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg font-bold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}