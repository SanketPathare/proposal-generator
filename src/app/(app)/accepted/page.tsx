'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  CheckCircle2,
  Search,
  User,
  Mail,
  Calendar,
  DollarSign,
  Eye,
  ExternalLink,
  FileText,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function AcceptedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    loadProposals();
  }, [user]);

  const loadProposals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await firestoreHelpers.getProposals(user.uid);
      setProposals((data || []).filter((p) => p.status === 'accepted'));
    } catch (err) {
      console.error('Failed to load accepted proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return proposals;
    const q = search.toLowerCase();
    return proposals.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.purpose?.toLowerCase().includes(q) ||
        p.clientSignName?.toLowerCase().includes(q) ||
        p.clientEmail?.toLowerCase().includes(q)
    );
  }, [proposals, search]);

  const totalValue = proposals.reduce((sum, p) => sum + (p.pricing?.total ?? 0), 0);

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
            <CheckCircle2 className="h-3 w-3" /> Accepted & Signed
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Accepted Proposals</h1>
          <p className="text-sm text-[#71717a] mt-1">All proposals that have been digitally signed and accepted by clients.</p>
        </div>
        <Button variant="accent" size="md" className="font-bold" onClick={() => router.push('/proposals/new')}>
          <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
          New Proposal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Total Accepted</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#09090b] tracking-tight">{proposals.length}</p>
            <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Deals closed</span> successfully
            </p>
          </div>
        </Card>

        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Total Value</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#09090b] tracking-tight">{formatCurrency(totalValue)}</p>
            <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Revenue</span> from accepted proposals
            </p>
          </div>
        </Card>

        <Card hoverEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Avg. Deal Size</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-extrabold text-[#09090b] tracking-tight">
              {proposals.length > 0 ? formatCurrency(totalValue / proposals.length) : formatCurrency(0)}
            </p>
            <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Average</span> per accepted proposal
            </p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
        <input
          type="text"
          placeholder="Search by title, client name, or email..."
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
          <h3 className="text-base font-bold text-[#09090b]">No accepted proposals yet</h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-sm mx-auto">
            When clients accept and sign your proposals, they will appear here with all the signed details.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((proposal) => (
            <Card key={proposal.id} hoverEffect className="overflow-hidden group">
              <CardContent className="p-0">
                {/* Top section - proposal info */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-[#09090b] truncate group-hover:text-emerald-700 transition-colors">
                        {proposal.title || <span className="italic text-[#a1a1aa]">Untitled</span>}
                      </h3>
                      {proposal.purpose && (
                        <p className="text-xs text-[#71717a] truncate mt-0.5">{proposal.purpose}</p>
                      )}
                    </div>
                    {proposal.pricing && proposal.pricing.total > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 shrink-0">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(proposal.pricing.total, proposal.pricing.currency)}
                      </span>
                    )}
                  </div>

                  {/* Accepted sign details */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Digitally Signed & Accepted
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {proposal.clientSignName && (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase text-emerald-600">Signed By</p>
                            <p className="text-sm font-bold text-emerald-900 truncate">{proposal.clientSignName}</p>
                          </div>
                        </div>
                      )}
                      {proposal.clientEmail && (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <Mail className="h-3.5 w-3.5 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase text-emerald-600">Email</p>
                            <p className="text-sm font-bold text-emerald-900 truncate">{proposal.clientEmail}</p>
                          </div>
                        </div>
                      )}
                      {proposal.acceptedAt && (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase text-emerald-600">Accepted On</p>
                            <p className="text-sm font-bold text-emerald-900">{formatDate(proposal.acceptedAt)}</p>
                          </div>
                        </div>
                      )}
                      {proposal.sharedAt && (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase text-emerald-600">Shared On</p>
                            <p className="text-sm font-bold text-emerald-900">{formatDate(proposal.sharedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="px-6 py-3 bg-[#fcfcfd] border-t border-[#f4f4f5] flex items-center justify-between">
                  <span className="text-[11px] text-[#71717a]">
                    {proposal.viewCount || 0} views &middot; {proposal.sections?.length || 0} sections
                  </span>
                  <div className="flex items-center gap-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
