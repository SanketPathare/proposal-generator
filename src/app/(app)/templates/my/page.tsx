'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Template } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn, formatDate, deepClone } from '@/lib/utils';

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
      setTemplates(data);
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

  const handleEdit = (templateId: string) => {
    router.push(`/templates/create?edit=${templateId}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Templates</h1>
          <p className="text-gray-500 mt-1">Manage your saved proposal templates.</p>
        </div>
        <Button onClick={() => router.push('/templates/create')}>Create Template</Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a template or exploring pre-built ones.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button onClick={() => router.push('/templates/create')}>Create Template</Button>
            <Button variant="outline" onClick={() => router.push('/templates/explore')}>Explore Templates</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <div
                className="h-32 rounded-t-lg"
                style={{ backgroundColor: template.styles.colors.primary + '15' }}
              >
                <div className="flex items-center justify-center h-full">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: template.styles.colors.primary }}
                  >
                    <span className="text-white text-xl font-bold">{template.title[0]}</span>
                  </div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {template.category || 'Uncategorized'}
                  </span>
                </div>
                <CardDescription className="line-clamp-2">{template.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{template.sections.length} sections</span>
                  <span>{formatDate(template.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(template.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={duplicatingId === template.id}
                    onClick={() => handleDuplicate(template)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={deletingId === template.id}
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
