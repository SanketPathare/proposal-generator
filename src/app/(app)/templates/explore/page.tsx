'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Template } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Search,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Code,
  Smartphone,
  Palette,
  Briefcase,
  TrendingUp,
  PenTool,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'marketing', label: 'Marketing & SEO' },
  { value: 'branding', label: 'Brand Identity' },
  { value: 'consulting', label: 'Consulting' },
];

const PREBUILT_TEMPLATES: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: null,
    title: 'Fullstack Web App Proposal',
    description: 'Complete Next.js/React engineering proposal with technical deliverables, milestone timelines, and interactive pricing.',
    category: 'web-development',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Web App Engineering Proposal', subtitle: 'Modern Fullstack Solution' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Executive Summary', content: '<p>Our team specializes in high-performance web applications built on Next.js, TypeScript, and modern cloud infrastructure.</p>', order: 1 },
      { id: '3', type: 'scope', title: 'Scope of Engineering', content: '<ul><li>Frontend Application & UI Component Architecture</li><li>REST/GraphQL API integrations & DB Schema</li><li>Security, Performance Optimization & Automated CI/CD</li></ul>', order: 2 },
      { id: '4', type: 'pricing', title: 'Investment & Pricing', content: { rows: [{ id: '1', item: 'Web App Engineering Sprint', description: 'Next.js Frontend & API Integration', quantity: 1, unitPrice: 6500, total: 6500 }, { id: '2', item: 'QA, Testing & Launch', description: 'Cross-browser testing & cloud deployment', quantity: 1, unitPrice: 1500, total: 1500 }], subtotal: 8000, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 8000, currency: 'USD' }, order: 3 },
      { id: '5', type: 'terms', title: 'Terms & Milestones', content: '<p>Payment schedule: 50% deposit upon commencement, 50% upon final production deployment.</p>', order: 4 },
    ],
    styles: {
      fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
      colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
      logoPosition: 'left',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'UI/UX Design System & Prototype',
    description: 'User research, wireframing, high-fidelity design system in Figma, and interactive prototypes.',
    category: 'ui-ux-design',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'UI/UX Product Design Proposal', subtitle: 'User-Centered Interface Architecture' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Design Vision', content: '<p>We craft intuitive, engaging interfaces that turn complex workflows into delightful user journeys.</p>', order: 1 },
      { id: '3', type: 'deliverables', title: 'Design Deliverables', content: '<ul><li>User Persona & Information Architecture</li><li>Figma Design System & Token Library</li><li>High-Fidelity Interactive Clickable Prototype</li></ul>', order: 2 },
      { id: '4', type: 'pricing', title: 'Design Investment', content: { rows: [{ id: '1', item: 'Figma UI/UX Design System', description: 'Complete screen flows and tokens', quantity: 1, unitPrice: 4200, total: 4200 }], subtotal: 4200, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 4200, currency: 'USD' }, order: 3 },
    ],
    styles: {
      fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
      colors: { primary: '#6366f1', secondary: '#f4f4f5', accent: '#6366f1', background: '#ffffff', text: '#09090b' },
      logoPosition: 'left',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'Mobile App (iOS & Android)',
    description: 'Cross-platform mobile application architecture, state management, and app store deployment.',
    category: 'mobile-app',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Mobile App Development Proposal', subtitle: 'Cross-Platform iOS & Android' }, order: 0 },
      { id: '2', type: 'scope', title: 'App Modules', content: '<p>Native performance cross-platform app with offline caching, push notifications, and biometric auth.</p>', order: 1 },
      { id: '3', type: 'pricing', title: 'App Investment', content: { rows: [{ id: '1', item: 'React Native Mobile App', description: 'iOS and Android build', quantity: 1, unitPrice: 7500, total: 7500 }], subtotal: 7500, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 7500, currency: 'USD' }, order: 2 },
    ],
    styles: {
      fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
      colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
      logoPosition: 'left',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'Brand Identity & Visual System',
    description: 'Logo mark, typography guidelines, color palette, social kit, and brand style guide.',
    category: 'branding',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Brand Identity Strategy & System', subtitle: 'Distinctive Visual Identity' }, order: 0 },
      { id: '2', type: 'scope', title: 'Brand Deliverables', content: '<ul><li>Primary & Secondary Logo Marks</li><li>Color Palette & Typography Specs</li><li>Brand Guidelines PDF Book</li></ul>', order: 1 },
      { id: '3', type: 'pricing', title: 'Branding Fee', content: { rows: [{ id: '1', item: 'Brand Identity Package', description: 'Logos, guidelines & assets', quantity: 1, unitPrice: 3200, total: 3200 }], subtotal: 3200, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 3200, currency: 'USD' }, order: 2 },
    ],
    styles: {
      fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
      colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
      logoPosition: 'left',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'Growth Marketing & SEO Strategy',
    description: 'Search engine optimization, paid ad campaigns, content marketing, and conversion optimization.',
    category: 'marketing',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Growth Marketing Proposal', subtitle: 'Data-Driven Acquisition Campaign' }, order: 0 },
      { id: '2', type: 'scope', title: 'Campaign Strategy', content: '<p>Comprehensive organic search rankings and targeted paid acquisition roadmap.</p>', order: 1 },
      { id: '3', type: 'pricing', title: 'Monthly Retainer', content: { rows: [{ id: '1', item: 'Quarterly Growth Sprint', description: '3-month execution retainer', quantity: 1, unitPrice: 4500, total: 4500 }], subtotal: 4500, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 4500, currency: 'USD' }, order: 2 },
    ],
    styles: {
      fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
      colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
      logoPosition: 'left',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'Strategic Advisory & Consulting',
    description: 'Organizational review, digital transformation roadmap, and executive advisory sessions.',
    category: 'consulting',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Strategic Advisory Proposal', subtitle: 'Business Optimization Engagement' }, order: 0 },
      { id: '2', type: 'scope', title: 'Advisory Pillars', content: '<p>Deep diagnostic review, strategic blueprint, and leadership implementation coaching.</p>', order: 1 },
      { id: '3', type: 'pricing', title: 'Advisory Retainer', content: { rows: [{ id: '1', item: 'Strategic Advisory Engagement', description: '4-week intensive sprint', quantity: 1, unitPrice: 5000, total: 5000 }], subtotal: 5000, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 5000, currency: 'USD' }, order: 2 },
    ],
    styles: {
      fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
      colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
      logoPosition: 'left',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
];

export default function ExploreTemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [usingIndex, setUsingIndex] = useState<number | null>(null);

  const filteredTemplates = PREBUILT_TEMPLATES.filter((t) => {
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleUseTemplate = async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>, index: number) => {
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
        templateId: `template-${index}`,
        currency: 'USD',
        sections: template.sections.map((s) => ({ ...s, id: Math.random().toString(36).substring(2, 9) })),
        pricing: null,
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
            Choose from curated, high-converting proposal architectures.
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
          <Card key={idx} hoverEffect className="flex flex-col justify-between overflow-hidden group">
            {/* Top Cover preview */}
            <div className="h-32 bg-[#09090b] text-white p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#d4ff00]/10 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 text-[#d4ff00] px-2.5 py-0.5 rounded-full">
                  {template.category}
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
    </div>
  );
}
