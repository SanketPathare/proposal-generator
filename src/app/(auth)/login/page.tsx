'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authInstance = getAuth();
      if (!authInstance) {
        setError('Authentication is currently initializing. Please try again.');
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(authInstance, email.trim(), password);
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment.');
      } else {
        setError(err?.message || 'Failed to sign in. You can also try Guest Demo login below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const authInstance = getAuth();
      if (!authInstance) {
        setError('Authentication service not ready. Try Guest Mode below.');
        setGoogleLoading(false);
        return;
      }

      const provider = new GoogleAuthProvider();
      await signInWithPopup(authInstance, provider);
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in was interrupted. You can also try Guest Demo Mode.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    setGuestLoading(true);
    setError('');
    try {
      const authInstance = getAuth();
      if (authInstance) {
        try {
          await signInAnonymously(authInstance);
        } catch {
          // If anonymous sign in is disabled in Firebase console, still allow dashboard demo
        }
      }
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Demo mode error:', err);
      router.replace('/dashboard');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#09090b]">Welcome back</h1>
        <p className="mt-2 text-sm text-[#71717a]">
          Sign in to manage and send your client proposals.
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium leading-relaxed">
          {error}
        </div>
      )}

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#e4e4e7] rounded-full bg-white text-sm font-semibold text-[#09090b] hover:bg-[#f4f4f5] hover:border-[#d4d4d8] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e4e4e7]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#fcfcfd] px-3 text-[#71717a] font-medium">or continue with email</span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="name@agency.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-[34px] text-[#71717a] hover:text-[#09090b] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-xs font-semibold text-[#52525b] hover:text-[#09090b]">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full font-bold" loading={loading}>
          Sign In
        </Button>
      </form>

      {/* Guest Mode Option */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleGuestDemo}
          disabled={guestLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#f4f4f5] hover:bg-[#e4e4e7] text-xs font-bold text-[#09090b] transition-colors cursor-pointer border border-neutral-200"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>{guestLoading ? 'Starting Guest Session...' : 'Instant Demo / Guest Test Drive'}</span>
          <ArrowRight className="h-3 w-3 ml-1" />
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-[#71717a]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#09090b] font-bold hover:underline">
          Create free account
        </Link>
      </p>
    </div>
  );
}