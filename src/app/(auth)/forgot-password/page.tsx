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
      const auth = getAuth();
      if (auth) {
        await sendPasswordResetEmail(auth, email.trim());
      }
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
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200">
            <CheckCircle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#09090b]">Check your email</h1>
          <p className="mt-2 text-[#71717a] text-xs leading-relaxed">
            We&apos;ve sent a password reset link to <span className="font-semibold text-[#09090b]">{email}</span>.
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full font-semibold"
          onClick={() => {
            setSent(false);
            setEmail('');
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Try a different email
        </Button>

        <Link href="/login" className="block text-center text-xs font-semibold text-[#71717a] hover:text-[#09090b]">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#09090b]">Reset your password</h1>
        <p className="mt-2 text-sm text-[#71717a]">
          Enter your email and we&apos;ll send you a recovery link.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full font-bold" loading={loading}>
          Send Reset Link
        </Button>
      </form>

      <Link href="/login" className="block text-center text-xs font-semibold text-[#71717a] hover:text-[#09090b]">
        <ArrowLeft className="h-3.5 w-3.5 inline mr-1" />
        Back to Sign In
      </Link>
    </div>
  );
}