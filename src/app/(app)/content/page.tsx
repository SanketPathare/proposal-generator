'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { SavedContent, ContentCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { cn, formatDate } from '@/lib/utils';

const CATEGORIES: { value: ContentCategory; label: string }[] = [
  { value: 'about_me', label: 'About Me' },
  { value: 'services', label: 'Services' },
  { value: 'payment_terms', label: 'Payment Terms' },
  { value: 'terms_conditions', label: 'Terms & Conditions' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'portfolio', label: 'Portfolio' },
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
      setAllContent(data);
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
      setError('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!user || !confirm('Are you sure you want to delete this item?')) return;
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
        <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
        <p className="text-gray-500 mt-1">Save and reuse content across your proposals.</p>
      </div>

      <div className="flex overflow-x-auto gap-1 border-b border-gray-200">
        {CATEGORIES.map((cat) => {
          const count = allContent.filter((c) => c.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => {
                setActiveTab(cat.value);
                resetForm();
              }}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors -mb-px',
                activeTab === cat.value
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {cat.label}
              {count > 0 && (
                <span
                  className={cn(
                    'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                    activeTab === cat.value ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredContent.length} item{filteredContent.length !== 1 ? 's' : ''} in{' '}
          {CATEGORIES.find((c) => c.value === activeTab)?.label}
        </p>
        {!showForm && (
          <Button onClick={openAdd} size="sm">
            Add Item
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? 'Edit Content' : 'New Content'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Title"
                placeholder="e.g. My introduction paragraph"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={error && !title.trim() ? 'Required' : undefined}
              />
              <Textarea
                label="Content"
                placeholder="Enter your content here..."
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                className="min-h-[160px]"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={handleSave} loading={saving}>
                {editingId ? 'Update' : 'Save'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredContent.length === 0 && !showForm ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No content yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add reusable content to quickly build proposals.
          </p>
          <div className="mt-6">
            <Button onClick={openAdd}>Add Content</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContent.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2 whitespace-pre-wrap">
                      {typeof item.content === 'string'
                        ? item.content
                        : JSON.stringify(item.content)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(item.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
