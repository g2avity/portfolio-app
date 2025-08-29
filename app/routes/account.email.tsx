import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, Mail, Bell, Shield, Eye, Users, Settings, Send } from "lucide-react";
import { Link } from "react-router";
import { requireUser } from "../lib/session.server";
import { useState, useEffect } from "react";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  return { user };
}

export default function AccountEmail() {
  const [from, setFrom] = useState<string | null>(null);
  
  useEffect(() => {
    // Read from sessionStorage on component mount
    const storedFrom = sessionStorage.getItem('emailFrom') || 'account';
    setFrom(storedFrom);
    
    // Clean up sessionStorage after reading
    sessionStorage.removeItem('emailFrom');
  }, []);

  const getBackButton = () => {
    // Show placeholder while loading to prevent layout shift
    if (from === null) {
      return (
        <div className="inline-flex items-center text-gray-600 mb-4 h-6">
          {/* Invisible placeholder with same dimensions as back button */}
          <div className="w-4 h-4 mr-2 opacity-0">←</div>
          <span className="opacity-0">Back to Account Settings</span>
        </div>
      );
    }
    
    if (from === 'dashboard') {
      return (
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      );
    }
    
    return (
      <Link 
        to="/account" 
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Account Settings
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          {getBackButton()}
          <h1 className="text-3xl font-bold text-gray-900">Email Preferences</h1>
          <p className="text-gray-600 mt-2">Manage your email notifications and communication preferences</p>
        </div>

        {/* Email Preferences Sections */}
        <div className="space-y-6">
          {/* Portfolio Activity Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Portfolio Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Portfolio Views</p>
                    <p className="text-sm text-gray-500">Get notified when someone views your portfolio</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Daily Digest
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Engagement Metrics</p>
                    <p className="text-sm text-gray-500">Weekly summary of portfolio performance</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Weekly
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Security & Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Login Alerts</p>
                    <p className="text-sm text-gray-500">Immediate notification of new login attempts</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Real-time
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Password Changes</p>
                    <p className="text-sm text-gray-500">Confirm when your password is updated</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Always
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Two-Factor Setup</p>
                    <p className="text-sm text-gray-500">Notifications about 2FA configuration</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Always
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content & Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Content & Platform Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">New Features</p>
                    <p className="text-sm text-gray-500">Learn about new portfolio features and tools</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Weekly
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Platform Announcements</p>
                    <p className="text-sm text-gray-500">Important updates about the portfolio platform</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Important Only
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Tips & Best Practices</p>
                    <p className="text-sm text-gray-500">Helpful content to improve your portfolio</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Monthly
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Format & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                Email Format & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Email Format</p>
                    <p className="text-sm text-gray-500">Choose between HTML and plain text emails</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    HTML
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Delivery Time</p>
                    <p className="text-sm text-gray-500">Preferred time to receive daily/weekly emails</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    9:00 AM
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Time Zone</p>
                    <p className="text-sm text-gray-500">Your local time zone for email scheduling</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Auto-detect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline" disabled>
            <Send className="w-4 h-4 mr-2" />
            Send Test Email
          </Button>
          <Button variant="outline" disabled>
            <Settings className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>

        {/* Email Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Email Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-blue-800">Emails this month</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-green-800">Security alerts</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">4</p>
                <p className="text-orange-800">Portfolio updates</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                <strong>Note:</strong> Most email preferences are currently set to default values. 
                Customization options will be available in future updates. You can always 
                unsubscribe from specific email types using the links at the bottom of each email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
