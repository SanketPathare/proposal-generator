'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, Client } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, getStatusBadgeStyle, getStatusLabel } from '@/lib/utils';
import {
  FileText,
  Users,
  Eye,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Layers,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, branding } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [proposalsData, clientsData] = await Promise.all([
        firestoreHelpers.getProposals(user.uid),
        firestoreHelpers.getClients(user.uid),
      ]);
      setProposals(proposalsData || []);
      setClients(clientsData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalViews = proposals.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const acceptedProposals = proposals.filter((p) => p.status === 'accepted').length;
  const winRate = proposals.length > 0 ? Math.round((acceptedProposals / proposals.length) * 100) : 0;

  const displayName = profile?.fullName || branding?.brandName || (user?.email ? user.email.split('@')[0] : 'Creator');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#e4e4e7] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f4f5] text-[11px] font-bold text-[#09090b] uppercase tracking-wider mb-2">
            <span className="h-2 w-2 rounded-full bg-[#d4ff00]" /> Studio Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-sm text-[#71717a] mt-1">
            Track pitch performance, client views, and deal statuses in real time.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="accent" size="md" className="font-bold shadow-sm" onClick={() => router.push('/proposals/new')}>
            <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
            New Proposal
          </Button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <Card hoverEffect className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Total Proposals</span>
            <div className="h-8 w-8 rounded-full bg-[#f4f4f5] flex items-center justify-center text-[#09090b]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#09090b] tracking-tight">{proposals.length}</p>
            <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Active documents</span> in workspace
            </p>
          </div>
        </Card>

        {/* Stat 2 */}
        <Card hoverEffect className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Client Views</span>
            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-700">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#09090b] tracking-tight">{totalViews}</p>
            <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
              <span className="text-indigo-600 font-semibold">Live views</span> tracked across links
            </p>
          </div>
        </Card>

        {/* Stat 3 */}
        <Card hoverEffect className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Accepted Deals</span>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#09090b] tracking-tight">{acceptedProposals}</p>
            <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">{winRate}% conversion</span> rate
            </p>
          </div>
        </Card>

        {/* Stat 4 */}
        <Card hoverEffect className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Active Clients</span>
            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#09090b] tracking-tight">{clients.length}</p>
            <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
              <span className="text-[#09090b] font-semibold">Client directory</span> total
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Launchpad Action Cards */}
      <div>
        <h2 className="text-base font-bold text-[#09090b] uppercase tracking-wider mb-3">Quick Launchpad</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/proposals/new')}
            className="flex items-center gap-4 p-5 bg-white border border-[#e4e4e7] rounded-2xl hover:border-[#09090b] hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="h-11 w-11 rounded-2xl bg-[#09090b] text-[#d4ff00] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 fill-[#d4ff00]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#09090b]">AI Proposal Generator</p>
              <p className="text-xs text-[#71717a] truncate mt-0.5">Generate customized proposal in seconds</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-[#a1a1aa] group-hover:text-[#09090b] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>

          <button
            onClick={() => router.push('/templates/explore')}
            className="flex items-center gap-4 p-5 bg-white border border-[#e4e4e7] rounded-2xl hover:border-[#09090b] hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="h-11 w-11 rounded-2xl bg-[#f4f4f5] text-[#09090b] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#09090b]">Browse Templates</p>
              <p className="text-xs text-[#71717a] truncate mt-0.5">Web Dev, UI/UX, Consulting & more</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-[#a1a1aa] group-hover:text-[#09090b] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>

          <button
            onClick={() => router.push('/clients')}
            className="flex items-center gap-4 p-5 bg-white border border-[#e4e4e7] rounded-2xl hover:border-[#09090b] hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="h-11 w-11 rounded-2xl bg-[#f4f4f5] text-[#09090b] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#09090b]">Manage Clients</p>
              <p className="text-xs text-[#71717a] truncate mt-0.5">Contacts, history, and CRM</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-[#a1a1aa] group-hover:text-[#09090b] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* Recent Proposals Section */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-[#e4e4e7] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#09090b]">Recent Proposals</h3>
            <p className="text-xs text-[#71717a] mt-0.5">Your latest proposals and their live statuses.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/proposals')}>
            View All ({proposals.length})
          </Button>
        </div>

        <div>
          {proposals.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="h-12 w-12 rounded-2xl bg-[#f4f4f5] flex items-center justify-center mx-auto text-[#71717a] mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-[#09090b]">No proposals created yet</h4>
              <p className="text-xs text-[#71717a] mt-1 max-w-sm mx-auto">
                Create your first client proposal with AI or choose a template to close your next deal.
              </p>
              <Button variant="accent" size="sm" className="mt-5 font-bold" onClick={() => router.push('/proposals/new')}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create Proposal
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#fcfcfd] border-b border-[#e4e4e7] text-[11px] font-bold uppercase tracking-wider text-[#71717a]">
                  <tr>
                    <th className="py-3.5 px-6">Proposal Details</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Status</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Views</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Last Updated</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f4f5] text-xs">
                  {proposals.slice(0, 5).map((proposal) => {
                    const badge = getStatusBadgeStyle(proposal.status);
                    return (
                      <tr key={proposal.id} className="hover:bg-[#fcfcfd] transition-colors group">
                        <td className="py-4 px-6">
                          <p className="font-bold text-sm text-[#09090b] truncate max-w-[240px] group-hover:text-[#6366f1] transition-colors">
                            {proposal.title || 'Untitled Proposal'}
                          </p>
                          <p className="text-xs text-[#71717a] truncate max-w-[240px] mt-0.5">
                            {proposal.purpose || 'No description'}
                          </p>
                        </td>
                        <td className="py-4 px-4 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                            {getStatusLabel(proposal.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-[#52525b] font-medium">
                            <Eye className="h-3.5 w-3.5 text-[#a1a1aa]" />
                            <span>{proposal.viewCount || 0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden lg:table-cell text-[#71717a]">
                          {formatDate(proposal.updatedAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {proposal.shareId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/shared/${proposal.shareId}`, '_blank')}
                                title="Open public view"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}