import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft, Shield, Lock, Key, Smartphone, Clock, AlertTriangle, Eye, EyeOff, Globe } from "lucide-react";
import { Link, useLoaderData, useSubmit, useActionData } from "react-router";
import { requireUser } from "../lib/session.server";
import { getPortfolioConfig } from "../lib/portfolio-config.server";
import { prisma } from "../lib/db.server";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  const portfolioConfig = await getPortfolioConfig(user.id);
  return { user, portfolioConfig };
}

export async function action({ request }: { request: Request }) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "updatePrivacy") {
    try {
      const isPublic = formData.get("isPublic") === 'true';
      
      console.log('Account Security action - received privacy update:', { 
        isPublic, 
        userId: user.id 
      });
      
      // Update user's privacy settings
      const client = await prisma;
      await client.user.update({
        where: { id: user.id },
        data: {
          isPublic: isPublic
        }
      });

      console.log('Account Security action - privacy update successful');
      return { 
        success: true, 
        message: "Privacy settings updated successfully" 
      };
    } catch (error) {
      console.error("❌ Failed to update privacy settings:", error);
      return { 
        success: false, 
        error: "Failed to update privacy settings",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  return { success: false, error: "Unknown action" };
}

export default function AccountSecurity() {
  const { user, portfolioConfig } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const theme = portfolioConfig?.theme || 'light';
  const submit = useSubmit();
  const [from, setFrom] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(user?.isPublic || false);
  
  useEffect(() => {
    // Read from sessionStorage on component mount
    const storedFrom = sessionStorage.getItem('securityFrom') || 'account';
    setFrom(storedFrom);
    
    // Clean up sessionStorage after reading
    sessionStorage.removeItem('securityFrom');
  }, []);

  useEffect(() => {
    if (user) {
      setIsPublic(user.isPublic || false);
    }
  }, [user]);

  // Handle action data and show toasts
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message || "Settings updated successfully");
      } else {
        toast.error(actionData.error || "Failed to update settings");
      }
    }
  }, [actionData]);

  const handlePrivacyToggle = () => {
    const newIsPublic = !isPublic;
    setIsPublic(newIsPublic);
    
    const formData = new FormData();
    formData.append('_action', 'updatePrivacy');
    formData.append('isPublic', newIsPublic.toString());
    
    submit(formData, { method: 'post' });
  };
  
  const getBackButton = () => {
    // Show placeholder while loading to prevent layout shift
    if (from === null) {
      return (
        <div className="inline-flex items-center mb-4 h-6" style={{ color: 'var(--text-secondary)' }}>
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
          className="inline-flex items-center mb-4 transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      );
    }
    
    return (
      <Link 
        to="/account" 
        className="inline-flex items-center mb-4 transition-colors hover:opacity-80"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Account Settings
      </Link>
    );
  };

  return (
    <main className="min-h-screen py-16" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          {getBackButton()}
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Security Settings</h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Manage your account security, authentication, and privacy</p>
        </div>

        {/* Privacy Control */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-green-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-orange-600" />
                )}
                Profile Visibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {isPublic 
                      ? "Your portfolio is visible to the public and can be found on the portfolios page."
                      : "Your portfolio is private and only visible to you."
                    }
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {isPublic 
                      ? "Anyone can view your portfolio at /portfolios/{username}"
                      : "Your portfolio will not appear in public listings"
                    }
                  </p>
                </div>
                <Button 
                  onClick={handlePrivacyToggle}
                  variant={isPublic ? "outline" : "default"}
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: isPublic ? 'var(--bg-card)' : 'var(--focus-ring)',
                    borderColor: isPublic ? 'var(--border-color)' : 'var(--focus-ring)',
                    color: isPublic ? 'var(--text-primary)' : 'white'
                  }}
                >
                  {isPublic ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Make Public
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
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
