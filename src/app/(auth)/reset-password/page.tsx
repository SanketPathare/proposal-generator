'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ArrowLeft, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(!!oobCode);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
    if (!oobCode) {
      setError('Invalid reset link. Please request a new one.');
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

  if (!oobCode) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
          <p className="text-gray-500 mb-6">
            This password reset link is invalid or missing. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full">Request New Link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successfully</h1>
          <p className="text-gray-500 mb-6">Your password has been updated. You can now sign in with your new password.</p>
          <Button className="w-full" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" className="w-full" loading={loading}>
            Reset Password
          </Button>
        </form>

        <Link href="/login" className="block text-center text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Back to Sign In
        </Link>
      </CardContent>
    </Card>
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