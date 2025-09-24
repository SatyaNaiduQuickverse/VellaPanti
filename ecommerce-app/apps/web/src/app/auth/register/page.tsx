'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@ecommerce/ui';
import { useRegister } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import type { RegisterRequest } from '@ecommerce/types';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const register = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await register.mutateAsync(registerData);
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
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">Join VellaPanti</h2>
          <p className="text-sm text-gray-600 font-normal">Create your account to get started</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2 tracking-tight">
                Full name
              </label>
              <Input
                id="name"
                type="text"
                {...registerField('name')}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-black focus:border-black transition-all text-sm font-normal`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-2 font-normal">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2 tracking-tight">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                {...registerField('email')}
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
                  {...registerField('password')}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2 tracking-tight">
                Confirm password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...registerField('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } focus:ring-2 focus:ring-black focus:border-black transition-all text-sm font-normal`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-2 font-normal">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="h-4 w-4 mt-1 rounded border-gray-300 text-black focus:ring-black focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-600 font-normal">
                I agree to the{' '}
                <Link href="/terms" className="text-black hover:text-gray-700 font-medium tracking-tight transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-black hover:text-gray-700 font-medium tracking-tight transition-colors">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-900 focus:ring-2 focus:ring-black focus:ring-offset-2 py-3 rounded-lg font-medium text-sm tracking-tight transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting || register.isPending}
            >
              {isSubmitting || register.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-normal">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-black hover:text-gray-700 font-medium tracking-tight transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}