'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, ProposalStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, getStatusBadgeStyle, getStatusLabel } from '@/lib/utils';
import {
  Plus,
  Search,
  FileText,
  Eye,
  Trash2,
  ExternalLink,
  Share2,
  Copy,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Check,
  CheckCircle2,
  User,
  Mail,
} from 'lucide-react';

const FILTER_TABS: { value: ProposalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Proposals' },
  { value: 'draft', label: 'Drafts' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Declined' },
];

export default function ProposalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadProposals();
  }, [user]);

  const loadProposals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await firestoreHelpers.getProposals(user.uid);
      setProposals(data || []);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = useMemo(() => {
    let result = proposals;
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.purpose.toLowerCase().includes(q)
      );
    }
    return result;
  }, [proposals, search, statusFilter]);

  const handleDelete = async (proposalId: string) => {
    if (!user || !confirm('Are you sure you want to delete this proposal?')) return;
    setDeletingId(proposalId);
    try {
      await firestoreHelpers.deleteProposal(user.uid, proposalId);
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
    } catch (err) {
      console.error('Failed to delete proposal:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = (shareId: string | null | undefined, proposalId: string) => {
    if (!shareId) return;
    const url = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(proposalId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Proposals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">My Proposals</h1>
          <p className="text-sm text-[#71717a] mt-1">Manage, share, and track all your client proposals.</p>
        </div>
        <Button variant="accent" size="md" className="font-bold" onClick={() => router.push('/proposals/new')}>
          <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
          New Proposal
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === 'all'
                ? proposals.length
                : proposals.filter((p) => p.status === tab.value).length;
            const isSelected = statusFilter === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#09090b] text-white shadow-sm'
                    : 'bg-[#f4f4f5] text-[#71717a] hover:bg-[#e4e4e7] hover:text-[#09090b]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#71717a]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-full border border-[#e4e4e7] bg-white focus:outline-none focus:ring-2 focus:ring-[#09090b]/10 focus:border-[#09090b] transition-all"
            />
          </div>

          <div className="flex items-center bg-[#f4f4f5] p-1 rounded-full border border-[#e4e4e7]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#09090b] shadow-sm' : 'text-[#71717a]'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#09090b] shadow-sm' : 'text-[#71717a]'
              }`}
              aria-label="List view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {proposals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e4e4e7] p-8">
          <div className="h-14 w-14 rounded-2xl bg-[#f4f4f5] flex items-center justify-center mx-auto text-[#71717a] mb-4">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#09090b]">No proposals yet</h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-sm mx-auto">
            Get started by creating your first client proposal with AI or customized blocks.
          </p>
          <Button variant="accent" size="md" className="mt-6 font-bold" onClick={() => router.push('/proposals/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Proposal
          </Button>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#e4e4e7] text-[#71717a]">
          <p className="text-sm font-medium">No proposals matching &ldquo;{search}&rdquo;</p>
          <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
            Reset Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProposals.map((proposal) => {
            const badge = getStatusBadgeStyle(proposal.status);
            return (
              <Card key={proposal.id} hoverEffect className="flex flex-col justify-between overflow-hidden group">
                <CardContent className="p-6">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-[#09090b] truncate group-hover:text-[#6366f1] transition-colors">
                        {proposal.title || 'Untitled Proposal'}
                      </h3>
                      <p className="text-xs text-[#71717a] truncate mt-0.5">
                        {proposal.purpose || 'No description provided'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${badge.bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      {getStatusLabel(proposal.status)}
                    </span>
                  </div>

                  {/* Accepted Info Banner */}
                  {proposal.status === 'accepted' && proposal.clientSignName && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Accepted & Signed
                      </p>
                      <p className="text-xs font-semibold text-emerald-900 flex items-center gap-1">
                        <User className="h-3 w-3 text-emerald-600" /> {proposal.clientSignName}
                      </p>
                      {proposal.clientEmail && (
                        <p className="text-xs text-emerald-700 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {proposal.clientEmail}
                        </p>
                      )}
                      {proposal.acceptedAt && (
                        <p className="text-[10px] text-emerald-600">{formatDate(proposal.acceptedAt)}</p>
                      )}
                    </div>
                  )}

                  {/* Metrics Badge Row */}
                  <div className="flex items-center gap-3 text-xs text-[#71717a] my-5 pt-3 border-t border-[#f4f4f5]">
                    <span className="flex items-center gap-1 font-medium">
                      <Eye className="h-3.5 w-3.5 text-[#a1a1aa]" />
                      {proposal.viewCount || 0} views
                    </span>
                    <span>•</span>
                    <span>{proposal.sections?.length || 0} sections</span>
                    <span>•</span>
                    <span>{formatDate(proposal.updatedAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 font-bold text-xs"
                      onClick={() => router.push(`/proposals/${proposal.id}`)}
                    >
                      Open Editor
                    </Button>

                    {proposal.shareId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(proposal.shareId, proposal.id)}
                        title="Copy client share link"
                        className="px-2.5"
                      >
                        {copiedId === proposal.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Share2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deletingId === proposal.id}
                      onClick={() => handleDelete(proposal.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5"
                      title="Delete proposal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfcfd] border-b border-[#e4e4e7] text-[11px] font-bold uppercase tracking-wider text-[#71717a]">
                <tr>
                  <th className="py-3.5 px-6">Proposal</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Updated</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f4f5]">
                {filteredProposals.map((proposal) => {
                  const badge = getStatusBadgeStyle(proposal.status);
                  return (
                    <tr key={proposal.id} className="hover:bg-[#fcfcfd] transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-sm text-[#09090b] truncate max-w-xs">{proposal.title || 'Untitled'}</p>
                        <p className="text-xs text-[#71717a] truncate max-w-xs">{proposal.purpose}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {getStatusLabel(proposal.status)}
                        </span>
                      </td>
                      {/* Client / Accepted-by column */}
                      <td className="py-4 px-4">
                        {proposal.status === 'accepted' && proposal.clientSignName ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <User className="h-3 w-3" />{proposal.clientSignName}
                            </p>
                            {proposal.clientEmail && (
                              <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                                <Mail className="h-3 w-3" />{proposal.clientEmail}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#a1a1aa] text-xs">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-[#52525b]">
                        {proposal.viewCount || 0}
                      </td>
                      <td className="py-4 px-4 text-[#71717a]">
                        {formatDate(proposal.updatedAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {proposal.shareId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(proposal.shareId, proposal.id)}
                            >
                              {copiedId === proposal.id ? 'Copied!' : 'Share'}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(proposal.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}