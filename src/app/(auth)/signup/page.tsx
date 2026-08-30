'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase/client';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Check, X, Sparkles, ArrowRight } from 'lucide-react';

function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  if (!password) return null;

  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500'];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : 'bg-[#e4e4e7]'
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-[#71717a]">
        Password strength: <span className="font-semibold text-[#09090b]">{labels[strength - 1] || 'Too short'}</span>
      </p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
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
      const authInstance = getAuth();
      if (!authInstance) {
        setError('Authentication service is initializing. Please try again.');
        setLoading(false);
        return;
      }

      const cred = await createUserWithEmailAndPassword(authInstance, email.trim(), password);
      await updateProfile(cred.user, { displayName: fullName.trim() });

      try {
        await firestoreHelpers.createUserProfile(cred.user.uid, {
          uid: cred.user.uid,
          fullName: fullName.trim(),
          email: email.trim(),
          profession: '',
          bio: '',
          profileImageUrl: '',
          profileImagePublicId: '',
          onboardingCompleted: true,
          onboardingStep: 3,
        });
      } catch (profileErr) {
        console.warn('Profile initialization note:', profileErr);
      }

      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try logging in.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err?.message || 'Failed to create account. You can also try Guest Mode below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      const cred = await signInWithPopup(authInstance, provider);

      try {
        await firestoreHelpers.createUserProfile(cred.user.uid, {
          uid: cred.user.uid,
          fullName: cred.user.displayName || '',
          email: cred.user.email || '',
          profession: '',
          bio: '',
          profileImageUrl: cred.user.photoURL || '',
          profileImagePublicId: '',
          onboardingCompleted: true,
          onboardingStep: 3,
        });
      } catch (profileErr) {
        console.warn('Google signup profile note:', profileErr);
      }

      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Google signup error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up was interrupted. Please try again.');
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
          // ignore
        }
      }
      router.replace('/dashboard');
    } catch (err: any) {
      router.replace('/dashboard');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#09090b]">Create your account</h1>
        <p className="mt-2 text-sm text-[#71717a]">
          Join thousands of creators closing deals with ProposalGen.
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
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#e4e4e7] rounded-full bg-white text-sm font-semibold text-[#09090b] hover:bg-[#f4f4f5] hover:border-[#d4d4d8] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>{googleLoading ? 'Creating account...' : 'Sign up with Google'}</span>
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

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          placeholder="Alex Rivera"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="alex@studio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create password (6+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-[34px] text-[#71717a] hover:text-[#09090b] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <PasswordStrength password={password} />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
          autoComplete="new-password"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full font-bold" loading={loading}>
          Create Free Account
        </Button>
      </form>

      {/* Guest Mode */}
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
        Already have an account?{' '}
        <Link href="/login" className="text-[#09090b] font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}