'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, ProposalSection, ProposalStatus, SectionType, PricingTableData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ProposalEditor } from '@/components/editor/ProposalEditor';
import { SectionManager, SECTION_TYPE_DETAILS } from '@/components/editor/SectionManager';
import { PricingTable } from '@/components/editor/PricingTable';
import { Timeline } from '@/components/editor/Timeline';
import { SaveAsTemplate } from '@/components/editor/SaveAsTemplate';
import { cn, generateId, generateShareId, getStatusBadgeStyle, getStatusLabel } from '@/lib/utils';
import {
  ArrowLeft,
  Save,
  Zap,
  ExternalLink,
  Layers,
  Plus,
  Check,
  Eye,
  Trash2,
  Copy,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Radio,
} from 'lucide-react';

function AddSectionFloating({ onAdd }: { onAdd: (type: SectionType) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-center py-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full border-2 border-dashed transition-all cursor-pointer shadow-xs',
          open
            ? 'border-[#09090b] bg-[#09090b] text-[#d4ff00]'
            : 'border-[#d4d4d8] bg-white text-[#52525b] hover:border-[#09090b] hover:text-[#09090b] hover:bg-[#fafafa]'
        )}
      >
        <Plus className="h-4 w-4" />
        <span>Insert Section Block</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 z-40 w-72 bg-white border border-[#e4e4e7] rounded-2xl shadow-xl p-2 max-h-80 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-[#f4f4f5] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717a]">Select Section Type</span>
          </div>
          {SECTION_TYPE_DETAILS.map((st) => (
            <button
              key={st.type}
              type="button"
              onClick={() => {
                onAdd(st.type);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-[#09090b] rounded-xl hover:bg-[#f4f4f5] transition-colors cursor-pointer"
            >
              <div className="h-6 w-6 rounded-lg bg-[#09090b] text-[#d4ff00] flex items-center justify-center shrink-0">
                <st.icon className="h-3 w-3" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate">{st.label}</p>
              </div>
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
  const [copiedLink, setCopiedLink] = useState(false);
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
      setTitle(data.title || 'Untitled Proposal');
      setStatus(data.status || 'draft');
      setSections(data.sections || []);
      setLastSaved(data.updatedAt ? new Date(data.updatedAt) : new Date());
    } catch (err) {
      console.error('Failed to load proposal:', err);
      setError('Failed to load proposal.');
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
    const typeInfo = SECTION_TYPE_DETAILS.find((t) => t.type === type);
    const newSection: ProposalSection = {
      id: generateId(),
      type,
      title: typeInfo?.label || 'New Section',
      content:
        type === 'pricing'
          ? { rows: [], subtotal: 0, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 0, currency: 'USD' }
          : type === 'timeline'
          ? []
          : type === 'cover'
          ? { title: title || 'Proposal Title', subtitle: 'Prepared for Client' }
          : '',
      order: sections.length,
    };
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.id);
    scheduleAutoSave();
  };

  const handleSectionsReorder = (newSections: ProposalSection[]) => {
    setSections(newSections);
    scheduleAutoSave();
  };

  const handleGoLive = async () => {
    if (!user || !proposalId) return;
    setSharing(true);
    try {
      // Save any pending edits first
      await firestoreHelpers.updateProposal(user.uid, proposalId, { title, sections });

      const shareId = proposal?.shareId || generateShareId();
      await firestoreHelpers.updateProposal(user.uid, proposalId, {
        shareId,
        status: 'live',
        sharedAt: new Date(),
      });
      await firestoreHelpers.createSharedProposal(shareId, user.uid, proposalId);
      setStatus('live');
      if (proposal) setProposal({ ...proposal, shareId, status: 'live' });
      const link = `${window.location.origin}/shared/${shareId}`;
      setShareLink(link);
      setShareModalOpen(true);
    } catch (err) {
      console.error('Failed to go live:', err);
      setError('Failed to generate live link. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLiveLink = async () => {
    if (!proposal?.shareId) {
      // If for some reason they got here without a shareId, generate it
      await handleGoLive();
      return;
    }
    const link = `${window.location.origin}/shared/${proposal.shareId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Proposal Studio...</span>
        </div>
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-center p-8 bg-white rounded-3xl border border-[#e4e4e7]">
        <div>
          <h3 className="text-lg font-bold text-[#09090b]">{error}</h3>
          <Button variant="accent" size="sm" className="mt-4 font-bold" onClick={() => router.push('/proposals')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  const badge = getStatusBadgeStyle(status);

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 flex flex-col h-[calc(100vh-4.5rem)] bg-[#fcfcfd]">
      {/* Sticky Top Control Toolbar */}
      <div className="bg-white border-b border-[#e4e4e7] px-4 py-3 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/proposals')}
            className="p-1.5 h-8 w-8 rounded-full shrink-0"
            title="Back to proposals"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] rounded-lg hover:bg-[#f4f4f5] transition-colors cursor-pointer shrink-0"
            title={sidebarOpen ? 'Hide Sections Panel' : 'Show Sections Panel'}
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          {/* Editable Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              scheduleAutoSave();
            }}
            placeholder="Untitled Proposal"
            className="text-base font-bold text-[#09090b] bg-transparent border-b border-transparent hover:border-[#e4e4e7] focus:border-[#09090b] outline-none px-2 py-0.5 max-w-sm sm:max-w-md truncate"
          />

          {/* Status Badge — Draft / Live only */}
          <select
            value={status === 'sent' || status === 'viewed' || status === 'live' ? 'live' : 'draft'}
            onChange={(e) => {
              const val = e.target.value as ProposalStatus;
              if (val === 'live' && !proposal?.shareId) {
                handleGoLive();
              } else {
                setStatus(val);
                scheduleAutoSave();
              }
            }}
            className={cn(
              'text-xs font-bold px-3 py-1 rounded-full border-0 cursor-pointer appearance-none outline-none shrink-0',
              badge.bg
            )}
          >
            <option value="draft">Draft</option>
            <option value="live">Live</option>
          </select>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {lastSaved && (
            <span className="text-[11px] text-[#a1a1aa] hidden md:inline-block">
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => saveProposal(false)}
            loading={saving}
            className="font-semibold text-xs gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSaveAsTemplateOpen(true)}
            className="font-semibold text-xs gap-1.5 hidden sm:inline-flex"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Template</span>
          </Button>

          {/* Go Live / Share button */}
          {status === 'live' || status === 'sent' || status === 'viewed' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLiveLink}
                className="font-bold text-xs gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                {copiedLink ? (
                  <><Check className="h-3.5 w-3.5" /> Copied!</>
                ) : (
                  <><Radio className="h-3.5 w-3.5" /> Copy Live Link</>
                )}
              </Button>
              {proposal?.shareId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/shared/${proposal.shareId}`, '_blank')}
                  className="p-2 rounded-full"
                  title="Preview Client View"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="accent"
              size="sm"
              onClick={handleGoLive}
              loading={sharing}
              className="font-bold text-xs gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Go Live</span>
            </Button>
          )}
        </div>
      </div>

      {/* Editor Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section Manager Drawer */}
        <div
          className={cn(
            'border-r border-[#e4e4e7] bg-[#fafafa] transition-all duration-300 flex flex-col shrink-0',
            sidebarOpen ? 'w-72' : 'w-0 overflow-hidden border-r-0'
          )}
        >
          <div className="p-4 border-b border-[#e4e4e7] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Proposal Sections</span>
            <span className="text-xs font-bold text-[#09090b] bg-white px-2 py-0.5 rounded-full border border-[#e4e4e7]">
              {sections.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <SectionManager
              sections={sections}
              onChange={handleSectionsReorder}
              activeSectionId={activeSectionId || undefined}
              onSelectSection={setActiveSectionId}
            />
          </div>
        </div>

        {/* Center Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#fcfcfd]">
          <div className="max-w-4xl mx-auto space-y-6 pb-24">
            {sections.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#e4e4e7] p-8">
                <div className="h-12 w-12 rounded-2xl bg-[#f4f4f5] text-[#09090b] flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-[#09090b]">No sections in proposal yet</h3>
                <p className="text-xs text-[#71717a] mt-1 mb-5">Click below to add your first content section.</p>
                <Button variant="accent" size="sm" className="font-bold" onClick={() => handleAddSection('introduction')}>
                  Add Introduction Block
                </Button>
              </div>
            ) : (
              sections.map((section, idx) => (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  onClick={() => setActiveSectionId(section.id)}
                  className={cn(
                    'rounded-3xl border transition-all duration-200 bg-white overflow-hidden shadow-xs',
                    activeSectionId === section.id
                      ? 'border-[#09090b] ring-2 ring-[#09090b]/5 shadow-md'
                      : 'border-[#e4e4e7] hover:border-[#d4d4d8]'
                  )}
                >
                  {/* Section Title Bar */}
                  <div className="px-6 py-4 border-b border-[#f4f4f5] flex items-center justify-between gap-3 bg-[#fafafa]/60">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-xs font-mono font-bold text-[#71717a]">{idx + 1}.</span>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                        className="text-sm font-bold text-[#09090b] bg-transparent border-none outline-none focus:ring-0 p-0 flex-1 truncate"
                        placeholder="Section Title"
                      />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-[#71717a] border border-[#e4e4e7] px-2.5 py-0.5 rounded-full shrink-0">
                      {section.type}
                    </span>
                  </div>

                  {/* Section Content View */}
                  <div className="p-6">
                    {section.type === 'cover' ? (
                      <div className="bg-[#09090b] text-white p-8 sm:p-10 rounded-2xl space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#d4ff00]/10 blur-2xl pointer-events-none" />
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
                          className="w-full text-2xl sm:text-3xl font-extrabold text-white bg-transparent outline-none border-b border-transparent hover:border-white/20 focus:border-[#d4ff00] pb-1"
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
                          placeholder="Prepared for Client Name / Subtitle"
                          className="w-full text-sm text-[#d4ff00] font-semibold bg-transparent outline-none"
                        />
                      </div>
                    ) : section.type === 'pricing' ? (
                      <PricingTable
                        data={section.content as PricingTableData}
                        onChange={(data) => handleSectionContentChange(section.id, data)}
                        currency={proposal?.currency || 'USD'}
                      />
                    ) : section.type === 'timeline' ? (
                      <Timeline
                        milestones={Array.isArray(section.content) ? section.content : []}
                        onChange={(milestones) => handleSectionContentChange(section.id, milestones)}
                      />
                    ) : (
                      <ProposalEditor
                        content={section.content}
                        onChange={(content) => handleSectionContentChange(section.id, content)}
                        placeholder={`Write your ${section.title.toLowerCase()} content here...`}
                      />
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Bottom floating inserter */}
            <AddSectionFloating onAdd={handleAddSection} />
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setShareModalOpen(false)}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <Card className="shadow-2xl border-[#e4e4e7] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#09090b]">Proposal is Now Live! 🎉</h3>
                    <p className="text-xs text-[#71717a]">Companies can now view and send accept requests.</p>
                  </div>
                </div>

                <div className="my-5 p-3 rounded-2xl bg-[#f4f4f5] border border-[#e4e4e7] flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 text-xs font-mono bg-transparent outline-none text-[#09090b] select-all truncate"
                  />
                  <Button variant="primary" size="sm" onClick={() => { navigator.clipboard.writeText(shareLink); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }} className="font-bold text-xs shrink-0">
                    {copiedLink ? (
                      <span className="flex items-center gap-1 text-[#d4ff00]"><Check className="h-3.5 w-3.5" /> Copied</span>
                    ) : (
                      'Copy Link'
                    )}
                  </Button>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 mb-4">
                  <strong>How it works:</strong> Share this link with companies. They can view the proposal and submit an accept request. You'll see all requests in the <strong>Accept Requests</strong> page.
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-semibold text-xs"
                    onClick={() => window.open(shareLink, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Preview as Company
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setShareModalOpen(false)}>
                    Done
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Save as Template Modal */}
      {proposal && (
        <SaveAsTemplate
          proposal={{ ...proposal, title, sections }}
          open={saveAsTemplateOpen}
          onClose={() => setSaveAsTemplateOpen(false)}
        />
      )}
    </div>
  );
}