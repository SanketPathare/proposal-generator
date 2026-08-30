'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Client } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate } from '@/lib/utils';

const EMPTY_FORM = { name: '', company: '', email: '', phone: '', address: '', notes: '' };

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    loadClients();
  }, [user]);

  const loadClients = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await firestoreHelpers.getClients(user.uid);
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (client: Client) => {
    setForm({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.name.trim()) {
      setError('Client name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await firestoreHelpers.updateClient(user.uid, editingId, form);
        setClients((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...form, updatedAt: new Date() } : c))
        );
      } else {
        const newClient = await firestoreHelpers.createClient(user.uid, form);
        setClients((prev) => [newClient, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save client:', err);
      setError('Failed to save client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!user || !confirm('Are you sure you want to delete this client?')) return;
    setDeletingId(clientId);
    try {
      await firestoreHelpers.deleteClient(user.uid, clientId);
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch (err) {
      console.error('Failed to delete client:', err);
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
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage your client directory.</p>
        </div>
        <Button onClick={openAdd}>Add Client</Button>
      </div>

      {clients.length > 0 && (
        <Input
          placeholder="Search clients by name, company, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? 'Edit Client' : 'New Client'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                error={error && !form.name.trim() ? 'Required' : undefined}
              />
              <Input
                label="Company"
                placeholder="Acme Inc."
                value={form.company}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@acme.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 234 567 890"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <Input
                label="Address"
                placeholder="123 Main St, City, Country"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="md:col-span-2"
              />
              <Textarea
                label="Notes"
                placeholder="Any additional notes about this client..."
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="md:col-span-2"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={handleSave} loading={saving}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add your first client to get started.</p>
          <div className="mt-6">
            <Button onClick={openAdd}>Add Client</Button>
          </div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No clients match &ldquo;{search}&rdquo;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{client.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(client)}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deletingId === client.id}
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
                {client.company && (
                  <p className="text-sm text-gray-500">{client.company}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 text-sm text-gray-600">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3">Added {formatDate(client.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
