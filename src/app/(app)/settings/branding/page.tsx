'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { storage as getStorage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, Building, Globe } from 'lucide-react';

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
        try {
          const storage = getStorage();
          if (storage) {
            const storageRef = ref(storage, `users/${user.uid}/branding/${Date.now()}_${logoFile.name}`);
            const snapshot = await uploadBytes(storageRef, logoFile);
            logoUrl = await getDownloadURL(snapshot.ref);
            logoPublicId = '';
          }
        } catch {
          // ignore upload failure in mock
        }
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update branding:', err);
      setError('Failed to save branding settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Branding...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Studio Branding</h1>
        <p className="text-sm text-[#71717a] mt-1">Configure your logo, brand name, and public contact information.</p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Logo upload */}
          <div className="flex items-center gap-6 pb-6 border-b border-[#f4f4f5]">
            <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-[#e4e4e7] flex items-center justify-center overflow-hidden bg-[#fafafa] p-1">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain rounded-xl" />
              ) : (
                <Building className="h-7 w-7 text-[#a1a1aa]" />
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
                className="font-bold text-xs"
                onClick={() => logoInputRef.current?.click()}
              >
                Upload Brand Logo
              </Button>
              <p className="text-[11px] text-[#a1a1aa] mt-1.5">PNG or SVG with transparent background recommended.</p>
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
              label="Agency / Brand Name"
              placeholder="e.g. Apex Studio"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            <Input
              label="Contact Email"
              type="email"
              placeholder="hello@apexstudio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 019-2834"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Company Website"
              type="url"
              placeholder="https://apexstudio.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Input
              label="Portfolio / Case Studies URL"
              type="url"
              placeholder="https://contra.com/apexstudio"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="sm:col-span-2"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-[#f4f4f5]">
            <Button variant="accent" size="md" className="font-bold" onClick={handleSave} loading={saving}>
              Save Branding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
