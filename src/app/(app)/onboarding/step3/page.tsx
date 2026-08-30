'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Settings, ArrowLeft, Check } from 'lucide-react';

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
  const { user, refreshSettings } = useAuth();
  const router = useRouter();
  const [currency, setCurrency] = useState('INR');
  const [paymentTerm, setPaymentTerm] = useState('50-50');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
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
      await refreshSettings();
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">1</div>
          <div className="h-1 w-12 bg-green-500 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">2</div>
          <div className="h-1 w-12 bg-green-500 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">3</div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Default Settings</CardTitle>
            <CardDescription>Configure your default proposal settings. You can change these anytime.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Button className="flex-1" onClick={handleSave} loading={saving}>
                <Check className="h-4 w-4 mr-1" />
                Finish
              </Button>
            </div>

            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              Skip for now
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}