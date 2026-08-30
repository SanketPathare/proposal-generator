'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const CURRENCIES = [
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
];

export default function ProposalSettingsPage() {
  const { user, settings, refreshSettings } = useAuth();

  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('en');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency || 'INR');
      setLanguage(settings.language || 'en');
      setDefaultPaymentTerms(settings.defaultPaymentTerms || '');
    }
    setLoading(false);
  }, [settings]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await firestoreHelpers.setUserSettings(user.uid, {
        currency,
        country: settings?.country || '',
        language,
        defaultPaymentTerms: defaultPaymentTerms.trim(),
      });

      await refreshSettings();
      setSuccess('Proposal settings updated successfully.');
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to save settings. Please try again.');
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
        <h1 className="text-2xl font-bold text-gray-900">Proposal Settings</h1>
        <p className="text-gray-500 mt-1">Configure default values for your proposals.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Defaults</CardTitle>
          <CardDescription>These values will be used as defaults when creating new proposals.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Default Currency"
                options={CURRENCIES}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
              <Select
                label="Default Language"
                options={LANGUAGES}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>

            <Textarea
              label="Default Payment Terms"
              placeholder="e.g. 50% upfront, 50% upon completion. Net 15 days."
              value={defaultPaymentTerms}
              onChange={(e) => setDefaultPaymentTerms(e.target.value)}
              className="min-h-[120px]"
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
