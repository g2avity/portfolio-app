import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, User, Shield, CreditCard, Settings, Mail } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import { requireUser } from "../lib/session.server";
import { getPortfolioConfig } from "../lib/portfolio-config.server";
import { useEffect } from "react";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  const portfolioConfig = await getPortfolioConfig(user.id);
  return { user, portfolioConfig };
}

export default function Account() {
  const { portfolioConfig } = useLoaderData<typeof loader>();
  const theme = portfolioConfig?.theme || 'light';
  
  // Debug: Log the theme to see what we're getting
  console.log('Account route - theme:', theme, 'portfolioConfig:', portfolioConfig);
  
  return (
    <main className="min-h-screen py-16" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center mb-4 transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Account Settings</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Manage your account preferences, security, and billing</p>
        </div>

        {/* Account Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile & Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Profile & Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Update your personal information, bio, and contact details.
              </p>
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Manage your password, two-factor authentication, and login preferences.
              </p>
              <Link 
                to="/account/security" 
                onClick={() => sessionStorage.setItem('securityFrom', 'account')}
              >
                <Button variant="outline" className="w-full">
                  Manage Security
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Billing & Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Billing & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                View your current plan, billing history, and manage subscriptions.
              </p>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Email Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-600" />
                Email Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Configure email notifications, privacy settings, and account preferences.
              </p>
              <Link 
                to="/account/email" 
                onClick={() => sessionStorage.setItem('emailFrom', 'account')}
              >
                <Button variant="outline" className="w-full">
                  Manage Preferences
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Current Plan Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Free Plan</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Basic portfolio features included</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">$0/month</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No credit card required</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg border" style={{ 
              backgroundColor: 'var(--bg-card-header)', 
              borderColor: 'var(--border-color)' 
            }}>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                <strong>What's included:</strong> Basic portfolio, custom sections, 
                responsive design, and core features. Premium plans with advanced 
                customization, analytics, and priority support coming soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
