'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Client, Proposal } from '@/types';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import { ArrowLeft, Mail, Phone, MapPin, FileText, Plus, Loader2, Save } from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (!user || !clientId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [clientData, allProposals] = await Promise.all([
          firestoreHelpers.getClient(user.uid, clientId),
          firestoreHelpers.getProposals(user.uid),
        ]);

        if (!clientData) {
          router.push('/clients');
          return;
        }

        setClient(clientData);
        setFormData({
          name: clientData.name,
          company: clientData.company,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          notes: clientData.notes,
        });

        const clientProposals = allProposals.filter((p) => p.clientId === clientId);
        setProposals(clientProposals);
      } catch (err) {
        console.error('Failed to load client:', err);
        setError('Failed to load client details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, clientId, router]);

  const handleSave = async () => {
    if (!user || !clientId) return;
    setSaving(true);
    setError('');
    try {
      await firestoreHelpers.updateClient(user.uid, clientId, formData);
      setClient((prev) => (prev ? { ...prev, ...formData } : null));
      setEditing(false);
    } catch (err) {
      console.error('Failed to save client:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => router.push('/clients')}>Back to Clients</Button>
      </div>
    );
  }

  if (!client) return null;

  const totalValue = proposals.reduce((sum, p) => sum + (p.pricing?.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          {client.company && <p className="text-gray-600">{client.company}</p>}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Edit Client</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Input
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  <Textarea
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </>
              ) : (
                <div className="space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${client.phone}`} className="text-primary hover:underline">{client.phone}</a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{client.address}</span>
                    </div>
                  )}
                  {client.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{client.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{proposals.length}</p>
                <p className="text-sm text-gray-600">Total Proposals</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proposals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Proposals</CardTitle>
            <CardDescription>All proposals for this client</CardDescription>
          </div>
          <Link href={`/proposals/new?client=${clientId}`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Proposal
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No proposals for this client yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {proposals.map((proposal) => (
                <Link
                  key={proposal.id}
                  href={`/proposals/${proposal.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{proposal.title}</p>
                    <p className="text-sm text-gray-500">{formatDate(proposal.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {proposal.pricing?.total && (
                      <span className="text-sm font-medium">{formatCurrency(proposal.pricing.total, proposal.currency)}</span>
                    )}
                    <span className={cn('px-2 py-1 text-xs font-semibold rounded-full', getStatusColor(proposal.status))}>
                      {getStatusLabel(proposal.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}