'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@ecommerce/ui';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest } from '@ecommerce/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login.mutateAsync(data);
      router.push('/');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans">
      {/* Fashion-themed Black & White Background */}
      <div className="absolute inset-0 bg-black">
        {/* Product showcase background - blurred fashion items */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-10 left-10 w-64 h-64 bg-cover bg-center rounded-lg blur-2xl transform rotate-12"
            style={{ backgroundImage: 'url(/images/products/skull-beats-1.png)', filter: 'grayscale(100%) contrast(1.2)' }}
          ></div>
          <div
            className="absolute bottom-20 right-20 w-72 h-72 bg-cover bg-center rounded-lg blur-2xl transform -rotate-12"
            style={{ backgroundImage: 'url(/images/products/drip-skull-tee-1.png)', filter: 'grayscale(100%) contrast(1.2)' }}
          ></div>
          <div
            className="absolute top-1/3 right-10 w-56 h-56 bg-cover bg-center rounded-lg blur-2xl transform rotate-45"
            style={{ backgroundImage: 'url(/images/products/gradient-skull-1.png)', filter: 'grayscale(100%) contrast(1.2)' }}
          ></div>
        </div>

        {/* Geometric pattern overlay - fashion grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Fabric texture pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.02) 35px, rgba(255,255,255,.02) 70px)',
        }}></div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white tracking-tighter mb-3 drop-shadow-lg">
            VellaPanti
          </h2>
          <p className="text-base text-gray-300 font-light tracking-wide">Sign in to continue your journey</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3 tracking-tight uppercase text-xs">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                placeholder="name@company.com"
                className={`w-full px-5 py-4 rounded-xl border-2 ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                } focus:ring-4 focus:ring-black/10 focus:border-black transition-all text-base font-medium placeholder:text-gray-400 placeholder:font-normal`}
                suppressHydrationWarning
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-2 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-3 tracking-tight uppercase text-xs">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full px-5 py-4 pr-12 rounded-xl border-2 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:ring-4 focus:ring-black/10 focus:border-black transition-all text-base font-medium placeholder:text-gray-400 placeholder:font-normal`}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs mt-2 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black focus:ring-2 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-black transition-colors">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-black hover:text-gray-600 font-semibold tracking-tight transition-colors underline decoration-2 underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 focus:ring-4 focus:ring-black/20 focus:ring-offset-0 py-4 rounded-xl font-bold text-base tracking-tight transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={isSubmitting || login.isPending}
            >
              {isSubmitting || login.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-black hover:text-gray-600 font-bold tracking-tight transition-colors underline decoration-2 underline-offset-2">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}