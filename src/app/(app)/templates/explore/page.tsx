'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreHelpers } from '@/lib/firebase/firestore';
import { Template } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

const TEMPLATE_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'branding', label: 'Branding' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'writing', label: 'Writing & Content' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
];

const PREBUILT_TEMPLATES: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: null,
    title: 'Web Development Proposal',
    description: 'A comprehensive template for web development projects including scope, deliverables, timeline, and pricing sections.',
    category: 'web-development',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { heading: 'Web Development Proposal', subheading: 'Professional Web Solutions' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Introduction', content: { text: 'We are excited to present our proposal for your web development project.' }, order: 1 },
      { id: '3', type: 'scope', title: 'Project Scope', content: { text: 'This project includes design, development, and deployment of your website.' }, order: 2 },
      { id: '4', type: 'features', title: 'Key Features', content: { items: ['Responsive Design', 'CMS Integration', 'SEO Optimization'] }, order: 3 },
      { id: '5', type: 'timeline', title: 'Timeline', content: { milestones: [] }, order: 4 },
      { id: '6', type: 'pricing', title: 'Pricing', content: { rows: [], subtotal: 0, discount: 0, discountType: 'percentage', tax: 0, taxType: 'percentage', total: 0, currency: 'INR' }, order: 5 },
      { id: '7', type: 'terms', title: 'Terms & Conditions', content: { text: 'Payment terms, revision policy, and other conditions.' }, order: 6 },
      { id: '8', type: 'contact', title: 'Contact Information', content: { text: 'We look forward to working with you.' }, order: 7 },
    ],
    styles: {
      fonts: { heading: 'Inter', body: 'Inter' },
      colors: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', background: '#ffffff', text: '#1f2937' },
      logoPosition: 'left',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'Mobile App Development',
    description: 'Tailored for mobile app projects with sections for platform details, app features, and development phases.',
    category: 'mobile-app',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { heading: 'Mobile App Proposal', subheading: 'iOS & Android Development' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Introduction', content: { text: 'Our team is ready to bring your mobile app idea to life.' }, order: 1 },
      { id: '3', type: 'overview', title: 'App Overview', content: { text: 'A detailed overview of the application concept and goals.' }, order: 2 },
      { id: '4', type: 'features', title: 'App Features', content: { items: ['Cross-platform Support', 'Offline Mode', 'Push Notifications'] }, order: 3 },
      { id: '5', type: 'deliverables', title: 'Deliverables', content: { items: ['Source Code', 'App Store Submission', 'Documentation'] }, order: 4 },
      { id: '6', type: 'timeline', title: 'Development Timeline', content: { milestones: [] }, order: 5 },
      { id: '7', type: 'pricing', title: 'Pricing', content: { rows: [], subtotal: 0, discount: 0, discountType: 'percentage', tax: 0, taxType: 'percentage', total: 0, currency: 'INR' }, order: 6 },
      { id: '8', type: 'terms', title: 'Terms', content: { text: 'Project terms and conditions.' }, order: 7 },
    ],
    styles: {
      fonts: { heading: 'Poppins', body: 'Inter' },
      colors: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6', background: '#ffffff', text: '#1f2937' },
      logoPosition: 'center',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'UI/UX Design Proposal',
    description: 'Perfect for design projects with user research, wireframing, prototyping, and testing phases.',
    category: 'ui-ux-design',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { heading: 'UI/UX Design Proposal', subheading: 'User-Centered Design' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Introduction', content: { text: 'We focus on creating intuitive and beautiful user experiences.' }, order: 1 },
      { id: '3', type: 'scope', title: 'Design Scope', content: { text: 'Research, wireframing, visual design, and usability testing.' }, order: 2 },
      { id: '4', type: 'features', title: 'Design Deliverables', content: { items: ['User Research Report', 'Wireframes', 'High-Fidelity Mockups', 'Interactive Prototype'] }, order: 3 },
      { id: '5', type: 'timeline', title: 'Design Timeline', content: { milestones: [] }, order: 4 },
      { id: '6', type: 'pricing', title: 'Pricing', content: { rows: [], subtotal: 0, discount: 0, discountType: 'percentage', tax: 0, taxType: 'percentage', total: 0, currency: 'INR' }, order: 5 },
      { id: '7', type: 'terms', title: 'Terms', content: { text: 'Design revision policy and intellectual property terms.' }, order: 6 },
    ],
    styles: {
      fonts: { heading: 'DM Sans', body: 'Inter' },
      colors: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#ffffff', text: '#1f2937' },
      logoPosition: 'right',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'Branding & Identity',
    description: 'For brand identity projects covering logo design, brand guidelines, and visual identity systems.',
    category: 'branding',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { heading: 'Branding Proposal', subheading: 'Creating Your Brand Identity' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Introduction', content: { text: 'Building a memorable brand that resonates with your audience.' }, order: 1 },
      { id: '3', type: 'scope', title: 'Branding Scope', content: { text: 'Logo design, brand guidelines, color palette, and typography.' }, order: 2 },
      { id: '4', type: 'features', title: 'Brand Deliverables', content: { items: ['Logo Design', 'Brand Style Guide', 'Business Cards', 'Letterhead'] }, order: 3 },
      { id: '5', type: 'timeline', title: 'Timeline', content: { milestones: [] }, order: 4 },
      { id: '6', type: 'pricing', title: 'Pricing', content: { rows: [], subtotal: 0, discount: 0, discountType: 'percentage', tax: 0, taxType: 'percentage', total: 0, currency: 'INR' }, order: 5 },
      { id: '7', type: 'terms', title: 'Terms', content: { text: 'Usage rights and ownership terms.' }, order: 6 },
    ],
    styles: {
      fonts: { heading: 'Playfair Display', body: 'Inter' },
      colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#ffffff', text: '#1f2937' },
      logoPosition: 'center',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'Digital Marketing',
    description: 'Comprehensive marketing proposal template with strategy, channels, KPIs, and campaign planning.',
    category: 'marketing',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { heading: 'Marketing Proposal', subheading: 'Digital Marketing Strategy' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Introduction', content: { text: 'Driving growth through data-driven marketing strategies.' }, order: 1 },
      { id: '3', type: 'scope', title: 'Marketing Scope', content: { text: 'SEO, social media, content marketing, and paid advertising.' }, order: 2 },
      { id: '4', type: 'features', title: 'Services', content: { items: ['SEO Optimization', 'Social Media Management', 'Content Creation', 'PPC Campaigns'] }, order: 3 },
      { id: '5', type: 'timeline', title: 'Campaign Timeline', content: { milestones: [] }, order: 4 },
      { id: '6', type: 'pricing', title: 'Pricing', content: { rows: [], subtotal: 0, discount: 0, discountType: 'percentage', tax: 0, taxType: 'percentage', total: 0, currency: 'INR' }, order: 5 },
      { id: '7', type: 'terms', title: 'Terms', content: { text: 'Campaign terms and reporting schedule.' }, order: 6 },
    ],
    styles: {
      fonts: { heading: 'Montserrat', body: 'Open Sans' },
      colors: { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
      logoPosition: 'left',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
  {
    userId: null,
    title: 'Consulting Services',
    description: 'Professional consulting proposal with problem analysis, recommendations, and implementation plan.',
    category: 'consulting',
    thumbnailUrl: '',
    thumbnailPublicId: '',
    sections: [
      { id: '1', type: 'cover', title: 'Cover Page', content: { heading: 'Consulting Proposal', subheading: 'Strategic Advisory Services' }, order: 0 },
      { id: '2', type: 'introduction', title: 'Introduction', content: { text: 'Expert consulting to help you achieve your business objectives.' }, order: 1 },
      { id: '3', type: 'requirements', title: 'Requirements Analysis', content: { text: 'Understanding your challenges and business goals.' }, order: 2 },
      { id: '4', type: 'scope', title: 'Engagement Scope', content: { text: 'Assessment, strategy development, and implementation support.' }, order: 3 },
      { id: '5', type: 'deliverables', title: 'Deliverables', content: { items: ['Analysis Report', 'Strategic Recommendations', 'Implementation Roadmap'] }, order: 4 },
      { id: '6', type: 'timeline', title: 'Timeline', content: { milestones: [] }, order: 5 },
      { id: '7', type: 'pricing', title: 'Pricing', content: { rows: [], subtotal: 0, discount: 0, discountType: 'percentage', tax: 0, taxType: 'percentage', total: 0, currency: 'INR' }, order: 6 },
      { id: '8', type: 'terms', title: 'Terms', content: { text: 'Confidentiality and engagement terms.' }, order: 7 },
    ],
    styles: {
      fonts: { heading: 'Georgia', body: 'Arial' },
      colors: { primary: '#1e3a5f', secondary: '#15294a', accent: '#2563eb', background: '#ffffff', text: '#1f2937' },
      logoPosition: 'left',
      header: '',
      footer: '',
    },
    isPublic: true,
  },
];

const CATEGORY_COLOR_MAP: Record<string, string> = {
  'web-development': 'bg-blue-100 text-blue-800',
  'mobile-app': 'bg-purple-100 text-purple-800',
  'ui-ux-design': 'bg-pink-100 text-pink-800',
  'branding': 'bg-amber-100 text-amber-800',
  'marketing': 'bg-emerald-100 text-emerald-800',
  'consulting': 'bg-slate-100 text-slate-800',
  'writing': 'bg-indigo-100 text-indigo-800',
  'photography': 'bg-rose-100 text-rose-800',
  'other': 'bg-gray-100 text-gray-800',
};

export default function ExploreTemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[]>(PREBUILT_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] = useState(templates);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingTemplateId, setSavingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = templates;

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    setFilteredTemplates(result);
  }, [selectedCategory, searchQuery, templates]);

  const handleUseTemplate = async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>, index: number) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setSavingTemplateId(`prebuilt-${index}`);
    try {
      const { userId: _, ...templateData } = template;
      await firestoreHelpers.createTemplate(user.uid, {
        ...templateData,
        isPublic: false,
      });
      router.push('/templates/my');
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setSavingTemplateId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore Templates</h1>
        <p className="text-gray-500 mt-1">Choose from pre-built templates to jumpstart your proposals.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            options={TEMPLATE_CATEGORIES}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => {
            const categoryColor = CATEGORY_COLOR_MAP[template.category] || CATEGORY_COLOR_MAP['other'];
            const isSaving = savingTemplateId === `prebuilt-${index}`;

            return (
              <Card key={index} className="flex flex-col">
                <div
                  className="h-40 rounded-t-lg"
                  style={{ backgroundColor: template.styles.colors.primary + '15' }}
                >
                  <div className="flex items-center justify-center h-full">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: template.styles.colors.primary }}
                    >
                      <span className="text-white text-2xl font-bold">{template.title[0]}</span>
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <span className={cn('shrink-0 text-xs font-medium px-2 py-1 rounded-full', categoryColor)}>
                      {TEMPLATE_CATEGORIES.find((c) => c.value === template.category)?.label || template.category}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{template.sections.length} sections</span>
                    <span>{template.styles.colors.primary}</span>
                  </div>
                  <Button
                    className="w-full"
                    loading={isSaving}
                    onClick={() => handleUseTemplate(template, index)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
