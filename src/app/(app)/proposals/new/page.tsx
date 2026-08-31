'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { generateId, CURRENCIES } from '@/lib/utils';
import {
  Sparkles,
  Layers,
  FileEdit,
  ArrowRight,
  Zap,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

const BUILTIN_TEMPLATES = [
  {
    id: 'web-dev',
    title: 'Web Development Proposal',
    description: 'Full-stack Next.js/React website proposal with deliverables, milestones, and pricing table.',
    tag: 'Engineering',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Web Development Proposal', subtitle: 'Modern High-Performance Web Solution' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Executive Summary', content: '<p>Thank you for the opportunity to partner on this web project. Our objective is to deliver a world-class, responsive, and SEO-optimized web application.</p>', order: 1 },
      { id: '3', type: 'scope', title: 'Scope of Work', content: '<p>Key development modules include:</p><ul><li>UX/UI Architecture & Design System</li><li>Next.js Frontend & API integration</li><li>Performance Optimization & Analytics</li><li>Comprehensive QA & Cloud Deployment</li></ul>', order: 2 },
      { id: '4', type: 'pricing', title: 'Investment & Pricing', content: { rows: [{ id: 'r1', item: 'Frontend & Backend Build', description: 'Next.js App with responsive views', quantity: 1, unitPrice: 4500, total: 4500 }, { id: 'r2', item: 'SEO & Analytics Setup', description: 'Technical SEO and tracking', quantity: 1, unitPrice: 800, total: 800 }], subtotal: 5300, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 5300, currency: 'USD' }, order: 3 },
      { id: '5', type: 'terms', title: 'Terms & Next Steps', content: '<p>50% initial deposit required prior to project kick-off. Final 50% payable upon deployment.</p>', order: 4 },
    ],
  },
  {
    id: 'uiux',
    title: 'UI/UX Design & Prototype',
    description: 'Design system, wireframing, high-fidelity mockups, and interactive prototype.',
    tag: 'Design',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'UI/UX Design Proposal', subtitle: 'User-Centered Product Design' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Project Overview', content: '<p>We craft intuitive, engaging digital products that delight users and drive business conversions.</p>', order: 1 },
      { id: '3', type: 'deliverables', title: 'Design Deliverables', content: '<ul><li>User Persona Research & Flow Mapping</li><li>Component Design System (Figma)</li><li>Interactive Prototype & Handoff</li></ul>', order: 2 },
      { id: '4', type: 'pricing', title: 'Project Pricing', content: { rows: [{ id: 'r1', item: 'Figma Design System & Screens', description: 'Up to 15 key views', quantity: 1, unitPrice: 3800, total: 3800 }], subtotal: 3800, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 3800, currency: 'USD' }, order: 3 },
    ],
  },
  {
    id: 'marketing',
    title: 'Growth & Digital Marketing',
    description: 'SEO, paid acquisition, conversion optimization, and monthly growth roadmap.',
    tag: 'Growth',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Growth Marketing Proposal', subtitle: 'Targeted Customer Acquisition Strategy' }, order: 0 },
      { id: '2', type: 'scope', title: 'Strategy & Channels', content: '<p>Comprehensive growth strategy covering Organic Search, Google/Meta Ads, and Content Marketing.</p>', order: 1 },
      { id: '3', type: 'pricing', title: 'Retainer & Pricing', content: { rows: [{ id: 'r1', item: 'Monthly Growth Campaign Management', description: 'Channel optimization & bi-weekly reporting', quantity: 3, unitPrice: 1500, total: 4500 }], subtotal: 4500, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 4500, currency: 'USD' }, order: 2 },
    ],
  },
  {
    id: 'consulting',
    title: 'Strategic Business Consulting',
    description: 'Business assessment, operational roadmap, and strategic recommendations.',
    tag: 'Strategy',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Strategic Advisory Engagement', subtitle: 'Business Optimization Roadmap' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Engagement Scope', content: '<p>In-depth diagnostic analysis and strategic execution roadmap tailored for scalable growth.</p>', order: 1 },
      { id: '3', type: 'pricing', title: 'Advisory Fee', content: { rows: [{ id: 'r1', item: 'Strategy & Diagnostic Sprint', description: '4-week advisory engagement', quantity: 1, unitPrice: 5000, total: 5000 }], subtotal: 5000, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 5000, currency: 'USD' }, order: 2 },
    ],
  },
];

export default function CreateProposalPage() {
  const { user, settings } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'ai' | 'template' | 'blank'>('ai');
  const [purpose, setPurpose] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('web-dev');
  const [currency, setCurrency] = useState(settings?.currency || 'USD');

  // AI Inputs
  const [projectDescription, setProjectDescription] = useState('');
  const [services, setServices] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!purpose.trim()) {
      setError('Please provide a proposal title or purpose.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let initialSections: any[] = [];

      if (mode === 'template') {
        const tmpl = BUILTIN_TEMPLATES.find((t) => t.id === selectedTemplate);
        if (tmpl) {
          initialSections = tmpl.sections.map((s) => ({
            ...s,
            id: generateId(),
            content: s.type === 'pricing' && s.content && typeof s.content === 'object' ? { ...(s.content as Record<string, unknown>), currency } : s.content,
          }));
        }
      } else if (mode === 'ai') {
        // Try calling AI route
        try {
          const aiRes = await fetch('/api/ai/generate-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              purpose: purpose.trim(),
              clientName: clientName.trim() || 'Client',
              services: services.trim() || 'Design & Development',
              budget: budget.trim() || '$5,000',
              timeline: timeline.trim() || '4 weeks',
              projectDescription: projectDescription.trim(),
            }),
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            if (aiData?.sections?.length) {
              initialSections = aiData.sections;
            }
          }
        } catch (aiErr) {
          console.warn('AI generator fallback:', aiErr);
        }

        // Fallback default sections if needed
        if (initialSections.length === 0) {
          initialSections = [
            {
              id: generateId(),
              type: 'cover',
              title: 'Cover Page',
              content: { title: purpose.trim(), subtitle: clientName.trim() ? `Prepared for ${clientName.trim()}` : 'Project Proposal' },
              order: 0,
            },
            {
              id: generateId(),
              type: 'introduction',
              title: 'Introduction',
              content: `<p>We are delighted to submit this proposal for <strong>${purpose.trim()}</strong>. ${projectDescription.trim() || 'We are dedicated to delivering top-tier outcomes that exceed expectations.'}</p>`,
              order: 1,
            },
            {
              id: generateId(),
              type: 'scope',
              title: 'Scope of Work',
              content: `<p>Key services and deliverables include:</p><ul><li>${services.trim() || 'Project Architecture & Design'}</li><li>Development & Implementation</li><li>Quality Assurance & Launch</li></ul>`,
              order: 2,
            },
            {
              id: generateId(),
              type: 'pricing',
              title: 'Pricing & Terms',
              content: { rows: [{ id: 'r1', item: purpose.trim(), description: 'Complete deliverables package', quantity: 1, unitPrice: parseFloat(budget.replace(/[^0-9.]/g, '')) || 3500, total: parseFloat(budget.replace(/[^0-9.]/g, '')) || 3500 }], subtotal: parseFloat(budget.replace(/[^0-9.]/g, '')) || 3500, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: parseFloat(budget.replace(/[^0-9.]/g, '')) || 3500, currency },
              order: 3,
            },
          ];
        }
      } else {
        // Blank mode
        initialSections = [
          {
            id: generateId(),
            type: 'cover',
            title: 'Cover Page',
            content: { title: purpose.trim(), subtitle: clientName.trim() ? `Prepared for ${clientName.trim()}` : '' },
            order: 0,
          },
          {
            id: generateId(),
            type: 'introduction',
            title: 'Introduction',
            content: '<p>Write your project introduction here...</p>',
            order: 1,
          },
        ];
      }

      const proposal = await firestoreHelpers.createProposal(user.uid, {
        clientId: null,
        title: purpose.trim(),
        purpose: clientName.trim() ? `Prepared for ${clientName.trim()}` : purpose.trim(),
        status: 'draft',
        templateId: mode === 'template' ? selectedTemplate : null,
        currency,
        sections: initialSections,
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

      router.push(`/proposals/${proposal.id}`);
    } catch (err: any) {
      console.error('Create proposal error:', err);
      setError('Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button & title */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71717a] hover:text-[#09090b] transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Proposals
        </button>
        <h1 className="text-3xl font-extrabold text-[#09090b] tracking-tight">Create New Proposal</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Select a creation method and configure your proposal details.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tab 1: AI */}
        <div
          onClick={() => setMode('ai')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            mode === 'ai'
              ? 'border-[#09090b] bg-[#09090b] text-white shadow-md'
              : 'border-[#e4e4e7] bg-white text-[#09090b] hover:border-[#d4d4d8]'
          }`}
        >
          <div>
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${
                mode === 'ai' ? 'bg-white/10 text-[#d4ff00]' : 'bg-[#09090b] text-[#d4ff00]'
              }`}
            >
              <Zap className="h-5 w-5 fill-[#d4ff00]" />
            </div>
            <h3 className="font-bold text-base">Gemini AI Builder</h3>
            <p className={`text-xs mt-1 leading-relaxed ${mode === 'ai' ? 'text-neutral-300' : 'text-[#71717a]'}`}>
              Prompt to structured proposal in seconds with smart auto-drafting.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold">
            <span className={mode === 'ai' ? 'text-[#d4ff00]' : 'text-[#09090b]'}>Fastest option</span>
            {mode === 'ai' && <CheckCircle2 className="h-4 w-4 text-[#d4ff00]" />}
          </div>
        </div>

        {/* Tab 2: Template */}
        <div
          onClick={() => setMode('template')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            mode === 'template'
              ? 'border-[#09090b] bg-[#09090b] text-white shadow-md'
              : 'border-[#e4e4e7] bg-white text-[#09090b] hover:border-[#d4d4d8]'
          }`}
        >
          <div>
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${
                mode === 'template' ? 'bg-white/10 text-[#d4ff00]' : 'bg-[#f4f4f5] text-[#09090b]'
              }`}
            >
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Curated Templates</h3>
            <p className={`text-xs mt-1 leading-relaxed ${mode === 'template' ? 'text-neutral-300' : 'text-[#71717a]'}`}>
              Start with pre-formatted sections designed for your specific industry.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold">
            <span className={mode === 'template' ? 'text-[#d4ff00]' : 'text-[#09090b]'}>8+ Pro layouts</span>
            {mode === 'template' && <CheckCircle2 className="h-4 w-4 text-[#d4ff00]" />}
          </div>
        </div>

        {/* Tab 3: Blank */}
        <div
          onClick={() => setMode('blank')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            mode === 'blank'
              ? 'border-[#09090b] bg-[#09090b] text-white shadow-md'
              : 'border-[#e4e4e7] bg-white text-[#09090b] hover:border-[#d4d4d8]'
          }`}
        >
          <div>
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${
                mode === 'blank' ? 'bg-white/10 text-[#d4ff00]' : 'bg-[#f4f4f5] text-[#09090b]'
              }`}
            >
              <FileEdit className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Blank Canvas</h3>
            <p className={`text-xs mt-1 leading-relaxed ${mode === 'blank' ? 'text-neutral-300' : 'text-[#71717a]'}`}>
              Start from scratch and insert custom sections step-by-step.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold">
            <span className={mode === 'blank' ? 'text-[#d4ff00]' : 'text-[#09090b]'}>Custom control</span>
            {mode === 'blank' && <CheckCircle2 className="h-4 w-4 text-[#d4ff00]" />}
          </div>
        </div>
      </div>

      {/* Step 1: Base Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-base font-bold text-[#09090b]">Project Title & Client</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Proposal Title *"
              placeholder="e.g. Acme Website Redesign & Brand Strategy"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
            <Input
              label="Client or Company Name"
              placeholder="e.g. Acme Corporation"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Currency"
              options={CURRENCIES.map((c) => ({ value: c.value, label: c.label }))}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mode-Specific Content */}
      {mode === 'ai' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
              <h2 className="text-base font-bold text-[#09090b]">AI Generation Details</h2>
            </div>
            <p className="text-xs text-[#71717a]">
              The more context you provide, the better Gemini drafts your deliverables and scope.
            </p>

            <Textarea
              label="Project Scope & Objectives"
              placeholder="Describe what the client needs, the problem to solve, and expected deliverables..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={3}
            />

            <Input
              label="Key Services (Comma Separated)"
              placeholder="e.g. UI/UX Design, Next.js Development, Stripe Checkout, SEO"
              value={services}
              onChange={(e) => setServices(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Budget / Investment"
                placeholder="e.g. $5,000 or ₹3,50,000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <Input
                label="Target Timeline"
                placeholder="e.g. 4-6 Weeks"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {mode === 'template' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-base font-bold text-[#09090b]">Select Starting Template</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILTIN_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedTemplate === tmpl.id
                      ? 'border-[#09090b] bg-[#f4f4f5]'
                      : 'border-[#e4e4e7] bg-white hover:border-[#d4d4d8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#09090b] text-[#d4ff00] px-2.5 py-0.5 rounded-full">
                      {tmpl.tag}
                    </span>
                    {selectedTemplate === tmpl.id && <CheckCircle2 className="h-4 w-4 text-[#09090b]" />}
                  </div>
                  <h4 className="font-bold text-sm text-[#09090b] mt-2">{tmpl.title}</h4>
                  <p className="text-xs text-[#71717a] mt-1 leading-relaxed">{tmpl.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e4e4e7]">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          variant="accent"
          size="lg"
          className="font-bold shadow-md"
          loading={loading}
          onClick={handleCreate}
          disabled={!purpose.trim()}
        >
          <span>{mode === 'ai' ? 'Generate Proposal with AI ⚡' : 'Create & Open Editor'}</span>
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
