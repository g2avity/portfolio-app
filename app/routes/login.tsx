import { Form, Link, redirect } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useSearchParams } from "react-router";

import { authenticator } from "../lib/auth.server";
import { ErrorBoundary as AppErrorBoundary } from "../components/error-boundary";

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <AppErrorBoundary 
      error={error} 
      title="Login Error"
      showBackButton={true}
      showHomeButton={true}
    />
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Use the authenticator to handle login
    return await authenticator.authenticate("user-pass", request);
  } catch (error) {
    console.error("Login error:", error);
    return redirect("/login?error=server-error");
  }
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full space-y-8">
        {message && (
          <div className="border rounded-md p-4" style={{ 
            backgroundColor: 'var(--success-bg)', 
            borderColor: 'var(--success-border)',
            color: 'var(--success-text)'
          }}>
            <p className="text-sm">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="border rounded-md p-4" style={{ 
            backgroundColor: 'var(--error-bg)', 
            borderColor: 'var(--error-border)',
            color: 'var(--error-text)'
          }}>
            <p className="text-sm">
              {error === "invalid-credentials" && "Invalid email or password. Please try again."}
              {error === "missing-fields" && "Please fill in all required fields."}
              {error === "server-error" && "An error occurred. Please try again."}
              {!["invalid-credentials", "missing-fields", "server-error"].includes(error) && "An error occurred. Please try again."}
            </p>
          </div>
        )}
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Or{" "}
            <Link to="/register" className="font-medium transition-colors hover:opacity-80" style={{ color: 'var(--focus-ring)' }}>
              create a new account
            </Link>
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <Form action="/auth/google" method="post">
              <Button 
                type="submit" 
                className="w-full border hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2" style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-muted)'
                }}>Or continue with</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <Form method="post" className="space-y-4">
              <style>{`
                .form-input {
                  border-color: var(--border-color);
                  background-color: var(--bg-card);
                  color: var(--text-primary);
                }
                .form-input:focus {
                  --tw-ring-color: var(--focus-ring);
                  --tw-ring-offset-color: var(--bg-primary);
                }
                .form-input::placeholder {
                  color: var(--text-muted);
                }
              `}</style>
              <div>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:z-10 sm:text-sm form-input"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:z-10 sm:text-sm form-input"
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
