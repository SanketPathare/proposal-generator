'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { CheckCircle2, DollarSign } from 'lucide-react';
import { CURRENCIES } from '@/lib/utils';

const LANGUAGES = [
  { value: 'en', label: 'English (US / UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
];

export default function ProposalSettingsPage() {
  const { user, settings, refreshSettings } = useAuth();

  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency || 'USD');
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Proposal Defaults</h1>
        <p className="text-sm text-[#71717a] mt-1">Configure default currencies, payment terms, and formats.</p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
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
            <Select
              label="Default Currency"
              options={CURRENCIES.map((c) => ({ value: c.value, label: c.label }))}
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
            label="Default Payment Terms Clause"
            placeholder="e.g. 50% initial milestone deposit upon signing. 50% payable upon final delivery and client QA sign-off. Invoices payable within 14 days."
            value={defaultPaymentTerms}
            onChange={(e) => setDefaultPaymentTerms(e.target.value)}
            rows={4}
          />

          <div className="flex items-center justify-end pt-4 border-t border-[#f4f4f5]">
            <Button variant="accent" size="md" className="font-bold" onClick={handleSave} loading={saving}>
              Save Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
