'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Proposal, Client } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { FileText, Users, Eye, CheckCircle, Plus, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
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
      setProposals(proposalsData);
      setClients(clientsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalProposals: proposals.length,
    totalViews: proposals.reduce((sum, p) => sum + (p.viewCount || 0), 0),
    acceptedProposals: proposals.filter((p) => p.status === 'accepted').length,
    totalClients: clients.length,
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s an overview of your proposals.</p>
        </div>
        <Button onClick={() => router.push('/proposals/new')}>
          <Plus className="h-4 w-4 mr-1" />
          New Proposal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProposals}</p>
                <p className="text-sm text-gray-500">Total Proposals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                <p className="text-sm text-gray-500">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedProposals}</p>
                <p className="text-sm text-gray-500">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                <p className="text-sm text-gray-500">Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/proposals/new')}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-900">New Proposal</p>
            <p className="text-sm text-gray-500">Create from scratch or template</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
        </button>

        <button
          onClick={() => router.push('/clients')}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Manage Clients</p>
            <p className="text-sm text-gray-500">View and add clients</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
        </button>

        <button
          onClick={() => router.push('/templates/explore')}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Browse Templates</p>
            <p className="text-sm text-gray-500">Explore pre-built templates</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
        </button>
      </div>

      {/* Recent Proposals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Proposals</CardTitle>
            <button
              onClick={() => router.push('/proposals')}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500">No proposals yet. Create your first one!</p>
              <Button className="mt-4" size="sm" onClick={() => router.push('/proposals/new')}>
                <Plus className="h-4 w-4 mr-1" />
                New Proposal
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Status</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Views</th>
                    <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Updated</th>
                    <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {proposals.slice(0, 5).map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{proposal.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{proposal.purpose}</p>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                          {getStatusLabel(proposal.status)}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500 hidden md:table-cell">{proposal.viewCount || 0}</td>
                      <td className="py-3 text-sm text-gray-500 hidden md:table-cell">{formatDate(proposal.updatedAt)}</td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/proposals/${proposal.id}`)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}