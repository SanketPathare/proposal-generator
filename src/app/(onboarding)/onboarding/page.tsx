'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { FileText, Sparkles, ArrowRight, Palette, BarChart3, PenTool } from 'lucide-react';

export default function OnboardingWelcomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && profile?.onboardingCompleted) {
      router.replace('/dashboard');
    }
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const fullName = profile?.fullName || '';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzRtMC04djJIMnYyaDM0bTAtMTZ2MkgzdjJoMzRtMC04djJIMXYyaDM0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
                <Sparkles className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-medium text-white">Welcome to ProposalGen</span>
              </div>

              {/* Initials avatar instead of Google photo */}
              <div className="mx-auto h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border-2 border-white/30">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Let&apos;s get started!
              </h1>
              <p className="text-white/80 text-lg">
                Set up your profile in just a few steps
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Feature preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: PenTool, label: 'Your Profile', desc: 'Tell us about yourself' },
                { icon: Palette, label: 'Your Brand', desc: 'Add logo & brand name' },
                { icon: BarChart3, label: 'Settings', desc: 'Currency & payment terms' },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="inline-flex h-10 w-10 rounded-lg bg-primary/10 items-center justify-center mb-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.label}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Setup steps */}
            <div className="space-y-3 mb-8">
              {[
                { step: 1, text: 'Complete your profile' },
                { step: 2, text: 'Set up your branding' },
                { step: 3, text: 'Configure default settings' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <span className="text-sm text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full text-base py-3"
              onClick={() => router.push('/onboarding/step1')}
            >
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Skip */}
        <p className="text-center mt-4">
          <button
            onClick={() => router.replace('/dashboard')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip setup for now
          </button>
        </p>
      </div>
    </div>
  );
}
