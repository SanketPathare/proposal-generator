'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, ProposalSection, ProposalStatus, SectionType, PricingTableData, TemplateStyles } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ProposalEditor } from '@/components/editor/ProposalEditor';
import { SectionManager, SECTION_TYPE_DETAILS } from '@/components/editor/SectionManager';
import { PricingTable } from '@/components/editor/PricingTable';
import { Timeline } from '@/components/editor/Timeline';
import { SaveAsTemplate } from '@/components/editor/SaveAsTemplate';
import { StylePanel } from '@/components/editor/StylePanel';
import { cn, generateId, generateShareId, getStatusBadgeStyle, getStatusLabel, CURRENCIES, cloneProposal } from '@/lib/utils';
import { GOOGLE_FONTS } from '@/lib/templates';

const DEFAULT_STYLES: TemplateStyles = {
  fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
  colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
  logoPosition: 'left',
  header: '',
  footer: '',
};
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
  Download,
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
  const [currency, setCurrency] = useState('USD');
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clients, setClients] = useState<{ id: string; name: string; company: string }[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [sharing, setSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [styles, setStyles] = useState<TemplateStyles>(DEFAULT_STYLES);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versions, setVersions] = useState<{ id: string; title: string; sections: ProposalSection[]; pricing: PricingTableData | null; currency: string; createdAt: Date }[]>([]);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);

  // Load Google Fonts for selected styles
  useEffect(() => {
    const fonts = new Set([styles.fonts.heading, styles.fonts.body]);
    fonts.forEach((fontName) => {
      const existing = document.querySelector(`link[data-font="${fontName}"]`);
      if (existing) return;
      const font = GOOGLE_FONTS.find((f) => f.name === fontName);
      if (!font) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.import}&display=swap`;
      link.setAttribute('data-font', fontName);
      document.head.appendChild(link);
    });
  }, [styles.fonts.heading, styles.fonts.body]);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!user || !proposalId) return;
    loadProposal();
    loadClients();
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
      setCurrency(data.currency || 'USD');
      setClientId(data.clientId || null);
      setClientName(data.clientName || '');
      setStyles(data.styles || DEFAULT_STYLES);
      setLastSaved(data.updatedAt ? new Date(data.updatedAt) : new Date());
    } catch (err) {
      console.error('Failed to load proposal:', err);
      setError('Failed to load proposal.');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    if (!user) return;
    try {
      const data = await firestoreHelpers.getClients(user.uid);
      setClients(data.map((c) => ({ id: c.id, name: c.name, company: c.company })));
    } catch (err) {
      console.error('Failed to load clients:', err);
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
  }, [proposalId, title, status, sections, currency, clientId, clientName, styles]);

  const saveProposal = async (isAuto = false) => {
    if (!user || !proposalId) return;
    if (!isAuto) setSaving(true);
    try {
      await firestoreHelpers.updateProposal(user.uid, proposalId, {
        title,
        status,
        sections,
        currency,
        clientId,
        clientName: clientName || undefined,
        styles,
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

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    const updatedSections = sections.map((s) => {
      if (s.type === 'pricing' && s.content) {
        return { ...s, content: { ...s.content, currency: newCurrency } };
      }
      return s;
    });
    setSections(updatedSections);
    scheduleAutoSave();
  };

  const handleClientChange = (newClientId: string) => {
    if (!newClientId) {
      setClientId(null);
      setClientName('');
    } else {
      const selected = clients.find((c) => c.id === newClientId);
      setClientId(newClientId);
      setClientName(selected ? `${selected.name} - ${selected.company}` : '');
    }
    scheduleAutoSave();
  };

  const handleDuplicate = async () => {
    if (!user || !proposal) return;
    setDuplicating(true);
    try {
      const cloned = cloneProposal(proposal);
      const newProposal = await firestoreHelpers.createProposal(user.uid, cloned);
      router.push(`/proposals/${newProposal.id}`);
    } catch (err) {
      console.error('Failed to duplicate proposal:', err);
      setError('Failed to duplicate proposal.');
    } finally {
      setDuplicating(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!user || !proposalId) return;
    try {
      await firestoreHelpers.createProposalVersion(user.uid, proposalId, {
        title,
        sections,
        pricing: proposal?.pricing || null,
        currency,
      });
    } catch (err) {
      console.error('Failed to save version:', err);
    }
  };

  const handleLoadVersions = async () => {
    if (!user || !proposalId) return;
    try {
      const data = await firestoreHelpers.getProposalVersions(user.uid, proposalId);
      setVersions(data);
      setVersionModalOpen(true);
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!user || !proposalId) return;
    try {
      const version = versions.find((v) => v.id === versionId);
      if (!version) return;
      setSections(version.sections);
      setCurrency(version.currency || 'USD');
      if (version.title) setTitle(version.title);
      scheduleAutoSave();
      setVersionModalOpen(false);
    } catch (err) {
      console.error('Failed to restore version:', err);
    }
  };

  const handleGenerateSection = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section || section.type === 'cover' || section.type === 'pricing' || section.type === 'timeline') return;

    setGeneratingSection(sectionId);
    try {
      const res = await fetch('/api/ai/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: section.type,
          context: {
            purpose: proposal?.purpose || title,
            clientName: clientName || 'Client',
            projectDescription: proposal?.purpose || title,
            services: [],
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          handleSectionContentChange(sectionId, data.content);
        }
      }
    } catch (err) {
      console.error('Failed to generate section:', err);
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleGoLive = async () => {
    if (!user || !proposalId) return;
    setSharing(true);
    try {
      // Save version before going live
      await handleSaveVersion();

      // Save any pending edits first
      await firestoreHelpers.updateProposal(user.uid, proposalId, { title, sections, currency, clientId, clientName: clientName || undefined, styles });

      const shareId = proposal?.shareId || generateShareId();
      await firestoreHelpers.updateProposal(user.uid, proposalId, {
        shareId,
        status: 'live',
        sharedAt: new Date(),
      });

      // Ensure sharedProposals lookup exists
      if (!proposal?.shareId) {
        await firestoreHelpers.createSharedProposal(shareId, user.uid, proposalId);
      }

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
      <div className="bg-white border-b border-[#e4e4e7] px-4 py-3 flex items-center justify-between gap-3 shrink-0 z-20 print:hidden">
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
              if (val === 'live') {
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

          {/* Currency Selector */}
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="text-xs font-bold px-2.5 py-1 rounded-full border border-[#e4e4e7] bg-white cursor-pointer appearance-none outline-none shrink-0 text-[#09090b]"
            title="Change currency"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.value}</option>
            ))}
          </select>

          {/* Client Selector */}
          <select
            value={clientId || ''}
            onChange={(e) => handleClientChange(e.target.value)}
            className="text-xs font-medium px-2.5 py-1 rounded-full border border-[#e4e4e7] bg-white cursor-pointer appearance-none outline-none shrink-0 text-[#09090b] max-w-[140px] truncate"
            title="Assign client"
          >
            <option value="">No Client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
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

          {/* Customize Design button — opens StylePanel */}
          <button
            onClick={() => {
              const event = new CustomEvent('toggle-style-panel');
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-full border border-[#e4e4e7] bg-white hover:bg-[#f4f4f5] transition-colors cursor-pointer"
            title="Customize Design"
          >
            <div className="flex -space-x-1">
              <div className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: styles.colors.primary }} />
              <div className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: styles.colors.accent }} />
              <div className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: styles.colors.secondary }} />
            </div>
            <span className="hidden sm:inline">Design</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            loading={duplicating}
            className="font-semibold text-xs gap-1.5 hidden sm:inline-flex"
            title="Duplicate proposal"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadVersions}
            className="font-semibold text-xs gap-1.5 hidden sm:inline-flex"
            title="Version history"
          >
            <span className="text-xs"> History</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="font-semibold text-xs gap-1.5 hidden sm:inline-flex"
            title="Export as PDF"
          >
            <Download className="h-3.5 w-3.5" />
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
            'border-r border-[#e4e4e7] bg-[#fafafa] transition-all duration-300 flex flex-col shrink-0 print:hidden',
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
                  <div className="px-6 py-4 border-b border-[#f4f4f5] flex items-center justify-between gap-3 bg-[#fafafa]/60 print:hidden">
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
                    <div className="flex items-center gap-2">
                      {section.type !== 'cover' && section.type !== 'pricing' && section.type !== 'timeline' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateSection(section.id)}
                          loading={generatingSection === section.id}
                          className="text-xs font-semibold gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          title="Generate with AI"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">AI</span>
                        </Button>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-[#71717a] border border-[#e4e4e7] px-2.5 py-0.5 rounded-full shrink-0">
                        {section.type}
                      </span>
                    </div>
                  </div>

                  {/* Section Content View */}
                  <div className="p-6">
                    {section.type === 'cover' ? (
                      <div className="text-white p-8 sm:p-10 rounded-2xl space-y-3 relative overflow-hidden" style={{ backgroundColor: styles.colors.primary }}>
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-20" style={{ backgroundColor: styles.colors.accent }} />
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
                          className="w-full text-2xl sm:text-3xl font-extrabold text-white bg-transparent outline-none border-b border-transparent hover:border-white/20 pb-1"
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
                          className="w-full text-sm font-semibold bg-transparent outline-none"
                          style={{ color: styles.colors.accent }}
                        />
                      </div>
                    ) : section.type === 'pricing' ? (
                      <PricingTable
                        data={section.content as PricingTableData}
                        onChange={(data) => handleSectionContentChange(section.id, data)}
                        currency={currency}
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
            <div className="print:hidden">
              <AddSectionFloating onAdd={handleAddSection} />
            </div>
          </div>
        </div>
      </div>

      {/* Style Panel (Design Customization) */}
      <StylePanel styles={styles} onChange={setStyles} />

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

      {/* Version History Modal */}
      {versionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setVersionModalOpen(false)}>
          <div className="w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Card className="shadow-2xl border-[#e4e4e7] overflow-hidden">
              <div className="p-6 border-b border-[#f4f4f5]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-[#09090b] text-[#d4ff00] flex items-center justify-center">
                      <span className="text-xs font-bold">v</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#09090b]">Version History</h3>
                      <p className="text-xs text-[#71717a]">Restore a previous version of this proposal</p>
                    </div>
                  </div>
                  <button onClick={() => setVersionModalOpen(false)} className="p-1 rounded-lg text-[#a1a1aa] hover:text-[#09090b] transition-colors cursor-pointer">
                    <span className="text-lg">&times;</span>
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {versions.length === 0 ? (
                  <div className="text-center py-8 text-[#71717a] text-xs">
                    No versions saved yet. Versions are created automatically when you go live.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <div
                        key={version.id}
                        className="p-4 rounded-2xl border border-[#e4e4e7] bg-white hover:border-[#d4d4d8] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-[#09090b]">{version.title || 'Untitled'}</p>
                            <p className="text-xs text-[#71717a] mt-0.5">
                              {version.sections?.length || 0} sections &middot; {version.currency || 'USD'}
                              {version.createdAt && ` &middot; ${new Date(version.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreVersion(version.id)}
                            className="font-bold text-xs"
                          >
                            Restore
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}