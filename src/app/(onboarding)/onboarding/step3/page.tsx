'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Settings, ArrowLeft, Check, Sparkles, PartyPopper } from 'lucide-react';

const currencies = [
  { value: 'INR', label: 'Indian Rupee (INR)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
];

const paymentTerms = [
  { value: 'upfront', label: '100% Upfront' },
  { value: '50-50', label: '50% Advance, 50% on Completion' },
  { value: '30-70', label: '30% Advance, 70% on Completion' },
  { value: 'milestone', label: 'Milestone-based' },
  { value: 'net15', label: 'Net 15' },
  { value: 'net30', label: 'Net 30' },
];

export default function OnboardingStep3Page() {
  const { user, profile, refreshSettings, refreshProfile } = useAuth();
  const router = useRouter();
  const [currency, setCurrency] = useState('INR');
  const [paymentTerm, setPaymentTerm] = useState('50-50');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await firestoreHelpers.setUserSettings(user.uid, {
        currency: currency,
        country: '',
        language: 'en',
        defaultPaymentTerms: paymentTerm,
      });
      await firestoreHelpers.updateUserProfile(user.uid, {
        onboardingCompleted: true,
        onboardingStep: 3,
      });
      await Promise.all([refreshSettings(), refreshProfile()]);
      setCompleted(true);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    try {
      await firestoreHelpers.updateUserProfile(user.uid, {
        onboardingCompleted: true,
        onboardingStep: 3,
      });
      await refreshProfile();
    } catch {}
    setCompleted(true);
  };

  const displayName = profile?.fullName || 'there';
  const profession = profile?.profession || 'Professional';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 flex items-center justify-center p-4">
        <div className={`w-full max-w-lg transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Progress — all done */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                {n < 3 && <div className="h-1 w-12 bg-green-500 rounded-full" />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center">
            <div className="px-8 py-12">
              {/* Initials avatar */}
              <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary">{initials}</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-1.5 mb-4">
                <PartyPopper className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">You&apos;re all set!</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Welcome, {displayName}!
              </h1>
              <p className="text-lg text-primary font-medium mb-1">{profession}</p>
              <p className="text-gray-500 mb-8">You&apos;re ready to start creating professional proposals.</p>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
                {['Profile completed', 'Branding configured', 'Default settings saved'].map((text) => (
                  <div key={text} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{text}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full text-base py-3" onClick={() => router.replace('/dashboard')}>
                Go to Dashboard
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="h-1 w-12 bg-green-500 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="h-1 w-12 bg-green-500 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">3</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-purple-50 flex items-center justify-center mb-4">
              <Settings className="h-9 w-9 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Default Settings</h2>
            <p className="text-gray-500 text-sm mt-1">Configure your default proposal settings. You can change these anytime.</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <Select
              label="Default Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencies}
            />

            <Select
              label="Payment Terms"
              value={paymentTerm}
              onChange={(e) => setPaymentTerm(e.target.value)}
              options={paymentTerms}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/onboarding/step2')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button className="flex-1" onClick={handleFinish} loading={saving}>
                Finish
                <Check className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
