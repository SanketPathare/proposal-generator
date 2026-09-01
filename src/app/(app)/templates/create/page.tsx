'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Template, ProposalSection, SectionType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { cn, generateId } from '@/lib/utils';

const TEMPLATE_CATEGORIES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'branding', label: 'Branding' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'writing', label: 'Writing & Content' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
];

const SECTION_TYPES: { value: SectionType; label: string }[] = [
  { value: 'cover', label: 'Cover Page' },
  { value: 'heading', label: 'Heading' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'about_me', label: 'About Me' },
  { value: 'requirements', label: 'Requirements' },
  { value: 'overview', label: 'Overview' },
  { value: 'scope', label: 'Scope' },
  { value: 'features', label: 'Features' },
  { value: 'deliverables', label: 'Deliverables' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'terms', label: 'Terms & Conditions' },
  { value: 'payment_terms', label: 'Payment Terms' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'conclusion', label: 'Conclusion' },
  { value: 'contact', label: 'Contact' },
];

const DEFAULT_TEMPLATE_STYLES = {
  fonts: { heading: 'Inter', body: 'Inter' },
  colors: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', background: '#ffffff', text: '#1f2937' },
  logoPosition: 'left' as const,
  header: '',
  footer: '',
  coverLayout: 'standard' as const,
  sectionStyle: 'cards' as const,
  borderStyle: 'rounded' as const,
  accentStyle: 'glow' as const,
  pricingStyle: 'standard' as const,
  timelineStyle: 'vertical' as const,
};

function createEmptySection(order: number): ProposalSection {
  return {
    id: generateId(),
    type: 'paragraph',
    title: 'New Section',
    content: { text: '' },
    order,
  };
}

export default function CreateTemplatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('web-development');
  const [sections, setSections] = useState<ProposalSection[]>([createEmptySection(0)]);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editId || !user) return;
    loadTemplate(editId);
  }, [editId, user]);

  const loadTemplate = async (templateId: string) => {
    if (!user) return;
    setLoadingEdit(true);
    try {
      const template = await firestoreHelpers.getTemplate(user.uid, templateId);
      if (template) {
        setName(template.title);
        setDescription(template.description);
        setCategory(template.category);
        setSections(template.sections.length > 0 ? template.sections : [createEmptySection(0)]);
      }
    } catch (err) {
      console.error('Failed to load template:', err);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleAddSection = () => {
    setSections((prev) => [...prev, createEmptySection(prev.length)]);
  };

  const handleRemoveSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<ProposalSection>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === sectionId);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated.map((s, i) => ({ ...s, order: i }));
    });
  };

  const handleSave = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!name.trim()) {
      setError('Template name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const templateData = {
        title: name.trim(),
        description: description.trim(),
        category,
        thumbnailUrl: '',
        thumbnailPublicId: '',
        sections: sections.map((s, i) => ({ ...s, order: i })),
        styles: DEFAULT_TEMPLATE_STYLES,
        isPublic: false,
        userId: user.uid,
      };

      if (editId) {
        await firestoreHelpers.updateTemplate(user.uid, editId, templateData);
      } else {
        await firestoreHelpers.createTemplate(user.uid, templateData);
      }

      router.push('/templates/my');
    } catch (err) {
      console.error('Failed to save template:', err);
      setError('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {editId ? 'Edit Template' : 'Create Template'}
        </h1>
        <p className="text-gray-500 mt-1">Define your template structure and content sections.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Template Name"
            placeholder="e.g., Web Development Proposal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!name.trim() && error ? 'Name is required' : undefined}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of this template..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <Select
            label="Category"
            options={TEMPLATE_CATEGORIES}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
          <Button variant="outline" size="sm" onClick={handleAddSection}>
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Section
          </Button>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">No sections added yet. Click &quot;Add Section&quot; to begin.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <Card key={section.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 pt-8">
                      <button
                        onClick={() => handleMoveSection(section.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
                      <button
                        onClick={() => handleMoveSection(section.id, 'down')}
                        disabled={index === sections.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          placeholder="Section title"
                          value={section.title}
                          onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                          className="flex-1"
                        />
                        <Select
                          options={SECTION_TYPES}
                          value={section.type}
                          onChange={(e) =>
                            handleUpdateSection(section.id, {
                              type: e.target.value as SectionType,
                            })
                          }
                          className="w-44"
                        />
                      </div>
                      <Textarea
                        placeholder="Section content..."
                        value={typeof section.content === 'object' && section.content?.text ? section.content.text : ''}
                        onChange={(e) =>
                          handleUpdateSection(section.id, {
                            content: { ...section.content, text: e.target.value },
                          })
                        }
                        rows={3}
                      />
                    </div>

                    <button
                      onClick={() => handleRemoveSection(section.id)}
                      disabled={sections.length <= 1}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed mt-8"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button loading={saving} onClick={handleSave}>
          {editId ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </div>
  );
}
