'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { generateHTML } from '@tiptap/react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Proposal, TimelineMilestone } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const editorExtensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  LinkExtension.configure({ openOnClick: false }),
  Image,
  TaskList,
  TaskItem.configure({ nested: true }),
];

export default function SharedProposalPage() {
  const params = useParams();
  const shareId = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responded, setResponded] = useState(false);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (!shareId) return;

    const loadProposal = async () => {
      try {
        const response = await fetch('/api/proposals/shared', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shareId }),
        });

        if (!response.ok) throw new Error('Proposal not found');

        const data = await response.json();
        setProposal(data.proposal);
      } catch {
        setError('This proposal could not be found or has expired.');
      } finally {
        setLoading(false);
      }
    };

    loadProposal();
  }, [shareId]);

  const handleResponse = async (action: 'accept' | 'reject') => {
    setResponding(true);
    try {
      await fetch('/api/proposals/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId, action }),
      });
      setResponded(true);
    } catch (err) {
      console.error('Failed to respond:', err);
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Proposal Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'This proposal could not be found.'}</p>
            <Link href="/">
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedSections = [...proposal.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Proposal</span>
          </div>
          {!responded ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResponse('reject')}
                disabled={responding}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleResponse('accept')}
                disabled={responding}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </div>
          ) : (
            <span className="text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Response recorded
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {sortedSections.map((section) => {
          if (section.type === 'cover') {
            return (
              <div key={section.id} className="bg-gradient-to-br from-primary to-blue-700 text-white rounded-xl p-8 sm:p-12">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">{proposal.title}</h1>
                <p className="text-lg opacity-90">{proposal.purpose}</p>
              </div>
            );
          }

          if (section.type === 'pricing' && proposal.pricing) {
            const pricing = proposal.pricing;
            return (
              <div key={section.id}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {section.title}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 border border-gray-200">Item</th>
                        <th className="text-left p-3 border border-gray-200">Description</th>
                        <th className="text-right p-3 border border-gray-200">Qty</th>
                        <th className="text-right p-3 border border-gray-200">Price</th>
                        <th className="text-right p-3 border border-gray-200">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricing.rows.map((row) => (
                        <tr key={row.id}>
                          <td className="p-3 border border-gray-200">{row.item}</td>
                          <td className="p-3 border border-gray-200 text-gray-600">{row.description}</td>
                          <td className="p-3 border border-gray-200 text-right">{row.quantity}</td>
                          <td className="p-3 border border-gray-200 text-right">{formatCurrency(row.unitPrice, pricing.currency)}</td>
                          <td className="p-3 border border-gray-200 text-right font-medium">{formatCurrency(row.total, pricing.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="p-3 border border-gray-200 text-right font-medium">Subtotal</td>
                        <td className="p-3 border border-gray-200 text-right">{formatCurrency(pricing.subtotal, pricing.currency)}</td>
                      </tr>
                      {pricing.discount > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="p-3 border border-gray-200 text-right font-medium">Discount</td>
                          <td className="p-3 border border-gray-200 text-right text-red-600">-{formatCurrency(pricing.discount, pricing.currency)}</td>
                        </tr>
                      )}
                      {pricing.tax > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="p-3 border border-gray-200 text-right font-medium">Tax</td>
                          <td className="p-3 border border-gray-200 text-right">{formatCurrency(pricing.tax, pricing.currency)}</td>
                        </tr>
                      )}
                      <tr className="bg-primary/10">
                        <td colSpan={4} className="p-3 border border-gray-200 text-right font-bold text-lg">Total</td>
                        <td className="p-3 border border-gray-200 text-right font-bold text-lg">{formatCurrency(pricing.total, pricing.currency)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          }

          if (section.type === 'timeline' && Array.isArray(section.content)) {
            return (
              <div key={section.id}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {(section.content as TimelineMilestone[]).map((milestone, idx) => (
                    <div key={milestone.id || idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        {milestone.description && <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>}
                        {milestone.date && (
                          <span className="text-xs text-gray-500 mt-1 inline-block bg-gray-100 px-2 py-0.5 rounded">
                            {new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // Handle TipTap JSON content, string content, or {html}/{json} objects
          let html = '';
          const content = section.content;
          if (typeof content === 'string') {
            html = content;
          } else if (content?.html) {
            html = content.html;
          } else if (content?.type === 'doc' && content?.content) {
            // TipTap JSON format — generate HTML from the document
            try {
              html = generateHTML(content, editorExtensions);
            } catch {
              html = JSON.stringify(content);
            }
          } else if (content?.json) {
            try {
              html = generateHTML(content.json, editorExtensions);
            } catch {
              html = JSON.stringify(content.json);
            }
          }

          if (!html) return null;

          return (
            <div key={section.id}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {section.title}
              </h2>
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          Created with Proposal Generator
        </div>
      </footer>
    </div>
  );
}