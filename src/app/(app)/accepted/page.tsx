'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, ProposalAcceptor } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import {
  CheckCircle2,
  Search,
  User,
  Mail,
  Calendar,
  Phone,
  MessageSquare,
  DollarSign,
  ExternalLink,
  FileText,
  Plus,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AcceptedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedProposals, setExpandedProposals] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    loadProposals();
  }, [user]);

  const loadProposals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await firestoreHelpers.getProposals(user.uid);
      // Show proposals that have any accept requests OR legacy 'accepted' status
      setProposals((data || []).filter((p) => (p.acceptors?.length ?? 0) > 0 || p.status === 'accepted'));
    } catch (err) {
      console.error('Failed to load accept requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return proposals;
    const q = search.toLowerCase();
    return proposals.filter((p) => {
      const inTitle = p.title?.toLowerCase().includes(q);
      const inPurpose = p.purpose?.toLowerCase().includes(q);
      const inAcceptors = (p.acceptors || []).some(
        (a) =>
          a.clientSignName?.toLowerCase().includes(q) ||
          a.clientEmail?.toLowerCase().includes(q) ||
          a.clientMobile?.toLowerCase().includes(q)
      );
      return inTitle || inPurpose || inAcceptors;
    });
  }, [proposals, search]);

  // Count total unique signatories across all accepted proposals
  const totalSignatories = proposals.reduce(
    (sum, p) => sum + (p.acceptors?.length || 0),
    0
  );

  const toggleExpand = (id: string) => {
    setExpandedProposals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Accepted Proposals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
            <CheckCircle2 className="h-3 w-3" /> Accept Requests
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Accept Requests</h1>
          <p className="text-sm text-[#71717a] mt-1">All companies that have sent accept requests for your live proposals.</p>
        </div>
        <Button variant="accent" size="md" className="font-bold" onClick={() => router.push('/proposals/new')}>
          <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
          New Proposal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Proposals with Requests</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#09090b] tracking-tight">{proposals.length}</p>
            <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Proposals</span> with accept requests
            </p>
          </div>
        </Card>

        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Total Signatories</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#09090b] tracking-tight">{totalSignatories}</p>
            <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Companies</span> sent accept requests
            </p>
          </div>
        </Card>

      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
        <input
          type="text"
          placeholder="Search by title, client name, email, or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs font-medium rounded-full border border-[#e4e4e7] bg-white focus:outline-none focus:ring-2 focus:ring-[#09090b]/10 focus:border-[#09090b] transition-all"
        />
      </div>

      {/* Content */}
      {proposals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e4e4e7] p-8">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600 mb-4">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#09090b]">No accept requests yet</h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-sm mx-auto">
            When companies view your live proposals and send accept requests, they will appear here with all their details.
          </p>
          <Button variant="accent" size="md" className="mt-6 font-bold" onClick={() => router.push('/proposals')}>
            <FileText className="h-4 w-4 mr-1.5" />
            View All Proposals
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#e4e4e7] text-[#71717a]">
          <p className="text-sm font-medium">No results for &ldquo;{search}&rdquo;</p>
          <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => setSearch('')}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((proposal) => {
            const acceptors: ProposalAcceptor[] = proposal.acceptors || [];
            const isExpanded = expandedProposals.has(proposal.id);
            const previewAcceptors = isExpanded ? acceptors : acceptors.slice(0, 2);

            return (
              <Card key={proposal.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Proposal Header */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f4f4f5]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-[#09090b] truncate">
                          {proposal.title || <span className="italic text-[#a1a1aa]">Untitled</span>}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 shrink-0">
                          <CheckCircle2 className="h-3 w-3" />
                          {acceptors.length} {acceptors.length === 1 ? 'Signatory' : 'Signatories'}
                        </span>
                      </div>
                      {proposal.purpose && (
                        <p className="text-xs text-[#71717a] truncate mt-0.5">{proposal.purpose}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {proposal.pricing && proposal.pricing.total > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(proposal.pricing.total, proposal.pricing.currency)}
                        </span>
                      )}
                      {proposal.shareId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/shared/${proposal.shareId}`, '_blank')}
                          className="text-xs font-semibold"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-semibold"
                        onClick={() => router.push(`/proposals/${proposal.id}`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Acceptors Table */}
                  {acceptors.length > 0 ? (
                    <div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider">
                              <th className="py-2.5 px-4 rounded-none">#</th>
                              <th className="py-2.5 px-4">
                                <div className="flex items-center gap-1.5"><User className="h-3 w-3" /> Name</div>
                              </th>
                              <th className="py-2.5 px-4">
                                <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email</div>
                              </th>
                              <th className="py-2.5 px-4">
                                <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> Mobile</div>
                              </th>
                              <th className="py-2.5 px-4">
                                <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Accepted On</div>
                              </th>
                              <th className="py-2.5 px-4">
                                <div className="flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Message</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f4f4f5]">
                            {previewAcceptors.map((acceptor, idx) => (
                              <tr key={acceptor.id || idx} className="hover:bg-[#fcfcfd] transition-colors group">
                                <td className="py-3 px-4">
                                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-emerald-700">{idx + 1}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                      <span className="text-[11px] font-bold text-emerald-700">
                                        {acceptor.clientSignName?.charAt(0)?.toUpperCase() || '?'}
                                      </span>
                                    </div>
                                    <span className="font-bold text-[#09090b] whitespace-nowrap">
                                      {acceptor.clientSignName || '—'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-[#52525b] font-medium">
                                  {acceptor.clientEmail ? (
                                    <a
                                      href={`mailto:${acceptor.clientEmail}`}
                                      className="hover:text-emerald-700 transition-colors"
                                    >
                                      {acceptor.clientEmail}
                                    </a>
                                  ) : (
                                    <span className="text-[#a1a1aa]">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-[#52525b] font-medium whitespace-nowrap">
                                  {acceptor.clientMobile || <span className="text-[#a1a1aa]">—</span>}
                                </td>
                                <td className="py-3 px-4 text-[#52525b] whitespace-nowrap">
                                  {acceptor.acceptedAt ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                                      <Calendar className="h-2.5 w-2.5" />
                                      {formatDate(acceptor.acceptedAt)}
                                    </span>
                                  ) : (
                                    <span className="text-[#a1a1aa]">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-[#52525b] max-w-xs">
                                  {acceptor.clientMessage ? (
                                    <span className="inline-block bg-[#f4f4f5] px-2 py-1 rounded-lg text-[11px] truncate max-w-[180px]" title={acceptor.clientMessage}>
                                      {acceptor.clientMessage}
                                    </span>
                                  ) : (
                                    <span className="text-[#a1a1aa]">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Show more/less toggle */}
                      {acceptors.length > 2 && (
                        <div className="px-4 py-2.5 border-t border-[#f4f4f5] bg-[#fcfcfd] flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                            onClick={() => toggleExpand(proposal.id)}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5 mr-1" /> Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                                Show {acceptors.length - 2} More {acceptors.length - 2 === 1 ? 'Signatory' : 'Signatories'}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-6 py-4 text-xs text-[#71717a] italic">
                      No acceptors found for this proposal.
                    </div>
                  )}

                  {/* Footer row */}
                  <div className="px-6 py-3 bg-[#fcfcfd] border-t border-[#f4f4f5] flex items-center justify-between">
                    <span className="text-[11px] text-[#71717a]">
                      {proposal.viewCount || 0} views · {proposal.sections?.length || 0} sections
                    </span>
                    {proposal.sharedAt && (
                      <span className="text-[11px] text-[#71717a] flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Shared {formatDate(proposal.sharedAt)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
