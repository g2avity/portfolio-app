import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Link } from "react-router";

interface NavProps {
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    isPublic: boolean;
    portfolioSlug: string;
  } | null;
}

export function Nav({ user }: NavProps) {
  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src="/g2avity-grey-crop.png" 
              alt="G2avity Logo" 
              className="h-10"
            />
            {/* <span className="text-xl font-bold text-gray-900">Portfolios</span> */}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/portfolios" className="text-gray-700 hover:text-blue-600 transition-colors">
              Browse Portfolios
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About This Site
            </Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600 transition-colors">
              Get Started
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/logout">
                  <Button size="sm" variant="ghost" className="text-gray-700 hover:text-gray-900">
                    Sign Out
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="relative overflow-hidden bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 group">
                    <span className="relative z-10">Create Portfolio</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm">
              ☰
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
