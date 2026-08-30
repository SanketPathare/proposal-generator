'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage as getStorage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';

export default function ProfileSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setProfession(profile.profession || '');
      setBio(profile.bio || '');
      setProfileImagePreview(profile.profileImageUrl || null);
    }
    setLoading(false);
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      let profileImageUrl = profile?.profileImageUrl || '';
      let profileImagePublicId = profile?.profileImagePublicId || '';

      if (profileImageFile) {
        const storageRef = ref(getStorage(), `users/${user.uid}/profile/${Date.now()}_${profileImageFile.name}`);
        const snapshot = await uploadBytes(storageRef, profileImageFile);
        profileImageUrl = await getDownloadURL(snapshot.ref);
        profileImagePublicId = '';
      }

      await firestoreHelpers.updateUserProfile(user.uid, {
        fullName: fullName.trim(),
        profession: profession.trim(),
        bio: bio.trim(),
        profileImageUrl,
        profileImagePublicId,
      });

      await refreshProfile();
      setProfileImageFile(null);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your personal profile information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Update your name, profession, bio, and profile picture.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar
                src={profileImagePreview}
                fallback={fullName}
                size="xl"
              />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </Button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={error && !fullName.trim() ? 'Required' : undefined}
              />
              <Input
                label="Profession"
                placeholder="Web Developer"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
            </div>

            <Textarea
              label="Bio"
              placeholder="Tell us a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px]"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="flex items-center gap-2">
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
