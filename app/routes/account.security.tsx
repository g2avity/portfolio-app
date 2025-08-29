import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, Shield, Lock, Key, Smartphone, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import { requireUser } from "../lib/session.server";
import { useState, useEffect } from "react";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  return { user };
}

export default function AccountSecurity() {
  const [from, setFrom] = useState<string | null>(null);
  
  useEffect(() => {
    // Read from sessionStorage on component mount
    const storedFrom = sessionStorage.getItem('securityFrom') || 'account';
    setFrom(storedFrom);
    
    // Clean up sessionStorage after reading
    sessionStorage.removeItem('securityFrom');
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
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account security, authentication, and privacy</p>
        </div>

        {/* Security Sections */}
        <div className="space-y-6">
          {/* Password Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Password Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">
                    Change your password to keep your account secure.
                  </p>
                  <p className="text-sm text-gray-500">
                    Last changed: <span className="font-medium">Never</span>
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">
                    Add an extra layer of security to your account.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Not Enabled
                    </span>
                    <span className="text-sm text-gray-500">Recommended for enhanced security</span>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">
                      Manage your active login sessions across devices.
                    </p>
                    <p className="text-sm text-gray-500">
                      Current session: <span className="font-medium">This device</span>
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    View Sessions
                  </Button>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    <strong>Current Session:</strong> You're logged in on this device 
                    (IP: 127.0.0.1, Location: Local)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys & Tokens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                API Keys & Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">
                    Manage API keys and access tokens for integrations.
                  </p>
                  <p className="text-sm text-gray-500">
                    No API keys configured
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Manage Keys
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">
                      Control your data privacy and account visibility.
                    </p>
                    <p className="text-sm text-gray-500">
                      Portfolio visibility: <span className="font-medium">Public</span>
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Privacy Settings
                  </Button>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-800 text-sm">
                      <strong>Data Export:</strong> You can request a copy of your data 
                      or delete your account. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Security Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Password Security</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Use a strong, unique password</li>
                  <li>• Don't reuse passwords across sites</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Account Protection</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Enable two-factor authentication</li>
                  <li>• Monitor your login sessions</li>
                  <li>• Keep your email secure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
