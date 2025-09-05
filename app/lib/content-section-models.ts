// Content Section Models and Helpers
// Defines the structure for different types of custom content sections

// Base interface for all custom sections
export interface BaseCustomSection {
  type: string;
  layout: 'grid' | 'list' | 'timeline' | 'cards';
  isPublic: boolean;
  order: number;
  allowImages: boolean;
  allowCode: boolean;
  maxEntries?: number;
  entries: any[]; // Array of section-specific entries
}

// Common field interfaces for reuse
export interface BaseEntry {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DateRangeEntry extends BaseEntry {
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface ImageEntry extends BaseEntry {
  images?: string[];
  imageUrls?: string[];
}

export interface CodeEntry extends BaseEntry {
  codeSnippets?: {
    language: string;
    code: string;
    description?: string;
  }[];
}

// STAR Memo specific structure
export interface StarMemoSection extends BaseCustomSection {
  type: 'star-memo';
  layout: 'timeline';
  fields: ['title', 'situation', 'task', 'action', 'result'];
  allowImages: true;
  allowCode: false;
  maxEntries: 10;
  template: {
    title: { label: string; required: boolean; type: 'text' };
    situation: { label: string; required: boolean; type: 'textarea' };
    task: { label: string; required: boolean; type: 'textarea' };
    action: { label: string; required: boolean; type: 'textarea' };
    result: { label: string; required: boolean; type: 'textarea' };
  };
  entries: StarMemoEntry[];
}

export interface StarMemoEntry extends BaseEntry {
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  images?: string[];
}

// Project Showcase structure
export interface ProjectShowcaseSection extends BaseCustomSection {
  type: 'project-showcase';
  layout: 'grid';
  fields: ['title', 'description', 'technologies', 'outcome', 'images'];
  allowImages: true;
  allowCode: true;
  maxProjects: 6;
  template: {
    title: { label: string; required: boolean; type: 'text' };
    description: { label: string; required: boolean; type: 'textarea' };
    technologies: { label: string; required: false; type: 'tags' };
    outcome: { label: string; required: true; type: 'textarea' };
    images: { label: string; required: false; type: 'image-gallery' };
  };
  entries: ProjectShowcaseEntry[];
}

export interface ProjectShowcaseEntry extends BaseEntry, ImageEntry, CodeEntry {
  title: string;
  description: string;
  technologies: string[];
  outcome: string;
  projectUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
}

// Community Engagement structure
export interface CommunityEngagementSection extends BaseCustomSection {
  type: 'community-engagement';
  layout: 'list';
  fields: ['event', 'role', 'date', 'description', 'impact'];
  allowImages: true;
  allowCode: false;
  template: {
    event: { label: string; required: boolean; type: 'text' };
    role: { label: string; required: true; type: 'text' };
    date: { label: string; required: true; type: 'date' };
    description: { label: string; required: true; type: 'textarea' };
    impact: { label: string; required: false; type: 'textarea' };
  };
  entries: CommunityEngagementEntry[];
}

export interface CommunityEngagementEntry extends BaseEntry, DateRangeEntry, ImageEntry {
  event: string;
  role: string;
  description: string;
  impact?: string;
  organizationUrl?: string;
}

// Speaking Engagements structure
export interface SpeakingEngagementsSection extends BaseCustomSection {
  type: 'speaking-engagements';
  layout: 'timeline';
  fields: ['event', 'title', 'date', 'audience', 'description', 'slides'];
  allowImages: true;
  allowCode: false;
  template: {
    event: { label: string; required: boolean; type: 'text' };
    title: { label: string; required: boolean; type: 'text' };
    date: { label: string; required: true; type: 'date' };
    audience: { label: string; required: false; type: 'text' };
    description: { label: string; required: true; type: 'textarea' };
    slides: { label: string; required: false; type: 'url' };
  };
  entries: SpeakingEngagementsEntry[];
}

export interface SpeakingEngagementsEntry extends BaseEntry, DateRangeEntry, ImageEntry {
  event: string;
  title: string;
  audience?: string;
  description: string;
  slides?: string;
  recordingUrl?: string;
  eventUrl?: string;
}

// Certifications structure
export interface CertificationsSection extends BaseCustomSection {
  type: 'certifications';
  layout: 'cards';
  fields: ['name', 'issuer', 'date', 'expiry', 'credentialId', 'description'];
  allowImages: true;
  allowCode: false;
  template: {
    name: { label: string; required: boolean; type: 'text' };
    issuer: { label: string; required: boolean; type: 'text' };
    date: { label: string; required: true; type: 'date' };
    expiry: { label: string; required: false; type: 'date' };
    credentialId: { label: string; required: false; type: 'text' };
    description: { label: string; required: false; type: 'textarea' };
  };
  entries: CertificationEntry[];
}

export interface CertificationEntry extends BaseEntry, ImageEntry {
  name: string;
  issuer: string;
  date: string;
  expiry?: string;
  credentialId?: string;
  description?: string;
  issuerUrl?: string;
  verificationUrl?: string;
}

// User-defined custom section
export interface UserDefinedSection extends BaseCustomSection {
  type: 'custom';
  layout: 'grid' | 'list' | 'timeline' | 'cards';
  fields: string[];
  template: Record<string, {
    label: string;
    required: boolean;
    type: 'text' | 'textarea' | 'date' | 'number' | 'url' | 'tags' | 'image-gallery';
    placeholder?: string;
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
    };
  }>;
  entries: Record<string, any>[];
}

// Union type for all predefined sections
export type PredefinedSectionType = 
  | StarMemoSection 
  | ProjectShowcaseSection 
  | CommunityEngagementSection
  | SpeakingEngagementsSection
  | CertificationsSection;

// All possible section types
export type SectionType = PredefinedSectionType | UserDefinedSection;

// Predefined section templates with empty entries arrays
export const STAR_MEMO_TEMPLATE: StarMemoSection = {
  type: 'star-memo',
  layout: 'timeline',
  isPublic: true,
  order: 1,
  allowImages: true,
  allowCode: false,
  maxEntries: 10,
  fields: ['title', 'situation', 'task', 'action', 'result'],
  entries: [],
  template: {
    title: { label: 'Title', required: true, type: 'text' },
    situation: { label: 'Situation', required: true, type: 'textarea' },
    task: { label: 'Task', required: true, type: 'textarea' },
    action: { label: 'Action', required: true, type: 'textarea' },
    result: { label: 'Result', required: true, type: 'textarea' },
  },
};

export const PROJECT_SHOWCASE_TEMPLATE: ProjectShowcaseSection = {
  type: 'project-showcase',
  layout: 'grid',
  isPublic: true,
  order: 2,
  allowImages: true,
  allowCode: true,
  maxProjects: 6,
  fields: ['title', 'description', 'technologies', 'outcome', 'images'],
  entries: [],
  template: {
    title: { label: 'Project Title', required: true, type: 'text' },
    description: { label: 'Description', required: true, type: 'textarea' },
    technologies: { label: 'Technologies Used', required: false, type: 'tags' },
    outcome: { label: 'Outcome/Results', required: true, type: 'textarea' },
    images: { label: 'Project Images', required: false, type: 'image-gallery' },
  },
};

export const COMMUNITY_ENGAGEMENT_TEMPLATE: CommunityEngagementSection = {
  type: 'community-engagement',
  layout: 'list',
  isPublic: true,
  order: 3,
  allowImages: true,
  allowCode: false,
  fields: ['event', 'role', 'date', 'description', 'impact'],
  entries: [],
  template: {
    event: { label: 'Event/Organization', required: true, type: 'text' },
    role: { label: 'Your Role', required: true, type: 'text' },
    date: { label: 'Date', required: true, type: 'date' },
    description: { label: 'Description', required: true, type: 'textarea' },
    impact: { label: 'Impact/Outcome', required: false, type: 'textarea' },
  },
};

export const SPEAKING_ENGAGEMENTS_TEMPLATE: SpeakingEngagementsSection = {
  type: 'speaking-engagements',
  layout: 'timeline',
  isPublic: true,
  order: 4,
  allowImages: true,
  allowCode: false,
  fields: ['event', 'title', 'date', 'audience', 'description', 'slides'],
  entries: [],
  template: {
    event: { label: 'Event/Conference', required: true, type: 'text' },
    title: { label: 'Presentation Title', required: true, type: 'text' },
    date: { label: 'Date', required: true, type: 'date' },
    audience: { label: 'Audience Size', required: false, type: 'text' },
    description: { label: 'Description', required: true, type: 'textarea' },
    slides: { label: 'Slides/Recording URL', required: false, type: 'url' },
  },
};

export const CERTIFICATIONS_TEMPLATE: CertificationsSection = {
  type: 'certifications',
  layout: 'cards',
  isPublic: true,
  order: 5,
  allowImages: true,
  allowCode: false,
  fields: ['name', 'issuer', 'date', 'expiry', 'credentialId', 'description'],
  entries: [],
  template: {
    name: { label: 'Certification Name', required: true, type: 'text' },
    issuer: { label: 'Issuing Organization', required: true, type: 'text' },
    date: { label: 'Date Earned', required: true, type: 'date' },
    expiry: { label: 'Expiry Date', required: false, type: 'date' },
    credentialId: { label: 'Credential ID', required: false, type: 'text' },
    description: { label: 'Description', required: false, type: 'textarea' },
  },
};

// All available templates
export const SECTION_TEMPLATES: Record<string, PredefinedSectionType> = {
  'star-memo': STAR_MEMO_TEMPLATE,
  'project-showcase': PROJECT_SHOWCASE_TEMPLATE,
  'community-engagement': COMMUNITY_ENGAGEMENT_TEMPLATE,
  'speaking-engagements': SPEAKING_ENGAGEMENTS_TEMPLATE,
  'certifications': CERTIFICATIONS_TEMPLATE,
};

// Helper functions
export function getPredefinedSectionTemplate(type: string): PredefinedSectionType | null {
  return SECTION_TEMPLATES[type] || null;
}

export function getAllSectionTypes(): string[] {
  return Object.keys(SECTION_TEMPLATES);
}

export function getSectionTemplateByType(type: string): PredefinedSectionType | null {
  return SECTION_TEMPLATES[type] || null;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateEntryId(): string {
  // Use crypto.randomUUID() if available, otherwise fall back to a simple counter
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `entry_${crypto.randomUUID()}`;
  }
  
  // Fallback for environments without crypto.randomUUID
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `entry_${timestamp}_${random}`;
}

export function validateSectionContent(
  content: any, 
  template: PredefinedSectionType | UserDefinedSection
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validation
  if (!content || typeof content !== 'object') {
    errors.push('Content must be an object');
    return { isValid: false, errors };
  }
  
  // Check required fields based on template
  if ('template' in template) {
    Object.entries(template.template).forEach(([fieldName, fieldConfig]) => {
      if (fieldConfig.required && !content[fieldName]) {
        errors.push(`Required field '${fieldName}' is missing`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function createSectionFromTemplate(
  type: string, 
  userId: string, 
  title: string,
  description?: string
): { 
  userId: string;
  title: string;
  slug: string;
  type: string;
  description?: string;
  content: PredefinedSectionType;
  isPublic: boolean;
  order: number;
  layout: string;
} {
  const template = getPredefinedSectionTemplate(type);
  if (!template) {
    throw new Error(`Unknown section type: ${type}`);
  }
  
  return {
    userId,
    title,
    slug: generateSlug(title),
    type: template.type,
    description,
    content: template,
    isPublic: template.isPublic,
    order: template.order,
    layout: template.layout,
  };
}

// Helper functions for managing entries
export function addEntryToSection<T extends BaseEntry>(
  sectionContent: any,
  newEntry: T
): any {
  if (!sectionContent.entries) {
    sectionContent.entries = [];
  }
  
  // Add ID and timestamps if not present
  const entryWithMetadata: T = {
    ...newEntry,
    id: newEntry.id || generateEntryId(),
    createdAt: newEntry.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return {
    ...sectionContent,
    entries: [...sectionContent.entries, entryWithMetadata]
  };
}

export function updateEntryInSection<T extends BaseEntry>(
  sectionContent: any,
  entryId: string,
  updatedEntry: Partial<T>
): any {
  if (!sectionContent.entries) {
    throw new Error('Section has no entries');
  }
  
  const entryIndex = sectionContent.entries.findIndex((entry: any) => entry.id === entryId);
  if (entryIndex === -1) {
    throw new Error(`Entry with ID ${entryId} not found`);
  }
  
  const updatedEntries = [...sectionContent.entries];
  updatedEntries[entryIndex] = {
    ...updatedEntries[entryIndex],
    ...updatedEntry,
    updatedAt: new Date().toISOString(),
  };
  
  return {
    ...sectionContent,
    entries: updatedEntries
  };
}

export function removeEntryFromSection(
  sectionContent: any,
  entryId: string
): any {
  if (!sectionContent.entries) {
    throw new Error('Section has no entries');
  }
  
  const filteredEntries = sectionContent.entries.filter((entry: any) => entry.id !== entryId);
  
  return {
    ...sectionContent,
    entries: filteredEntries
  };
}

export function getEntryById<T extends BaseEntry>(
  sectionContent: any,
  entryId: string
): T | null {
  if (!sectionContent.entries) {
    return null;
  }
  
  return sectionContent.entries.find((entry: any) => entry.id === entryId) || null;
}
