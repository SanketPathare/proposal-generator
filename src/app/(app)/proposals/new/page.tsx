'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { generateId } from '@/lib/utils';

const BUILTIN_TEMPLATES = [
  { id: 'blank', title: 'Start Blank', description: 'Begin with an empty proposal and add your own sections.', icon: 'M12 4v16m8-8H4' },
  { id: 'web-dev', title: 'Web Development', description: 'Full-stack web project proposal with scope, timeline, and pricing.', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'seo', title: 'SEO Services', description: 'Search engine optimization package with audit and monthly plans.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'uiux', title: 'UI/UX Design', description: 'Design system, wireframes, prototypes, and handoff deliverables.', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id: 'mobile', title: 'Mobile App', description: 'iOS/Android app proposal covering design, development, and launch.', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { id: 'consulting', title: 'Consulting', description: 'Business consulting engagement with objectives and deliverables.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'marketing', title: 'Marketing', description: 'Digital marketing proposal with strategy, channels, and KPIs.', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
  { id: 'writing', title: 'Writing & Content', description: 'Content creation proposal for blogs, copywriting, or ghostwriting.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
];

export default function CreateProposalPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [purpose, setPurpose] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [clientName, setClientName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [services, setServices] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const [creating, setCreating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateBlank = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!purpose.trim()) {
      setError('Please enter a purpose for your proposal.');
      return;
    }

    setCreating(true);
    setError('');
    try {
      const proposal = await firestoreHelpers.createProposal(user.uid, {
        clientId: null,
        title: purpose.trim(),
        purpose: purpose.trim(),
        status: 'draft',
        templateId: selectedTemplate === 'blank' || !selectedTemplate ? null : selectedTemplate,
        currency: 'INR',
        sections: [],
        pricing: null,
        shareId: null,
        sharedAt: null,
        expiresAt: null,
        passwordHash: null,
        lastViewedAt: null,
        acceptedAt: null,
        rejectedAt: null,
      });
      router.push(`/proposals/${proposal.id}`);
    } catch (err) {
      console.error('Failed to create proposal:', err);
      setError('Failed to create proposal. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!purpose.trim()) {
      setError('Please enter a purpose for your proposal.');
      return;
    }
    if (!clientName.trim()) {
      setError('Client name is required for AI generation.');
      return;
    }
    if (!projectDescription.trim()) {
      setError('Project description is required for AI generation.');
      return;
    }

    setAiLoading(true);
    setError('');
    try {
      const proposal = await firestoreHelpers.createProposal(user.uid, {
        clientId: null,
        title: purpose.trim(),
        purpose: purpose.trim(),
        status: 'draft',
        templateId: null,
        currency: 'INR',
        sections: [],
        pricing: null,
        shareId: null,
        sharedAt: null,
        expiresAt: null,
        passwordHash: null,
        lastViewedAt: null,
        acceptedAt: null,
        rejectedAt: null,
      });

      const aiInput = {
        purpose: purpose.trim(),
        clientName: clientName.trim(),
        projectDescription: projectDescription.trim(),
        services: services.split(',').map((s) => s.trim()).filter(Boolean),
        budget: budget.trim(),
        timeline: timeline.trim(),
        additionalInstructions: additionalInstructions.trim() || undefined,
      };

      const response = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: proposal.id, ...aiInput }),
      });

      if (!response.ok) {
        throw new Error('AI generation failed');
      }

      router.push(`/proposals/${proposal.id}`);
    } catch (err) {
      console.error('Failed to generate proposal with AI:', err);
      setError('Failed to generate proposal with AI. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Proposal</h1>
        <p className="text-gray-500 mt-1">Start a new proposal for your client.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Proposal Purpose */}
      <Card>
        <CardHeader>
          <CardTitle>What is the purpose of this proposal?</CardTitle>
          <CardDescription>
            Give your proposal a clear title so you can identify it later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g. Website Development Proposal, SEO Service Proposal"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* AI Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Enable Gemini AI Assistance</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Let AI generate proposal content based on your inputs.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={aiEnabled}
              onClick={() => {
                setAiEnabled(!aiEnabled);
                setError('');
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                aiEnabled ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  aiEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* AI Input Form */}
      {aiEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>AI Generation Details</CardTitle>
            <CardDescription>
              Provide details about the project so AI can generate a tailored proposal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Client Name"
              placeholder="e.g. Acme Inc."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <Textarea
              label="Project Description"
              placeholder="Describe the project, goals, and requirements..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={4}
            />
            <Input
              label="Services"
              placeholder="e.g. Web Design, Frontend Development, SEO"
              helperText="Comma-separated list of services to include."
              value={services}
              onChange={(e) => setServices(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Budget"
                placeholder="e.g. ₹50,000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <Input
                label="Timeline"
                placeholder="e.g. 4 weeks"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              />
            </div>
            <Textarea
              label="Additional Instructions (Optional)"
              placeholder="Any specific tone, structure, or details the AI should follow..."
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {/* Template Selection */}
      {!aiEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Starting Point</CardTitle>
            <CardDescription>
              Start blank or pick a pre-built template to jump ahead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BUILTIN_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <svg
                    className="h-6 w-6 text-gray-600 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={template.icon}
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">{template.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        {aiEnabled ? (
          <Button loading={aiLoading} onClick={handleGenerateWithAI}>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Generate with AI
          </Button>
        ) : (
          <Button loading={creating} onClick={handleCreateBlank} disabled={!purpose.trim()}>
            Create Proposal
          </Button>
        )}
      </div>
    </div>
  );
}
