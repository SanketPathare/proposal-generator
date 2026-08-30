'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage as getStorage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function BrandingSettingsPage() {
  const { user, branding, refreshBranding } = useAuth();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (branding) {
      setBrandName(branding.brandName || '');
      setEmail(branding.email || '');
      setPhone(branding.phone || '');
      setWebsite(branding.website || '');
      setPortfolioUrl(branding.portfolioUrl || '');
      setLogoPreview(branding.logoUrl || null);
    }
    setLoading(false);
  }, [branding]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      let logoUrl = branding?.logoUrl || '';
      let logoPublicId = branding?.logoPublicId || '';

      if (logoFile) {
        const storageRef = ref(getStorage(), `users/${user.uid}/branding/${Date.now()}_${logoFile.name}`);
        const snapshot = await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(snapshot.ref);
        logoPublicId = '';
      }

      await firestoreHelpers.setUserBranding(user.uid, {
        logoUrl,
        logoPublicId,
        brandName: brandName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: website.trim(),
        portfolioUrl: portfolioUrl.trim(),
      });

      await refreshBranding();
      setLogoFile(null);
      setSuccess('Branding settings updated successfully.');
    } catch (err) {
      console.error('Failed to update branding:', err);
      setError('Failed to save branding settings. Please try again.');
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
        <h1 className="text-2xl font-bold text-gray-900">Branding Settings</h1>
        <p className="text-gray-500 mt-1">Customize your brand identity for proposals.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brand Details</CardTitle>
          <CardDescription>Set your logo, brand name, and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                ) : (
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                >
                  Upload Logo
                </Button>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, or SVG. Recommended: 200x200px.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Brand Name"
                placeholder="Your Brand"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="hello@yourbrand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Website"
                type="url"
                placeholder="https://yourbrand.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <Input
                label="Portfolio URL"
                type="url"
                placeholder="https://portfolio.yourbrand.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="md:col-span-2"
              />
            </div>

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
