import { ReactNode } from 'react';
import Link from 'next/link';
import { FileText, Zap, Shield, BarChart3 } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzRtMC04djJIMnYyaDM0bTAtMTZ2MkgzdjJoMzRtMC04djJIMXYyaDM0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ProposalGen</span>
          </Link>

          {/* Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Create proposals
                <br />
                that win clients.
              </h1>
              <p className="mt-4 text-lg text-white/80 max-w-md">
                Professional proposal builder for freelancers and teams. Create, share, and track proposals with ease.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Zap, text: 'AI-powered proposal generation' },
                { icon: Shield, text: 'Secure sharing with analytics' },
                { icon: BarChart3, text: 'Track views and responses' },
              ].map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-white/90">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-white/50">&copy; 2026 ProposalGen. All rights reserved.</p>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ProposalGen</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}