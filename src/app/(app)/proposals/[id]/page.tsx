'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, ProposalSection, ProposalStatus, SectionType, PricingTableData, TemplateStyles, TimelineMilestone } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown';
import { ProposalEditor } from '@/components/editor/ProposalEditor';
import { SectionManager, SECTION_TYPE_DETAILS } from '@/components/editor/SectionManager';
import { PricingTable } from '@/components/editor/PricingTable';
import { Timeline } from '@/components/editor/Timeline';
import { SaveAsTemplate } from '@/components/editor/SaveAsTemplate';
import { StylePanel } from '@/components/editor/StylePanel';
import { cn, generateId, generateShareId, getStatusBadgeStyle, getStatusLabel, CURRENCIES, cloneProposal, formatCurrency, formatDate } from '@/lib/utils';
import { GOOGLE_FONTS } from '@/lib/templates';
import {
  CoverStandard,
  CoverSplit,
  CoverCentered,
  CoverFullBleed,
  CoverSidebar,
  CoverDiagonal,
  SectionCard,
  SectionTitle,
} from '@/lib/layout-variants';

const DEFAULT_STYLES: TemplateStyles = {
  fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
  colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
  logoPosition: 'left',
  header: '',
  footer: '',
  coverLayout: 'standard',
  sectionStyle: 'cards',
  borderStyle: 'rounded',
  accentStyle: 'glow',
  pricingStyle: 'standard',
  timelineStyle: 'vertical',
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
  Calendar,
  DollarSign,
  MoreHorizontal,
  History as HistoryIcon,
  ChevronDown,
} from 'lucide-react';

function renderCover(section: any, proposal: any, styles: TemplateStyles) {
  const title = section.content?.title || proposal?.title;
  const subtitle = section.content?.subtitle || proposal?.purpose;
  const date = formatDate(proposal?.updatedAt || new Date());
  const props = { title, subtitle, date, styles };

  switch (styles.coverLayout) {
    case 'split': return <CoverSplit {...props} />;
    case 'centered': return <CoverCentered {...props} />;
    case 'full-bleed': return <CoverFullBleed {...props} />;
    case 'sidebar': return <CoverSidebar {...props} />;
    case 'diagonal': return <CoverDiagonal {...props} />;
    default: return <CoverStandard {...props} />;
  }
}

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
  const [previewMode, setPreviewMode] = useState(false);

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
      <div className="bg-white border-b border-[#e4e4e7] px-4 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 z-20 print:hidden">
        <div className="flex items-center gap-3 shrink-0">
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
          <Dropdown
            trigger={
              <button
                className={cn(
                  'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-transparent hover:brightness-95 transition-all cursor-pointer outline-none shrink-0',
                  badge.bg
                )}
              >
                <span>{status === 'sent' || status === 'viewed' || status === 'live' ? 'Live' : 'Draft'}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
            }
            content={
              <div className="py-1 min-w-[120px]">
                <DropdownItem onClick={() => {
                  setStatus('draft');
                  scheduleAutoSave();
                }}>
                  Draft
                </DropdownItem>
                <DropdownItem onClick={() => {
                  handleGoLive();
                }}>
                  Live
                </DropdownItem>
              </div>
            }
          />

          {/* Currency Selector */}
          <Dropdown
            trigger={
              <button
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border border-[#e4e4e7] bg-white hover:bg-[#f4f4f5] transition-colors cursor-pointer outline-none shrink-0 text-[#09090b]"
                title="Change currency"
              >
                <span>{currency}</span>
                <ChevronDown className="h-3 w-3 text-[#71717a]" />
              </button>
            }
            content={
              <div className="py-1 min-w-[100px] max-h-[300px] overflow-y-auto">
                {CURRENCIES.map((c) => (
                  <DropdownItem key={c.value} onClick={() => handleCurrencyChange(c.value)}>
                    <span className={currency === c.value ? "font-bold" : ""}>{c.value}</span>
                  </DropdownItem>
                ))}
              </div>
            }
          />

          {/* Client Selector */}
          <Dropdown
            trigger={
              <button
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[#e4e4e7] bg-white hover:bg-[#f4f4f5] transition-colors cursor-pointer outline-none shrink-0 text-[#09090b] max-w-[160px]"
                title="Assign client"
              >
                <span className="truncate">{clientId ? clients.find(c => c.id === clientId)?.name || 'Unknown Client' : 'No Client'}</span>
                <ChevronDown className="h-3 w-3 text-[#71717a] shrink-0" />
              </button>
            }
            content={
              <div className="py-1 min-w-[160px] max-h-[300px] overflow-y-auto">
                <DropdownItem onClick={() => handleClientChange('')}>
                  <span className={!clientId ? 'font-bold' : ''}>No Client</span>
                </DropdownItem>
                {clients.length > 0 && <DropdownSeparator />}
                {clients.map((c) => (
                  <DropdownItem key={c.id} onClick={() => handleClientChange(c.id)}>
                    <span className={clientId === c.id ? 'font-bold' : ''}>{c.name}</span>
                  </DropdownItem>
                ))}
              </div>
            }
          />
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
            variant={previewMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="font-semibold text-xs gap-1.5 hidden sm:inline-flex"
            title="Live Preview"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Dropdown
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="font-semibold text-xs px-2"
                title="More options"
              >
                <MoreHorizontal className="h-4 w-4 text-[#71717a]" />
              </Button>
            }
            content={
              <div className="py-1 w-48">
                <DropdownItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 text-[#71717a]" />
                  <span>Duplicate Proposal</span>
                </DropdownItem>
                <DropdownItem onClick={handleLoadVersions}>
                  <HistoryIcon className="h-4 w-4 text-[#71717a]" />
                  <span>Version History</span>
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={handleExportPdf}>
                  <Download className="h-4 w-4 text-[#71717a]" />
                  <span>Export as PDF</span>
                </DropdownItem>
              </div>
            }
            align="end"
          />

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
        <div className={cn("flex-1 overflow-y-auto p-4 sm:p-8 bg-[#fcfcfd] print:hidden", previewMode ? "hidden xl:block xl:border-r border-[#e4e4e7]" : "block")}>
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
                        styles={styles}
                      />
                    ) : section.type === 'timeline' ? (
                      <Timeline
                        milestones={Array.isArray(section.content) ? section.content : []}
                        onChange={(milestones) => handleSectionContentChange(section.id, milestones)}
                        styles={styles}
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

        {/* Live Preview Panel */}
        <div className={cn("flex-1 overflow-y-auto p-4 sm:p-8", previewMode ? "block" : "hidden print:block")} style={{ backgroundColor: styles.colors.background }}>
            <div className="max-w-4xl mx-auto space-y-8 pb-24" style={{ fontFamily: styles.fonts.body, color: styles.colors.text }}>
              {sections.map((section) => {
                if (section.type === 'cover') {
                  return <div key={section.id}>{renderCover(section, proposal, styles)}</div>;
                }

                if (section.type === 'pricing') {
                  const pricing = (section.content || proposal?.pricing) as PricingTableData;
                  if (!pricing || !pricing.rows) return null;
                  const borderClass = styles.borderStyle === 'sharp' ? 'rounded-none' : styles.borderStyle === 'pill' ? 'rounded-2xl' : 'rounded-3xl';
                  const headerBg = styles.sectionStyle === 'filled' ? styles.colors.secondary : styles.sectionStyle === 'striped' ? styles.colors.secondary : `${styles.colors.text}08`;
                  const totalBg = styles.pricingStyle === 'highlight' ? styles.colors.accent : styles.pricingStyle === 'bordered' ? 'transparent' : `${styles.colors.accent}30`;
                  const totalBorder = styles.pricingStyle === 'bordered' ? `2px solid ${styles.colors.accent}` : 'none';

                  return (
                    <div key={section.id} className={`${borderClass} p-6 sm:p-8 shadow-xs space-y-5`} style={{ backgroundColor: styles.sectionStyle === 'filled' ? styles.colors.secondary : styles.sectionStyle === 'minimal' ? 'transparent' : 'white', border: styles.sectionStyle === 'minimal' ? 'none' : styles.sectionStyle === 'bordered' ? 'none' : `1px solid ${styles.colors.text}10` }}>
                      <SectionTitle title={section.title || 'Investment & Pricing'} styles={styles} icon={<DollarSign className="h-4 w-4" />} />
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs" style={{ fontFamily: styles.fonts.body }}>
                          <thead>
                            <tr className="font-bold uppercase tracking-wider" style={{ backgroundColor: headerBg, color: styles.colors.text }}>
                              <th className="py-3 px-4 rounded-l-xl">Deliverable</th>
                              <th className="py-3 px-4">Description</th>
                              <th className="py-3 px-4 text-center w-16">Qty</th>
                              <th className="py-3 px-4 text-right w-28">Rate</th>
                              <th className="py-3 px-4 text-right w-28 rounded-r-xl">Total</th>
                            </tr>
                          </thead>
                          <tbody style={{ borderTop: `1px solid ${styles.colors.text}10` }}>
                            {pricing.rows.map((row) => (
                              <tr key={row.id} style={{ borderBottom: `1px solid ${styles.colors.text}08` }}>
                                <td className="py-3.5 px-4 font-bold" style={{ color: styles.colors.text }}>{row.item}</td>
                                <td className="py-3.5 px-4" style={{ color: `${styles.colors.text}80` }}>{row.description}</td>
                                <td className="py-3.5 px-4 text-center font-medium">{row.quantity}</td>
                                <td className="py-3.5 px-4 text-right" style={{ color: `${styles.colors.text}80` }}>{formatCurrency(row.unitPrice, pricing.currency)}</td>
                                <td className="py-3.5 px-4 text-right font-bold" style={{ color: styles.colors.text }}>{formatCurrency(row.total, pricing.currency)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end pt-4" style={{ borderTop: `1px solid ${styles.colors.text}10` }}>
                        <div className="w-72 space-y-2 text-xs">
                          <div className="flex justify-between" style={{ color: `${styles.colors.text}80` }}>
                            <span>Subtotal</span>
                            <span className="font-bold" style={{ color: styles.colors.text }}>{formatCurrency(pricing.subtotal, pricing.currency)}</span>
                          </div>
                          {pricing.discount > 0 && (
                            <div className="flex justify-between font-semibold text-emerald-600">
                              <span>Discount Applied</span>
                              <span>-{formatCurrency(pricing.discount, pricing.currency)}</span>
                            </div>
                          )}
                          {pricing.tax > 0 && (
                            <div className="flex justify-between" style={{ color: `${styles.colors.text}80` }}>
                              <span>Taxes & Fees</span>
                              <span>+{formatCurrency(pricing.tax, pricing.currency)}</span>
                            </div>
                          )}
                          <div className="pt-3 flex justify-between items-baseline" style={{ borderTop: `1px solid ${styles.colors.text}15` }}>
                            <span className="font-extrabold text-sm" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>Total Investment</span>
                            <span className="font-extrabold text-lg px-3 py-0.5 rounded-xl" style={{ color: styles.colors.text, backgroundColor: totalBg, border: totalBorder }}>
                              {formatCurrency(pricing.total, pricing.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (section.type === 'timeline' && Array.isArray(section.content)) {
                  const milestones = section.content as TimelineMilestone[];
                  
                  if (styles.timelineStyle === 'horizontal') {
                    return (
                      <SectionCard key={section.id} styles={styles}>
                        <SectionTitle title={section.title || 'Project Timeline'} styles={styles} icon={<Calendar className="h-4 w-4" />} />
                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {milestones.map((m, mIdx) => (
                            <div key={m.id || mIdx} className="shrink-0 w-56 p-4 rounded-2xl border" style={{ borderColor: `${styles.colors.text}10`, backgroundColor: styles.colors.background }}>
                              <div className="h-6 w-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold mb-2" style={{ backgroundColor: styles.colors.primary, color: styles.colors.accent }}>
                                {mIdx + 1}
                              </div>
                              <h4 className="text-xs font-bold" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>{m.title}</h4>
                              {m.description && <p className="text-[11px] mt-1 leading-relaxed" style={{ color: `${styles.colors.text}70` }}>{m.description}</p>}
                              {m.date && (
                                <span className="inline-block text-[10px] font-medium mt-2" style={{ color: `${styles.colors.text}50` }}>
                                  {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    );
                  }

                  if (styles.timelineStyle === 'steps') {
                    return (
                      <SectionCard key={section.id} styles={styles}>
                        <SectionTitle title={section.title || 'Project Timeline'} styles={styles} icon={<Calendar className="h-4 w-4" />} />
                        <div className="flex gap-3">
                          {milestones.map((m, mIdx) => (
                            <div key={m.id || mIdx} className="flex-1 text-center">
                              <div className="h-8 w-8 rounded-full text-white flex items-center justify-center text-xs font-bold mx-auto mb-2" style={{ backgroundColor: styles.colors.primary, color: styles.colors.accent }}>
                                {mIdx + 1}
                              </div>
                              <div className="h-1 w-full mb-2" style={{ backgroundColor: mIdx < milestones.length - 1 ? `${styles.colors.accent}40` : styles.colors.accent }} />
                              <h4 className="text-xs font-bold" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>{m.title}</h4>
                              {m.description && <p className="text-[10px] mt-1" style={{ color: `${styles.colors.text}60` }}>{m.description}</p>}
                              {m.date && (
                                <span className="text-[10px] font-medium mt-1 block" style={{ color: `${styles.colors.text}50` }}>
                                  {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    );
                  }

                  if (styles.timelineStyle === 'cards') {
                    return (
                      <SectionCard key={section.id} styles={styles}>
                        <SectionTitle title={section.title || 'Project Timeline'} styles={styles} icon={<Calendar className="h-4 w-4" />} />
                        <div className="grid grid-cols-2 gap-3">
                          {milestones.map((m, mIdx) => (
                            <div key={m.id || mIdx} className="p-4 rounded-2xl border" style={{ borderColor: `${styles.colors.text}10`, backgroundColor: styles.colors.background }}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 w-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: styles.colors.primary, color: styles.colors.accent }}>
                                  {mIdx + 1}
                                </div>
                                <h4 className="text-xs font-bold" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>{m.title}</h4>
                              </div>
                              {m.description && <p className="text-[11px] leading-relaxed" style={{ color: `${styles.colors.text}70` }}>{m.description}</p>}
                              {m.date && (
                                <span className="text-[10px] font-medium mt-2 block" style={{ color: `${styles.colors.text}50` }}>
                                  {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </SectionCard>
                    );
                  }

                  return (
                    <SectionCard key={section.id} styles={styles}>
                      <SectionTitle title={section.title || 'Project Timeline'} styles={styles} icon={<Calendar className="h-4 w-4" />} />
                      <div className="relative pl-6 space-y-5">
                        <div className="absolute left-2.5 top-2 bottom-2 w-0.5" style={{ backgroundColor: `${styles.colors.text}15` }} />
                        {milestones.map((m, mIdx) => (
                          <div key={m.id || mIdx} className="relative">
                            <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: styles.colors.primary, color: styles.colors.accent }}>
                              {mIdx + 1}
                            </div>
                            <div className="p-4 rounded-2xl space-y-1" style={{ backgroundColor: styles.colors.background, border: `1px solid ${styles.colors.text}10` }}>
                              <h4 className="text-sm font-bold" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>{m.title}</h4>
                              {m.description && <p className="text-xs leading-relaxed" style={{ color: `${styles.colors.text}70` }}>{m.description}</p>}
                              {m.date && (
                                <span className="text-[11px] font-medium pt-1 block" style={{ color: `${styles.colors.text}50` }}>
                                  Target Date: {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  );
                }

                let htmlContent = '';
                if (typeof section.content === 'string') {
                  htmlContent = section.content;
                } else if (section.content?.html) {
                  htmlContent = section.content.html;
                }
                if (!htmlContent) return null;

                return (
                  <SectionCard key={section.id} styles={styles}>
                    <SectionTitle title={section.title} styles={styles} />
                    <div
                      className="prose prose-neutral max-w-none text-sm leading-relaxed"
                      style={{ color: styles.colors.text, fontFamily: styles.fonts.body }}
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  </SectionCard>
                );
              })}
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