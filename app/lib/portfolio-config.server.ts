import { prisma } from "./db.server";

export interface SectionConfig {
  id: string;
  type: 'profile' | 'experiences' | 'skills' | 'custom';
  order: number;
  isVisible: boolean;
  layout: string;
  sectionId?: string; // For custom sections
}

export interface PortfolioConfigData {
  userId: string;
  sectionOrder?: SectionConfig[];
  layoutType?: string;
  theme?: string;
  primaryColor?: string;
  fontFamily?: string;
  spacing?: string;
  showProfileImage?: boolean;
  showSocialLinks?: boolean;
  showContactInfo?: boolean;
  customCSS?: string;
  animationsEnabled?: boolean;
}

export interface PortfolioConfig {
  id: string;
  userId: string;
  sectionOrder: SectionConfig[];
  layoutType: string;
  theme: string;
  primaryColor: string;
  fontFamily: string;
  spacing: string;
  showProfileImage: boolean;
  showSocialLinks: boolean;
  showContactInfo: boolean;
  customCSS: string | null;
  animationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Portfolio Config Functions
export async function getPortfolioConfig(userId: string): Promise<PortfolioConfig | null> {
  const client = await prisma;
  
  if (!client) {
    throw new Error("Prisma client is undefined");
  }
  
  const config = await client.portfolioConfig.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      sectionOrder: true,
      layoutType: true,
      theme: true,
      primaryColor: true,
      fontFamily: true,
      spacing: true,
      showProfileImage: true,
      showSocialLinks: true,
      showContactInfo: true,
      customCSS: true,
      animationsEnabled: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return config as PortfolioConfig | null;
}

export async function createPortfolioConfig(data: PortfolioConfigData): Promise<PortfolioConfig> {
  const client = await prisma;
  
  if (!client) {
    throw new Error("Prisma client is undefined");
  }
  
  const config = await client.portfolioConfig.create({
    data: {
      userId: data.userId,
      sectionOrder: (data.sectionOrder || []) as any,
      layoutType: data.layoutType || 'default',
      theme: data.theme || 'light',
      primaryColor: data.primaryColor || '#3b82f6',
      fontFamily: data.fontFamily || 'Inter',
      spacing: data.spacing || 'comfortable',
      showProfileImage: data.showProfileImage ?? true,
      showSocialLinks: data.showSocialLinks ?? true,
      showContactInfo: data.showContactInfo ?? true,
      customCSS: data.customCSS || null,
      animationsEnabled: data.animationsEnabled ?? true,
    },
    select: {
      id: true,
      userId: true,
      sectionOrder: true,
      layoutType: true,
      theme: true,
      primaryColor: true,
      fontFamily: true,
      spacing: true,
      showProfileImage: true,
      showSocialLinks: true,
      showContactInfo: true,
      customCSS: true,
      animationsEnabled: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return config as unknown as PortfolioConfig;
}

export async function updatePortfolioConfig(userId: string, data: Partial<PortfolioConfigData>): Promise<PortfolioConfig> {
  const client = await prisma;
  
  if (!client) {
    throw new Error("Prisma client is undefined");
  }
  
  const config = await client.portfolioConfig.upsert({
    where: { userId },
    update: {
      ...data,
      sectionOrder: data.sectionOrder ? (data.sectionOrder as any) : undefined,
    },
    create: {
      userId,
      sectionOrder: (data.sectionOrder || []) as any,
      layoutType: data.layoutType || 'default',
      theme: data.theme || 'light',
      primaryColor: data.primaryColor || '#3b82f6',
      fontFamily: data.fontFamily || 'Inter',
      spacing: data.spacing || 'comfortable',
      showProfileImage: data.showProfileImage ?? true,
      showSocialLinks: data.showSocialLinks ?? true,
      showContactInfo: data.showContactInfo ?? true,
      customCSS: data.customCSS || null,
      animationsEnabled: data.animationsEnabled ?? true,
    },
    select: {
      id: true,
      userId: true,
      sectionOrder: true,
      layoutType: true,
      theme: true,
      primaryColor: true,
      fontFamily: true,
      spacing: true,
      showProfileImage: true,
      showSocialLinks: true,
      showContactInfo: true,
      customCSS: true,
      animationsEnabled: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return config as unknown as PortfolioConfig;
}

// Helper function to ensure a user has a portfolio config (creates one if missing)
export async function ensurePortfolioConfig(userId: string): Promise<PortfolioConfig> {
  let config = await getPortfolioConfig(userId);
  
  if (!config) {
    // Create default config for existing user
    config = await createPortfolioConfig({
      userId,
      sectionOrder: [
        { id: 'profile', type: 'profile', order: 1, isVisible: true, layout: 'default' },
        { id: 'experiences', type: 'experiences', order: 2, isVisible: true, layout: 'default' },
        { id: 'skills', type: 'skills', order: 3, isVisible: true, layout: 'default' }
      ],
      layoutType: 'default',
      theme: 'light',
      primaryColor: '#3b82f6',
      fontFamily: 'Inter',
      spacing: 'comfortable',
      showProfileImage: true,
      showSocialLinks: true,
      showContactInfo: true,
      animationsEnabled: true
    });
  }
  
  return config;
}
