'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Proposal, ProposalAcceptor, PricingTableData, TimelineMilestone } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  DollarSign,
  Printer,
  ShieldCheck,
  Check,
  Phone,
  MessageSquare,
  Undo2,
} from 'lucide-react';

export default function SharedProposalPage() {
  const params = useParams();
  const shareId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string>('sent');

  // Accept Modal State
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [clientSignName, setClientSignName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);


  // Print / PDF ref
  const printRef = useRef<HTMLDivElement>(null);
  const handleDownloadPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: proposal?.title || 'Proposal',
  });

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
        body: JSON.stringify({
          shareId,
          action: 'accept',
          clientSignName,
          clientEmail,
          clientMobile,
          clientMessage,
        }),
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
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Proposal...</span>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-3xl border border-[#e4e4e7] shadow-lg">
          <div className="h-12 w-12 rounded-2xl bg-[#f4f4f5] text-[#09090b] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-[#09090b]">Proposal Unavailable</h1>
          <p className="text-xs text-[#71717a] mt-2 mb-6 leading-relaxed">
            {error || 'This proposal could not be loaded.'}
          </p>
          <Link href="/">
            <Button variant="accent" size="md" className="font-bold">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedSections = [...(proposal.sections || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#09090b] selection:bg-[#d4ff00] selection:text-black">
      {/* Sticky Client Response Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e4e4e7] print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#09090b] text-[#d4ff00] flex items-center justify-center shadow-xs">
              <Sparkles className="h-4 w-4 fill-[#d4ff00]" />
            </div>
            <div>
          <span className="font-extrabold text-sm text-[#09090b] tracking-tight">Proposal Preview</span>
              <span className="text-[10px] text-[#71717a] block">Live &amp; accepting requests</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadPDF()}
              className="text-xs font-semibold hidden sm:inline-flex"
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs font-semibold hidden sm:inline-flex"
            >
              <Printer className="h-3.5 w-3.5 mr-1" /> Print
            </Button>
            {status === 'rejected' ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold shadow-sm">
                  <XCircle className="h-4 w-4" /> Declined
                </span>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setAcceptModalOpen(true)}
                  className="text-xs font-bold text-black shadow-sm"
                >
                  <Check className="h-3.5 w-3.5 mr-1 stroke-[3]" /> Send Request
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleDecline} className="text-xs font-semibold text-rose-600 hover:bg-rose-50">
                  Decline
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setAcceptModalOpen(true)}
                  className="text-xs font-bold text-black shadow-sm"
                >
                  <Check className="h-3.5 w-3.5 mr-1 stroke-[3]" /> Send Request
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div ref={printRef} data-print-root className="space-y-8">

        {/* Render Sections */}
        {sortedSections.map((section, idx) => {
          if (section.type === 'cover') {
            return (
              <div
                key={section.id}
                className="bg-[#09090b] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-xl"
              >
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#d4ff00]/15 blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#d4ff00] border border-white/10">
                    <Sparkles className="h-3 w-3 fill-[#d4ff00]" /> Client Proposal
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    {section.content?.title || proposal.title}
                  </h1>
                  <p className="text-base sm:text-lg text-[#d4ff00] font-semibold">
                    {section.content?.subtitle || proposal.purpose}
                  </p>
                  <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-400 border-t border-white/10">
                    <span>Date: {formatDate(proposal.updatedAt)}</span>
                    <span>Valid For: 30 Days</span>
                  </div>
                </div>
              </div>
            );
          }

          if (section.type === 'pricing') {
            const pricing = (section.content || proposal.pricing) as PricingTableData;
            if (!pricing || !pricing.rows) return null;

            return (
              <div key={section.id} className="bg-white rounded-3xl border border-[#e4e4e7] p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#f4f4f5]">
                  <div className="h-7 w-7 rounded-lg bg-[#09090b] text-[#d4ff00] flex items-center justify-center">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold text-[#09090b]">{section.title || 'Investment & Pricing'}</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#f4f4f5] text-[#71717a] font-bold uppercase tracking-wider">
                        <th className="py-3 px-4 rounded-l-xl">Deliverable</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4 text-center w-16">Qty</th>
                        <th className="py-3 px-4 text-right w-28">Rate</th>
                        <th className="py-3 px-4 text-right w-28 rounded-r-xl">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f4f4f5]">
                      {pricing.rows.map((row) => (
                        <tr key={row.id}>
                          <td className="py-3.5 px-4 font-bold text-[#09090b]">{row.item}</td>
                          <td className="py-3.5 px-4 text-[#52525b]">{row.description}</td>
                          <td className="py-3.5 px-4 text-center font-medium">{row.quantity}</td>
                          <td className="py-3.5 px-4 text-right text-[#52525b]">{formatCurrency(row.unitPrice, pricing.currency)}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#09090b]">{formatCurrency(row.total, pricing.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#f4f4f5]">
                  <div className="w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-[#71717a]">
                      <span>Subtotal</span>
                      <span className="font-bold text-[#09090b]">{formatCurrency(pricing.subtotal, pricing.currency)}</span>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Discount Applied</span>
                        <span>-{formatCurrency(pricing.discount, pricing.currency)}</span>
                      </div>
                    )}
                    {pricing.tax > 0 && (
                      <div className="flex justify-between text-[#71717a]">
                        <span>Taxes & Fees</span>
                        <span>+{formatCurrency(pricing.tax, pricing.currency)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-[#e4e4e7] flex justify-between items-baseline">
                      <span className="font-extrabold text-sm text-[#09090b]">Total Investment</span>
                      <span className="font-extrabold text-lg text-[#09090b] bg-[#d4ff00]/40 px-3 py-0.5 rounded-xl">
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
            return (
              <div key={section.id} className="bg-white rounded-3xl border border-[#e4e4e7] p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#f4f4f5]">
                  <div className="h-7 w-7 rounded-lg bg-[#09090b] text-[#d4ff00] flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold text-[#09090b]">{section.title || 'Project Timeline'}</h2>
                </div>

                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e4e4e7]">
                  {milestones.map((m, mIdx) => (
                    <div key={m.id || mIdx} className="relative">
                      <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-[#09090b] text-[#d4ff00] flex items-center justify-center text-[10px] font-bold">
                        {mIdx + 1}
                      </div>
                      <div className="bg-[#fcfcfd] p-4 rounded-2xl border border-[#e4e4e7] space-y-1">
                        <h4 className="text-sm font-bold text-[#09090b]">{m.title}</h4>
                        {m.description && <p className="text-xs text-[#52525b] leading-relaxed">{m.description}</p>}
                        {m.date && (
                          <span className="inline-block text-[11px] text-[#71717a] font-medium pt-1">
                            Target Date: {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            <div key={section.id} className="bg-white rounded-3xl border border-[#e4e4e7] p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-[#09090b] pb-3 border-b border-[#f4f4f5]">
                {section.title}
              </h2>
              <div
                className="prose prose-neutral max-w-none text-sm text-[#18181b] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          );
        })}

        {/* Bottom Accept Action Box */}
        {status !== 'rejected' && (
          <div className="p-8 bg-[#09090b] text-white rounded-3xl text-center space-y-4 shadow-xl print:hidden" data-html2canvas-ignore="true">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4ff00]">
              Interested in this proposal?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Send an Accept Request
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Fill in your details and send an accept request to the proposal creator.
            </p>
            <Button
              variant="accent"
              size="lg"
              onClick={() => setAcceptModalOpen(true)}
              className="font-bold text-black shadow-md hover:scale-105"
            >
              <Check className="h-4 w-4 mr-2 stroke-[3]" /> Send Accept Request
            </Button>
          </div>
        )}
        </div>
      </main>

      {/* Digital Acceptance Modal Dialog */}
      {acceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setAcceptModalOpen(false)}>
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <Card className="shadow-2xl border-[#e4e4e7] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#09090b]">Send Accept Request</h3>
                    <p className="text-xs text-[#71717a]">Fill in your company details to send an accept request.</p>
                  </div>
                </div>

                <form onSubmit={handleAcceptSubmit} className="space-y-4 my-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#52525b] mb-1.5">
                      Your Full Name (Digital Signature) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Miller"
                      value={clientSignName}
                      onChange={(e) => setClientSignName(e.target.value)}
                      className="w-full h-11 px-4 text-sm font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#52525b] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jordan@company.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full h-11 px-4 text-sm font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#52525b] mb-1.5">
                      Mobile Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={clientMobile}
                        onChange={(e) => setClientMobile(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 text-sm font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#52525b] mb-1.5">
                      Message / Notes (Optional)
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-[#a1a1aa]" />
                      <textarea
                        placeholder="Any additional notes or comments..."
                        value={clientMessage}
                        onChange={(e) => setClientMessage(e.target.value)}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b] resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#f4f4f5] rounded-xl text-[11px] text-[#52525b] leading-relaxed">
                    By clicking &ldquo;Confirm & Sign&rdquo;, you accept the scope of work, timeline, and investment terms outlined in this proposal.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setAcceptModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="accent"
                      size="sm"
                      className="font-bold text-black shadow-xs"
                      loading={submitting}
                    >
                      Confirm & Send Request
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      )}


      {/* Footer */}
      <footer className="border-t border-[#e4e4e7] bg-white py-8 mt-16 text-center text-xs text-[#71717a]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Created with ProposalGen Studio</span>
          <span>⚡ High-Converting Proposal Architecture</span>
        </div>
      </footer>
    </div>
  );
}