'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, ProposalStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Plus, Search, FileText, Eye, Trash2, ExternalLink } from 'lucide-react';

export default function ProposalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | ''>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadProposals();
  }, [user]);

  const loadProposals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await firestoreHelpers.getProposals(user.uid);
      setProposals(data);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = useMemo(() => {
    let result = proposals;
    if (statusFilter) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-gray-500 mt-1">Manage and track all your proposals.</p>
        </div>
        <Button onClick={() => router.push('/proposals/new')}>
          <Plus className="h-4 w-4 mr-1" />
          New Proposal
        </Button>
      </div>

      {/* Filters */}
      {proposals.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | '')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first proposal to get started.</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/proposals/new')}>
              <Plus className="h-4 w-4 mr-1" />
              New Proposal
            </Button>
          </div>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No proposals match &ldquo;{search}&rdquo;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{proposal.title}</h3>
                    <p className="text-sm text-gray-500 truncate mt-1">{proposal.purpose}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 shrink-0 ${getStatusColor(proposal.status)}`}>
                    {getStatusLabel(proposal.status)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {proposal.viewCount || 0} views
                  </span>
                  <span>{proposal.sections?.length || 0} sections</span>
                  <span>{formatDate(proposal.updatedAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/proposals/${proposal.id}`)}
                  >
                    Edit
                  </Button>
                  {proposal.shareId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/shared/${proposal.shareId}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={deletingId === proposal.id}
                    onClick={() => handleDelete(proposal.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}