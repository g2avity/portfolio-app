import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GoogleStrategy } from "@curvenote/remix-auth-google";
import { sessionStorage } from "./session.server";
import { findOrCreateUserFromOAuth, verifyUserCredentials } from "./db.server";
import { redirect } from "react-router";

// Define the User type for authentication
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
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
}

// Create the authenticator instance
export const authenticator = new Authenticator<Response>();

// Google OAuth Strategy
authenticator.use(
  new GoogleStrategy(
    {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (options) => {
      // For OAuth2, we need to handle the callback parameters correctly
      // The GoogleStrategy provides options with tokens
      if (!options || typeof options !== 'object') {
        throw new Error("Invalid OAuth callback parameters");
      }

      // Extract tokens and fetch user profile
      const { tokens } = options;
      if (!tokens?.accessToken) {
        throw new Error("Missing access token from Google OAuth");
      }

      // Extract the actual access token value (it might be a getter function)
      const accessToken = typeof tokens.accessToken === 'function' 
        ? tokens.accessToken() 
        : tokens.accessToken;

      // Fetch user profile from Google using the access token
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch user profile from Google");
      }

      const profile = await profileResponse.json();
      
      const email = profile.email;
      const firstName = profile.given_name || "";
      const lastName = profile.family_name || "";
      const providerAccountId = profile.sub; // Google uses 'sub' for user ID

      // Find or create user from OAuth
      const user = await findOrCreateUserFromOAuth({
        provider: "google",
        providerAccountId,
        email,
        firstName,
        lastName,
      });

      // Create session manually
      const session = await sessionStorage.getSession();
      session.set("userId", user.id);
      
      return redirect("/dashboard", {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      });
    }
  ),
  "google"
);

// Form Strategy for email/password
authenticator.use(
  new FormStrategy(
    async ({ form }) => {
      const email = form.get("email") as string;
      const password = form.get("password") as string;

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Validate against database
      const user = await verifyUserCredentials(email, password);
      
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Create session manually
      const session = await sessionStorage.getSession();
      session.set("userId", user.id);
      
      return redirect("/dashboard", {
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      });
    }
  ),
  "user-pass"
);
