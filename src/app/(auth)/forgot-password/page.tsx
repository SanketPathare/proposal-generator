'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(getAuth(), email.trim());
      setSent(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-500 text-sm">
            We&apos;ve sent a password reset link to{' '}
            <span className="font-medium text-gray-700">{email}</span>.
            Check your inbox and follow the instructions.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p>Didn&apos;t receive the email? Check your spam folder or try again with a different email address.</p>
        </div>

        <Button variant="outline" className="w-full" onClick={() => { setSent(false); setEmail(''); }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Try a different email
        </Button>

        <Link href="/login" className="block text-center text-sm text-gray-500 hover:text-gray-700">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <Mail className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-700">
            Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <Button type="submit" className="w-full" loading={loading}>
          Send Reset Link
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