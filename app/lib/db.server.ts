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
  isPublic: boolean;
  portfolioSlug: string;
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
    isPublic: user.isPublic,
    portfolioSlug: user.portfolioSlug,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
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

// Auto-setup graceful shutdown
setupGracefulShutdown();
