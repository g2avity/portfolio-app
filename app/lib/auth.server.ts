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
  email: string;
  username: string;
  firstName: string;
  lastName: string;
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

    // Temporarily return a mock user for testing
    // TODO: Implement proper database authentication
    return {
      id: "temp-user-id",
      email: email,
      username: email.split('@')[0],
      firstName: "Test",
      lastName: "User"
    };
  }),
  "user-pass"
);

// export { prisma };
