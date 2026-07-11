'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.resetPassword(token, data.newPassword);
      setSuccess(response.message || 'Password reset successfully');

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <p className="text-red-600 mb-4">Invalid or missing reset token</p>
            <Link href="/forgot-password" className="text-terracotta hover:text-terracotta-hover">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight text-ink">
            Reset <em className="text-terracotta not-italic">Password</em>
          </h1>
          <p className="mt-2 text-muted font-light">
            Enter your new password
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-600">
              {success}
              <p className="mt-1 text-xs">Redirecting to login...</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-ink mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink placeholder:text-muted/50 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                placeholder="••••••••"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink placeholder:text-muted/50 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full rounded-full bg-terracotta px-8 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-terracotta-hover hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center text-sm text-muted">
            <Link href="/login" className="text-terracotta hover:text-terracotta-hover font-medium transition">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
