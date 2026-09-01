'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Proposal, ProposalAcceptor, PricingTableData, TimelineMilestone, TemplateStyles } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
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
import {
  Sparkles,
  XCircle,
  Download,
  Calendar,
  DollarSign,
  Printer,
  ShieldCheck,
  Check,
  Phone,
  MessageSquare,
} from 'lucide-react';

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

function renderCover(section: any, proposal: any, styles: TemplateStyles) {
  const title = section.content?.title || proposal.title;
  const subtitle = section.content?.subtitle || proposal.purpose;
  const date = formatDate(proposal.updatedAt);
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

export default function SharedProposalPage() {
  const params = useParams();
  const shareId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string>('sent');

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [clientSignName, setClientSignName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handleDownloadPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: proposal?.title || 'Proposal',
  });

  const styles: TemplateStyles = proposal?.styles || DEFAULT_STYLES;

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

  useEffect(() => {
    if (!shareId) return;
    const loadProposal = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/proposals/shared', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shareId }),
        });
        const data = await response.json();
        if (!response.ok) {
          if (data?.error === 'server_misconfigured') {
            setError('This app is not fully configured yet. Firebase Admin credentials are missing.');
          } else if (data?.error === 'not_found') {
            setError('This proposal link is invalid or has been removed.');
          } else {
            setError(data?.message || 'Something went wrong loading this proposal.');
          }
          return;
        }
        if (data?.proposal) {
          setProposal(data.proposal);
          setStatus(data.proposal.status || 'sent');
        } else {
          setError('Proposal data is empty or malformed.');
        }
      } catch (err) {
        console.error('Shared proposal load error:', err);
        setError('Unable to load the proposal. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    loadProposal();
  }, [shareId]);

  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSignName.trim()) return;
    setSubmitting(true);
    try {
      const newAcceptor: ProposalAcceptor = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 10),
        clientSignName,
        clientEmail,
        clientMobile,
        clientMessage,
        acceptedAt: new Date(),
      };
      await fetch('/api/proposals/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId, action: 'accept', clientSignName, clientEmail, clientMobile, clientMessage }),
      });
      if (proposal) {
        const updatedAcceptors = [...(proposal.acceptors || []), newAcceptor];
        setProposal({ ...proposal, acceptors: updatedAcceptors, status: 'accepted' });
      }
      setStatus('accepted');
      setAcceptModalOpen(false);
      setClientSignName('');
      setClientEmail('');
      setClientMobile('');
      setClientMessage('');
    } catch (err) {
      console.error('Accept error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this proposal?')) return;
    try {
      await fetch('/api/proposals/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId, action: 'reject' }),
      });
      if (proposal) {
        setProposal({ ...proposal, status: 'rejected', rejectedAt: new Date() });
      }
      setStatus('rejected');
    } catch (err) {
      console.error('Reject error:', err);
      setStatus('rejected');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: styles.colors.background }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-t-[#d4ff00] animate-spin" style={{ borderColor: styles.colors.primary, borderTopColor: styles.colors.accent }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: `${styles.colors.text}60` }}>Loading Proposal...</span>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: styles.colors.background }}>
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-[#e4e4e7] shadow-lg">
          <div className="h-12 w-12 rounded-2xl bg-[#f4f4f5] text-[#09090b] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-[#09090b]">Proposal Unavailable</h1>
          <p className="text-xs text-[#71717a] mt-2 mb-6 leading-relaxed">
            {error || 'This proposal could not be loaded.'}
          </p>
          <Link href="/">
            <Button variant="accent" size="md" className="font-bold">Return to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedSections = [...(proposal.sections || [])].sort((a, b) => a.order - b.order);
  const accentBarStyle = styles.accentStyle === 'gradient'
    ? { background: `linear-gradient(90deg, ${styles.colors.accent}, ${styles.colors.primary})` }
    : styles.accentStyle === 'stripe'
    ? { backgroundImage: `repeating-linear-gradient(45deg, ${styles.colors.accent}, ${styles.colors.accent} 4px, ${styles.colors.accent}60 4px, ${styles.colors.accent}60 8px)` }
    : { backgroundColor: styles.colors.accent };

  return (
    <div className="min-h-screen text-[#09090b] selection:text-black" style={{ backgroundColor: styles.colors.background, fontFamily: styles.fonts.body, color: styles.colors.text, [`--tw-ring-color` as any]: styles.colors.accent }}>
      <header className="sticky top-0 z-40 border-b print:hidden" style={{ backgroundColor: `${styles.colors.background}e6`, backdropFilter: 'blur(12px)', borderColor: `${styles.colors.text}10` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shadow-xs" style={{ backgroundColor: styles.colors.primary, color: styles.colors.accent }}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>Proposal Preview</span>
              <span className="text-[10px] block" style={{ color: `${styles.colors.text}60` }}>Live &amp; accepting requests</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDownloadPDF()} className="text-xs font-semibold hidden sm:inline-flex">
              <Download className="h-3.5 w-3.5 mr-1" /> Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs font-semibold hidden sm:inline-flex">
              <Printer className="h-3.5 w-3.5 mr-1" /> Print
            </Button>
            {status === 'rejected' ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold shadow-sm">
                  <XCircle className="h-4 w-4" /> Declined
                </span>
                <Button variant="accent" size="sm" onClick={() => setAcceptModalOpen(true)} className="text-xs font-bold shadow-sm" style={{ color: styles.colors.primary }}>
                  <Check className="h-3.5 w-3.5 mr-1 stroke-[3]" /> Send Request
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleDecline} className="text-xs font-semibold text-rose-600 hover:bg-rose-50">Decline</Button>
                <Button variant="accent" size="sm" onClick={() => setAcceptModalOpen(true)} className="text-xs font-bold shadow-sm" style={{ color: styles.colors.primary }}>
                  <Check className="h-3.5 w-3.5 mr-1 stroke-[3]" /> Send Request
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div ref={printRef} data-print-root className="space-y-8">
          {styles.header && (
            <div className="text-center text-[10px] font-bold uppercase tracking-widest py-2" style={{ color: styles.colors.accent, fontFamily: styles.fonts.heading, borderBottom: `1px solid ${styles.colors.text}10` }}>
              {styles.header}
            </div>
          )}

          {sortedSections.map((section) => {
            if (section.type === 'cover') {
              return <div key={section.id}>{renderCover(section, proposal, styles)}</div>;
            }

            if (section.type === 'pricing') {
              const pricing = (section.content || proposal.pricing) as PricingTableData;
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
              const borderClass = styles.borderStyle === 'sharp' ? 'rounded-none' : styles.borderStyle === 'pill' ? 'rounded-2xl' : 'rounded-3xl';

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

              // Default: vertical
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

          {styles.footer && (
            <div className="text-center text-[10px] font-bold uppercase tracking-widest py-3 mt-8" style={{ color: styles.colors.accent, fontFamily: styles.fonts.heading, borderTop: `1px solid ${styles.colors.text}10` }}>
              {styles.footer}
            </div>
          )}

          {status !== 'rejected' && (
            <div className="p-8 text-white rounded-3xl text-center space-y-4 shadow-xl print:hidden" data-html2canvas-ignore="true" style={{ backgroundColor: styles.colors.primary }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: styles.colors.accent }}>
                Interested in this proposal?
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: styles.fonts.heading }}>
                Send an Accept Request
              </h3>
              <p className="text-xs max-w-md mx-auto" style={{ color: `${styles.colors.accent}99` }}>
                Fill in your details and send an accept request to the proposal creator.
              </p>
              <Button variant="accent" size="lg" onClick={() => setAcceptModalOpen(true)} className="font-bold shadow-md hover:scale-105" style={{ color: styles.colors.primary }}>
                <Check className="h-4 w-4 mr-2 stroke-[3]" /> Send Accept Request
              </Button>
            </div>
          )}
        </div>
      </main>

      {acceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setAcceptModalOpen(false)}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <Card className="shadow-2xl border-[#e4e4e7] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-xs" style={{ backgroundColor: '#059669', color: 'white' }}>
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#09090b]">Send Accept Request</h3>
                    <p className="text-xs text-[#71717a]">Fill in your company details to send an accept request.</p>
                  </div>
                </div>
                <form onSubmit={handleAcceptSubmit} className="space-y-4 my-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#52525b] mb-1.5">Your Full Name (Digital Signature) *</label>
                    <input type="text" required placeholder="e.g. Jordan Miller" value={clientSignName} onChange={(e) => setClientSignName(e.target.value)} className="w-full h-11 px-4 text-sm font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#52525b] mb-1.5">Email Address *</label>
                    <input type="email" required placeholder="jordan@company.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full h-11 px-4 text-sm font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#52525b] mb-1.5">Mobile Number (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                      <input type="tel" placeholder="+91 98765 43210" value={clientMobile} onChange={(e) => setClientMobile(e.target.value)} className="w-full h-11 pl-10 pr-4 text-sm font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#52525b] mb-1.5">Message / Notes (Optional)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-[#a1a1aa]" />
                      <textarea placeholder="Any additional notes or comments..." value={clientMessage} onChange={(e) => setClientMessage(e.target.value)} rows={3} className="w-full pl-10 pr-4 py-2.5 text-sm font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b] resize-none" />
                    </div>
                  </div>
                  <div className="p-3 bg-[#f4f4f5] rounded-xl text-[11px] text-[#52525b] leading-relaxed">
                    By clicking &ldquo;Confirm & Sign&rdquo;, you accept the scope of work, timeline, and investment terms outlined in this proposal.
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setAcceptModalOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="accent" size="sm" className="font-bold text-black shadow-xs" loading={submitting}>Confirm & Send Request</Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      )}

      <footer className="border-t bg-white py-8 mt-16 text-center text-xs" style={{ borderColor: `${styles.colors.text}10`, color: `${styles.colors.text}60` }}>
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Created with ProposalGen Studio</span>
          <span>High-Converting Proposal Architecture</span>
        </div>
      </footer>
    </div>
  );
}
