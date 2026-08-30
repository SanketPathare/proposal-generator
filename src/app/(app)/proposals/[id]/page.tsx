'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, ProposalSection, ProposalStatus, SectionType, PricingTableData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ProposalEditor } from '@/components/editor/ProposalEditor';
import { SectionManager } from '@/components/editor/SectionManager';
import { PricingTable } from '@/components/editor/PricingTable';
import { Timeline } from '@/components/editor/Timeline';
import { SaveAsTemplate } from '@/components/editor/SaveAsTemplate';
import { cn, generateId, generateShareId, getStatusColor } from '@/lib/utils';

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  cover: 'Cover Page',
  heading: 'Heading',
  paragraph: 'Paragraph',
  introduction: 'Introduction',
  about_me: 'About Me',
  requirements: 'Client Requirements',
  overview: 'Project Overview',
  scope: 'Scope of Work',
  features: 'Features',
  deliverables: 'Deliverables',
  timeline: 'Project Timeline',
  pricing: 'Pricing',
  terms: 'Terms & Conditions',
  payment_terms: 'Payment Terms',
  portfolio: 'Portfolio',
  testimonials: 'Testimonials',
  conclusion: 'Conclusion',
  contact: 'Contact Information',
};

function AddSectionButton({ onAdd }: { onAdd: (type: SectionType) => void }) {
  const [open, setOpen] = useState(false);

  const SECTION_TYPES: { type: SectionType; label: string }[] = [
    { type: 'cover', label: 'Cover Page' },
    { type: 'introduction', label: 'Introduction' },
    { type: 'about_me', label: 'About Me' },
    { type: 'requirements', label: 'Requirements' },
    { type: 'overview', label: 'Project Overview' },
    { type: 'scope', label: 'Scope of Work' },
    { type: 'features', label: 'Features' },
    { type: 'deliverables', label: 'Deliverables' },
    { type: 'timeline', label: 'Timeline' },
    { type: 'pricing', label: 'Pricing' },
    { type: 'terms', label: 'Terms & Conditions' },
    { type: 'payment_terms', label: 'Payment Terms' },
    { type: 'portfolio', label: 'Portfolio' },
    { type: 'testimonials', label: 'Testimonials' },
    { type: 'conclusion', label: 'Conclusion' },
    { type: 'contact', label: 'Contact Information' },
  ];

  return (
    <div className="relative flex justify-center py-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm rounded-full border-2 border-dashed transition-colors',
          open
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5'
        )}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Section
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 z-30 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-h-80 overflow-y-auto">
          {SECTION_TYPES.map((st) => (
            <button
              key={st.type}
              type="button"
              onClick={() => {
                onAdd(st.type);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
            >
              {st.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProposalEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<ProposalStatus>('draft');
  const [sections, setSections] = useState<ProposalSection[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [sharing, setSharing] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!user || !proposalId) return;
    loadProposal();
  }, [user, proposalId]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const loadProposal = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await firestoreHelpers.getProposal(user.uid, proposalId);
      if (!data) {
        setError('Proposal not found.');
        return;
      }
      setProposal(data);
      setTitle(data.title);
      setStatus(data.status);
      setSections(data.sections || []);
      setLastSaved(new Date(data.updatedAt));
    } catch (err) {
      console.error('Failed to load proposal:', err);
      setError('Failed to load proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    isDirtyRef.current = true;
    autoSaveTimerRef.current = setTimeout(() => {
      saveProposal(true);
    }, 2000);
  }, [proposalId, title, status, sections]);

  const saveProposal = async (isAuto = false) => {
    if (!user || !proposalId) return;
    if (!isAuto) setSaving(true);
    try {
      await firestoreHelpers.updateProposal(user.uid, proposalId, {
        title,
        status,
        sections,
      });
      setLastSaved(new Date());
      isDirtyRef.current = false;
    } catch (err) {
      console.error('Failed to save proposal:', err);
      if (!isAuto) setError('Failed to save. Please try again.');
    } finally {
      if (!isAuto) setSaving(false);
    }
  };

  const handleSectionUpdate = (sectionId: string, updates: Partial<ProposalSection>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
    scheduleAutoSave();
  };

  const handleSectionContentChange = (sectionId: string, content: any) => {
    handleSectionUpdate(sectionId, { content });
  };

  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    handleSectionUpdate(sectionId, { title: newTitle });
  };

  const handleAddSection = (type: SectionType) => {
    const defaultContent =
      type === 'pricing'
        ? { rows: [], subtotal: 0, discount: 0, discountType: 'fixed' as const, tax: 0, taxType: 'fixed' as const, total: 0, currency: 'INR' }
        : type === 'timeline'
        ? []
        : type === 'cover'
        ? { title: '', subtitle: '' }
        : '';
    const newSection: ProposalSection = {
      id: generateId(),
      type,
      title: SECTION_TYPE_LABELS[type],
      content: defaultContent,
      order: sections.length,
    };
    setSections((prev) => [...prev, newSection]);
    scheduleAutoSave();
  };

  const handleSectionsReorder = (newSections: ProposalSection[]) => {
    setSections(newSections);
    scheduleAutoSave();
  };

  const handleShare = async () => {
    if (!user || !proposalId) return;
    setSharing(true);
    try {
      const shareId = proposal?.shareId || generateShareId();
      await firestoreHelpers.updateProposal(user.uid, proposalId, {
        shareId,
        status: 'sent',
        sharedAt: new Date(),
      });
      setStatus('sent');
      const link = `${window.location.origin}/shared/${shareId}`;
      setShareLink(link);
      setShareModalOpen(true);
    } catch (err) {
      console.error('Failed to share proposal:', err);
      setError('Failed to generate share link.');
    } finally {
      setSharing(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => router.push('/proposals')}>
              Back to Proposals
            </Button>
            <Button onClick={loadProposal}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar with SectionManager */}
      <div
        className={cn(
          'border-r border-gray-200 bg-gray-50/50 transition-all duration-200 flex flex-col',
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden border-r-0'
        )}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Sections</h2>
            <span className="text-xs text-gray-500">{sections.length}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SectionManager
            sections={sections}
            onChange={handleSectionsReorder}
            activeSectionId={activeSectionId || undefined}
            onSelectSection={setActiveSectionId}
          />
        </div>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            Collapse Sidebar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3 px-4 h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/proposals')}
              className="shrink-0"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Button>

            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="shrink-0"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            )}

            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                scheduleAutoSave();
              }}
              placeholder="Untitled Proposal"
              className="flex-1 min-w-0 text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400"
            />

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ProposalStatus);
                  scheduleAutoSave();
                }}
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-primary/30 cursor-pointer appearance-none',
                  getStatusColor(status)
                )}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {lastSaved && (
              <span className="text-xs text-gray-400 hidden md:block shrink-0">
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveProposal(false)}
                loading={saving}
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaveAsTemplateOpen(true)}
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                loading={sharing}
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (proposal?.shareId) {
                    window.open(`/shared/${proposal.shareId}`, '_blank');
                  } else {
                    setError('Share the proposal first to get a preview link.');
                  }
                }}
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </Button>
            </div>
          </div>
        </div>

        {error && proposal && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Sections Editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {sections.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-3 text-sm font-medium text-gray-900">No sections yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first section.</p>
                <div className="mt-6">
                  <AddSectionButton onAdd={handleAddSection} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id}>
                    <Card>
                      <CardContent className="p-0">
                        {/* Section Header */}
                        <div
                          className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                          onClick={() => setActiveSectionId(section.id === activeSectionId ? null : section.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-sm font-medium text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400"
                              placeholder="Section title"
                            />
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                            {SECTION_TYPE_LABELS[section.type]}
                          </span>
                        </div>

                        {/* Section Content */}
                        <div className="p-1">
                          {section.type === 'pricing' ? (
                            <div className="p-3">
                              <PricingTable
                                data={section.content as PricingTableData}
                                onChange={(data) => handleSectionContentChange(section.id, data)}
                                currency={proposal?.pricing?.currency || 'INR'}
                              />
                            </div>
                          ) : section.type === 'timeline' ? (
                            <div className="p-3">
                              <Timeline
                                milestones={Array.isArray(section.content) ? section.content : []}
                                onChange={(milestones) => handleSectionContentChange(section.id, milestones)}
                              />
                            </div>
                          ) : section.type === 'cover' ? (
                            <div className="p-3 space-y-3">
                              <input
                                type="text"
                                value={section.content?.title || ''}
                                onChange={(e) =>
                                  handleSectionContentChange(section.id, {
                                    ...section.content,
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Proposal Title"
                                className="w-full text-xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400"
                              />
                              <input
                                type="text"
                                value={section.content?.subtitle || ''}
                                onChange={(e) =>
                                  handleSectionContentChange(section.id, {
                                    ...section.content,
                                    subtitle: e.target.value,
                                  })
                                }
                                placeholder="Subtitle or brief description"
                                className="w-full text-gray-500 bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-300"
                              />
                            </div>
                          ) : (
                            <ProposalEditor
                              content={section.content}
                              onChange={(content) => handleSectionContentChange(section.id, content)}
                              placeholder={`Write your ${SECTION_TYPE_LABELS[section.type].toLowerCase()} content here...`}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                <AddSectionButton onAdd={handleAddSection} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShareModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Proposal</h3>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Share this link with your client to let them view the proposal.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
              />
              <Button onClick={copyShareLink} size="sm">
                Copy
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShareModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save as Template Modal */}
      {proposal && (
        <SaveAsTemplate
          proposal={proposal}
          open={saveAsTemplateOpen}
          onClose={() => setSaveAsTemplateOpen(false)}
          onSave={() => {
            setSaveAsTemplateOpen(false);
          }}
        />
      )}
    </div>
  );
}