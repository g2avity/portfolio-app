import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Globe, 
  Link, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ExternalLink,
  Info,
  Clock,
  Shield
} from "lucide-react";

interface CustomDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Domain {
  id: string;
  domain: string;
  status: 'pending' | 'active' | 'error' | 'verifying';
  createdAt: Date;
  lastVerified?: Date;
}

export default function CustomDomainModal({ isOpen, onClose }: CustomDomainModalProps) {
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([
    {
      id: '1',
      domain: 'jamesmcghee.com',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      lastVerified: new Date('2024-01-20')
    },
    {
      id: '2',
      domain: 'portfolio.jamesmcghee.com',
      status: 'pending',
      createdAt: new Date('2024-01-18')
    }
  ]);

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    
    setIsAdding(true);
    
    // Simulate Vercel API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDomainObj: Domain = {
      id: Date.now().toString(),
      domain: newDomain.trim(),
      status: 'pending',
      createdAt: new Date()
    };
    
    setDomains([...domains, newDomainObj]);
    setNewDomain('');
    setIsAdding(false);
  };

  const handleRemoveDomain = (id: string) => {
    setDomains(domains.filter(d => d.id !== id));
  };

  const handleVerifyDomain = async (id: string) => {
    // Simulate verification process
    setDomains(domains.map(d => 
      d.id === id ? { ...d, status: 'verifying' as const } : d
    ));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDomains(domains.map(d => 
      d.id === id ? { ...d, status: 'active' as const, lastVerified: new Date() } : d
    ));
  };

  const getStatusIcon = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'verifying':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending Verification';
      case 'verifying':
        return 'Verifying...';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verifying':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Custom Domain Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add New Domain */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Link className="w-5 h-5 text-green-600" />
                Add New Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="new-domain">Domain Name</Label>
                  <Input
                    id="new-domain"
                    type="text"
                    placeholder="Enter your domain (e.g., jamesmcghee.com)"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleAddDomain} 
                    disabled={!newDomain.trim() || isAdding}
                    className="h-10"
                  >
                    {isAdding ? 'Adding...' : 'Add Domain'}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Enter your domain and we'll handle the DNS configuration automatically through Vercel.
              </p>
            </CardContent>
          </Card>

          {/* Current Domains */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Your Domains
              </CardTitle>
            </CardHeader>
            <CardContent>
              {domains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No domains configured yet</p>
                  <p className="text-sm">Add your first domain above to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {domains.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(domain.status)}
                        <div>
                          <p className="font-medium text-gray-900">{domain.domain}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(domain.status)}`}>
                              {getStatusText(domain.status)}
                            </span>
                            <span>Added {domain.createdAt.toLocaleDateString()}</span>
                            {domain.lastVerified && (
                              <span>Verified {domain.lastVerified.toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {domain.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyDomain(domain.id)}
                          >
                            Verify Now
                          </Button>
                        )}
                        {domain.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDomain(domain.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                How Custom Domains Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">1</span>
                  </div>
                  <h4 className="font-medium text-blue-900 mb-2">Add Your Domain</h4>
                  <p className="text-sm text-blue-700">Enter your domain name in the field above</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">2</span>
                  </div>
                  <h4 className="font-medium text-green-900 mb-2">Automatic Setup</h4>
                  <p className="text-sm text-green-700">Vercel handles DNS configuration and SSL certificates</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">3</span>
                  </div>
                  <h4 className="font-medium text-purple-900 mb-2">Go Live</h4>
                  <p className="text-sm text-purple-700">Your portfolio is accessible at your custom domain</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">What We Handle:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• DNS configuration and management</li>
                  <li>• SSL certificate provisioning</li>
                  <li>• CDN optimization through Vercel's edge network</li>
                  <li>• Automatic HTTPS enforcement</li>
                  <li>• Domain verification and monitoring</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => window.open('https://vercel.com/docs/concepts/projects/domains', '_blank')}
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Vercel Domain Docs
          </Button>
        </div>
      </div>
    </div>
  );
}
