'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage as getStorage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { CheckCircle2, UserCheck, Sparkles } from 'lucide-react';

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
        try {
          const storage = getStorage();
          if (storage) {
            const storageRef = ref(storage, `users/${user.uid}/profile/${Date.now()}_${profileImageFile.name}`);
            const snapshot = await uploadBytes(storageRef, profileImageFile);
            profileImageUrl = await getDownloadURL(snapshot.ref);
            profileImagePublicId = '';
          }
        } catch {
          // ignore upload failure in dev/mock
        }
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
      setTimeout(() => setSuccess(''), 3000);
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
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Personal Profile</h1>
        <p className="text-sm text-[#71717a] mt-1">Manage your creator persona, avatar, and proposal bio.</p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6 pb-6 border-b border-[#f4f4f5]">
            <Avatar
              src={profileImagePreview}
              fallback={fullName || 'User'}
              size="lg"
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
                className="font-bold text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Avatar
              </Button>
              <p className="text-[11px] text-[#a1a1aa] mt-1.5">PNG, JPG, or SVG under 2MB.</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> {success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="Alex Rivera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Profession / Title"
              placeholder="e.g. Senior Product Designer & Consultant"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            />
          </div>

          <Textarea
            label="Proposal Bio / About Us"
            placeholder="Introduce your background, awards, experience, and value proposition..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />

          <div className="flex items-center justify-end pt-4 border-t border-[#f4f4f5]">
            <Button variant="accent" size="md" className="font-bold" onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
