'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Palette, ArrowRight, ArrowLeft, Upload } from 'lucide-react';

export default function OnboardingStep2Page() {
  const { user, refreshBranding } = useAuth();
  const router = useRouter();
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await firestoreHelpers.setUserBranding(user.uid, {
        brandName: brandName.trim(),
        website: website.trim(),
        logoUrl: '',
        logoPublicId: '',
        email: '',
        phone: '',
        portfolioUrl: '',
      });
      await refreshBranding();
      router.push('/onboarding/step3');
    } catch (err) {
      console.error('Failed to save branding:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="h-1 w-12 bg-green-500 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">2</div>
          <div className="h-1 w-12 bg-gray-200 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">3</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Palette className="h-9 w-9 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Branding</h2>
            <p className="text-gray-500 text-sm mt-1">Set up your brand identity for proposals. You can customize this later.</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            {/* Logo upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Upload your logo</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB (optional)</p>
            </div>

            <Input
              label="Brand / Company Name"
              placeholder="Acme Inc."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />

            <Input
              label="Website"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              type="url"
            />

            <p className="text-xs text-gray-400">Email, phone, and more can be configured in Settings after onboarding.</p>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/onboarding/step1')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button className="flex-1" onClick={handleNext} loading={saving}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
