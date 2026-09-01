'use client';

import { useState, useEffect } from 'react';
import { TemplateStyles } from '@/types';
import { GOOGLE_FONTS } from '@/lib/templates';
import { X, Palette, Type, Image, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface StylePanelProps {
  styles: TemplateStyles;
  onChange: (styles: TemplateStyles) => void;
}

const COLOR_FIELDS: { key: keyof TemplateStyles['colors']; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'accent', label: 'Accent' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
];

const FONT_OPTIONS = GOOGLE_FONTS.map((f) => f.name);

export function StylePanel({ styles, onChange }: StylePanelProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen((prev) => !prev);
    window.addEventListener('toggle-style-panel', handler);
    return () => window.removeEventListener('toggle-style-panel', handler);
  }, []);

  // Inject Google Fonts for selected fonts
  useEffect(() => {
    const fonts = new Set([styles.fonts.heading, styles.fonts.body]);
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
  }, [styles.fonts.heading, styles.fonts.body]);

  const updateColor = (key: keyof TemplateStyles['colors'], value: string) => {
    onChange({ ...styles, colors: { ...styles.colors, [key]: value } });
  };

  const updateFont = (key: keyof TemplateStyles['fonts'], value: string) => {
    onChange({ ...styles, fonts: { ...styles.fonts, [key]: value } });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex print:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" onClick={() => setOpen(false)} />

      {/* Panel */}
      <div className="relative ml-auto w-80 bg-white border-l border-[#e4e4e7] shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e4e4e7] px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#09090b]" />
            <h3 className="text-sm font-bold text-[#09090b]">Customize Design</h3>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-[#f4f4f5] transition-colors cursor-pointer">
            <X className="h-4 w-4 text-[#71717a]" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Colors */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] mb-3 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" /> Colors
            </h4>
            <div className="space-y-3">
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-[#52525b] w-20">{label}</label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={styles.colors[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[#e4e4e7] cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={styles.colors[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="flex-1 h-8 px-2 text-xs font-mono border border-[#e4e4e7] rounded-lg outline-none focus:border-[#09090b]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Fonts */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] mb-3 flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5" /> Fonts
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#52525b] mb-1 block">Heading Font</label>
                <select
                  value={styles.fonts.heading}
                  onChange={(e) => updateFont('heading', e.target.value)}
                  className="w-full h-9 px-3 text-xs font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b] bg-white"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#52525b] mb-1 block">Body Font</label>
                <select
                  value={styles.fonts.body}
                  onChange={(e) => updateFont('body', e.target.value)}
                  className="w-full h-9 px-3 text-xs font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b] bg-white"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              {/* Font Preview */}
              <div className="p-3 rounded-xl bg-[#f4f4f5] border border-[#e4e4e7]">
                <p className="text-lg font-bold mb-1" style={{ fontFamily: styles.fonts.heading }}>Heading Preview</p>
                <p className="text-xs text-[#52525b]" style={{ fontFamily: styles.fonts.body }}>Body text preview — the quick brown fox jumps over the lazy dog.</p>
              </div>
            </div>
          </section>

          {/* Logo Position */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] mb-3 flex items-center gap-1.5">
              <Image className="h-3.5 w-3.5" /> Logo Position
            </h4>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as const).map((pos) => {
                const Icon = pos === 'left' ? AlignLeft : pos === 'center' ? AlignCenter : AlignRight;
                const isActive = styles.logoPosition === pos;
                return (
                  <button
                    key={pos}
                    onClick={() => onChange({ ...styles, logoPosition: pos })}
                    className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      isActive ? 'border-[#09090b] bg-[#f4f4f5]' : 'border-[#e4e4e7] bg-white hover:border-[#d4d4d8]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#09090b]' : 'text-[#71717a]'}`} />
                    <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-[#09090b]' : 'text-[#71717a]'}`}>{pos}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Header / Footer */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] mb-3">Header & Footer</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#52525b] mb-1 block">Header Text</label>
                <input
                  type="text"
                  value={styles.header}
                  onChange={(e) => onChange({ ...styles, header: e.target.value })}
                  placeholder="Optional header text"
                  className="w-full h-9 px-3 text-xs font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#52525b] mb-1 block">Footer Text</label>
                <input
                  type="text"
                  value={styles.footer}
                  onChange={(e) => onChange({ ...styles, footer: e.target.value })}
                  placeholder="Optional footer text"
                  className="w-full h-9 px-3 text-xs font-medium border border-[#e4e4e7] rounded-xl outline-none focus:border-[#09090b]"
                />
              </div>
            </div>
          </section>

          {/* Live Preview Summary */}
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] mb-3">Preview</h4>
            <div
              className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ backgroundColor: styles.colors.primary }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-xl opacity-20" style={{ backgroundColor: styles.colors.accent }} />
              <p className="text-sm font-bold relative z-10" style={{ fontFamily: styles.fonts.heading }}>Cover Title</p>
              <p className="text-xs mt-1 relative z-10" style={{ color: styles.colors.accent, fontFamily: styles.fonts.body }}>Subtitle text here</p>
              <div className="mt-3 flex gap-2 relative z-10">
                <div className="h-2 w-16 rounded-full" style={{ backgroundColor: styles.colors.accent }} />
                <div className="h-2 w-10 rounded-full bg-white/20" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
