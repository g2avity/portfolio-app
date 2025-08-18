import { createCookieSessionStorage, redirect } from "react-router";

// Create session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.SESSION_SECRET || "default-secret"], // replace this with an actual secret
    secure: process.env.NODE_ENV === "production", // enable this in prod only
  },
});

// Create session helper functions
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function commitSession(session: any) {
  return sessionStorage.commitSession(session);
}

export async function destroySession(session: any) {
  return sessionStorage.destroySession(session);
}

// Helper functions for user sessions
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

import { findUserById } from "./db.server";

export async function getUserFromSession(request: Request) {
  const session = await getSession(request);
  const userId = session.get("userId");
  
  if (!userId) return null;
  
  // Fetch real user from database
  const user = await findUserById(userId);
  return user;
}

export async function requireUser(request: Request) {
  const user = await getUserFromSession(request);
  
  if (!user) {
    throw redirect("/login");
  }
  
  return user;
}
