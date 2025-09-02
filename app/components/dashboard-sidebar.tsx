import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Settings, 
  User, 
  Palette, 
  Shield, 
  Eye, 
  Link, 
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { Link as RouterLink } from "react-router";

interface SidebarItem {
  label: string;
  icon: any;
  href?: string;
  action?: string;
}

interface SidebarSection {
  title: string;
  icon: any;
  items: SidebarItem[];
}

interface DashboardSidebarProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    portfolioSlug: string | null;
    isPublic: boolean;
    avatarUrl: string | null;
  };
  onOpenPrivacyModal?: () => void;
  onOpenDomainModal?: () => void;
  onOpenThemeModal?: () => void;
  onOpenSectionOrderingModal?: () => void;
  onOpenSEOModal?: () => void;
}

export function DashboardSidebar({ user, onOpenPrivacyModal, onOpenDomainModal, onOpenThemeModal, onOpenSectionOrderingModal, onOpenSEOModal }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar Trigger */}
      <div className="lg:hidden mb-6">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Menu className="w-4 h-4" />
              Settings
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Dashboard Settings</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <DashboardSidebarContent user={user} onItemClick={() => setIsOpen(false)} onOpenPrivacyModal={onOpenPrivacyModal} onOpenDomainModal={onOpenDomainModal} onOpenThemeModal={onOpenThemeModal} onOpenSectionOrderingModal={onOpenSectionOrderingModal} onOpenSEOModal={onOpenSEOModal} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-6">
          <DashboardSidebarContent user={user} onOpenPrivacyModal={onOpenPrivacyModal} onOpenDomainModal={onOpenDomainModal} onOpenThemeModal={onOpenThemeModal} onOpenSectionOrderingModal={onOpenSectionOrderingModal} onOpenSEOModal={onOpenSEOModal} />
        </div>
      </div>
    </>
  );
}

function DashboardSidebarContent({ 
  user, 
  onItemClick,
  onOpenPrivacyModal,
  onOpenDomainModal,
  onOpenThemeModal,
  onOpenSectionOrderingModal,
  onOpenSEOModal
}: { 
  user: DashboardSidebarProps['user']; 
  onItemClick?: () => void;
  onOpenPrivacyModal?: () => void;
  onOpenDomainModal?: () => void;
  onOpenThemeModal?: () => void;
  onOpenSectionOrderingModal?: () => void;
  onOpenSEOModal?: () => void;
}) {
  const sidebarItems: SidebarSection[] = [
    {
      title: "Account Settings",
      icon: User,
      items: [
        { label: "Account Information", href: "/account", icon: User },
        { label: "Account Security", href: "/account/security", icon: Shield },
        { label: "Email Preferences", href: "/account/email", icon: User },
      ]
    },
    {
      title: "Portfolio Settings",
      icon: Palette,
      items: [
        { label: "Visibility & Privacy", icon: Eye, action: "privacy" },
        { label: "Custom Domain", icon: Link, action: "domain" },
        { label: "Theme & Styling", icon: Palette, action: "theme" },
        { label: "Section Ordering", icon: Palette, action: "section-ordering" },
      ]
    },
    {
      title: "Content Management",
      icon: Settings,
      items: [
        { label: "Media Library", href: "/dashboard/media", icon: Settings },
        { label: "SEO Settings", icon: Settings, action: "seo" },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--border-light)' }}>
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log("❌ Sidebar avatar failed to load:", user.avatarUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log("✅ Sidebar avatar loaded successfully:", user.avatarUrl)}
                />
              ) : (
                <User className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.firstName} {user.lastName}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
            </div>
          </div>
          <div className="pt-2 border-t" style={{ borderTopColor: 'var(--border-light)' }}>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Portfolio Status:</span>
              <span className="px-2 py-1 rounded-full text-xs" style={{ 
                backgroundColor: user.isPublic ? 'var(--success-bg)' : 'var(--border-light)', 
                color: user.isPublic ? 'var(--success-text)' : 'var(--text-secondary)' 
              }}>
                {user.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
            {user.portfolioSlug && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span style={{ color: 'var(--text-secondary)' }}>Slug:</span>
                <span className="font-mono text-xs px-2 py-1 rounded" style={{ 
                  backgroundColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}>
                  {user.portfolioSlug}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Navigation */}
      {sidebarItems.map((section) => (
        <Card key={section.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <section.icon className="w-5 h-5" />
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.items.map((item) => (
              <Button
                key={item.href || item.action || item.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start h-9 px-3"
                onClick={() => {
                  if (item.action === "privacy") {
                    // Open privacy modal
                    onOpenPrivacyModal?.();
                    // Don't call onItemClick for modal actions to avoid closing mobile sidebar
                    return;
                  } else if (item.action === "domain") {
                    // Open custom domain modal
                    onOpenDomainModal?.();
                    // Don't call onItemClick for modal actions to avoid closing mobile sidebar
                    return;
                  } else if (item.action === "theme") {
                    // Open theme styling modal
                    onOpenThemeModal?.();
                    // Don't call onItemClick for modal actions to avoid closing mobile sidebar
                    return;
                  } else if (item.action === "section-ordering") {
                    // Open section ordering modal
                    onOpenSectionOrderingModal?.();
                    // Don't call onItemClick for modal actions to avoid closing mobile sidebar
                    return;
                  } else if (item.action === "seo") {
                    // Open SEO settings modal
                    onOpenSEOModal?.();
                    // Don't call onItemClick for modal actions to avoid closing mobile sidebar
                    return;
                  } else if (item.href === "/account") {
                    // Navigate to account route
                    window.location.href = item.href;
                  } else if (item.href === "/account/security") {
                    // Navigate to security route with state indicating we came from dashboard
                    // We'll use sessionStorage for now since we're using window.location
                    sessionStorage.setItem('securityFrom', 'dashboard');
                    window.location.href = item.href;
                  } else if (item.href === "/account/email") {
                    // Navigate to email route with state indicating we came from dashboard
                    sessionStorage.setItem('emailFrom', 'dashboard');
                    window.location.href = item.href;
                  } else if (item.href === "/dashboard/media") {
                    // Navigate to media library route
                    window.location.href = item.href;
                  } else {
                    // TODO: Implement navigation to other settings pages
                    console.log(`Navigate to ${item.href}`);
                  }
                  onItemClick?.();
                }}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Button>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            View Public Portfolio
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Import Resume
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


