'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Palette, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OnboardingStep2Page() {
  const { user, refreshBranding } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await firestoreHelpers.setUserBranding(user.uid, {
        brandName: companyName.trim(),
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">1</div>
          <div className="h-1 w-12 bg-green-500 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">2</div>
          <div className="h-1 w-12 bg-gray-200 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">3</div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Your Branding</CardTitle>
            <CardDescription>Set up your brand identity for proposals. You can customize this later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <Input
              label="Company Name"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <Input
              label="Website"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-3">Logo and colors can be configured in Settings after onboarding.</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/onboarding/step1')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button className="flex-1" onClick={handleSave} loading={saving}>
                Continue
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}