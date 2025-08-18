import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { GoogleStrategy } from "@curvenote/remix-auth-google";
import { sessionStorage } from "./session.server";

// Temporarily disable Prisma for basic setup
// const prisma = new PrismaClient();

// Define the User type for authentication
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isPublic: boolean;
  portfolioSlug: string;
}

// Create the authenticator instance
export const authenticator = new Authenticator<User>();

// Google OAuth Strategy - temporarily disabled for basic setup
// We'll implement this after getting the basic auth working

// Form Strategy for email/password (optional fallback)
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    // TODO: Validate against database
    // For now, mock authentication
    if (email === "james@g2avity.com" && password === "password") {
      return {
        id: "user-123",
        username: "james-mcghee",
        firstName: "James",
        lastName: "McGhee",
        email: "james@g2avity.com",
        isPublic: true,
        portfolioSlug: "james-mcghee"
      };
    }

    throw new Error("Invalid credentials");
  }),
  "user-pass"
);

// export { prisma };
