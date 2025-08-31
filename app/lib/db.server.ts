import bcrypt from "bcrypt";
import { singleton } from "./singleton";
import { createPortfolioConfig } from "./portfolio-config.server";

async function getPrismaClient() {
  const { PrismaClient } = await import("@prisma/client");
  
  const { DATABASE_URL } = process.env;
  
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  const databaseUrl = new URL(DATABASE_URL);
  console.log(`🔌 Setting up Prisma client to ${databaseUrl.host}`);
  
  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl.toString(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
  
  // Connect eagerly
  client.$connect();
  
  return client;
}

export const prisma = singleton("prisma", getPrismaClient);

export interface CreateUserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  portfolioSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create new user in database
export async function createUser(userData: CreateUserData): Promise<User> {
  const hashedPassword = await hashPassword(userData.password);
  const client = await prisma;
  
  const user = await client.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isPublic: false, // Default to private
      portfolioSlug: userData.username, // Use username as default slug
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: userData.email,
          password: hashedPassword,
        }
      }
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      bio: true,
      linkedinUrl: true,
      githubUrl: true,
      websiteUrl: true,
      avatarUrl: true,
      isPublic: true,
      portfolioSlug: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  // Create default portfolio configuration for the new user
  try {
    await createPortfolioConfig({
      userId: user.id,
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
  } catch (error) {
    console.error('Failed to create default portfolio config for user:', user.id, error);
    // Don't fail user creation if portfolio config creation fails
  }
  
  return user;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const client = await prisma;
  const user = await client.user.findUnique({
    where: { email },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      bio: true,
      linkedinUrl: true,
      githubUrl: true,
      websiteUrl: true,
      avatarUrl: true,
      isPublic: true,
      portfolioSlug: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return user;
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const client = await prisma;
  const user = await client.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      bio: true,
      linkedinUrl: true,
      githubUrl: true,
      websiteUrl: true,
      avatarUrl: true,
      isPublic: true,
      portfolioSlug: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return user;
}

// Find user by username/slug
export async function findUserBySlug(slug: string): Promise<User | null> {
  const client = await prisma;
  const user = await client.user.findUnique({
    where: { portfolioSlug: slug },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      bio: true,
      linkedinUrl: true,
      githubUrl: true,
      websiteUrl: true,
      avatarUrl: true,
      isPublic: true,
      portfolioSlug: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return user;
}

// Verify user credentials
export async function verifyUserCredentials(email: string, password: string): Promise<User | null> {
  const client = await prisma;
  const user = await client.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: {
          type: "credentials",
          provider: "credentials"
        }
      }
    }
  });
  
  if (!user || !user.accounts[0]?.password) {
    return null;
  }
  
  const isValidPassword = await verifyPassword(password, user.accounts[0].password);
  
  if (!isValidPassword) {
    return null;
  }
  
  // Return user without sensitive data
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    country: user.country,
    bio: user.bio,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl,
    websiteUrl: user.websiteUrl,
    avatarUrl: user.avatarUrl,
    isPublic: user.isPublic,
    portfolioSlug: user.portfolioSlug,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Create or link a user from an OAuth provider (e.g., Google)
export async function findOrCreateUserFromOAuth(params: {
  provider: string;
  providerAccountId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<User> {
  const { provider, providerAccountId, email } = params;
  const firstName = params.firstName ?? "";
  const lastName = params.lastName ?? "";
  const client = await prisma;

  // 1) If this provider account already exists, return its user
  const existingAccount = await client.account.findUnique({
    where: {
      provider_providerAccountId: { provider, providerAccountId },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          country: true,
          bio: true,
          linkedinUrl: true,
          githubUrl: true,
          websiteUrl: true,
          avatarUrl: true,
          isPublic: true,
          portfolioSlug: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (existingAccount?.user) {
    return existingAccount.user;
  }

  // 2) Try to find an existing user by email and link the new provider account
  const existingUser = await client.user.findUnique({
    where: { email },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      bio: true,
      linkedinUrl: true,
      githubUrl: true,
      websiteUrl: true,
      avatarUrl: true,
      isPublic: true,
      portfolioSlug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (existingUser) {
    await client.account.create({
      data: {
        userId: existingUser.id,
        type: provider,
        provider,
        providerAccountId,
      },
    });
    return existingUser;
  }

  // 3) Otherwise create a brand-new user and account
  const username = await generateUniqueUsername(client, email);

  const newUser = await client.user.create({
    data: {
      username,
      email,
      firstName,
      lastName,
      isPublic: false,
      portfolioSlug: username,
      accounts: {
        create: {
          type: provider,
          provider,
          providerAccountId,
        },
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      bio: true,
      linkedinUrl: true,
      githubUrl: true,
      websiteUrl: true,
      avatarUrl: true,
      isPublic: true,
      portfolioSlug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Create default portfolio configuration for the new OAuth user
  try {
    await createPortfolioConfig({
      userId: newUser.id,
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
  } catch (error) {
    console.error('Failed to create default portfolio config for OAuth user:', newUser.id, error);
    // Don't fail user creation if portfolio config creation fails
  }

  return newUser;
}

async function generateUniqueUsername(client: any, email: string): Promise<string> {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  let candidate = base || "user";
  let suffix = 0;

  while (true) {
    const exists = await client.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

// Close Prisma connection
export async function closePrisma() {
  const client = await prisma;
  await client.$disconnect();
}

// Graceful shutdown handler
export function setupGracefulShutdown() {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
      await closePrisma();
      console.log('✅ Prisma client disconnected');
      process.exit(0);
    });
  });
}

// Experience-related functions
export interface CreateExperienceData {
  title: string;
  companyName: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  location?: string;
  userId: string;
}

export interface Experience {
  id: string;
  title: string;
  companyName: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  location: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create new experience
export async function createExperience(data: CreateExperienceData): Promise<Experience> {
  const client = await prisma;
  
  const experience = await client.experience.create({
    data: {
      title: data.title,
      companyName: data.companyName,
      description: data.description,
      startDate: data.startDate,
      endDate: data.isCurrent ? null : data.endDate,
      isCurrent: data.isCurrent,
      location: data.location || null,
      userId: data.userId,
    },
    select: {
      id: true,
      title: true,
      companyName: true,
      description: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
      location: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return experience;
}

// Get experiences for a user
export async function getUserExperiences(userId: string): Promise<Experience[]> {
  const client = await prisma;
  
  const experiences = await client.experience.findMany({
    where: { userId },
    orderBy: [
      { isCurrent: 'desc' }, // Current positions first
      { endDate: 'desc' },   // Then by end date (most recent first)
      { startDate: 'desc' }  // Finally by start date
    ],
    select: {
      id: true,
      title: true,
      companyName: true,
      description: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
      location: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return experiences;
}

// Get experience count for a user
export async function getUserExperienceCount(userId: string): Promise<number> {
  const client = await prisma;
  
  const count = await client.experience.count({
    where: { userId }
  });
  
  return count;
}

// Update existing experience
export async function updateExperience(data: CreateExperienceData & { id: string }): Promise<Experience> {
  const client = await prisma;
  
  const experience = await client.experience.update({
    where: { id: data.id },
    data: {
      title: data.title,
      companyName: data.companyName,
      description: data.description,
      startDate: data.startDate,
      endDate: data.isCurrent ? null : data.endDate,
      isCurrent: data.isCurrent,
      location: data.location || null,
    },
    select: {
      id: true,
      title: true,
      companyName: true,
      description: true,
      startDate: true,
      endDate: true,
      isCurrent: true,
      location: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return experience;
}

// Delete experience
export async function deleteExperience(experienceId: string, userId: string): Promise<void> {
  const client = await prisma;
  
  // Verify ownership before deletion
  const experience = await client.experience.findUnique({
    where: { id: experienceId },
    select: { userId: true }
  });
  
  if (!experience || experience.userId !== userId) {
    throw new Error("Experience not found or access denied");
  }
  
  await client.experience.delete({
    where: { id: experienceId }
  });
}

// Skills-related functions
export interface CreateSkillData {
  name: string;
  description: string;
  category?: string;
  proficiency?: number;
  yearsOfExperience?: number;
  userId: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string | null;
  proficiency: number | null;
  yearsOfExperience: number | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create new skill
export async function createSkill(data: CreateSkillData): Promise<Skill> {
  const client = await prisma;
  
  const skill = await client.skill.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category || null,
      proficiency: data.proficiency || null,
      yearsOfExperience: data.yearsOfExperience || null,
      userId: data.userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      proficiency: true,
      yearsOfExperience: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return skill;
}

// Get skills for a user
export async function getUserSkills(userId: string): Promise<Skill[]> {
  const client = await prisma;
  
  const skills = await client.skill.findMany({
    where: { userId },
    orderBy: [
      { category: 'asc' },
      { name: 'asc' }
    ],
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      proficiency: true,
      yearsOfExperience: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return skills;
}

// Get skill count for a user
export async function getUserSkillCount(userId: string): Promise<number> {
  const client = await prisma;
  
  const count = await client.skill.count({
    where: { userId }
  });
  
  return count;
}

// Update existing skill
export async function updateSkill(data: CreateSkillData & { id: string }): Promise<Skill> {
  const client = await prisma;
  
  const skill = await client.skill.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      proficiency: data.proficiency,
      yearsOfExperience: data.yearsOfExperience,
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      proficiency: true,
      yearsOfExperience: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return skill;
}

// Delete skill
export async function deleteSkill(skillId: string, userId: string): Promise<void> {
  const client = await prisma;
  
  // Verify ownership before deletion
  const skill = await client.skill.findUnique({
    where: { id: skillId },
    select: { userId: true }
  });
  
  if (!skill || skill.userId !== userId) {
    throw new Error("Skill not found or access denied");
  }
  
  await client.skill.delete({
    where: { id: skillId }
  });
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
    avatarUrl?: string;
  }
): Promise<User> {
  const client = await prisma;
  
  try {
    const updatedUser = await client.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        country: true,
        bio: true,
        linkedinUrl: true,
        githubUrl: true,
        websiteUrl: true,
        avatarUrl: true,
        portfolioSlug: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        accounts: true,
        sessions: true,
      },
    });
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

// Auto-setup graceful shutdown
setupGracefulShutdown();

// Custom Section related functions
export interface CreateCustomSectionData {
  userId: string;
  title: string;
  slug: string;
  type: string;
  description?: string;
  isPublic: boolean;
  order: number;
  layout: string;
  content: any; // JSONB content with template and entries
}

export interface UpdateCustomSectionData {
  title?: string;
  slug?: string;
  description?: string;
  isPublic?: boolean;
  order?: number;
  layout?: string;
  content?: any;
}

export interface CustomSection {
  id: string;
  userId: string;
  title: string;
  slug: string;
  type: string;
  description: string | null;
  isPublic: boolean;
  order: number;
  layout: string;
  content: any;
  createdAt: Date;
  updatedAt: Date;
}

// Create new custom section
export async function createCustomSection(data: CreateCustomSectionData): Promise<CustomSection> {
  const client = await prisma;
  
  const customSection = await client.customSection.create({
    data: {
      userId: data.userId,
      title: data.title,
      slug: data.slug,
      type: data.type,
      description: data.description || null,
      isPublic: data.isPublic,
      order: data.order,
      layout: data.layout,
      content: data.content,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      slug: true,
      type: true,
      description: true,
      isPublic: true,
      order: true,
      layout: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return customSection;
}

// Get custom sections for a user
export async function getUserCustomSections(userId: string): Promise<CustomSection[]> {
  try {
    const client = await prisma;
    
    if (!client) {
      throw new Error("Prisma client is undefined");
    }
    
    if (!client.customSection) {
      throw new Error("customSection model is not available on Prisma client");
    }
    
    console.log("🔍 getUserCustomSections - Client:", !!client, "CustomSection model:", !!client.customSection);
    
    const customSections = await client.customSection.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        userId: true,
        title: true,
        slug: true,
        type: true,
        description: true,
        isPublic: true,
        order: true,
        layout: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    console.log("✅ getUserCustomSections - Found", customSections.length, "sections");
    return customSections;
  } catch (error) {
    console.error("❌ getUserCustomSections error:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      userId
    });
    throw error;
  }
}

// Get custom section by ID
export async function getCustomSectionById(id: string, userId: string): Promise<CustomSection | null> {
  const client = await prisma;
  
  const customSection = await client.customSection.findFirst({
    where: { 
      id,
      userId // Ensure user owns this section
    },
    select: {
      id: true,
      userId: true,
      title: true,
      slug: true,
      type: true,
      description: true,
      isPublic: true,
      order: true,
      layout: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return customSection;
}

// Get custom section by slug
export async function getCustomSectionBySlug(slug: string, userId: string): Promise<CustomSection | null> {
  const client = await prisma;
  
  const customSection = await client.customSection.findFirst({
    where: { 
      slug,
      userId // Ensure user owns this section
    },
    select: {
      id: true,
      userId: true,
      title: true,
      slug: true,
      type: true,
      description: true,
      isPublic: true,
      order: true,
      layout: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return customSection;
}

// Update custom section
export async function updateCustomSection(
  id: string, 
  userId: string, 
  data: UpdateCustomSectionData
): Promise<CustomSection> {
  const client = await prisma;
  
  // Verify ownership before update
  const existingSection = await client.customSection.findUnique({
    where: { id },
    select: { userId: true }
  });
  
  if (!existingSection || existingSection.userId !== userId) {
    throw new Error("Custom section not found or access denied");
  }
  
  const updatedSection = await client.customSection.update({
    where: { id },
    data,
    select: {
      id: true,
      userId: true,
      title: true,
      slug: true,
      type: true,
      description: true,
      isPublic: true,
      order: true,
      layout: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return updatedSection;
}

// Delete custom section
export async function deleteCustomSection(id: string, userId: string): Promise<void> {
  const client = await prisma;
  
  // Verify ownership before deletion
  const customSection = await client.customSection.findUnique({
    where: { id },
    select: { userId: true }
  });
  
  if (!customSection || customSection.userId !== userId) {
    throw new Error("Custom section not found or access denied");
  }
  
  await client.customSection.delete({
    where: { id }
  });
}

// Get custom section count for a user
export async function getUserCustomSectionCount(userId: string): Promise<number> {
  const client = await prisma;
  
  const count = await client.customSection.count({
    where: { userId }
  });
  
  return count;
}

// Reorder custom sections
export async function reorderCustomSections(
  userId: string, 
  sectionOrders: Array<{ id: string; order: number }>
): Promise<void> {
  const client = await prisma;
  
  // Verify all sections belong to the user
  const sectionIds = sectionOrders.map(s => s.id);
  const userSections = await client.customSection.findMany({
    where: { 
      id: { in: sectionIds },
      userId 
    },
    select: { id: true }
  });
  
  if (userSections.length !== sectionIds.length) {
    throw new Error("Some sections not found or access denied");
  }
  
  // Update each section's order
  for (const { id, order } of sectionOrders) {
    await client.customSection.update({
      where: { id },
      data: { order }
    });
  }
}

// Get public custom sections for portfolio display
export async function getPublicCustomSections(portfolioSlug: string): Promise<CustomSection[]> {
  const client = await prisma;
  
  const customSections = await client.customSection.findMany({
    where: {
      user: { portfolioSlug },
      isPublic: true
    },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      userId: true,
      title: true,
      slug: true,
      type: true,
      description: true,
      isPublic: true,
      order: true,
      layout: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return customSections;
}



// Copy template to create user's custom section
export async function copyTemplateToUserSection(
  userId: string,
  templateType: string,
  title: string,
  description?: string
): Promise<CustomSection> {
  const client = await prisma;
  
  // Find the template
  const template = await client.customSection.findFirst({
    where: { 
      type: templateType,
      user: { id: { not: userId } } // Not owned by the current user
    },
    select: { content: true }
  });
  
  if (!template) {
    throw new Error(`Template '${templateType}' not found`);
  }
  
  // Generate unique slug
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let slug = baseSlug;
  let counter = 1;
  
  while (await client.customSection.findFirst({ where: { userId, slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  // Get the next order number
  const maxOrder = await client.customSection.aggregate({
    where: { userId },
    _max: { order: true }
  });
  
  const nextOrder = (maxOrder._max.order || 0) + 1;
  
  // Create the new section
  const customSection = await client.customSection.create({
    data: {
      userId,
      title,
      slug,
      type: templateType,
      description: description || null,
      isPublic: true,
      order: nextOrder,
      layout: (template.content as any)?.layout || 'default',
      content: template.content as any,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      slug: true,
      type: true,
      description: true,
      isPublic: true,
      order: true,
      layout: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  
  return customSection;
}
