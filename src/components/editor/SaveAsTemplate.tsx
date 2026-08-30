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
import { X, Check, Loader2 } from 'lucide-react';

interface SaveAsTemplateProps {
  proposal: Proposal;
  open: boolean;
  onClose: () => void;
  onSave?: (template: Template) => void;
}

const categories = [
  { value: 'general', label: 'General' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'seo', label: 'SEO' },
  { value: 'marketing', label: 'Digital Marketing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'writing', label: 'Writing & Content' },
  { value: 'design', label: 'Graphic Design' },
];

export function SaveAsTemplate({ proposal, open, onClose, onSave }: SaveAsTemplateProps) {
  const { user } = useAuth();
  const [name, setName] = useState(`${proposal.title} Template`);
  const [description, setDescription] = useState(proposal.purpose);
  const [category, setCategory] = useState('general');
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
          fonts: { heading: 'Inter', body: 'Inter' },
          colors: { primary: '#2563eb', secondary: '#f1f5f9', accent: '#3b82f6', background: '#ffffff', text: '#171717' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Save as Template</CardTitle>
                <CardDescription>Save this proposal as a reusable template</CardDescription>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <Input
              label="Template Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Website Proposal Template"
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is for..."
              rows={3}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1" disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={saving} className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Save Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}