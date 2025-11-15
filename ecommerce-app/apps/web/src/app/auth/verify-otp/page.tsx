'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

const verifyOtpSchema = z.object({
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Redirect if no phone number
  useEffect(() => {
    if (!phone) {
      toast.error('Phone number is required');
      router.push('/auth/register');
    }
  }, [phone, router]);

  const onSubmit = async (data: VerifyOtpFormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          otp: data.otp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'OTP verification failed');
      }

      // Store auth data
      setAuth(result.data);

      toast.success('Phone verified successfully! Welcome to VellaPanti!');
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP verification failed');
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || !phone) return;

    setIsResending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend OTP');
      }

      toast.success('OTP sent successfully!');
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            VERIFY OTP
          </h1>
          <p className="mt-4 text-base text-gray-600">
            We&apos;ve sent a 6-digit code to
            <br />
            <span className="font-semibold text-gray-900">+91 {phone}</span>
          </p>
        </div>

        <div className="mt-8 bg-white py-10 px-8 shadow-xl rounded-lg border-2 border-black">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-bold text-gray-900 uppercase tracking-wide"
              >
                Enter OTP
              </label>
              <div className="mt-2">
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className={`block w-full rounded-md border-2 px-4 py-3 text-center text-2xl font-bold tracking-widest ${
                    errors.otp
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-black focus:border-black focus:ring-black'
                  }`}
                  {...register('otp')}
                />
                {errors.otp && (
                  <p className="mt-2 text-sm text-red-600">{errors.otp.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border-2 border-black rounded-md shadow-sm text-base font-black uppercase tracking-wide text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'VERIFYING...' : 'VERIFY OTP'}
              </button>
            </div>

            <div className="text-center mt-4">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-sm font-semibold text-black hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
              ) : (
                <p className="text-sm text-gray-600">
                  Resend OTP in{' '}
                  <span className="font-bold text-black">{timer}s</span>
                </p>
              )}
            </div>

            <div className="text-center pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/auth/register')}
                className="text-sm font-semibold text-gray-700 hover:text-black hover:underline"
              >
                Change phone number?
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Didn&apos;t receive the code? Check your phone or try resending.
        </p>
      </div>
    </div>
  );
}
