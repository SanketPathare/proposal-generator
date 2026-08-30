'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Template } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, deepClone } from '@/lib/utils';
import {
  Layers,
  Plus,
  Copy,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function MyTemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await firestoreHelpers.getTemplates(user.uid);
      setTemplates(data || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!user || !confirm('Are you sure you want to delete this template?')) return;
    setDeletingId(templateId);
    try {
      await firestoreHelpers.deleteTemplate(user.uid, templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (err) {
      console.error('Failed to delete template:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (template: Template) => {
    if (!user) return;
    setDuplicatingId(template.id);
    try {
      const duplicated = deepClone(template);
      const { id, createdAt, updatedAt, userId, ...rest } = duplicated;
      const newTemplate = await firestoreHelpers.createTemplate(user.uid, {
        ...rest,
        title: `${template.title} (Copy)`,
        isPublic: false,
      });
      setTemplates((prev) => [newTemplate, ...prev]);
    } catch (err) {
      console.error('Failed to duplicate template:', err);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleUseTemplate = async (template: Template) => {
    if (!user) return;
    try {
      const newProposal = await firestoreHelpers.createProposal(user.uid, {
        clientId: null,
        title: template.title,
        purpose: template.description || 'Proposal draft',
        status: 'draft',
        templateId: template.id,
        currency: 'USD',
        sections: template.sections.map((s) => ({ ...s, id: Math.random().toString(36).substring(2, 9) })),
        pricing: null,
        shareId: null,
        sharedAt: null,
        expiresAt: null,
        passwordHash: null,
        lastViewedAt: null,
        acceptedAt: null,
        rejectedAt: null,
      });
      router.push(`/proposals/${newProposal.id}`);
    } catch (err) {
      console.error('Use custom template error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">My Saved Templates</h1>
          <p className="text-sm text-[#71717a] mt-1">Custom templates saved from your proposals.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/templates/explore')}>
            Explore Gallery
          </Button>
          <Button variant="accent" size="sm" className="font-bold" onClick={() => router.push('/proposals/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Proposal
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e4e4e7] p-8">
          <div className="h-14 w-14 rounded-2xl bg-[#f4f4f5] text-[#09090b] flex items-center justify-center mx-auto mb-4">
            <Layers className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#09090b]">No custom templates saved yet</h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-sm mx-auto">
            You can save any proposal as a reusable template directly from the proposal editor or use the pre-built gallery.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="accent" size="md" className="font-bold" onClick={() => router.push('/templates/explore')}>
              Explore Templates
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((template) => (
            <Card key={template.id} hoverEffect className="flex flex-col justify-between overflow-hidden">
              <div className="h-28 bg-[#09090b] text-white p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-[#d4ff00]/10 blur-xl pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 text-[#d4ff00] px-2 py-0.5 rounded-full">
                    {template.category || 'Custom'}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {template.sections.length} sections
                  </span>
                </div>
                <h3 className="text-base font-bold text-white truncate relative z-10">{template.title}</h3>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-[#52525b] leading-relaxed line-clamp-2">
                  {template.description || 'No description provided.'}
                </p>

                <div className="space-y-3 pt-3 border-t border-[#f4f4f5]">
                  <div className="flex items-center justify-between text-[11px] text-[#a1a1aa]">
                    <span>Updated {formatDate(template.updatedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 font-bold text-xs"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={duplicatingId === template.id}
                      onClick={() => handleDuplicate(template)}
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deletingId === template.id}
                      onClick={() => handleDelete(template.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
