import bcrypt from "bcrypt";
import { singleton } from "./singleton";

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

const prisma = singleton("prisma", getPrismaClient);

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
