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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">VellaPanti</h2>
          <p className="text-sm text-gray-600 font-normal">Sign in to your account or create a new one</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2 tracking-tight">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="name@company.com"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-black focus:border-black transition-all text-sm font-normal`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-2 font-normal">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2 tracking-tight">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } focus:ring-2 focus:ring-black focus:border-black transition-all text-sm font-normal`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-2 font-normal">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600 font-normal">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-black hover:text-gray-700 font-medium tracking-tight transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-black focus:ring-offset-2 py-3 rounded-lg font-medium text-sm tracking-tight transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting || login.isPending}
            >
              {isSubmitting || login.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-normal">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-black hover:text-gray-700 font-medium tracking-tight transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-900 mb-3 tracking-tight">Demo Credentials:</p>
          <div className="space-y-2 text-sm font-normal">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-700"><span className="font-medium">User:</span> user@example.com</div>
              <div className="text-gray-600 text-xs mt-1">Password: user123</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-700"><span className="font-medium">Admin:</span> admin@vellapanti.com</div>
              <div className="text-gray-600 text-xs mt-1">Password: admin123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}