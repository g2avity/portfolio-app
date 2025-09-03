import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Modal } from "./ui/modal";
import { useSubmit, useActionData } from "react-router";
import { toast } from "sonner";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Search, 
  Mail, 
  Users, 
  Plus, 
  Trash2,
  Globe,
  Shield
} from "lucide-react";

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    isPublic: boolean;
  };
}

interface Invite {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
}

export default function PrivacySettingsModal({ isOpen, onClose, user }: PrivacySettingsModalProps) {
  const submit = useSubmit();
  const actionData = useActionData<{ success: boolean; message?: string; error?: string }>();
  const [portfolioVisibility, setPortfolioVisibility] = useState<'public' | 'private' | 'invite'>(
    user?.isPublic ? 'public' : 'private'
  );
  const [searchEngineIndexing, setSearchEngineIndexing] = useState(true);
  const [passwordProtection, setPasswordProtection] = useState(false);
  const [portfolioPassword, setPortfolioPassword] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invites, setInvites] = useState<Invite[]>([
    { id: '1', email: 'colleague@company.com', status: 'pending' },
    { id: '2', email: 'client@business.com', status: 'accepted' }
  ]);

  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setPortfolioVisibility(user.isPublic ? 'public' : 'private');
    }
  }, [user]);

  // Handle action data and show toasts
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        toast.success(actionData.message || "Privacy settings updated successfully");
      } else {
        toast.error(actionData.error || "Failed to update privacy settings");
      }
    }
  }, [actionData]);

  const handleAddInvite = () => {
    if (inviteEmail.trim() && !invites.find(invite => invite.email === inviteEmail.trim())) {
      const newInvite: Invite = {
        id: Date.now().toString(),
        email: inviteEmail.trim(),
        status: 'pending'
      };
      setInvites([...invites, newInvite]);
      setInviteEmail('');
    }
  };

  const handleRemoveInvite = (id: string) => {
    setInvites(invites.filter(invite => invite.id !== id));
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append('_action', 'updatePrivacy');
    formData.append('isPublic', portfolioVisibility === 'public' ? 'true' : 'false');
    formData.append('searchEngineIndexing', searchEngineIndexing.toString());
    formData.append('passwordProtection', passwordProtection.toString());
    if (passwordProtection && portfolioPassword) {
      formData.append('portfolioPassword', portfolioPassword);
    }
    
    submit(formData, { method: 'post' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy Settings" maxWidth="max-w-2xl">
      <div className="space-y-6">
          {/* Portfolio Visibility */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Portfolio Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={portfolioVisibility === 'public'}
                    onChange={(e) => setPortfolioVisibility(e.target.value as 'public' | 'private' | 'invite')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Public</span>
                    <span className="text-sm text-gray-500">Anyone can view your portfolio</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={portfolioVisibility === 'private'}
                    onChange={(e) => setPortfolioVisibility(e.target.value as 'public' | 'private' | 'invite')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-600" />
                    <span className="font-medium">Private</span>
                    <span className="text-sm text-gray-500">Only you can access your portfolio</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="invite"
                    checked={portfolioVisibility === 'invite'}
                    onChange={(e) => setPortfolioVisibility(e.target.value as 'public' | 'private' | 'invite')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Invite Only</span>
                    <span className="text-sm text-gray-500">Only invited users can view your portfolio</span>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Search Engine Indexing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                Search Engine Visibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Allow search engines to index</p>
                  <p className="text-sm text-gray-500">Your portfolio can appear in Google, Bing, etc.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchEngineIndexing}
                    onChange={(e) => setSearchEngineIndexing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Password Protection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                Password Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Require password to access</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={passwordProtection}
                    onChange={(e) => setPasswordProtection(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {passwordProtection && (
                <div className="space-y-2">
                  <Label htmlFor="portfolio-password">Portfolio Password</Label>
                  <Input
                    id="portfolio-password"
                    type="password"
                    placeholder="Enter a strong password"
                    value={portfolioPassword}
                    onChange={(e) => setPortfolioPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    This password will be required for anyone to view your portfolio
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invite Management */}
          {portfolioVisibility === 'invite' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-600" />
                  Invite Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInvite()}
                  />
                  <Button onClick={handleAddInvite} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{invite.email}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invite.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          invite.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invite.status}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInvite(invite.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500">
                  Invited users will receive an email with a secure link to view your portfolio
                </p>
              </CardContent>
            </Card>
          )}
        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
