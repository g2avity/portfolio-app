import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Modal } from "./ui/modal";
import { 
  Globe, 
  Link, 
  CheckCircle, 
  AlertCircle, 
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
        return 'var(--success-bg) var(--success-text)';
      case 'pending':
        return 'var(--warning-bg) var(--warning-text)';
      case 'verifying':
        return 'var(--focus-ring) var(--text-inverse)';
      case 'error':
        return 'var(--error-bg) var(--error-text)';
      default:
        return 'var(--border-light) var(--text-secondary)';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom Domain Management" maxWidth="max-w-4xl">
      <div className="space-y-6">
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
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  <Globe className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p>No domains configured yet</p>
                  <p className="text-sm">Add your first domain above to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {domains.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-card-content)', borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(domain.status)}
                        <div>
                                                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{domain.domain}</p>
                            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    <span 
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: getStatusColor(domain.status).split(' ')[0],
                            color: getStatusColor(domain.status).split(' ')[1]
                          }}
                        >
                          {getStatusText(domain.status)}
                        </span>
                                                          <span style={{ color: 'var(--text-muted)' }}>Added {domain.createdAt.toLocaleDateString()}</span>
                              {domain.lastVerified && (
                                <span style={{ color: 'var(--text-muted)' }}>Verified {domain.lastVerified.toLocaleDateString()}</span>
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
                          style={{
                            color: 'var(--error-text)',
                            backgroundColor: 'transparent'
                          }}
                          className="hover:bg-red-50"
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
                <Info className="w-5 h-5" style={{ color: 'var(--focus-ring)' }} />
                How Custom Domains Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--border-color)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--border-light)' }}>
                    <span className="text-2xl" style={{ color: 'var(--text-primary)' }}>1</span>
                  </div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--success-text)' }}>Add Your Domain</h4>
                  <p className="text-sm" style={{ color: 'var(--success-text)' }}>Enter your domain name in the field above</p>
                </div>
                <div className="text-center p-4 rounded-lg border" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--border-color)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--border-light)' }}>
                    <span className="text-2xl" style={{ color: 'var(--text-primary)' }}>2</span>
                  </div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--success-text)' }}>Automatic Setup</h4>
                  <p className="text-sm" style={{ color: 'var(--success-text)' }}>Vercel handles DNS configuration and SSL certificates</p>
                </div>
                <div className="text-center p-4 rounded-lg border" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--border-color)' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--border-light)' }}>
                                         <span className="text-2xl" style={{ color: 'var(--text-primary)' }}>3</span>
                  </div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--success-text)' }}>Go Live</h4>
                  <p className="text-sm" style={{ color: 'var(--success-text)' }}>Your portfolio is accessible at your custom domain</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: 'var(--border-light)', borderColor: 'var(--border-color)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>What We Handle:</h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• DNS configuration and management</li>
                  <li>• SSL certificate provisioning</li>
                  <li>• CDN optimization through Vercel's edge network</li>
                  <li>• Automatic HTTPS enforcement</li>
                  <li>• Domain verification and monitoring</li>
                </ul>
              </div>
            </CardContent>
          </Card>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
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
    </Modal>
  );
}
