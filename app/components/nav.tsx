import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Link } from "react-router";

export function Nav() {
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
            <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </a>
            <a href="/portfolios" className="text-gray-700 hover:text-blue-600 transition-colors">
              Browse Portfolios
            </a>
            <a href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              About This Site
            </a>
            <a href="/get-started" className="text-gray-700 hover:text-blue-600 transition-colors">
              Get Started
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
                Sign In
              </Button>
            </Link>
            <Button size="sm" className="relative overflow-hidden bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 group">
              <span className="relative z-10">Create Portfolio</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </Button>
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
