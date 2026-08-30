'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase/client';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Check, X } from 'lucide-react';

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
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Password strength: <span className="font-medium">{labels[strength - 1] || 'Too short'}</span>
      </p>
    </div>
  );
}

function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="space-y-1">
      {requirements.map((req) => (
        <div key={req.label} className="flex items-center gap-1.5 text-xs">
          {req.met ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <X className="h-3 w-3 text-gray-400" />
          )}
          <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.label}</span>
        </div>
      ))}
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
        setError('Authentication service is not available. Please refresh the page and try again.');
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
          onboardingCompleted: false,
          onboardingStep: 1,
        });
      } catch (profileErr) {
        console.warn('Failed to create user profile, but account was created:', profileErr);
      }

      router.replace('/onboarding/step1');
    } catch (err: any) {
      console.error('Signup error:', err);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err?.message || 'Failed to create account. Please try again.');
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
        setError('Authentication service is not available. Please refresh the page and try again.');
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
          onboardingCompleted: false,
          onboardingStep: 1,
        });
      } catch (profileErr) {
        console.warn('Failed to create user profile after Google signup:', profileErr);
      }

      router.replace('/onboarding/step1');
    } catch (err: any) {
      console.error('Google signup error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        if (err.code === 'auth/account-exists-with-different-credential') {
          setError('An account already exists with this email. Try signing in instead.');
        } else if (err.code === 'auth/network-request-failed') {
          setError('Network error. Please check your internet connection.');
        } else {
          setError('Failed to sign up with Google. Please try again.');
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start creating professional proposals today
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <svg className="h-5 w-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {googleLoading ? 'Creating account...' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-50 px-3 text-gray-500">or continue with email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
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

        <PasswordStrength password={password} />
        <PasswordRequirements password={password} />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </div>
  );
}