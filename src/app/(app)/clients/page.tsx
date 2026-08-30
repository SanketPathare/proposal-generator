'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Client } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Edit2,
  Building,
  ExternalLink,
  Check,
} from 'lucide-react';

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
      setClients(data || []);
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
      name: client.name || '',
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || '',
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
      setError('Failed to save client.');
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
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-[#09090b] border-t-[#d4ff00] animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#71717a]">Loading Directory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Clients Directory</h1>
          <p className="text-sm text-[#71717a] mt-1">Manage client companies, contact details, and histories.</p>
        </div>
        <Button variant="accent" size="md" className="font-bold" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
          Add Client
        </Button>
      </div>

      {/* Search Bar */}
      {clients.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-full border border-[#e4e4e7] bg-white focus:outline-none focus:ring-2 focus:ring-[#09090b]/10 focus:border-[#09090b] transition-all"
          />
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={resetForm}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="shadow-2xl border-[#e4e4e7] overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#09090b] mb-1">
                  {editingId ? 'Edit Client Profile' : 'Add New Client'}
                </h3>
                <p className="text-xs text-[#71717a] mb-5">Configure client company details and contact channels.</p>

                {error && (
                  <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Person Name *"
                      placeholder="Jordan Miller"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                    <Input
                      label="Company Name"
                      placeholder="Acme Corporation"
                      value={form.company}
                      onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="jordan@acme.com"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+1 (555) 234-5678"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>

                  <Input
                    label="Physical Address / Location"
                    placeholder="742 Evergreen Terrace, San Francisco, CA"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  />

                  <Textarea
                    label="Client Notes"
                    placeholder="Key project interests, communication preferences, previous proposals..."
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-5 mt-2 border-t border-[#f4f4f5]">
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSave} loading={saving} className="font-bold">
                    {editingId ? 'Update Client' : 'Save Client'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e4e4e7] p-8">
          <div className="h-14 w-14 rounded-2xl bg-[#f4f4f5] text-[#09090b] flex items-center justify-center mx-auto mb-4">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[#09090b]">No clients added yet</h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-sm mx-auto">
            Build your CRM directory to quickly auto-populate proposal details and client scopes.
          </p>
          <Button variant="accent" size="md" className="mt-6 font-bold" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Client
          </Button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#e4e4e7] text-[#71717a]">
          <p className="text-sm font-medium">No clients matching &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <Card key={client.id} hoverEffect className="flex flex-col justify-between overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar fallback={client.name} size="md" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#09090b] truncate">{client.name}</h3>
                      {client.company && (
                        <p className="text-xs text-[#71717a] truncate font-medium flex items-center gap-1">
                          <Building className="h-3 w-3" /> {client.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(client)}
                      className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-[#09090b] hover:bg-[#f4f4f5] transition-colors cursor-pointer"
                      title="Edit client"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete client"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#f4f4f5] text-xs text-[#52525b]">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-[#a1a1aa] shrink-0" />
                      <a href={`mailto:${client.email}`} className="truncate hover:underline text-[#09090b]">
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[#a1a1aa] shrink-0" />
                      <a href={`tel:${client.phone}`} className="truncate hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#a1a1aa] shrink-0" />
                      <span className="truncate text-[#71717a]">{client.address}</span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <p className="text-[11px] text-[#71717a] bg-[#f4f4f5] p-2.5 rounded-xl line-clamp-2 italic">
                    &ldquo;{client.notes}&rdquo;
                  </p>
                )}

                <div className="text-[10px] text-[#a1a1aa] pt-1">
                  Added {formatDate(client.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
