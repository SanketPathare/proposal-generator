'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmPasswordReset } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!oobCode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h1>
          <p className="mt-2 text-gray-500 text-sm">
            This password reset link is invalid or missing. Please request a new one.
          </p>
        </div>

        <Link href="/forgot-password">
          <Button className="w-full">Request New Link</Button>
        </Link>

        <Link href="/login" className="block text-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Back to Sign In
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Password Reset Successfully</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>

        <Button className="w-full" onClick={() => router.push('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await confirmPasswordReset(getAuth(), oobCode, password);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/invalid-action-code') {
        setError('This reset link is invalid or has expired. Please request a new one.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your new password below
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleReset} className="space-y-4">
        <div className="relative">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" loading={loading}>
          Reset Password
        </Button>
      </form>

      {/* Footer */}
      <Link href="/login" className="block text-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4 inline mr-1" />
        Back to Sign In
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}