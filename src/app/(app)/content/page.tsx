'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { SavedContent, ContentCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { cn, formatDate } from '@/lib/utils';
import {
  Library,
  Plus,
  Copy,
  Check,
  Edit2,
  Trash2,
  FileText,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: { value: ContentCategory; label: string }[] = [
  { value: 'about_me', label: 'About Us / Bio' },
  { value: 'services', label: 'Services & Scope' },
  { value: 'payment_terms', label: 'Payment Terms' },
  { value: 'terms_conditions', label: 'Terms & Conditions' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'portfolio', label: 'Portfolio Case Studies' },
];

export default function ContentPage() {
  const { user } = useAuth();
  const [allContent, setAllContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ContentCategory>('about_me');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    loadContent();
  }, [user]);

  const loadContent = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await firestoreHelpers.getSavedContent(user.uid);
      setAllContent(data || []);
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = useMemo(
    () => allContent.filter((c) => c.category === activeTab),
    [allContent, activeTab]
  );

  const resetForm = () => {
    setTitle('');
    setContentText('');
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (item: SavedContent) => {
    setTitle(item.title);
    setContentText(typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2));
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await firestoreHelpers.updateSavedContent(user.uid, editingId, {
          title: title.trim(),
          content: contentText,
        });
        setAllContent((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, title: title.trim(), content: contentText, updatedAt: new Date() }
              : c
          )
        );
      } else {
        const newItem = await firestoreHelpers.createSavedContent(user.uid, {
          title: title.trim(),
          category: activeTab,
          content: contentText,
        });
        setAllContent((prev) => [newItem, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save content:', err);
      setError('Failed to save content block.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!user || !confirm('Are you sure you want to remove this block?')) return;
    setDeletingId(contentId);
    try {
      await firestoreHelpers.deleteSavedContent(user.uid, contentId);
      setAllContent((prev) => prev.filter((c) => c.id !== contentId));
    } catch (err) {
      console.error('Failed to delete content:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Content Library...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Content Library</h1>
          <p className="text-sm text-[#71717a] mt-1">Save reusable clauses, scopes, and bio snippets across proposals.</p>
        </div>
        <Button variant="accent" size="md" className="font-bold" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
          New Snippet
        </Button>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = allContent.filter((c) => c.category === cat.value).length;
          const isSelected = activeTab === cat.value;

          return (
            <button
              key={cat.value}
              onClick={() => {
                setActiveTab(cat.value);
                resetForm();
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#09090b] text-white shadow-sm'
                  : 'bg-white border border-[#e4e4e7] text-[#71717a] hover:border-[#d4d4d8] hover:text-[#09090b]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#f4f4f5] text-[#71717a]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={resetForm}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="shadow-2xl border-[#e4e4e7] overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#09090b] mb-1">
                  {editingId ? 'Edit Content Snippet' : 'New Content Snippet'}
                </h3>
                <p className="text-xs text-[#71717a] mb-5">
                  Category: <span className="font-semibold text-[#09090b]">{CATEGORIES.find((c) => c.value === activeTab)?.label}</span>
                </p>

                {error && (
                  <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    label="Snippet Title *"
                    placeholder="e.g. Standard 50/50 Payment Schedule"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <Textarea
                    label="Snippet Content *"
                    placeholder="Write the reusable text or terms here..."
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-5 mt-2 border-t border-[#f4f4f5]">
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSave} loading={saving} className="font-bold">
                    {editingId ? 'Update Snippet' : 'Save Snippet'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Content Blocks List */}
      {filteredContent.length === 0 && !showForm ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e4e4e7] p-8">
          <div className="h-14 w-14 rounded-2xl bg-[#f4f4f5] text-[#09090b] flex items-center justify-center mx-auto mb-4">
            <Library className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#09090b]">No snippets in this category</h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-sm mx-auto">
            Save standard terms, bios, and scope clauses to insert them into any proposal in seconds.
          </p>
          <Button variant="accent" size="md" className="mt-6 font-bold" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Snippet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContent.map((item) => (
            <Card key={item.id} hoverEffect className="flex flex-col justify-between overflow-hidden">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-sm text-[#09090b]">{item.title}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(typeof item.content === 'string' ? item.content : JSON.stringify(item.content), item.id)}
                      className="p-1.5 rounded-lg text-[#71717a] hover:text-[#09090b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                      title="Copy to clipboard"
                    >
                      {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg text-[#71717a] hover:text-[#09090b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                      title="Edit snippet"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete snippet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#fcfcfd] rounded-2xl border border-[#e4e4e7] text-xs text-[#52525b] leading-relaxed whitespace-pre-wrap font-mono">
                  {typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2)}
                </div>

                <div className="text-[10px] text-[#a1a1aa] pt-1">
                  Updated {formatDate(item.updatedAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
