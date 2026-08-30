import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">ProposalGen</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="#templates" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Templates</Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign in</Link>
              <Link href="/signup">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Create Professional Proposals.<br />
              <span className="text-primary">Your Way.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              A simple SaaS platform for freelancers and independent professionals to create, customize, 
              generate, save, share, and manage professional proposals.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <button className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors">
                  Start Free — No Credit Card Required
                </button>
              </Link>
              <Link href="#features">
                <button className="w-full sm:w-auto px-8 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors">
                  View Features
                </button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Free tier available • Cancel anytime • 14-day Pro trial
            </p>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
              <span className="text-sm font-medium uppercase tracking-wider">Trusted by freelancers worldwide</span>
              <div className="flex flex-wrap items-center justify-center gap-10 text-sm font-medium">
                <span>Web Designers</span>
                <span>Developers</span>
                <span>Marketers</span>
                <span>Consultants</span>
                <span>Writers</span>
                <span>Photographers</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything you need to win clients</h2>
              <p className="mt-4 text-lg text-gray-600">Three ways to create proposals — choose what works for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1: Manual */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 110 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 11-4 0v-1a1 1 0 00-1-1H8a1 1 0 01-1-1V8a1 1 0 011-1h1a2 2 0 110-4H8a1 1 0 00-1-1V5a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Manually</h3>
                <p className="text-gray-600 mb-6">Full control over every detail. Build proposals section by section with our rich text editor.</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Rich text editor with formatting</li>
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Drag-and-drop section reordering</li>
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Interactive pricing tables</li>
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Timeline & milestone tracking</li>
                </ul>
              </div>

              {/* Feature 2: Templates */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Use Templates</h3>
                <p className="text-gray-600 mb-6">Start fast with professional templates or create your own reusable templates.</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>8+ professional templates included</li>
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Create unlimited personal templates</li>
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Convert any proposal to template</li>
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Custom branding & styles</li>
                </ul>
              </div>

              {/* Feature 3: AI */}
              <div className="bg-white p-8 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-6">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Generate with AI (Optional)</h3>
                <p className="text-gray-600 mb-6">Let Gemini AI draft your proposal — then edit freely. AI assists, you decide.</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Full proposal generation</li>
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Section-by-section generation</li>
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Improve, rewrite, shorten, expand</li>
                  <li className="flex items-center gap-2"><svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Fix grammar, adjust tone</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">More powerful features</h2>
              <p className="mt-4 text-lg text-gray-600">Everything you need to manage your proposal workflow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '👥', title: 'Client Management', desc: 'Simple CRM for your clients with proposal history' },
                { icon: '📚', title: 'Content Library', desc: 'Save & reuse content blocks across proposals' },
                { icon: '🔗', title: 'Share & Track', desc: 'Public links with view tracking & accept/reject' },
                { icon: '🎨', title: 'Personal Branding', desc: 'Logo, colors, fonts applied automatically' },
                { icon: '☁️', title: 'Cloudinary Media', desc: 'Professional image management & optimization' },
                { icon: '🔒', title: 'Secure & Private', desc: 'Your data isolated — no team access ever' },
                { icon: '📱', title: 'Mobile Ready', desc: 'Works beautifully on any device' },
                { icon: '⚡', title: 'Fast & Simple', desc: 'No bloat — built for individuals' },
              ].map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
                  <span className="text-3xl mb-3 block">{feature.icon}</span>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-2xl p-12 sm:p-16 text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to create better proposals?</h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join freelancers who are winning more clients with professional proposals. 
                Start free, upgrade when you're ready.
              </p>
              <Link href="/signup">
                <button className="px-8 py-3 bg-white text-primary rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors">
                  Create Free Account
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">ProposalGen</span>
              </Link>
              <p className="text-sm">Create professional proposals. Your way.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#templates" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
            © 2026 ProposalGen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}