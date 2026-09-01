'use client';

import { ReactNode } from 'react';
import { TemplateStyles } from '@/types';
import { Sparkles } from 'lucide-react';

// ============================================
// COVER LAYOUT VARIANTS
// ============================================

interface CoverProps {
  title: string;
  subtitle: string;
  date?: string;
  styles: TemplateStyles;
}

export function CoverStandard({ title, subtitle, date, styles }: CoverProps) {
  return (
    <div className="text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-xl" style={{ backgroundColor: styles.colors.primary }}>
      {styles.accentStyle === 'glow' && (
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15" style={{ backgroundColor: styles.colors.accent }} />
      )}
      {styles.accentStyle === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent pointer-events-none" style={{ backgroundImage: `linear-gradient(135deg, transparent 40%, ${styles.colors.accent}25 100%)` }} />
      )}
      {styles.accentStyle === 'dots' && (
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `radial-gradient(${styles.colors.accent} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
      )}
      {styles.accentStyle === 'stripe' && (
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${styles.colors.accent}20 10px, ${styles.colors.accent}20 20px)` }} />
      )}
      {styles.accentStyle === 'lines' && (
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 30px, ${styles.colors.accent}30 30px, ${styles.colors.accent}30 31px)` }} />
      )}
      <div className="relative z-10 max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-white/10" style={{ backgroundColor: `${styles.colors.accent}20`, color: styles.colors.accent, fontFamily: styles.fonts.heading }}>
          <Sparkles className="h-3 w-3" /> Client Proposal
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ fontFamily: styles.fonts.heading }}>
          {title}
        </h1>
        <p className="text-base sm:text-lg font-semibold" style={{ color: styles.colors.accent, fontFamily: styles.fonts.body }}>
          {subtitle}
        </p>
        {date && (
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-400 border-t border-white/10" style={{ fontFamily: styles.fonts.body }}>
            <span>Date: {date}</span>
            <span>Valid For: 30 Days</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CoverSplit({ title, subtitle, date, styles }: CoverProps) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-xl flex min-h-[320px]" style={{ fontFamily: styles.fonts.heading }}>
      <div className="w-2/5 p-8 sm:p-10 flex flex-col justify-center relative" style={{ backgroundColor: styles.colors.primary }}>
        {styles.accentStyle === 'gradient' && (
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(135deg, ${styles.colors.accent}15, transparent)` }} />
        )}
        {styles.accentStyle === 'stripe' && (
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, ${styles.colors.accent}30 8px, ${styles.colors.accent}30 16px)` }} />
        )}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-white/10" style={{ backgroundColor: `${styles.colors.accent}20`, color: styles.colors.accent }}>
            <Sparkles className="h-3 w-3" /> Client Proposal
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {title}
          </h1>
        </div>
      </div>
      <div className="w-3/5 p-8 sm:p-10 flex flex-col justify-center relative" style={{ backgroundColor: styles.colors.secondary }}>
        {styles.accentStyle === 'dots' && (
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(${styles.colors.accent} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
        )}
        <div className="relative z-10 space-y-4">
          <p className="text-lg sm:text-xl font-semibold" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>
            {subtitle}
          </p>
          {date && (
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs border-t" style={{ color: `${styles.colors.text}80`, borderColor: `${styles.colors.text}15` }}>
              <span>Date: {date}</span>
              <span>Valid For: 30 Days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CoverCentered({ title, subtitle, date, styles }: CoverProps) {
  return (
    <div className="rounded-3xl p-10 sm:p-16 relative overflow-hidden shadow-xl text-center" style={{ backgroundColor: styles.colors.primary }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(180deg, transparent 60%, ${styles.colors.accent}15 100%)` }} />
      {styles.accentStyle === 'stripe' && (
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${styles.colors.accent}20 10px, ${styles.colors.accent}20 20px)` }} />
      )}
      {styles.accentStyle === 'dots' && (
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `radial-gradient(${styles.colors.accent} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
      )}
      <div className="relative z-10 max-w-2xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border border-white/10" style={{ backgroundColor: `${styles.colors.accent}20`, color: styles.colors.accent, fontFamily: styles.fonts.heading }}>
          <Sparkles className="h-3 w-3" /> Client Proposal
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ fontFamily: styles.fonts.heading }}>
          {title}
        </h1>
        <p className="text-base sm:text-lg font-semibold" style={{ color: styles.colors.accent, fontFamily: styles.fonts.body }}>
          {subtitle}
        </p>
        {date && (
          <div className="pt-4 flex justify-center items-center gap-6 text-xs text-neutral-400 border-t border-white/10" style={{ fontFamily: styles.fonts.body }}>
            <span>Date: {date}</span>
            <span>Valid For: 30 Days</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CoverFullBleed({ title, subtitle, date, styles }: CoverProps) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-xl relative min-h-[350px] flex items-end" style={{ backgroundColor: styles.colors.primary }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(180deg, ${styles.colors.primary} 0%, ${styles.colors.accent}40 100%)` }} />
      {styles.accentStyle === 'stripe' && (
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 12px, white 12px, white 24px)` }} />
      )}
      {styles.accentStyle === 'glow' && (
        <>
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: styles.colors.accent }} />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-15" style={{ backgroundColor: styles.colors.accent }} />
        </>
      )}
      <div className="relative z-10 w-full p-8 sm:p-12 bg-gradient-to-t from-black/60 to-transparent">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-sm" style={{ fontFamily: styles.fonts.heading }}>
            <Sparkles className="h-3 w-3" /> Client Proposal
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ fontFamily: styles.fonts.heading }}>
            {title}
          </h1>
          <p className="text-base sm:text-lg font-semibold" style={{ color: styles.colors.accent, fontFamily: styles.fonts.body }}>
            {subtitle}
          </p>
          {date && (
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-white/60" style={{ fontFamily: styles.fonts.body }}>
              <span>Date: {date}</span>
              <span>Valid For: 30 Days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CoverSidebar({ title, subtitle, date, styles }: CoverProps) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-xl flex min-h-[300px]" style={{ fontFamily: styles.fonts.heading }}>
      <div className="w-1/4 p-6 flex flex-col items-center justify-center text-center relative" style={{ backgroundColor: styles.colors.accent }}>
        {styles.accentStyle === 'lines' && (
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 8px, white 8px, white 9px)` }} />
        )}
        <div className="relative z-10">
          <Sparkles className="h-8 w-8 text-white mb-3 mx-auto" />
          <div className="text-xs font-bold text-white/80 uppercase tracking-widest leading-relaxed">
            Client<br />Proposal
          </div>
        </div>
      </div>
      <div className="w-3/4 p-8 sm:p-10 flex flex-col justify-center relative" style={{ backgroundColor: styles.colors.background }}>
        {styles.accentStyle === 'dots' && (
          <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: `radial-gradient(${styles.colors.primary} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
        )}
        <div className="relative z-10 space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: styles.colors.text }}>
            {title}
          </h1>
          <p className="text-base sm:text-lg font-semibold" style={{ color: styles.colors.accent }}>
            {subtitle}
          </p>
          {date && (
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs border-t" style={{ color: `${styles.colors.text}60`, borderColor: `${styles.colors.text}15` }}>
              <span>Date: {date}</span>
              <span>Valid For: 30 Days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CoverDiagonal({ title, subtitle, date, styles }: CoverProps) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-xl relative min-h-[320px]" style={{ backgroundColor: styles.colors.background }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${styles.colors.primary} 0%, ${styles.colors.primary} 50%, ${styles.colors.accent} 50%, ${styles.colors.accent} 100%)`, clipPath: 'polygon(0 0, 60% 0, 40% 100%, 0 100%)' }} />
      {styles.accentStyle === 'stripe' && (
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)` }} />
      )}
      <div className="relative z-10 p-8 sm:p-12 flex items-center min-h-[320px]">
        <div className="max-w-xl space-y-4 ml-auto pl-8" style={{ width: '55%' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${styles.colors.accent}20`, color: styles.colors.accent, fontFamily: styles.fonts.heading }}>
            <Sparkles className="h-3 w-3" /> Client Proposal
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>
            {title}
          </h1>
          <p className="text-base sm:text-lg font-semibold" style={{ color: styles.colors.accent, fontFamily: styles.fonts.body }}>
            {subtitle}
          </p>
          {date && (
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs" style={{ color: `${styles.colors.text}60`, fontFamily: styles.fonts.body }}>
              <span>Date: {date}</span>
              <span>Valid For: 30 Days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION CARD WRAPPER
// ============================================

interface SectionCardProps {
  styles: TemplateStyles;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ styles, children, className = '' }: SectionCardProps) {
  const borderClass = styles.borderStyle === 'sharp' ? 'rounded-none' : styles.borderStyle === 'pill' ? 'rounded-2xl' : 'rounded-3xl';

  switch (styles.sectionStyle) {
    case 'minimal':
      return <div className={`py-6 ${className}`}>{children}</div>;
    case 'bordered':
      return (
        <div className={`${borderClass} border-l-4 p-6 sm:p-8 space-y-4 bg-transparent`} style={{ borderLeftColor: styles.colors.accent, borderLeftWidth: '4px' }}>
          {children}
        </div>
      );
    case 'filled':
      return (
        <div className={`${borderClass} p-6 sm:p-8 space-y-4`} style={{ backgroundColor: styles.colors.secondary }}>
          {children}
        </div>
      );
    case 'striped':
      return (
        <div className={`${borderClass} overflow-hidden`}>
          {children}
        </div>
      );
    case 'cards':
    default:
      return (
        <div className={`${borderClass} border p-6 sm:p-8 space-y-4 shadow-xs bg-white`} style={{ borderColor: `${styles.colors.text}15` }}>
          {children}
        </div>
      );
  }
}

// ============================================
// SECTION TITLE WRAPPER
// ============================================

interface SectionTitleProps {
  title: string;
  styles: TemplateStyles;
  icon?: ReactNode;
}

export function SectionTitle({ title, styles, icon }: SectionTitleProps) {
  const borderClass = styles.borderStyle === 'sharp' ? 'rounded-none' : styles.borderStyle === 'pill' ? 'rounded-full' : 'rounded-lg';

  if (styles.sectionStyle === 'minimal') {
    return (
      <div className="pb-3" style={{ borderBottom: `2px solid ${styles.colors.accent}` }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: styles.fonts.heading, color: styles.colors.text }}>
          {icon}
          {title}
        </h2>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 pb-3" style={{ borderBottom: styles.sectionStyle === 'striped' ? 'none' : `1px solid ${styles.colors.text}10` }}>
      {icon && (
        <div className={`h-7 w-7 ${borderClass} text-white flex items-center justify-center shrink-0`} style={{ backgroundColor: styles.colors.primary }}>
          {icon}
        </div>
      )}
      <h2 className="text-xl font-bold" style={{ fontFamily: styles.fonts.heading, color: styles.colors.text }}>
        {title}
      </h2>
    </div>
  );
}
