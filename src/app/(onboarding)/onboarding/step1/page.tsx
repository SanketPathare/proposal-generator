'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { User, ArrowRight, ArrowLeft, Camera } from 'lucide-react';

export default function OnboardingStep1Page() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleNext = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await firestoreHelpers.updateUserProfile(user.uid, {
        fullName: fullName.trim(),
        profession: profession.trim(),
        bio: bio.trim(),
      });
      await refreshProfile();
      router.push('/onboarding/step2');
    } catch (err) {
      console.error('Failed to save profile:', err);
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
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">1</div>
          <div className="h-1 w-12 bg-gray-200 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">2</div>
          <div className="h-1 w-12 bg-gray-200 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">3</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            {/* Avatar with initials */}
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative group cursor-pointer">
              <span className="text-2xl font-bold text-primary">{initials}</span>
              <div className="absolute inset-0 rounded-full bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
            <p className="text-gray-500 text-sm mt-1">Tell us about yourself to personalize your experience.</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />

            <Input
              label="Profession"
              placeholder="Web Developer, Designer, Consultant..."
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />

            <Textarea
              label="Bio"
              placeholder="A brief description about yourself and your expertise..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/onboarding')}>
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
