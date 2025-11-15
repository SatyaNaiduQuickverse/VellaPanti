'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@ecommerce/ui';
import { useRegister } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import type { RegisterRequest } from '@ecommerce/types';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number. Must be a 10-digit Indian mobile number starting with 6-9')
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits'),
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Redirect to OTP verification page with phone number
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(registerData.phone)}`);
    } catch (error) {
      // Error is handled by toast in the component
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans py-12">
      {/* Fashion-themed Black & White Background */}
      <div className="absolute inset-0 bg-black">
        {/* Product showcase background - blurred fashion items */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-10 right-10 w-64 h-64 bg-cover bg-center rounded-lg blur-2xl transform -rotate-12"
            style={{ backgroundImage: 'url(/images/products/crown-skull-1.png)', filter: 'grayscale(100%) contrast(1.2)' }}
          ></div>
          <div
            className="absolute bottom-20 left-20 w-72 h-72 bg-cover bg-center rounded-lg blur-2xl transform rotate-12"
            style={{ backgroundImage: 'url(/images/products/x-face-rebel-1.png)', filter: 'grayscale(100%) contrast(1.2)' }}
          ></div>
          <div
            className="absolute top-1/3 left-10 w-56 h-56 bg-cover bg-center rounded-lg blur-2xl transform -rotate-45"
            style={{ backgroundImage: 'url(/images/products/skull-splash-1.png)', filter: 'grayscale(100%) contrast(1.2)' }}
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
            JOIN VELLAPANTI
          </h2>
          <p className="text-base text-gray-300 font-light tracking-wide">Create your account and start shopping</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3 tracking-tight uppercase text-xs">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                {...registerField('name')}
                placeholder="John Doe"
                className={`w-full px-5 py-4 rounded-xl border-2 ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                } focus:ring-4 focus:ring-black/10 focus:border-black transition-all text-base font-medium placeholder:text-gray-400 placeholder:font-normal`}
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-2 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3 tracking-tight uppercase text-xs">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                {...registerField('email')}
                placeholder="name@company.com"
                className={`w-full px-5 py-4 rounded-xl border-2 ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                } focus:ring-4 focus:ring-black/10 focus:border-black transition-all text-base font-medium placeholder:text-gray-400 placeholder:font-normal`}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-2 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-3 tracking-tight uppercase text-xs">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 py-4 rounded-l-xl border-2 border-r-0 border-gray-200 bg-gray-100 text-gray-700 font-semibold text-base">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  {...registerField('phone')}
                  placeholder="9876543210"
                  className={`w-full px-5 py-4 rounded-r-xl border-2 ${
                    errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:ring-4 focus:ring-black/10 focus:border-black transition-all text-base font-medium placeholder:text-gray-400 placeholder:font-normal`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-600 text-xs mt-2 font-medium">{errors.phone.message}</p>
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
                  {...registerField('password')}
                  placeholder="••••••••"
                  className={`w-full px-5 py-4 pr-12 rounded-xl border-2 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:ring-4 focus:ring-black/10 focus:border-black transition-all text-base font-medium placeholder:text-gray-400 placeholder:font-normal`}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-3 tracking-tight uppercase text-xs">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...registerField('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full px-5 py-4 pr-12 rounded-xl border-2 ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } focus:ring-4 focus:ring-black/10 focus:border-black transition-all text-base font-medium placeholder:text-gray-400 placeholder:font-normal`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-2 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start pt-2">
              <input
                type="checkbox"
                required
                className="h-4 w-4 mt-1 rounded border-gray-300 text-black focus:ring-black focus:ring-2 cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700 font-medium leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-black hover:text-gray-600 font-semibold tracking-tight transition-colors underline decoration-2 underline-offset-2">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-black hover:text-gray-600 font-semibold tracking-tight transition-colors underline decoration-2 underline-offset-2">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800 focus:ring-4 focus:ring-black/20 focus:ring-offset-0 py-4 rounded-xl font-bold text-base tracking-tight transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={isSubmitting || register.isPending}
            >
              {isSubmitting || register.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-black hover:text-gray-600 font-bold tracking-tight transition-colors underline decoration-2 underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}