import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, User, Shield, CreditCard, Settings, Mail } from "lucide-react";
import { Link } from "react-router";
import { requireUser } from "../lib/session.server";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  return { user };
}

export default function Account() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences, security, and billing</p>
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
              <p className="text-gray-600 mb-4">
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
              <p className="text-gray-600 mb-4">
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
              <p className="text-gray-600 mb-4">
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
              <p className="text-gray-600 mb-4">
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
                <h3 className="text-lg font-medium">Free Plan</h3>
                <p className="text-gray-600">Basic portfolio features included</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">$0/month</p>
                <p className="text-sm text-gray-500">No credit card required</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
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
