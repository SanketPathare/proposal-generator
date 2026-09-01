'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ALL_TEMPLATES, TemplateDefinition } from '@/lib/templates';
import {
  Search,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'branding', label: 'Branding' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'photography', label: 'Photography' },
  { value: 'writing', label: 'Writing' },
  { value: 'events', label: 'Events' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'ai-saas', label: 'AI/SaaS' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'legal', label: 'Legal/Finance' },
  { value: 'education', label: 'Education' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'food', label: 'Food & Hospitality' },
  { value: 'crypto', label: 'Crypto/Web3' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'nonprofit', label: 'Non-Profit' },
];

export default function ExploreTemplatesPage() {
  const { user, settings } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [usingIndex, setUsingIndex] = useState<number | null>(null);

  const filteredTemplates = ALL_TEMPLATES.filter((t) => {
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleUseTemplate = async (template: TemplateDefinition, index: number) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setUsingIndex(index);
    try {
      const newProposal = await firestoreHelpers.createProposal(user.uid, {
        clientId: null,
        title: template.title,
        purpose: template.description,
        status: 'draft',
        templateId: template.id,
        currency: settings?.currency || 'USD',
        sections: template.sections.map((s) => ({ ...s, id: Math.random().toString(36).substring(2, 9) })),
        pricing: null,
        styles: template.styles,
        shareId: null,
        sharedAt: null,
        expiresAt: null,
        passwordHash: null,
        lastViewedAt: null,
        acceptedAt: null,
        rejectedAt: null,
        clientSignName: null,
        clientEmail: null,
      });

      router.push(`/proposals/${newProposal.id}`);
    } catch (err) {
      console.error('Use template error:', err);
    } finally {
      setUsingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Template Gallery</h1>
          <p className="text-sm text-[#71717a] mt-1">
            {ALL_TEMPLATES.length} curated, high-converting proposal templates.
          </p>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#09090b] text-white shadow-sm'
                    : 'bg-[#f4f4f5] text-[#71717a] hover:bg-[#e4e4e7] hover:text-[#09090b]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-full border border-[#e4e4e7] bg-white focus:outline-none focus:ring-2 focus:ring-[#09090b]/10 focus:border-[#09090b] transition-all"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, idx) => (
          <Card key={template.id} hoverEffect className="flex flex-col justify-between overflow-hidden group">
            {/* Top Cover preview — uses template's own colors */}
            <div
              className="h-36 text-white p-5 flex flex-col justify-between relative overflow-hidden"
              style={{ backgroundColor: template.styles.colors.primary }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-xl pointer-events-none opacity-20"
                style={{ backgroundColor: template.styles.colors.accent }}
              />
              <div className="flex items-center justify-between relative z-10">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${template.styles.colors.accent}30`, color: template.styles.colors.accent }}
                >
                  {template.tag}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {template.sections.length} sections
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white tracking-tight leading-tight relative z-10">
                {template.title}
              </h3>
            </div>

            {/* Description & Action */}
            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-[#52525b] leading-relaxed line-clamp-3">
                {template.description}
              </p>

              {/* Color swatches preview */}
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full border border-[#e4e4e7]" style={{ backgroundColor: template.styles.colors.primary }} title={`Primary: ${template.styles.colors.primary}`} />
                <div className="w-5 h-5 rounded-full border border-[#e4e4e7]" style={{ backgroundColor: template.styles.colors.accent }} title={`Accent: ${template.styles.colors.accent}`} />
                <div className="w-5 h-5 rounded-full border border-[#e4e4e7]" style={{ backgroundColor: template.styles.colors.secondary }} title={`Secondary: ${template.styles.colors.secondary}`} />
                <span className="text-[10px] text-[#a1a1aa] ml-1">{template.styles.fonts.heading}</span>
              </div>

              <div className="pt-3 border-t border-[#f4f4f5]">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full font-bold text-xs gap-1.5"
                  loading={usingIndex === idx}
                  onClick={() => handleUseTemplate(template, idx)}
                >
                  <span>Use This Template</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#e4e4e7]">
          <p className="text-sm font-medium text-[#71717a]">No templates found for &ldquo;{search}&rdquo;</p>
          <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => { setSearch(''); setSelectedCategory('all'); }}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
