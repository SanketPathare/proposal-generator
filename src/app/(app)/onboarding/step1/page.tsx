'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { User, ArrowRight } from 'lucide-react';

export default function OnboardingStep1Page() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">1</div>
          <div className="h-1 w-12 bg-gray-200 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">2</div>
          <div className="h-1 w-12 bg-gray-200 rounded-full" />
          <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">3</div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Your Profile</CardTitle>
            <CardDescription>Tell us about yourself so we can personalize your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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

            <Button className="w-full" onClick={handleSave} loading={saving}>
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}