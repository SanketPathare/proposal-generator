export type UserRole = 'user';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  profession: string;
  bio: string;
  profileImageUrl: string;
  profileImagePublicId: string;
  createdAt: Date;
  updatedAt: Date;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

export interface UserBranding {
  logoUrl: string;
  logoPublicId: string;
  brandName: string;
  email: string;
  phone: string;
  website: string;
  portfolioUrl: string;
}

export interface UserSettings {
  currency: string;
  country: string;
  language: string;
  defaultPaymentTerms: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export type SectionType = 
  | 'cover'
  | 'heading'
  | 'paragraph'
  | 'introduction'
  | 'about_me'
  | 'requirements'
  | 'overview'
  | 'scope'
  | 'features'
  | 'deliverables'
  | 'timeline'
  | 'pricing'
  | 'terms'
  | 'payment_terms'
  | 'portfolio'
  | 'testimonials'
  | 'conclusion'
  | 'contact';

export interface ProposalSection {
  id: string;
  type: SectionType;
  title: string;
  content: any;
  order: number;
  aiGenerated?: boolean;
}

export interface PricingTableRow {
  id: string;
  item: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PricingTableData {
  rows: PricingTableRow[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  taxType: 'percentage' | 'fixed';
  total: number;
  currency: string;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

export interface Proposal {
  id: string;
  userId: string;
  clientId: string | null;
  title: string;
  purpose: string;
  status: ProposalStatus;
  templateId: string | null;
  currency: string;
  sections: ProposalSection[];
  pricing: PricingTableData | null;
  shareId: string | null;
  sharedAt: Date | null;
  expiresAt: Date | null;
  passwordHash: string | null;
  viewCount: number;
  lastViewedAt: Date | null;
  acceptedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  userId: string | null;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  sections: ProposalSection[];
  styles: TemplateStyles;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateStyles {
  fonts: {
    heading: string;
    body: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  logoPosition: 'left' | 'center' | 'right';
  header: string;
  footer: string;
}

export type ContentCategory = 'about_me' | 'services' | 'payment_terms' | 'terms_conditions' | 'testimonials' | 'portfolio';

export interface SavedContent {
  id: string;
  userId: string;
  title: string;
  category: ContentCategory;
  content: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaAsset {
  url: string;
  publicId: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface AIProposalInput {
  purpose: string;
  clientName: string;
  projectDescription: string;
  services: string[];
  budget: string;
  timeline: string;
  additionalInstructions?: string;
}

export interface AISectionInput {
  sectionType: SectionType;
  context: {
    purpose: string;
    clientName: string;
    projectDescription: string;
    services: string[];
    existingSections: ProposalSection[];
  };
}

export interface AITransformInput {
  text: string;
  action: 'improve' | 'rewrite' | 'shorten' | 'expand' | 'professional' | 'simple' | 'fix_grammar';
}

export interface ShareableProposal {
  id: string;
  title: string;
  purpose: string;
  userId: string;
  userProfile: Pick<UserProfile, 'fullName' | 'profession' | 'profileImageUrl'>;
  userBranding: UserBranding;
  sections: ProposalSection[];
  pricing: PricingTableData | null;
  status: ProposalStatus;
  sharedAt: Date;
}

export interface ProposalAnalytics {
  proposalId: string;
  viewCount: number;
  lastViewedAt: Date | null;
  viewedBy: string[];
  acceptedAt: Date | null;
  rejectedAt: Date | null;
}

export interface DashboardStats {
  totalProposals: number;
  draftProposals: number;
  sentProposals: number;
  viewedProposals: number;
  acceptedProposals: number;
}