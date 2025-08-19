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

interface DashboardSidebarProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    portfolioSlug: string | null;
    isPublic: boolean;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarItems = [
    {
      title: "Account Settings",
      icon: User,
      items: [
        { label: "Profile Information", href: "#profile", icon: User },
        { label: "Account Security", href: "#security", icon: Shield },
        { label: "Email Preferences", href: "#email", icon: User },
      ]
    },
    {
      title: "Portfolio Settings",
      icon: Palette,
      items: [
        { label: "Visibility & Privacy", href: "#visibility", icon: Eye },
        { label: "Custom Domain", href: "#domain", icon: Link },
        { label: "Theme & Styling", href: "#theme", icon: Palette },
        { label: "Section Ordering", href: "#sections", icon: Palette },
      ]
    },
    {
      title: "Content Management",
      icon: Settings,
      items: [
        { label: "Content Sections", href: "#sections", icon: Settings },
        { label: "Media Library", href: "#media", icon: Settings },
        { label: "SEO Settings", href: "#seo", icon: Settings },
      ]
    }
  ];

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
              <DashboardSidebarContent user={user} onItemClick={() => setIsOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-6">
          <DashboardSidebarContent user={user} />
        </div>
      </div>
    </>
  );
}

function DashboardSidebarContent({ 
  user, 
  onItemClick 
}: { 
  user: DashboardSidebarProps['user']; 
  onItemClick?: () => void;
}) {
  const sidebarItems = [
    {
      title: "Account Settings",
      icon: User,
      items: [
        { label: "Profile Information", href: "#profile", icon: User },
        { label: "Account Security", href: "#security", icon: Shield },
        { label: "Email Preferences", href: "#email", icon: User },
      ]
    },
    {
      title: "Portfolio Settings",
      icon: Palette,
      items: [
        { label: "Visibility & Privacy", href: "#visibility", icon: Eye },
        { label: "Custom Domain", href: "#domain", icon: Link },
        { label: "Theme & Styling", href: "#theme", icon: Palette },
        { label: "Section Ordering", href: "#sections", icon: Palette },
      ]
    },
    {
      title: "Content Management",
      icon: Settings,
      items: [
        { label: "Content Sections", href: "#sections", icon: Settings },
        { label: "Media Library", href: "#media", icon: Settings },
        { label: "SEO Settings", href: "#seo", icon: Settings },
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
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Portfolio Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.isPublic 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
            {user.portfolioSlug && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Slug:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
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
                key={item.href}
                variant="ghost"
                size="sm"
                className="w-full justify-start h-9 px-3"
                onClick={() => {
                  // TODO: Implement navigation to settings pages
                  console.log(`Navigate to ${item.href}`);
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
