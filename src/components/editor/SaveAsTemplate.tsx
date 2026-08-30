'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, Template } from '@/types';
import { X, Check, Layers } from 'lucide-react';

interface SaveAsTemplateProps {
  proposal: Proposal;
  open: boolean;
  onClose: () => void;
  onSave?: (template: Template) => void;
}

const categories = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'marketing', label: 'Marketing & SEO' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'writing', label: 'Writing & Content' },
  { value: 'general', label: 'General / Other' },
];

export function SaveAsTemplate({ proposal, open, onClose, onSave }: SaveAsTemplateProps) {
  const { user } = useAuth();
  const [name, setName] = useState(`${proposal.title} Template`);
  const [description, setDescription] = useState(proposal.purpose);
  const [category, setCategory] = useState('web-development');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      const template = await firestoreHelpers.createTemplate(user.uid, {
        title: name.trim(),
        description: description.trim(),
        category,
        thumbnailUrl: '',
        thumbnailPublicId: '',
        sections: proposal.sections,
        styles: {
          fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
          colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
          logoPosition: 'left',
          header: '',
          footer: '',
        },
        isPublic: false,
      });
      onSave?.(template);
      onClose();
    } catch (err) {
      setError('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <Card className="shadow-2xl border-[#e4e4e7] overflow-hidden">
          <CardHeader className="pb-3 border-b border-[#f4f4f5]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-[#09090b] text-[#d4ff00] flex items-center justify-center">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Save as Template</CardTitle>
                  <CardDescription className="text-xs">Reuse this proposal structure for future deals</CardDescription>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg text-[#a1a1aa] hover:text-[#09090b] transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">{error}</div>
            )}

            <Input
              label="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Next.js SaaS Web App Proposal"
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what projects this template is best suited for..."
              rows={2}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories}
            />

            <div className="flex gap-2.5 pt-3">
              <Button variant="outline" onClick={onClose} className="flex-1 font-semibold text-xs" disabled={saving}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleSave} loading={saving} className="flex-1 font-bold text-xs">
                <Check className="h-3.5 w-3.5 mr-1" />
                Save Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}