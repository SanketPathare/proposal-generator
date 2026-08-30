import { ReactNode } from 'react';
import Link from 'next/link';
import { Sparkles, Check, Shield, Eye, DollarSign } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#fcfcfd]">
      {/* Left side — Obsidian Contra Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[48%] relative bg-[#09090b] text-white overflow-hidden p-12 flex-col justify-between border-r border-black/10">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#d4ff00]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#6366f1]/15 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[#d4ff00]">
              <Sparkles className="h-5 w-5 fill-[#d4ff00]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              ProposalGen
              <span className="h-2 w-2 rounded-full bg-[#d4ff00]" />
            </span>
          </Link>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 space-y-8 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#d4ff00] border border-white/10">
            <span>⚡ Close deals 2x faster</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Pitch like a top-tier agency. Close like a pro.
          </h2>

          <p className="text-sm text-neutral-400 leading-relaxed">
            ProposalGen gives independent creators and freelancers an unfair advantage with modern interactive proposals, smart pricing tables, and live view tracking.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { text: 'Interactive digital sign-off from any device' },
              { text: 'Gemini AI assistant for lightning-fast drafting' },
              { text: 'Live view analytics with instant notifications' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-neutral-300 font-medium">
                <div className="h-5 w-5 rounded-full bg-[#d4ff00]/15 text-[#d4ff00] flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-500 pt-6 border-t border-white/10">
          <span>© 2026 ProposalGen Inc.</span>
          <span className="text-neutral-400">Trusted by 25k+ Creators</span>
        </div>
      </div>

      {/* Right side — Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="h-9 w-9 rounded-xl bg-[#09090b] flex items-center justify-center text-[#d4ff00]">
              <Sparkles className="h-5 w-5 fill-[#d4ff00]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#09090b]">ProposalGen</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}