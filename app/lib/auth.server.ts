import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { GoogleStrategy } from "@curvenote/remix-auth-google";
import { PrismaClient } from "../generated/prisma";
import { sessionStorage } from "./session.server";

// Initialize Prisma client
const prisma = new PrismaClient();

// Define the User type for authentication
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

// Create the authenticator instance
export const authenticator = new Authenticator<User>(sessionStorage);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authenticator.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
      },
      async ({ accessToken, refreshToken, extraParams, profile }) => {
        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });

        if (!user) {
          // Create new user from Google profile
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              username: profile.emails[0].value.split('@')[0], // Use email prefix as username
              firstName: profile.name.givenName || '',
              lastName: profile.name.familyName || '',
              avatarUrl: profile.photos[0]?.value,
            },
          });
        }

        return user;
      }
    ),
    "google"
  );
}

// Form Strategy for email/password (optional fallback)
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    // For now, we'll implement basic email/password logic
    // In production, you'd want proper password hashing and validation
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // TODO: Add proper password verification
    // For now, just return the user if found
    return user;
  }),
  "user-pass"
);

export { prisma };
