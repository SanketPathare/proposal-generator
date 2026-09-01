import { TemplateStyles, ProposalSection } from '@/types';

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  tag: string;
  sections: ProposalSection[];
  styles: TemplateStyles;
}

export const GOOGLE_FONTS = [
  { name: 'Inter', import: 'Inter:wght@400;500;600;700;800;900' },
  { name: 'Plus Jakarta Sans', import: 'Plus+Jakarta+Sans:wght@400;500;600;700;800' },
  { name: 'Playfair Display', import: 'Playfair+Display:wght@400;500;600;700;800;900' },
  { name: 'Lora', import: 'Lora:wght@400;500;600;700;800' },
  { name: 'Outfit', import: 'Outfit:wght@400;500;600;700;800;900' },
  { name: 'Cormorant Garamond', import: 'Cormorant+Garamond:wght@400;500;600;700' },
  { name: 'Space Grotesk', import: 'Space+Grotesk:wght@400;500;600;700' },
  { name: 'Nunito', import: 'Nunito:wght@400;500;600;700;800' },
  { name: 'Merriweather', import: 'Merriweather:wght@400;700;900' },
  { name: 'Poppins', import: 'Poppins:wght@400;500;600;700;800;900' },
  { name: 'Manrope', import: 'Manrope:wght@400;500;600;700;800' },
  { name: 'DM Serif Display', import: 'DM+Serif+Display:wght@400' },
  { name: 'Sora', import: 'Sora:wght@400;500;600;700;800' },
  { name: 'Atkinson Hyperlegible', import: 'Atkinson+Hyperlegible:wght@400;700' },
  { name: 'Bebas Neue', import: 'Bebas+Neue:wght@400' },
  { name: 'Fraunces', import: 'Fraunces:wght@400;500;600;700;800;900' },
  { name: 'Chakra Petch', import: 'Chakra+Petch:wght@400;500;600;700' },
  { name: 'Source Sans 3', import: 'Source+Sans+3:wght@400;500;600;700' },
  { name: 'DM Sans', import: 'DM+Sans:wght@400;500;600;700' },
  { name: 'Raleway', import: 'Raleway:wght@400;500;600;700' },
  { name: 'Open Sans', import: 'Open+Sans:wght@400;500;600;700' },
  { name: 'Lato', import: 'Lato:wght@400;700;900' },
  { name: 'Nunito Sans', import: 'Nunito+Sans:wght@400;600;700;800' },
  { name: 'Work Sans', import: 'Work+Sans:wght@400;500;600;700' },
  { name: 'Rubik', import: 'Rubik:wght@400;500;600;700' },
  { name: 'Commissioner', import: 'Commissioner:wght@400;500;600;700' },
];

export function getFontImportUrl(fontName: string): string {
  const font = GOOGLE_FONTS.find((f) => f.name === fontName);
  return font ? `https://fonts.googleapis.com/css2?family=${font.import}&display=swap` : '';
}

export const ALL_TEMPLATES: TemplateDefinition[] = [
  // ============================================
  // 1. WEB DEVELOPMENT — Standard + Glow + Cards
  // ============================================
  {
    id: 'web-dev',
    title: 'Web Development Proposal',
    description: 'Full-stack Next.js/React website proposal with deliverables, milestones, and pricing table.',
    category: 'web-development',
    tag: 'Engineering',
    styles: {
      fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
      colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
      logoPosition: 'left',
      header: 'proposal.example.com',
      footer: 'Confidential — All Rights Reserved',
      coverLayout: 'standard',
      sectionStyle: 'cards',
      borderStyle: 'rounded',
      accentStyle: 'glow',
      pricingStyle: 'standard',
      timelineStyle: 'vertical',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Web Development Proposal', subtitle: 'Modern High-Performance Web Solution' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Executive Summary', content: '<p>Thank you for the opportunity to partner on this web project. Our objective is to deliver a world-class, responsive, and SEO-optimized web application.</p><p>We combine cutting-edge technology with thoughtful design to create digital experiences that drive results.</p>', order: 1 },
      { id: '3', type: 'scope', title: 'Scope of Work', content: '<p>Key development modules include:</p><ul><li>UX/UI Architecture & Design System</li><li>Next.js Frontend & API Integration</li><li>Performance Optimization & Analytics</li><li>Comprehensive QA & Cloud Deployment</li></ul>', order: 2 },
      { id: '4', type: 'features', title: 'Technical Features', content: '<ul><li>Server-side rendering for optimal SEO</li><li>Responsive design across all devices</li><li>Progressive Web App capabilities</li><li>Automated testing and CI/CD pipeline</li></ul>', order: 3 },
      { id: '5', type: 'timeline', title: 'Project Timeline', content: [{ id: 't1', title: 'Discovery & Planning', description: 'Requirements gathering and technical architecture', date: '2026-01-15', completed: false }, { id: 't2', title: 'Design & Prototyping', description: 'UI/UX design and interactive prototype', date: '2026-02-01', completed: false }, { id: 't3', title: 'Development Sprint', description: 'Core feature implementation', date: '2026-03-01', completed: false }, { id: 't4', title: 'Testing & Launch', description: 'QA, performance optimization, and deployment', date: '2026-03-20', completed: false }], order: 4 },
      { id: '6', type: 'pricing', title: 'Investment & Pricing', content: { rows: [{ id: 'r1', item: 'Frontend & Backend Build', description: 'Next.js App with responsive views', quantity: 1, unitPrice: 4500, total: 4500 }, { id: 'r2', item: 'SEO & Analytics Setup', description: 'Technical SEO and tracking', quantity: 1, unitPrice: 800, total: 800 }], subtotal: 5300, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 5300, currency: 'USD' }, order: 5 },
      { id: '7', type: 'terms', title: 'Terms & Next Steps', content: '<p>50% initial deposit required prior to project kick-off. Final 50% payable upon deployment.</p><p>All intellectual property transfers to the client upon full payment.</p>', order: 6 },
    ],
  },

  // ============================================
  // 2. UI/UX DESIGN — Split + Gradient + Minimal
  // ============================================
  {
    id: 'uiux',
    title: 'UI/UX Design & Prototype',
    description: 'Design system, wireframing, high-fidelity mockups, and interactive prototype.',
    category: 'ui-ux-design',
    tag: 'Design',
    styles: {
      fonts: { heading: 'Outfit', body: 'DM Sans' },
      colors: { primary: '#6366f1', secondary: '#eef2ff', accent: '#818cf8', background: '#ffffff', text: '#1e1b4b' },
      logoPosition: 'center',
      header: '',
      footer: 'Designed with care by Studio UX',
      coverLayout: 'split',
      sectionStyle: 'minimal',
      borderStyle: 'sharp',
      accentStyle: 'gradient',
      pricingStyle: 'compact',
      timelineStyle: 'horizontal',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'UI/UX Design Proposal', subtitle: 'User-Centered Product Design' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Project Overview', content: '<p>We craft intuitive, engaging digital products that delight users and drive business conversions.</p><p>Our human-centered design process ensures every interaction is purposeful and every screen tells a story.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About Our Studio', content: '<p>With 50+ completed design projects across fintech, healthcare, and e-commerce, our studio brings deep expertise in creating interfaces that users love.</p><p>We follow a rigorous design thinking process: Empathize, Define, Ideate, Prototype, Test.</p>', order: 2 },
      { id: '4', type: 'deliverables', title: 'Design Deliverables', content: '<ul><li>User Persona Research & Flow Mapping</li><li>Wireframes & Low-Fidelity Prototypes</li><li>Component Design System (Figma)</li><li>High-Fidelity Interactive Prototype</li><li>Developer Handoff & Specifications</li></ul>', order: 3 },
      { id: '5', type: 'pricing', title: 'Project Pricing', content: { rows: [{ id: 'r1', item: 'Figma Design System & Screens', description: 'Up to 15 key views', quantity: 1, unitPrice: 3800, total: 3800 }, { id: 'r2', item: 'Interactive Prototype', description: 'Click-through prototype in Figma', quantity: 1, unitPrice: 1200, total: 1200 }], subtotal: 5000, discount: 500, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 4500, currency: 'USD' }, order: 4 },
      { id: '6', type: 'testimonials', title: 'What Clients Say', content: '<p><strong>"The redesign increased our conversion rate by 40% in just two months."</strong></p><p>— Sarah K., Product Lead at TechFlow</p><hr><p><strong>"Incredible attention to user research. The final product exceeded all expectations."</strong></p><p>— Marcus L., CEO at HealthApp</p>', order: 5 },
      { id: '7', type: 'terms', title: 'Terms & Conditions', content: '<p>Payment schedule: 40% upfront, 30% at design review, 30% upon final delivery.</p><p>Up to 3 rounds of revisions included. Additional revisions billed at hourly rate.</p>', order: 6 },
    ],
  },

  // ============================================
  // 3. MARKETING — Centered + Stripe + Filled
  // ============================================
  {
    id: 'marketing',
    title: 'Growth & Digital Marketing',
    description: 'SEO, paid acquisition, conversion optimization, and monthly growth roadmap.',
    category: 'marketing',
    tag: 'Growth',
    styles: {
      fonts: { heading: 'Sora', body: 'Plus Jakarta Sans' },
      colors: { primary: '#c2410c', secondary: '#fff7ed', accent: '#f97316', background: '#ffffff', text: '#431407' },
      logoPosition: 'left',
      header: 'GROWTH PARTNERS',
      footer: 'Driving results since 2020',
      coverLayout: 'centered',
      sectionStyle: 'filled',
      borderStyle: 'pill',
      accentStyle: 'stripe',
      pricingStyle: 'highlight',
      timelineStyle: 'steps',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Growth Marketing Proposal', subtitle: 'Data-Driven Customer Acquisition' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Growth Overview', content: '<p>Our growth marketing framework combines organic search, paid channels, and conversion optimization to deliver measurable ROI.</p><p>We don\'t just drive traffic — we drive revenue.</p>', order: 1 },
      { id: '3', type: 'scope', title: 'Strategy & Channels', content: '<p>Comprehensive growth strategy covering:</p><ul><li>Organic Search (Technical SEO + Content Marketing)</li><li>Google Ads & Meta Ads Campaign Management</li><li>Landing Page Optimization & A/B Testing</li><li>Email Marketing Automation</li></ul>', order: 2 },
      { id: '4', type: 'pricing', title: 'Retainer & Pricing', content: { rows: [{ id: 'r1', item: 'Monthly Growth Campaign Management', description: 'Channel optimization & bi-weekly reporting', quantity: 3, unitPrice: 1500, total: 4500 }, { id: 'r2', item: 'Landing Page Optimization', description: 'CRO audit and implementation', quantity: 1, unitPrice: 800, total: 800 }], subtotal: 5300, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 5300, currency: 'USD' }, order: 3 },
      { id: '5', type: 'conclusion', title: 'Next Steps', content: '<p>We\'re ready to accelerate your growth. Let\'s schedule a strategy call to align on goals and launch your first campaign within 2 weeks.</p>', order: 4 },
    ],
  },

  // ============================================
  // 4. CONSULTING — Sidebar + Lines + Bordered
  // ============================================
  {
    id: 'consulting',
    title: 'Strategic Business Consulting',
    description: 'Business assessment, operational roadmap, and strategic recommendations.',
    category: 'consulting',
    tag: 'Strategy',
    styles: {
      fonts: { heading: 'Merriweather', body: 'Lato' },
      colors: { primary: '#1e293b', secondary: '#f8fafc', accent: '#d97706', background: '#ffffff', text: '#0f172a' },
      logoPosition: 'right',
      header: 'STRATEGIC ADVISORY',
      footer: 'Partner — Build — Scale',
      coverLayout: 'sidebar',
      sectionStyle: 'bordered',
      borderStyle: 'sharp',
      accentStyle: 'lines',
      pricingStyle: 'bordered',
      timelineStyle: 'vertical',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Strategic Advisory Engagement', subtitle: 'Business Optimization Roadmap' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Engagement Scope', content: '<p>In-depth diagnostic analysis and strategic execution roadmap tailored for scalable growth.</p><p>Our advisory engagement is designed to identify high-impact opportunities and create actionable plans for execution.</p>', order: 1 },
      { id: '3', type: 'scope', title: 'Advisory Pillars', content: '<ul><li>Operational Efficiency Audit</li><li>Revenue Growth Strategy</li><li>Organizational Structure Review</li><li>Digital Transformation Roadmap</li></ul>', order: 2 },
      { id: '4', type: 'pricing', title: 'Advisory Fee', content: { rows: [{ id: 'r1', item: 'Strategy & Diagnostic Sprint', description: '4-week advisory engagement', quantity: 1, unitPrice: 5000, total: 5000 }, { id: 'r2', item: 'Implementation Support', description: 'Monthly follow-up sessions', quantity: 3, unitPrice: 500, total: 1500 }], subtotal: 6500, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 6500, currency: 'USD' }, order: 3 },
      { id: '5', type: 'terms', title: 'Terms', content: '<p>Engagement fee is due upon signing. All findings and deliverables are confidential and proprietary to the client.</p>', order: 4 },
    ],
  },

  // ============================================
  // 5. PHOTOGRAPHY — Full-Bleed + None + Minimal
  // ============================================
  {
    id: 'photography',
    title: 'Photography & Video Production',
    description: 'Professional photo and video production for brands, events, and campaigns.',
    category: 'photography',
    tag: 'Creative',
    styles: {
      fonts: { heading: 'Playfair Display', body: 'Source Sans 3' },
      colors: { primary: '#1a1a2e', secondary: '#f5f0eb', accent: '#e94560', background: '#fdfcfa', text: '#1a1a2e' },
      logoPosition: 'center',
      header: 'VISUAL STUDIO',
      footer: 'Capturing moments that matter',
      coverLayout: 'full-bleed',
      sectionStyle: 'minimal',
      borderStyle: 'rounded',
      accentStyle: 'none',
      pricingStyle: 'standard',
      timelineStyle: 'cards',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Photography & Video Production', subtitle: 'Visual Storytelling for Your Brand' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Creative Vision', content: '<p>We believe every brand has a story worth telling. Our team of photographers and videographers specialize in capturing authentic moments that resonate with your audience.</p><p>From concept to final delivery, we handle every aspect of visual production with artistic precision.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About the Studio', content: '<p>With 8+ years of experience in commercial photography and video production, our studio has worked with brands like Nike, Airbnb, and local startups alike.</p><p><strong>Our Equipment:</strong> Sony A7IV, Canon R5, DJI Mavic 3 Pro, Professional lighting kits, 4K cinema cameras.</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Services & Packages', content: '<p><strong>Package A — Brand Photography</strong></p><ul><li>2-hour studio or on-location shoot</li><li>30+ edited high-resolution images</li><li>Color grading and retouching</li></ul><p><strong>Package B — Video Production</strong></p><ul><li>Pre-production planning and storyboard</li><li>Full-day shoot with 2-camera setup</li><li>Professional editing and motion graphics</li></ul>', order: 3 },
      { id: '5', type: 'portfolio', title: 'Portfolio Showcase', content: '<p>Our recent work spans commercial campaigns, product photography, event coverage, and brand storytelling.</p><p><em>[Portfolio images and video reels available upon request]</em></p>', order: 4 },
      { id: '6', type: 'pricing', title: 'Production Investment', content: { rows: [{ id: 'r1', item: 'Brand Photography Package', description: '2-hour shoot, 30+ edited images', quantity: 1, unitPrice: 1200, total: 1200 }, { id: 'r2', item: 'Video Production Package', description: 'Full-day shoot, 60s brand video', quantity: 1, unitPrice: 3500, total: 3500 }, { id: 'r3', item: 'Drone Aerial Footage', description: 'Licensed drone operator, 4K aerial shots', quantity: 1, unitPrice: 500, total: 500 }], subtotal: 5200, discount: 200, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 5000, currency: 'USD' }, order: 5 },
      { id: '7', type: 'timeline', title: 'Production Timeline', content: [{ id: 't1', title: 'Creative Brief & Planning', description: 'Mood board, shot list, location scouting', date: '2026-01-20', completed: false }, { id: 't2', title: 'Production Day', description: 'Photo and video shoot on location', date: '2026-02-01', completed: false }, { id: 't3', title: 'Post-Production', description: 'Editing, color grading, retouching', date: '2026-02-15', completed: false }, { id: 't4', title: 'Final Delivery', description: 'High-res files and usage rights transfer', date: '2026-02-25', completed: false }], order: 6 },
      { id: '8', type: 'terms', title: 'Terms & Usage Rights', content: '<p>50% deposit required to secure booking. Balance due upon final delivery.</p><p>All final images/video files include full commercial usage rights. Raw files available upon request for additional fee.</p>', order: 7 },
    ],
  },

  // ============================================
  // 6. WRITING — Centered + Dots + Cards
  // ============================================
  {
    id: 'writing',
    title: 'Writing & Content Strategy',
    description: 'Content writing, copywriting, editorial strategy, and brand voice development.',
    category: 'writing',
    tag: 'Content',
    styles: {
      fonts: { heading: 'Lora', body: 'Inter' },
      colors: { primary: '#2d1b69', secondary: '#f5f3ff', accent: '#a78bfa', background: '#fefcfb', text: '#1e1b4b' },
      logoPosition: 'left',
      header: '',
      footer: 'Words that work — Inkwell Studio',
      coverLayout: 'centered',
      sectionStyle: 'cards',
      borderStyle: 'rounded',
      accentStyle: 'dots',
      pricingStyle: 'compact',
      timelineStyle: 'vertical',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Writing & Content Strategy', subtitle: 'Words That Convert and Inspire' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Content Vision', content: '<p>Great content isn\'t just about words — it\'s about crafting narratives that connect, persuade, and convert.</p><p>Our content strategy combines data-driven insights with compelling storytelling to build brands that resonate.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About the Writer', content: '<p>As a professional content strategist and copywriter with 6+ years of experience, I\'ve written for SaaS startups, Fortune 500 companies, and everything in between.</p><p><strong>Specialties:</strong> Website copy, blog content, email sequences, case studies, whitepapers, and brand voice guidelines.</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Content Strategy Scope', content: '<ul><li>Brand Voice & Tone Guidelines</li><li>Content Audit & Gap Analysis</li><li>Blog Content Calendar (12 months)</li><li>Website Copy (Up to 10 pages)</li><li>Email Sequence Framework (5 emails)</li></ul>', order: 3 },
      { id: '5', type: 'deliverables', title: 'Writing Deliverables', content: '<ul><li>Brand Voice Document with tone examples</li><li>SEO-optimized blog posts (1,500-2,500 words each)</li><li>Homepage, About, Services, and Landing page copy</li><li>Welcome email sequence with subject lines</li><li>Content style guide for internal teams</li></ul>', order: 4 },
      { id: '6', type: 'pricing', title: 'Content Investment', content: { rows: [{ id: 'r1', item: 'Brand Voice Development', description: 'Guidelines, tone matrix, examples', quantity: 1, unitPrice: 1500, total: 1500 }, { id: 'r2', item: 'Website Copy Package', description: '10 pages of conversion-focused copy', quantity: 1, unitPrice: 2500, total: 2500 }, { id: 'r3', item: 'Blog Content (4 posts)', description: 'SEO-optimized, 2000 words each', quantity: 4, unitPrice: 300, total: 1200 }], subtotal: 5200, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 5200, currency: 'USD' }, order: 5 },
      { id: '7', type: 'testimonials', title: 'Client Testimonials', content: '<p><strong>"Our website traffic increased 200% after implementing the new content strategy."</strong></p><p>— Jessica M., Marketing Director at SaaS Co</p><hr><p><strong>"Professional, on-brand, and always delivered ahead of deadline."</strong></p><p>— David R., Founder at TechStartup</p>', order: 6 },
      { id: '8', type: 'terms', title: 'Terms & Process', content: '<p>Payment: 50% upfront, 50% upon final delivery. Revisions: 2 rounds included per deliverable.</p><p>Content ownership transfers fully to the client upon payment. All work is original and plagiarism-free.</p>', order: 7 },
    ],
  },

  // ============================================
  // 7. EVENTS — Diagonal + Stripe + Filled
  // ============================================
  {
    id: 'events',
    title: 'Events & Entertainment',
    description: 'Corporate events, weddings, conferences, and entertainment production.',
    category: 'events',
    tag: 'Events',
    styles: {
      fonts: { heading: 'Outfit', body: 'DM Sans' },
      colors: { primary: '#be123c', secondary: '#fff1f2', accent: '#fb923c', background: '#fffaf8', text: '#1c1917' },
      logoPosition: 'center',
      header: 'SPECTACLE EVENTS',
      footer: 'Creating unforgettable moments',
      coverLayout: 'diagonal',
      sectionStyle: 'filled',
      borderStyle: 'pill',
      accentStyle: 'stripe',
      pricingStyle: 'highlight',
      timelineStyle: 'steps',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Event Production Proposal', subtitle: 'Creating Unforgettable Experiences' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Event Overview', content: '<p>From intimate gatherings to large-scale conferences, we bring creativity, precision, and flawless execution to every event.</p><p>Our team handles everything from concept development to day-of coordination.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About Our Team', content: '<p>With 150+ successful events produced across corporate, social, and entertainment sectors, our team combines creative vision with operational excellence.</p><p><strong>Certifications:</strong> Certified Meeting Professional (CMP), OSHA Safety Certified.</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Event Concepts', content: '<ul><li>Corporate Conference & Product Launch</li><li>Gala Dinner & Awards Ceremony</li><li>Team Building & Corporate Retreat</li><li>Brand Activation & Pop-Up Events</li></ul>', order: 3 },
      { id: '5', type: 'pricing', title: 'Event Packages', content: { rows: [{ id: 'r1', item: 'Full Event Production', description: 'Concept, planning, execution, coordination', quantity: 1, unitPrice: 5000, total: 5000 }, { id: 'r2', item: 'AV & Entertainment', description: 'Sound, lighting, DJ/live entertainment', quantity: 1, unitPrice: 2000, total: 2000 }, { id: 'r3', item: 'Photography & Videography', description: 'Event documentation and highlights reel', quantity: 1, unitPrice: 1500, total: 1500 }], subtotal: 8500, discount: 500, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 8000, currency: 'USD' }, order: 4 },
      { id: '6', type: 'timeline', title: 'Event Timeline', content: [{ id: 't1', title: 'Concept & Planning', description: 'Theme development, vendor selection, budgeting', date: '2026-01-15', completed: false }, { id: 't2', title: 'Logistics & Coordination', description: 'Venue booking, catering, AV setup', date: '2026-02-15', completed: false }, { id: 't3', title: 'Final Rehearsal', description: 'Walk-through and final confirmations', date: '2026-03-01', completed: false }, { id: 't4', title: 'Event Day', description: 'Full production and coordination', date: '2026-03-05', completed: false }], order: 5 },
      { id: '7', type: 'terms', title: 'Terms & Conditions', content: '<p>30% deposit required to reserve date. 40% due 30 days before event. Final 30% due within 7 days after event.</p><p>Cancellation policy: Full refund if cancelled 60+ days before event. 50% refund if 30-59 days. No refund within 30 days.</p>', order: 6 },
    ],
  },

  // ============================================
  // 8. REAL ESTATE — Sidebar + Lines + Bordered
  // ============================================
  {
    id: 'real-estate',
    title: 'Real Estate & Architecture',
    description: 'Architectural design, property development, and interior design proposals.',
    category: 'real-estate',
    tag: 'Architecture',
    styles: {
      fonts: { heading: 'Cormorant Garamond', body: 'Raleway' },
      colors: { primary: '#1e3a5f', secondary: '#f0f4f8', accent: '#c9a96e', background: '#faf8f5', text: '#1a1a1a' },
      logoPosition: 'right',
      header: 'ATELIER STUDIO',
      footer: 'Crafting spaces since 2015',
      coverLayout: 'sidebar',
      sectionStyle: 'bordered',
      borderStyle: 'sharp',
      accentStyle: 'lines',
      pricingStyle: 'bordered',
      timelineStyle: 'cards',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Architectural Design Proposal', subtitle: 'Crafting Spaces That Inspire' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Project Vision', content: '<p>Our architectural approach blends form and function to create spaces that are both beautiful and purposeful.</p><p>We listen to our clients\' aspirations and translate them into designs that stand the test of time.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About the Firm', content: '<p>Established in 2015, our architecture studio has completed 60+ residential and commercial projects across the region.</p><p><strong>Awards:</strong> AIA Design Excellence Award 2024, Interior Design Best of Year.</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Design Scope', content: '<ul><li>Schematic Design & Concept Development</li><li>3D Visualization & Renderings</li><li>Construction Drawings & Specifications</li><li>Material Selection & Finish Schedule</li><li>Project Administration During Construction</li></ul>', order: 3 },
      { id: '5', type: 'deliverables', title: 'Deliverables', content: '<ul><li>Architectural drawings (plans, elevations, sections)</li><li>Photorealistic 3D renderings (4 views)</li><li>Material and finish board</li><li>Cost estimation report</li><li>Permit application documents</li></ul>', order: 4 },
      { id: '6', type: 'pricing', title: 'Design Investment', content: { rows: [{ id: 'r1', item: 'Schematic Design Phase', description: 'Concept, planning, 3D renderings', quantity: 1, unitPrice: 4000, total: 4000 }, { id: 'r2', item: 'Design Development', description: 'Detailed drawings and specifications', quantity: 1, unitPrice: 6000, total: 6000 }, { id: 'r3', item: 'Construction Documents', description: 'Permit-ready drawings', quantity: 1, unitPrice: 5000, total: 5000 }], subtotal: 15000, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 15000, currency: 'USD' }, order: 5 },
      { id: '7', type: 'terms', title: 'Professional Terms', content: '<p>Fee structure based on AIA Standard Form of Agreement. Payments tied to project milestones.</p><p>All drawings and designs remain property of the firm until final payment. Copyright transfers to client upon completion.</p>', order: 6 },
    ],
  },

  // ============================================
  // 9. AI/SAAS — Split + Gradient + Minimal
  // ============================================
  {
    id: 'ai-saas',
    title: 'AI / SaaS Tech Startup',
    description: 'AI/ML solutions, SaaS platform development, and cloud infrastructure.',
    category: 'ai-saas',
    tag: 'AI/Tech',
    styles: {
      fonts: { heading: 'Space Grotesk', body: 'Inter' },
      colors: { primary: '#0f172a', secondary: '#f0f9ff', accent: '#06b6d4', background: '#fcfeff', text: '#0f172a' },
      logoPosition: 'left',
      header: 'TECHFORGE AI',
      footer: 'Building intelligent systems',
      coverLayout: 'split',
      sectionStyle: 'minimal',
      borderStyle: 'sharp',
      accentStyle: 'gradient',
      pricingStyle: 'compact',
      timelineStyle: 'horizontal',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'AI/SaaS Platform Proposal', subtitle: 'Intelligent Solutions for Modern Business' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Problem Statement', content: '<p>Businesses today struggle with data overload, manual processes, and the need for intelligent automation.</p><p>Our proposed solution leverages AI/ML to transform raw data into actionable insights and automated workflows.</p>', order: 1 },
      { id: '3', type: 'scope', title: 'Technical Architecture', content: '<ul><li>Microservices architecture on AWS/GCP</li><li>RESTful API layer with GraphQL gateway</li><li>Real-time data processing pipeline</li><li>ML model training and inference infrastructure</li><li>CI/CD with automated testing</li></ul>', order: 2 },
      { id: '4', type: 'features', title: 'AI/ML Capabilities', content: '<ul><li>Natural Language Processing for document analysis</li><li>Predictive analytics with custom ML models</li><li>Computer vision for image/video processing</li><li>Recommendation engine for personalization</li><li>Anomaly detection for security monitoring</li></ul>', order: 3 },
      { id: '5', type: 'pricing', title: 'Platform Investment', content: { rows: [{ id: 'r1', item: 'MVP Development Sprint', description: 'Core platform with 3 AI features', quantity: 1, unitPrice: 15000, total: 15000 }, { id: 'r2', item: 'ML Model Development', description: 'Custom model training and deployment', quantity: 1, unitPrice: 8000, total: 8000 }, { id: 'r3', item: 'Cloud Infrastructure Setup', description: 'AWS/GCP, CI/CD, monitoring', quantity: 1, unitPrice: 3000, total: 3000 }], subtotal: 26000, discount: 2000, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 24000, currency: 'USD' }, order: 4 },
      { id: '6', type: 'timeline', title: 'Development Roadmap', content: [{ id: 't1', title: 'Discovery & Architecture', description: 'Requirements, system design, tech stack selection', date: '2026-01-20', completed: false }, { id: 't2', title: 'MVP Development', description: 'Core features and API layer', date: '2026-03-01', completed: false }, { id: 't3', title: 'ML Integration', description: 'Model training, testing, deployment', date: '2026-04-15', completed: false }, { id: 't4', title: 'Beta Launch', description: 'Limited release and performance optimization', date: '2026-05-15', completed: false }], order: 5 },
      { id: '7', type: 'terms', title: 'Terms & IP', content: '<p>Payment: 25% per development milestone. Source code ownership transfers to client upon full payment.</p><p>Confidentiality: All proprietary algorithms and training data remain strictly confidential.</p>', order: 6 },
    ],
  },

  // ============================================
  // 10. HEALTH & FITNESS — Standard + Dots + Cards
  // ============================================
  {
    id: 'health-fitness',
    title: 'Health & Fitness Coaching',
    description: 'Personal training, nutrition planning, wellness programs, and fitness coaching.',
    category: 'health',
    tag: 'Wellness',
    styles: {
      fonts: { heading: 'Nunito', body: 'Open Sans' },
      colors: { primary: '#065f46', secondary: '#ecfdf5', accent: '#10b981', background: '#f7fdf9', text: '#064e3b' },
      logoPosition: 'left',
      header: '',
      footer: 'Your journey starts here — FitLife Pro',
      coverLayout: 'standard',
      sectionStyle: 'cards',
      borderStyle: 'pill',
      accentStyle: 'dots',
      pricingStyle: 'standard',
      timelineStyle: 'vertical',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Health & Fitness Program', subtitle: 'Transform Your Body, Transform Your Life' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Health Assessment', content: '<p>Our personalized fitness programs are designed around your unique goals, body type, and lifestyle.</p><p>We combine science-based training with nutritional guidance to deliver sustainable results.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About the Trainer', content: '<p>Certified Personal Trainer (ACE, NASM) with 10+ years of experience training 500+ clients.</p><p><strong>Specializations:</strong> Weight loss, muscle building, athletic performance, post-rehab training, and senior fitness.</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Program Overview', content: '<ul><li>Initial fitness assessment and body composition analysis</li><li>Customized workout plan (4-5 days/week)</li><li>Personalized nutrition plan with macro tracking</li><li>Weekly check-ins and progress tracking</li><li>Access to training app with video demonstrations</li></ul>', order: 3 },
      { id: '5', type: 'deliverables', title: 'What You Get', content: '<ul><li>Personalized 12-week training program</li><li>Custom meal plan with grocery lists</li><li>Exercise video library access</li><li>Weekly progress photos and measurements</li><li>Direct messaging for questions and support</li></ul>', order: 4 },
      { id: '6', type: 'pricing', title: 'Training Plans', content: { rows: [{ id: 'r1', item: '12-Week Transformation Package', description: 'Full training + nutrition + coaching', quantity: 1, unitPrice: 800, total: 800 }, { id: 'r2', item: 'Monthly Coaching', description: 'Ongoing training and accountability', quantity: 3, unitPrice: 250, total: 750 }], subtotal: 1550, discount: 100, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 1450, currency: 'USD' }, order: 5 },
      { id: '7', type: 'testimonials', title: 'Success Stories', content: '<p><strong>"Lost 35 lbs in 12 weeks and gained confidence I never knew I had!"</strong></p><p>— Amanda T., Marketing Manager</p><hr><p><strong>"Best investment in my health. The personalized approach makes all the difference."</strong></p><p>— Robert K., Software Engineer</p>', order: 6 },
      { id: '8', type: 'terms', title: 'Program Terms', content: '<p>Payment is due in full before program start, or split into 3 monthly installments.</p><p>Results may vary. A 7-day satisfaction guarantee applies — if you\'re not satisfied after the first week, full refund.</p>', order: 7 },
    ],
  },

  // ============================================
  // 11. LEGAL & FINANCE — Centered + Lines + Bordered
  // ============================================
  {
    id: 'legal-finance',
    title: 'Legal & Financial Advisory',
    description: 'Legal consulting, financial advisory, tax planning, and compliance services.',
    category: 'legal',
    tag: 'Legal/Finance',
    styles: {
      fonts: { heading: 'Merriweather', body: 'Lato' },
      colors: { primary: '#1e293b', secondary: '#f8fafc', accent: '#d97706', background: '#fffdf7', text: '#1e293b' },
      logoPosition: 'right',
      header: 'STERLING & ASSOCIATES',
      footer: 'Trusted counsel since 2005',
      coverLayout: 'centered',
      sectionStyle: 'bordered',
      borderStyle: 'sharp',
      accentStyle: 'lines',
      pricingStyle: 'bordered',
      timelineStyle: 'steps',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Legal & Financial Advisory', subtitle: 'Strategic Counsel for Complex Matters' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Engagement Summary', content: '<p>Our advisory team provides comprehensive legal and financial guidance tailored to your business objectives.</p><p>We combine deep domain expertise with practical, actionable recommendations.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About the Firm', content: '<p>With 20+ years of combined experience in corporate law, tax advisory, and financial planning, our firm serves businesses from startups to Fortune 500 companies.</p><p><strong>Bar Admissions:</strong> State Bar of California, New York, Texas.</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Advisory Scope', content: '<ul><li>Corporate Structure & Entity Formation</li><li>Contract Drafting & Negotiation</li><li>Tax Planning & Compliance Strategy</li><li>Intellectual Property Protection</li><li>Regulatory Compliance Audit</li></ul>', order: 3 },
      { id: '5', type: 'pricing', title: 'Fee Structure', content: { rows: [{ id: 'r1', item: 'Legal Consultation', description: 'Initial assessment and strategy session', quantity: 1, unitPrice: 2000, total: 2000 }, { id: 'r2', item: 'Contract Review Package', description: 'Up to 5 contracts reviewed and redlined', quantity: 1, unitPrice: 1500, total: 1500 }, { id: 'r3', item: 'Tax Strategy & Planning', description: 'Comprehensive tax optimization', quantity: 1, unitPrice: 3000, total: 3000 }], subtotal: 6500, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 6500, currency: 'USD' }, order: 4 },
      { id: '6', type: 'terms', title: 'Confidentiality & Terms', content: '<p>All consultations and communications are protected by attorney-client privilege.</p><p>Retainer fees are billed against hourly work. Unused retainer balance is fully refundable.</p><p>Standard payment terms: Net 15 from invoice date.</p>', order: 5 },
    ],
  },

  // ============================================
  // 12. EDUCATION — Diagonal + Stripe + Filled
  // ============================================
  {
    id: 'education',
    title: 'Education & Training Programs',
    description: 'Corporate training, online courses, workshops, and educational programs.',
    category: 'education',
    tag: 'Education',
    styles: {
      fonts: { heading: 'Poppins', body: 'Nunito Sans' },
      colors: { primary: '#7c3aed', secondary: '#f5f3ff', accent: '#f59e0b', background: '#fffdf5', text: '#1e1b4b' },
      logoPosition: 'center',
      header: 'SKILLFORGE ACADEMY',
      footer: 'Empowering teams through knowledge',
      coverLayout: 'diagonal',
      sectionStyle: 'filled',
      borderStyle: 'rounded',
      accentStyle: 'stripe',
      pricingStyle: 'highlight',
      timelineStyle: 'cards',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Training Program Proposal', subtitle: 'Empowering Teams Through Knowledge' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Course Overview', content: '<p>Our training programs are designed to upskill teams with practical, hands-on learning experiences.</p><p>We combine instructional design best practices with real-world case studies for maximum retention.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About the Instructor', content: '<p>Certified Instructional Designer (CID) and corporate trainer with 12+ years of experience delivering programs to 10,000+ professionals.</p><p><strong>Topics:</strong> Leadership, project management, digital transformation, data analytics, and team building.</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Curriculum Outline', content: '<ul><li>Module 1: Foundations & Core Concepts</li><li>Module 2: Practical Application & Tools</li><li>Module 3: Case Studies & Real-World Scenarios</li><li>Module 4: Assessment & Certification</li><li>Module 5: Ongoing Support & Resources</li></ul>', order: 3 },
      { id: '5', type: 'deliverables', title: 'Training Materials', content: '<ul><li>Comprehensive participant workbook (PDF)</li><li>Slide deck with speaker notes</li><li>Hands-on exercise files and templates</li><li>Video recordings of all sessions</li><li>Certificate of completion</li></ul>', order: 4 },
      { id: '6', type: 'pricing', title: 'Program Investment', content: { rows: [{ id: 'r1', item: 'Full-Day Workshop (6 hours)', description: 'Up to 25 participants, all materials', quantity: 1, unitPrice: 3000, total: 3000 }, { id: 'r2', item: 'Multi-Session Course (4 weeks)', description: 'Weekly 2-hour sessions + materials', quantity: 1, unitPrice: 5000, total: 5000 }, { id: 'r3', item: 'Custom Content Development', description: 'Tailored curriculum to your industry', quantity: 1, unitPrice: 2000, total: 2000 }], subtotal: 10000, discount: 1000, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 9000, currency: 'USD' }, order: 5 },
      { id: '7', type: 'testimonials', title: 'Training Reviews', content: '<p><strong>"The most engaging training session our team has attended. Practical and immediately applicable."</strong></p><p>— HR Director, GlobalTech Inc.</p><hr><p><strong>"Excellent content delivery. Our team productivity improved 25% after the program."</strong></p><p>— VP of Operations, ScaleUp Corp</p>', order: 6 },
      { id: '8', type: 'terms', title: 'Terms & Conditions', content: '<p>50% deposit upon booking confirmation. Balance due before session date.</p><p>Cancellations made 14+ days in advance receive full refund. 7-13 days: 50% refund. Within 7 days: credit toward future session.</p>', order: 7 },
    ],
  },

  // ============================================
  // 13. PODCAST — Full-Bleed + Glow + Minimal
  // ============================================
  {
    id: 'podcast',
    title: 'Podcast & Audio Production',
    description: 'Podcast launch, production, editing, distribution, and monetization.',
    category: 'podcast',
    tag: 'Audio',
    styles: {
      fonts: { heading: 'Manrope', body: 'Work Sans' },
      colors: { primary: '#18181b', secondary: '#f5f3ff', accent: '#8b5cf6', background: '#fefcff', text: '#18181b' },
      logoPosition: 'left',
      header: 'RESONANCE AUDIO',
      footer: 'Your voice, amplified',
      coverLayout: 'full-bleed',
      sectionStyle: 'minimal',
      borderStyle: 'rounded',
      accentStyle: 'glow',
      pricingStyle: 'standard',
      timelineStyle: 'vertical',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Podcast Production Proposal', subtitle: 'Your Voice, Amplified' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Show Concept', content: '<p>From concept to launch, we handle every aspect of podcast production so you can focus on creating great content.</p><p>Our end-to-end service covers recording, editing, distribution, and growth strategy.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About the Producer', content: '<p>Produced 50+ podcasts with 1M+ combined downloads. Expert in audio engineering, storytelling, and audience growth.</p><p><strong>Portfolio:</strong> Top 100 shows in Business, Technology, and Self-Improvement categories.</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Production Services', content: '<ul><li>Show branding and cover art design</li><li>Recording (studio or remote via Riverside.fm)</li><li>Audio editing and mixing</li><li>Show notes, transcripts, and SEO optimization</li><li>Distribution to all major platforms</li></ul>', order: 3 },
      { id: '5', type: 'pricing', title: 'Production Packages', content: { rows: [{ id: 'r1', item: 'Podcast Launch Package', description: 'Branding, pilot episodes, platform setup', quantity: 1, unitPrice: 2000, total: 2000 }, { id: 'r2', item: 'Monthly Production (4 episodes)', description: 'Editing, show notes, distribution', quantity: 1, unitPrice: 800, total: 800 }, { id: 'r3', item: 'Growth & Monetization', description: 'Sponsorship outreach, ad insertion setup', quantity: 1, unitPrice: 500, total: 500 }], subtotal: 3300, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 3300, currency: 'USD' }, order: 4 },
      { id: '6', type: 'terms', title: 'Terms', content: '<p>Monthly services billed on the 1st of each month. 30-day notice for cancellation.</p><p>All audio files and raw recordings remain property of the client.</p>', order: 5 },
    ],
  },

  // ============================================
  // 14. FOOD & HOSPITALITY — Split + Dots + Cards
  // ============================================
  {
    id: 'food-hospitality',
    title: 'Food & Hospitality',
    description: 'Restaurant consulting, catering services, event menus, and hospitality management.',
    category: 'food',
    tag: 'Hospitality',
    styles: {
      fonts: { heading: 'Fraunces', body: 'Commissioner' },
      colors: { primary: '#78350f', secondary: '#fef3c7', accent: '#dc2626', background: '#fffdf5', text: '#451a03' },
      logoPosition: 'center',
      header: 'SAVORY TABLE CO.',
      footer: 'Exceptional dining, every time',
      coverLayout: 'split',
      sectionStyle: 'cards',
      borderStyle: 'pill',
      accentStyle: 'dots',
      pricingStyle: 'highlight',
      timelineStyle: 'steps',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Catering & Hospitality Proposal', subtitle: 'Exceptional Dining Experiences' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Concept Overview', content: '<p>We create memorable culinary experiences that leave lasting impressions on your guests.</p><p>From menu curation to event execution, every detail is crafted with passion and precision.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About the Chef', content: '<p>Culinary Institute graduate with 15+ years in fine dining and event catering.</p><p><strong>Specialties:</strong> Farm-to-table cuisine, international fusion, dietary-inclusive menus (vegan, gluten-free, halal).</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Menu & Service', content: '<ul><li>Custom menu development and tasting session</li><li>Fresh, locally-sourced ingredients</li><li>Full-service catering staff (chefs, servers, bartenders)</li><li>Table settings, linens, and presentation</li><li>Bar service and signature cocktail creation</li></ul>', order: 3 },
      { id: '5', type: 'pricing', title: 'Catering Packages', content: { rows: [{ id: 'r1', item: 'Plated Dinner Service', description: '3-course meal, per person', quantity: 50, unitPrice: 85, total: 4250 }, { id: 'r2', item: 'Cocktail Reception', description: 'Passed hors d\'oeuvres, 2 hours', quantity: 50, unitPrice: 45, total: 2250 }, { id: 'r3', item: 'Premium Bar Service', description: 'Full bar with signature cocktails', quantity: 50, unitPrice: 35, total: 1750 }], subtotal: 8250, discount: 500, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 7750, currency: 'USD' }, order: 4 },
      { id: '6', type: 'terms', title: 'Terms & Allergies', content: '<p>Final guest count confirmed 7 days before event. 50% deposit upon booking, balance due day of event.</p><p>All dietary restrictions and allergies must be communicated at least 5 days in advance. We accommodate all dietary needs.</p>', order: 5 },
    ],
  },

  // ============================================
  // 15. CRYPTO & WEB3 — Standard + Gradient + Striped
  // ============================================
  {
    id: 'crypto-web3',
    title: 'Crypto & Web3 Project',
    description: 'Blockchain development, tokenomics, smart contracts, and DeFi protocols.',
    category: 'crypto',
    tag: 'Web3',
    styles: {
      fonts: { heading: 'Chakra Petch', body: 'Space Grotesk' },
      colors: { primary: '#09090b', secondary: '#faf5ff', accent: '#a855f7', background: '#fefcff', text: '#09090b' },
      logoPosition: 'left',
      header: 'NEXUS CHAIN',
      footer: 'Decentralized by design',
      coverLayout: 'standard',
      sectionStyle: 'striped',
      borderStyle: 'sharp',
      accentStyle: 'gradient',
      pricingStyle: 'compact',
      timelineStyle: 'horizontal',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Web3 Project Proposal', subtitle: 'Building the Decentralized Future' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Vision & Roadmap', content: '<p>Our team specializes in building secure, scalable blockchain solutions that push the boundaries of decentralized technology.</p><p>From token launches to DeFi protocols, we deliver production-grade Web3 infrastructure.</p>', order: 1 },
      { id: '3', type: 'scope', title: 'Technical Architecture', content: '<ul><li>Smart contract development (Solidity/Rust)</li><li>DeFi protocol design and implementation</li><li>NFT marketplace and minting platform</li><li>Cross-chain bridge infrastructure</li><li>DAO governance framework</li></ul>', order: 2 },
      { id: '4', type: 'features', title: 'Security & Compliance', content: '<ul><li>Multi-signature wallet integration</li><li>Formal verification of smart contracts</li><li>Third-party security audit coordination</li><li>KYC/AML compliance framework</li><li>Emergency pause and upgrade mechanisms</li></ul>', order: 3 },
      { id: '5', type: 'pricing', title: 'Development Investment', content: { rows: [{ id: 'r1', item: 'Smart Contract Suite', description: 'Core contracts + testing + deployment', quantity: 1, unitPrice: 12000, total: 12000 }, { id: 'r2', item: 'Frontend dApp Development', description: 'Web3 wallet integration, UI/UX', quantity: 1, unitPrice: 8000, total: 8000 }, { id: 'r3', item: 'Security Audit Coordination', description: 'Audit prep and remediation', quantity: 1, unitPrice: 3000, total: 3000 }], subtotal: 23000, discount: 0, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 23000, currency: 'USD' }, order: 4 },
      { id: '6', type: 'timeline', title: 'Development Timeline', content: [{ id: 't1', title: 'Tokenomics & Architecture', description: 'Token design, protocol architecture', date: '2026-02-01', completed: false }, { id: 't2', title: 'Smart Contract Development', description: 'Core contracts, testing, deployment', date: '2026-03-15', completed: false }, { id: 't3', title: 'Frontend & Integration', description: 'dApp UI, wallet integration', date: '2026-04-30', completed: false }, { id: 't4', title: 'Audit & Launch', description: 'Security audit, testnet, mainnet launch', date: '2026-06-01', completed: false }], order: 5 },
      { id: '7', type: 'terms', title: 'Terms & Governance', content: '<p>Milestone-based payments tied to deliverables. All smart contracts undergo third-party security audit before mainnet deployment.</p><p>IP and code ownership transfers to the project upon final payment. Ongoing maintenance available on retainer.</p>', order: 6 },
    ],
  },

  // ============================================
  // 16. ECOMMERCE — Centered + Stripe + Filled
  // ============================================
  {
    id: 'ecommerce',
    title: 'E-commerce & Retail',
    description: 'Online store development, product strategy, and digital commerce solutions.',
    category: 'ecommerce',
    tag: 'Commerce',
    styles: {
      fonts: { heading: 'Sora', body: 'Plus Jakarta Sans' },
      colors: { primary: '#991b1b', secondary: '#fef2f2', accent: '#f97316', background: '#fffdf8', text: '#1c1917' },
      logoPosition: 'left',
      header: 'COMMERCE STUDIO',
      footer: 'Sell more, scale faster',
      coverLayout: 'centered',
      sectionStyle: 'filled',
      borderStyle: 'rounded',
      accentStyle: 'stripe',
      pricingStyle: 'highlight',
      timelineStyle: 'cards',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'E-commerce Solution Proposal', subtitle: 'Sell More, Scale Faster' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Business Overview', content: '<p>Our e-commerce solutions are designed to maximize conversions and streamline operations.</p><p>From storefront design to payment optimization, we build stores that sell.</p>', order: 1 },
      { id: '3', type: 'scope', title: 'Platform & Tech', content: '<ul><li>Shopify Plus / WooCommerce / Custom solution</li><li>Payment gateway integration (Stripe, PayPal, crypto)</li><li>Inventory management and order fulfillment</li><li>Mobile-optimized checkout flow</li><li>SEO and performance optimization</li></ul>', order: 2 },
      { id: '4', type: 'features', title: 'Key Features', content: '<ul><li>Product search with filters and sorting</li><li>Customer accounts and wishlists</li><li>Abandoned cart recovery emails</li><li>Loyalty and rewards program</li><li>Multi-currency and multi-language support</li></ul>', order: 3 },
      { id: '5', type: 'pricing', title: 'Development Investment', content: { rows: [{ id: 'r1', item: 'E-commerce Store Development', description: 'Custom theme + core features', quantity: 1, unitPrice: 6000, total: 6000 }, { id: 'r2', item: 'Payment & Shipping Setup', description: 'Gateway integration, shipping rules', quantity: 1, unitPrice: 1500, total: 1500 }, { id: 'r3', item: 'Marketing Integration', description: 'Email, analytics, social commerce', quantity: 1, unitPrice: 1000, total: 1000 }], subtotal: 8500, discount: 500, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 8000, currency: 'USD' }, order: 4 },
      { id: '6', type: 'terms', title: 'Terms', content: '<p>Payment: 40% upfront, 30% at design approval, 30% at launch.</p><p>Post-launch support: 30 days included. Monthly maintenance packages available.</p>', order: 5 },
    ],
  },

  // ============================================
  // 17. NONPROFIT — Sidebar + Lines + Bordered
  // ============================================
  {
    id: 'nonprofit',
    title: 'Non-Profit & Social Impact',
    description: 'Grant proposals, program design, fundraising strategy, and impact measurement.',
    category: 'nonprofit',
    tag: 'Social Impact',
    styles: {
      fonts: { heading: 'Atkinson Hyperlegible', body: 'Source Sans 3' },
      colors: { primary: '#1e40af', secondary: '#eff6ff', accent: '#f472b6', background: '#fefcff', text: '#1e3a5f' },
      logoPosition: 'left',
      header: 'HOPE FORWARD',
      footer: 'Creating lasting change together',
      coverLayout: 'sidebar',
      sectionStyle: 'bordered',
      borderStyle: 'pill',
      accentStyle: 'lines',
      pricingStyle: 'standard',
      timelineStyle: 'vertical',
    },
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { title: 'Social Impact Program', subtitle: 'Creating Lasting Change Together' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Mission Summary', content: '<p>Our program is designed to create measurable social impact in underserved communities.</p><p>Through evidence-based interventions and community partnerships, we drive meaningful, sustainable change.</p>', order: 1 },
      { id: '3', type: 'about_me', title: 'About the Organization', content: '<p>A 501(c)(3) nonprofit with 10+ years of experience in community development, education, and economic empowerment.</p><p><strong>Impact:</strong> 50,000+ lives touched across 25 communities in 8 countries.</p>', order: 2 },
      { id: '4', type: 'scope', title: 'Program Goals', content: '<ul><li>Education access for 1,000+ children</li><li>Micro-enterprise training for 200 entrepreneurs</li><li>Community health outreach in 10 villages</li><li>Clean water access for 5 communities</li></ul>', order: 3 },
      { id: '5', type: 'pricing', title: 'Budget & Funding', content: { rows: [{ id: 'r1', item: 'Education Program', description: 'Materials, teachers, school supplies', quantity: 1, unitPrice: 15000, total: 15000 }, { id: 'r2', item: 'Micro-Enterprise Training', description: 'Curriculum, mentors, seed funding', quantity: 1, unitPrice: 10000, total: 10000 }, { id: 'r3', item: 'Health & Water Initiative', description: 'Medical supplies, water systems', quantity: 1, unitPrice: 20000, total: 20000 }], subtotal: 45000, discount: 5000, discountType: 'fixed', tax: 0, taxType: 'fixed', total: 40000, currency: 'USD' }, order: 4 },
      { id: '6', type: 'terms', title: 'Partnership Terms', content: '<p>Funding disbursed in quarterly installments tied to program milestones and impact reporting.</p><p>Full financial transparency with quarterly impact reports and independent audit.</p>', order: 5 },
    ],
  },
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): TemplateDefinition[] {
  if (category === 'all') return ALL_TEMPLATES;
  return ALL_TEMPLATES.filter((t) => t.category === category);
}
