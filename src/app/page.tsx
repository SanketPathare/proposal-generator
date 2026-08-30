'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Layers,
  FileCheck,
  TrendingUp,
  ChevronRight,
  Star,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeTab, setActiveTab] = useState<'ai' | 'templates' | 'manual'>('ai');

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#09090b] selection:bg-[#d4ff00] selection:text-black">
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fcfcfd]/80 backdrop-blur-md border-b border-[#e4e4e7]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-[#09090b] flex items-center justify-center text-[#d4ff00] shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5 fill-[#d4ff00]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#09090b] flex items-center gap-1">
                ProposalGen
                <span className="h-2 w-2 rounded-full bg-[#d4ff00]" />
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1 bg-[#f4f4f5] p-1 rounded-full border border-neutral-200/80">
              <a href="#features" className="px-4 py-1.5 text-xs font-semibold text-[#52525b] hover:text-[#09090b] rounded-full hover:bg-white transition-all">
                Features
              </a>
              <a href="#how-it-works" className="px-4 py-1.5 text-xs font-semibold text-[#52525b] hover:text-[#09090b] rounded-full hover:bg-white transition-all">
                How It Works
              </a>
              <a href="#templates" className="px-4 py-1.5 text-xs font-semibold text-[#52525b] hover:text-[#09090b] rounded-full hover:bg-white transition-all">
                Templates
              </a>
              <a href="#pricing" className="px-4 py-1.5 text-xs font-semibold text-[#52525b] hover:text-[#09090b] rounded-full hover:bg-white transition-all">
                Pricing
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-[#52525b] hover:text-[#09090b] px-3 py-2 transition-colors">
                Sign In
              </Link>
              <Link href="/signup">
                <Button variant="accent" size="sm" className="font-bold">
                  Get Started Free
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 sm:pt-28">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-20 sm:pt-14 sm:pb-32 bg-grid-pattern">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#09090b] text-white text-xs font-semibold shadow-sm mb-8 border border-black/10">
                <span className="flex h-2 w-2 rounded-full bg-[#d4ff00] animate-pulse" />
                <span className="text-[#d4ff00]">⚡ The Next-Gen Proposal Platform</span>
                <span className="text-neutral-400">• Built for Independents</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#09090b] leading-[1.08]">
                Proposals designed to win.{' '}
                <span className="block mt-2 bg-gradient-to-r from-[#09090b] via-[#3f3f46] to-[#09090b] bg-clip-text text-transparent">
                  Built in minutes.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg sm:text-xl text-[#52525b] max-w-2xl mx-auto font-normal leading-relaxed">
                Create stunning, interactive proposals that impress clients. AI drafting, dynamic pricing tables, live view analytics, and instant 1-click digital sign-offs.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button variant="accent" size="lg" className="w-full sm:w-auto text-base font-bold shadow-md hover:scale-[1.02]">
                    Start Building Free — No Card Needed
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base font-medium">
                    Try Live Demo
                  </Button>
                </Link>
              </div>

              {/* Small micro points */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#71717a] font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Free Tier Available
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Instant Share Links
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Export to PDF
                </span>
              </div>
            </div>

            {/* Interactive Hero Visual Mockup */}
            <div className="mt-14 max-w-5xl mx-auto">
              <div className="rounded-3xl border border-[#e4e4e7] bg-white p-3 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden">
                {/* Mockup Topbar */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#f4f4f5] rounded-2xl mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-mono text-[#71717a]">proposalgen.studio/p/acme-brand-redesign</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Client Viewed 3m ago
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#09090b] text-white text-xs font-semibold">
                      $12,500 USD
                    </span>
                  </div>
                </div>

                {/* Mockup Canvas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left Column — Proposal Structure */}
                  <div className="space-y-3 bg-[#fcfcfd] p-4 rounded-2xl border border-[#e4e4e7]">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e4e4e7]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Proposal Outline</span>
                      <span className="text-xs font-mono text-[#09090b] font-semibold">6 Sections</span>
                    </div>
                    {[
                      { title: '1. Executive Summary', active: true },
                      { title: '2. Scope & Deliverables', active: false },
                      { title: '3. Milestone Roadmap', active: false },
                      { title: '4. Interactive Pricing', active: false },
                      { title: '5. Terms & SLA', active: false },
                      { title: '6. Digital Acceptance', active: false },
                    ].map((sec, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                          sec.active ? 'bg-[#09090b] text-white font-semibold' : 'bg-white text-[#52525b] border border-[#e4e4e7]'
                        }`}
                      >
                        <span>{sec.title}</span>
                        {sec.active && <span className="h-1.5 w-1.5 rounded-full bg-[#d4ff00]" />}
                      </div>
                    ))}
                  </div>

                  {/* Center Column — Interactive Live Preview */}
                  <div className="md:col-span-2 space-y-4 bg-white p-5 rounded-2xl border border-[#e4e4e7]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4ff00] bg-[#09090b] px-2.5 py-1 rounded-full">
                          Web Application & Brand Identity
                        </span>
                        <h3 className="text-xl font-bold text-[#09090b] mt-2">Acme Global Brand Redesign</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#71717a]">Client</span>
                        <p className="text-xs font-bold text-[#09090b]">Acme Studios Inc.</p>
                      </div>
                    </div>

                    <p className="text-xs text-[#52525b] leading-relaxed">
                      We are thrilled to present our full-cycle proposal for the complete digital brand revamp, design system, and Next.js web platform.
                    </p>

                    {/* Mini Pricing Demo */}
                    <div className="rounded-xl border border-[#e4e4e7] overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-[#f4f4f5] text-[#52525b] font-semibold">
                          <tr>
                            <th className="p-2.5 text-left">Deliverable</th>
                            <th className="p-2.5 text-center">Timeline</th>
                            <th className="p-2.5 text-right">Investment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f4f4f5]">
                          <tr>
                            <td className="p-2.5 font-medium text-[#09090b]">Brand Strategy & Design System</td>
                            <td className="p-2.5 text-center text-[#71717a]">2 Weeks</td>
                            <td className="p-2.5 text-right font-semibold text-[#09090b]">$4,500</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium text-[#09090b]">Next.js High-Performance Frontend</td>
                            <td className="p-2.5 text-center text-[#71717a]">3 Weeks</td>
                            <td className="p-2.5 text-right font-semibold text-[#09090b]">$6,500</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium text-[#09090b]">CMS Setup & SEO Handoff</td>
                            <td className="p-2.5 text-center text-[#71717a]">1 Week</td>
                            <td className="p-2.5 text-right font-semibold text-[#09090b]">$1,500</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-[#fcfcfd] border-t border-[#e4e4e7]">
                          <tr>
                            <td colSpan={2} className="p-2.5 font-bold text-[#09090b]">Total Project Investment</td>
                            <td className="p-2.5 text-right font-extrabold text-sm text-[#09090b]">$12,500</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Action pill inside mockup */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-[#71717a]">Ready to approve?</span>
                      <button className="px-4 py-2 bg-[#09090b] text-[#d4ff00] text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Sign & Accept Proposal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Ticker */}
        <section className="py-12 border-y border-[#e4e4e7] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-[#71717a] mb-6">
              Empowering Independent Creators, Freelancers & Top Agencies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-sm font-semibold text-[#71717a]">
              <span className="hover:text-[#09090b] transition-colors">⚡ Fullstack Developers</span>
              <span className="hover:text-[#09090b] transition-colors">🎨 UI/UX Designers</span>
              <span className="hover:text-[#09090b] transition-colors">🚀 Growth Marketers</span>
              <span className="hover:text-[#09090b] transition-colors">💼 Strategy Consultants</span>
              <span className="hover:text-[#09090b] transition-colors">✍️ Copywriters</span>
              <span className="hover:text-[#09090b] transition-colors">🎬 Video Directors</span>
            </div>
          </div>
        </section>

        {/* 3 Creation Modes — Interactive Showcase */}
        <section id="how-it-works" className="py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6366f1] bg-[#6366f1]/10 px-3 py-1.5 rounded-full border border-[#6366f1]/20">
              Complete Creative Freedom
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#09090b] tracking-tight mt-4">
              Three flexible ways to build proposals.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#52525b]">
              Whether you need Gemini AI to draft in 30 seconds, a pre-built industry template, or complete custom block control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mode 1: AI */}
            <div className="rounded-3xl border border-[#e4e4e7] bg-white p-8 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-[#d4d4d8] transition-all flex flex-col justify-between group">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-[#09090b] flex items-center justify-center text-[#d4ff00] mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 fill-[#d4ff00]" />
                </div>
                <h3 className="text-2xl font-bold text-[#09090b] mb-3">1. AI Generator</h3>
                <p className="text-sm text-[#52525b] leading-relaxed mb-6">
                  Input your client name, key deliverables, and target budget. Gemini AI drafts a structured, highly persuasive proposal in seconds.
                </p>
                <ul className="space-y-2.5 text-xs text-[#52525b] font-medium">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Full proposal generation</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Scope & milestone generation</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Edit & customize freely anytime</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-[#f4f4f5]">
                <Link href="/signup">
                  <Button variant="outline" size="sm" className="w-full font-semibold">Try AI Builder →</Button>
                </Link>
              </div>
            </div>

            {/* Mode 2: Templates */}
            <div className="rounded-3xl border-2 border-[#09090b] bg-[#09090b] text-white p-8 shadow-xl flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#d4ff00] text-black text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                Most Popular
              </div>
              <div>
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#d4ff00] mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">2. Pro Templates</h3>
                <p className="text-sm text-neutral-300 leading-relaxed mb-6">
                  Pick from curated, industry-tested templates for Web Dev, UI/UX, Marketing, Mobile Apps, and Consulting.
                </p>
                <ul className="space-y-2.5 text-xs text-neutral-300 font-medium">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d4ff00] shrink-0" /> 10+ professional pre-built designs</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d4ff00] shrink-0" /> Save any proposal as personal template</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d4ff00] shrink-0" /> 1-Click clone & edit</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <Link href="/templates/explore">
                  <Button variant="accent" size="sm" className="w-full font-bold text-black">Explore Templates →</Button>
                </Link>
              </div>
            </div>

            {/* Mode 3: Manual Canvas */}
            <div className="rounded-3xl border border-[#e4e4e7] bg-white p-8 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-[#d4d4d8] transition-all flex flex-col justify-between group">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-[#f4f4f5] flex items-center justify-center text-[#09090b] mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#09090b] mb-3">3. Custom Canvas</h3>
                <p className="text-sm text-[#52525b] leading-relaxed mb-6">
                  Build from scratch with rich text editing, drag-and-drop sections, pricing calculation tables, and custom brand logos.
                </p>
                <ul className="space-y-2.5 text-xs text-[#52525b] font-medium">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Rich TipTap formatting & media</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Drag-and-drop section manager</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Real-time autosave</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-[#f4f4f5]">
                <Link href="/signup">
                  <Button variant="outline" size="sm" className="w-full font-semibold">Start Blank →</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid — Key Features */}
        <section id="features" className="py-20 bg-[#f4f4f5] border-y border-[#e4e4e7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#09090b] bg-white px-3 py-1.5 rounded-full border border-[#e4e4e7]">
                Features Built to Convert
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09090b] tracking-tight mt-4">
                Everything you need to close deals fast.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="rounded-3xl border border-[#e4e4e7] bg-white p-7 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#09090b] mb-2">Interactive Pricing & Currencies</h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  Automatic subtotal, discounts (percentage or fixed), and taxes calculation across USD, EUR, GBP, INR, and more.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-[#e4e4e7] bg-white p-7 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#09090b] mb-2">Live View Analytics</h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  Know exactly when your client opens your proposal link, how many times they review it, and when they make a decision.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-[#e4e4e7] bg-white p-7 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#09090b] mb-2">1-Click Client Sign-Off</h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  Clients can accept or reject directly from the shared public link with timestamped confirmation.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-3xl border border-[#e4e4e7] bg-white p-7 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#09090b] mb-2">Personal Branding</h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  Upload your logo, define custom brand colors and contact info to make every proposal strictly professional.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-3xl border border-[#e4e4e7] bg-white p-7 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#09090b] mb-2">Project Timelines & Milestones</h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  Display clear deliverable phases and milestones so clients know exactly what to expect and when.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-3xl border border-[#e4e4e7] bg-white p-7 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#09090b] mb-2">Private & Secure</h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  Isolated user workspace — your client directory, pricing strategies, and proposals are completely private.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section id="pricing" className="py-20 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#09090b] bg-[#f4f4f5] px-3 py-1.5 rounded-full border border-[#e4e4e7]">
              Simple & Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#09090b] tracking-tight mt-4">
              Start free, upgrade as you scale.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#52525b]">
              No hidden fees. Cancel anytime.
            </p>

            {/* Toggle */}
            <div className="mt-8 inline-flex items-center bg-[#f4f4f5] p-1 rounded-full border border-[#e4e4e7]">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-white text-[#09090b] shadow-sm' : 'text-[#71717a]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                  billingCycle === 'annual' ? 'bg-[#09090b] text-[#d4ff00] shadow-sm' : 'text-[#71717a]'
                }`}
              >
                Annual <span className="text-[10px] bg-[#d4ff00] text-black px-1.5 py-0.2 rounded-full font-extrabold">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="rounded-3xl border border-[#e4e4e7] bg-white p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Starter</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#09090b]">$0</span>
                  <span className="text-xs text-[#71717a]">/forever</span>
                </div>
                <p className="text-xs text-[#71717a] mt-2">Perfect for freelancers just starting out.</p>

                <ul className="mt-8 space-y-3 text-xs text-[#52525b] font-medium">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Up to 5 Active Proposals</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Standard Template Library</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Public Share Links</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Basic View Tracking</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-[#f4f4f5]">
                <Link href="/signup">
                  <Button variant="outline" size="md" className="w-full font-bold">Get Started Free</Button>
                </Link>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="rounded-3xl border-2 border-[#09090b] bg-[#09090b] text-white p-8 flex flex-col justify-between relative shadow-xl">
              <div className="absolute top-4 right-4 bg-[#d4ff00] text-black text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d4ff00]">Professional</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {billingCycle === 'annual' ? '$15' : '$19'}
                  </span>
                  <span className="text-xs text-neutral-400">/month</span>
                </div>
                <p className="text-xs text-neutral-400 mt-2">For busy freelancers & solo consultants.</p>

                <ul className="mt-8 space-y-3 text-xs text-neutral-300 font-medium">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d4ff00] shrink-0" /> Unlimited Proposals</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d4ff00] shrink-0" /> Gemini AI Proposal Generation</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d4ff00] shrink-0" /> Custom Branding & Logo</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d4ff00] shrink-0" /> Reusable Content Block Library</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d4ff00] shrink-0" /> Client CRM & History</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <Link href="/signup">
                  <Button variant="accent" size="md" className="w-full font-bold text-black">Start 14-Day Pro Trial</Button>
                </Link>
              </div>
            </div>

            {/* Studio / Agency Tier */}
            <div className="rounded-3xl border border-[#e4e4e7] bg-white p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Studio / Agency</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#09090b]">
                    {billingCycle === 'annual' ? '$39' : '$49'}
                  </span>
                  <span className="text-xs text-[#71717a]">/month</span>
                </div>
                <p className="text-xs text-[#71717a] mt-2">For growing creative agencies & boutique studios.</p>

                <ul className="mt-8 space-y-3 text-xs text-[#52525b] font-medium">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Custom Domain Support</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Priority 24/7 Support</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /> Unlimited Template Exports</li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-[#f4f4f5]">
                <Link href="/signup">
                  <Button variant="outline" size="md" className="w-full font-bold">Choose Studio Plan</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#09090b] text-white p-10 sm:p-16 text-center relative overflow-hidden border border-black/10 shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#d4ff00]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#6366f1]/15 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4ff00]">Take Your Pitch to the Next Level</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-3">
                Ready to send proposals that actually win deals?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
                Join thousands of creators who pitch with confidence, win higher rates, and get paid faster.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/signup">
                  <Button variant="accent" size="lg" className="font-bold text-black shadow-md hover:scale-105">
                    Create Your First Proposal Now →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e4e4e7] bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#09090b] flex items-center justify-center text-[#d4ff00]">
                  <Sparkles className="h-4 w-4 fill-[#d4ff00]" />
                </div>
                <span className="text-lg font-bold text-[#09090b]">ProposalGen</span>
              </Link>
              <p className="text-xs text-[#71717a] leading-relaxed">
                The modern proposal generator and client deal closing platform for independent professionals.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold pt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                All Systems Operational
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#09090b] mb-4">Product</h4>
              <ul className="space-y-2 text-xs text-[#71717a]">
                <li><a href="#features" className="hover:text-[#09090b] transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-[#09090b] transition-colors">Template Gallery</a></li>
                <li><a href="#pricing" className="hover:text-[#09090b] transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-[#09090b] transition-colors">Live Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#09090b] mb-4">Resources</h4>
              <ul className="space-y-2 text-xs text-[#71717a]">
                <li><a href="#" className="hover:text-[#09090b] transition-colors">Freelance Pricing Guide</a></li>
                <li><a href="#" className="hover:text-[#09090b] transition-colors">Proposal Writing Checklist</a></li>
                <li><a href="#" className="hover:text-[#09090b] transition-colors">Client Contract Templates</a></li>
                <li><a href="#" className="hover:text-[#09090b] transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#09090b] mb-4">Legal</h4>
              <ul className="space-y-2 text-xs text-[#71717a]">
                <li><a href="#" className="hover:text-[#09090b] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#09090b] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#09090b] transition-colors">Security & SLA</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#f4f4f5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#a1a1aa] gap-4">
            <span>© 2026 ProposalGen. All rights reserved. Crafted with Contra aesthetics.</span>
            <span>Made for independent creators worldwide ⚡</span>
          </div>
        </div>
      </footer>
    </div>
  );
}