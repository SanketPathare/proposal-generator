'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ALL_TEMPLATES, TemplateDefinition, GOOGLE_FONTS } from '@/lib/templates';
import { TemplateStyles } from '@/types';
import {
  CoverStandard,
  CoverSplit,
  CoverCentered,
  CoverFullBleed,
  CoverSidebar,
  CoverDiagonal,
  SectionCard,
  SectionTitle,
} from '@/lib/layout-variants';
import { Search, ArrowRight, X, Sparkles, DollarSign, Calendar } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Designs' },
  { value: 'web-development', label: 'Web Dev' },
  { value: 'ui-ux-design', label: 'UI/UX' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'photography', label: 'Photography' },
  { value: 'writing', label: 'Writing' },
  { value: 'events', label: 'Events' },
  { value: 'real-estate', label: 'Architecture' },
  { value: 'ai-saas', label: 'AI/Tech' },
  { value: 'health', label: 'Health' },
  { value: 'legal', label: 'Legal' },
  { value: 'education', label: 'Education' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'food', label: 'Food' },
  { value: 'crypto', label: 'Web3' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'nonprofit', label: 'Non-Profit' },
];

function MiniCover({ template }: { template: TemplateDefinition }) {
  const s = template.styles;
  const title = template.sections.find((sec) => sec.type === 'cover')?.content?.title || template.title;
  const subtitle = template.sections.find((sec) => sec.type === 'cover')?.content?.subtitle || template.description;

  const borderClass = s.borderStyle === 'sharp' ? 'rounded-none' : s.borderStyle === 'pill' ? 'rounded-xl' : 'rounded-2xl';

  return (
    <div className={`${borderClass} overflow-hidden relative`} style={{ height: '200px', fontFamily: s.fonts.heading }}>
      <div className="absolute inset-0" style={{ backgroundColor: s.colors.primary }}>
        {s.accentStyle === 'glow' && <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: s.colors.accent }} />}
        {s.accentStyle === 'gradient' && <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(135deg, transparent 50%, ${s.colors.accent}30 100%)` }} />}
        {s.accentStyle === 'stripe' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 6px, ${s.colors.accent}20 6px, ${s.colors.accent}20 12px)` }} />}
        {s.accentStyle === 'dots' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${s.colors.accent} 1px, transparent 1px)`, backgroundSize: '12px 12px' }} />}
        {s.accentStyle === 'lines' && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 18px, ${s.colors.accent}25 18px, ${s.colors.accent}25 19px)` }} />}
      </div>

      {s.coverLayout === 'split' && (
        <div className="absolute inset-0 flex">
          <div className="w-2/5" style={{ backgroundColor: s.colors.primary }} />
          <div className="w-3/5" style={{ backgroundColor: s.colors.secondary }} />
        </div>
      )}
      {s.coverLayout === 'sidebar' && (
        <div className="absolute inset-0 flex">
          <div className="w-1/4" style={{ backgroundColor: s.colors.accent }} />
          <div className="w-3/4" style={{ backgroundColor: s.colors.background }} />
        </div>
      )}
      {s.coverLayout === 'diagonal' && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${s.colors.primary} 0%, ${s.colors.primary} 50%, ${s.colors.accent} 50%, ${s.colors.accent} 100%)`, clipPath: 'polygon(0 0, 60% 0, 40% 100%, 0 100%)' }} />
      )}
      {s.coverLayout === 'centered' && (
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(180deg, transparent 60%, ${s.colors.accent}20 100%)` }} />
      )}
      {s.coverLayout === 'full-bleed' && (
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(180deg, ${s.colors.primary} 0%, ${s.colors.accent}50 100%)` }} />
      )}

      <div className="relative z-10 h-full flex flex-col justify-end p-5" style={{ color: s.coverLayout === 'sidebar' || s.coverLayout === 'diagonal' ? s.colors.text : 'white' }}>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold w-fit mb-2" style={{ backgroundColor: `${s.colors.accent}20`, color: s.coverLayout === 'sidebar' || s.coverLayout === 'diagonal' ? s.colors.accent : s.colors.accent }}>
          <Sparkles className="h-2.5 w-2.5" /> {template.tag}
        </div>
        <h3 className="text-sm font-extrabold leading-tight" style={{ fontFamily: s.fonts.heading, color: s.coverLayout === 'sidebar' || s.coverLayout === 'diagonal' ? s.colors.text : 'white' }}>
          {title.length > 40 ? title.substring(0, 40) + '...' : title}
        </h3>
        <p className="text-[10px] mt-1 line-clamp-1" style={{ color: s.coverLayout === 'sidebar' || s.coverLayout === 'diagonal' ? `${s.colors.text}70` : `${s.colors.accent}cc`, fontFamily: s.fonts.body }}>
          {subtitle.length > 50 ? subtitle.substring(0, 50) + '...' : subtitle}
        </p>
      </div>
    </div>
  );
}

function TemplatePreviewModal({ template, onClose, onUse, loading }: { template: TemplateDefinition; onClose: () => void; onUse: () => void; loading: boolean }) {
  const s = template.styles;
  const coverSection = template.sections.find((sec) => sec.type === 'cover');
  const pricingSection = template.sections.find((sec) => sec.type === 'pricing');
  const sampleSections = template.sections.filter((sec) => sec.type !== 'cover' && sec.type !== 'pricing').slice(0, 2);

  const title = coverSection?.content?.title || template.title;
  const subtitle = coverSection?.content?.subtitle || template.description;

  useEffect(() => {
    const fonts = new Set([s.fonts.heading, s.fonts.body]);
    fonts.forEach((fontName) => {
      const existing = document.querySelector(`link[data-font="${fontName}"]`);
      if (existing) return;
      const font = GOOGLE_FONTS.find((f) => f.name === fontName);
      if (!font) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.import}&display=swap`;
      link.setAttribute('data-font', fontName);
      document.head.appendChild(link);
    });
  }, [s.fonts.heading, s.fonts.body]);

  const renderCover = () => {
    const props = { title, subtitle, date: 'Jan 1, 2026', styles: s };
    switch (s.coverLayout) {
      case 'split': return <CoverSplit {...props} />;
      case 'centered': return <CoverCentered {...props} />;
      case 'full-bleed': return <CoverFullBleed {...props} />;
      case 'sidebar': return <CoverSidebar {...props} />;
      case 'diagonal': return <CoverDiagonal {...props} />;
      default: return <CoverStandard {...props} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-[#e4e4e7] px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
          <div>
            <h3 className="text-base font-bold text-[#09090b]" style={{ fontFamily: s.fonts.heading }}>{template.title}</h3>
            <p className="text-xs text-[#71717a]">{template.tag} · {template.sections.length} sections · {s.fonts.heading} + {s.fonts.body}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#f4f4f5] transition-colors cursor-pointer">
            <X className="h-4 w-4 text-[#71717a]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {renderCover()}

          {sampleSections.map((section) => (
            <SectionCard key={section.id} styles={s}>
              <SectionTitle title={section.title} styles={s} />
              <div className="text-sm leading-relaxed" style={{ color: s.colors.text, fontFamily: s.fonts.body }}>
                {typeof section.content === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                ) : null}
              </div>
            </SectionCard>
          ))}

          {pricingSection && (
            <SectionCard styles={s}>
              <SectionTitle title={pricingSection.title} styles={s} icon={<DollarSign className="h-4 w-4" />} />
              <div className="text-xs" style={{ color: `${s.colors.text}70` }}>
                Sample pricing table with {Array.isArray(pricingSection.content?.rows) ? pricingSection.content.rows.length : 0} line items
              </div>
            </SectionCard>
          )}

          <div className="flex items-center gap-3 pt-4">
            <div className="flex gap-1.5">
              <div className="w-6 h-6 rounded-full border border-[#e4e4e7]" style={{ backgroundColor: s.colors.primary }} />
              <div className="w-6 h-6 rounded-full border border-[#e4e4e7]" style={{ backgroundColor: s.colors.accent }} />
              <div className="w-6 h-6 rounded-full border border-[#e4e4e7]" style={{ backgroundColor: s.colors.secondary }} />
            </div>
            <span className="text-[10px] text-[#a1a1aa]">{s.coverLayout} cover · {s.sectionStyle} sections · {s.accentStyle} accent</span>
          </div>

          <Button variant="accent" size="lg" className="w-full font-bold" loading={loading} onClick={onUse}>
            Use This Template <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ExploreTemplatesPage() {
  const { user, settings } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [usingIndex, setUsingIndex] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);

  const filteredTemplates = ALL_TEMPLATES.filter((t) => {
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch = !search.trim() || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleUseTemplate = async (template: TemplateDefinition, index?: number) => {
    if (!user) { router.push('/login'); return; }
    if (index !== undefined) setUsingIndex(index);
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
        shareId: null, sharedAt: null, expiresAt: null, passwordHash: null, lastViewedAt: null, acceptedAt: null, rejectedAt: null, clientSignName: null, clientEmail: null,
      });
      router.push(`/proposals/${newProposal.id}`);
    } catch (err) {
      console.error('Use template error:', err);
    } finally {
      setUsingIndex(null);
      setPreviewTemplate(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090b] tracking-tight">Explore Designs</h1>
          <p className="text-sm text-[#71717a] mt-1">
            {ALL_TEMPLATES.length} unique proposal designs — each with its own layout, colors, and visual identity.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isSelected ? 'bg-[#09090b] text-white shadow-sm' : 'bg-[#f4f4f5] text-[#71717a] hover:bg-[#e4e4e7] hover:text-[#09090b]'}`}>
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
          <input type="text" placeholder="Search designs..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-full border border-[#e4e4e7] bg-white focus:outline-none focus:ring-2 focus:ring-[#09090b]/10 focus:border-[#09090b] transition-all" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, idx) => (
          <Card key={template.id} hoverEffect className="flex flex-col justify-between overflow-hidden group cursor-pointer" onClick={() => setPreviewTemplate(template)}>
            <MiniCover template={template} />
            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[#09090b] leading-tight" style={{ fontFamily: template.styles.fonts.heading }}>{template.title}</h3>
                <p className="text-[11px] text-[#71717a] mt-1 line-clamp-2">{template.description}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full border border-[#e4e4e7]" style={{ backgroundColor: template.styles.colors.primary }} />
                <div className="w-4 h-4 rounded-full border border-[#e4e4e7]" style={{ backgroundColor: template.styles.colors.accent }} />
                <div className="w-4 h-4 rounded-full border border-[#e4e4e7]" style={{ backgroundColor: template.styles.colors.secondary }} />
                <span className="text-[9px] text-[#a1a1aa] ml-1">{template.styles.fonts.heading}</span>
                <span className="text-[9px] text-[#a1a1aa]">·</span>
                <span className="text-[9px] text-[#a1a1aa]">{template.styles.coverLayout}</span>
                <span className="text-[9px] text-[#a1a1aa]">·</span>
                <span className="text-[9px] text-[#a1a1aa]">{template.sections.length} sec</span>
              </div>
              <div className="pt-3 border-t border-[#f4f4f5]">
                <Button variant="primary" size="sm" className="w-full font-bold text-xs gap-1.5"
                  loading={usingIndex === idx}
                  onClick={(e) => { e.stopPropagation(); handleUseTemplate(template, idx); }}>
                  <span>Use This Design</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#e4e4e7]">
          <p className="text-sm font-medium text-[#71717a]">No designs found for &ldquo;{search}&rdquo;</p>
          <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => { setSearch(''); setSelectedCategory('all'); }}>Reset Filters</Button>
        </div>
      )}

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => handleUseTemplate(previewTemplate)}
          loading={usingIndex !== null}
        />
      )}
    </div>
  );
}
