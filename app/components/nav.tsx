import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Link } from "react-router";
import { ThemeToggle } from "./theme-toggle";
import type { User } from "../lib/db.server";

interface NavProps {
  user?: User | null;
}

export function Nav({ user }: NavProps) {
  return (
    <nav className="w-full backdrop-blur-sm border-b sticky top-0 z-50" style={{ 
      backgroundColor: 'var(--bg-navbar)', 
      borderColor: 'var(--border-color)' 
    }}>
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
            <Link to="/" className="transition-colors hover:text-[var(--link-hover)]" style={{ color: 'var(--text-secondary)' }}>
              Home
            </Link>
            <Link to="/portfolios" className="transition-colors hover:text-[var(--link-hover)]" style={{ color: 'var(--text-secondary)' }}>
              Browse Portfolios
            </Link>
            <Link to="/about" className="transition-colors hover:text-[var(--link-hover)]" style={{ color: 'var(--text-secondary)' }}>
              About This Site
            </Link>
            <Link to="/register" className="transition-colors hover:text-[var(--link-hover)]" style={{ color: 'var(--text-secondary)' }}>
              Get Started
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" style={{ 
                    borderColor: 'var(--border-color) !important', 
                    color: 'var(--text-secondary) !important'
                  }}>
                    Dashboard
                  </Button>
                </Link>
                <Link to="/logout">
                  <Button size="sm" variant="ghost" style={{ color: 'var(--text-secondary) !important' }}>
                    Sign Out
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" style={{ 
                    borderColor: 'var(--border-color) !important', 
                    color: 'var(--text-secondary) !important'
                  }}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" variant="outline" className="relative overflow-hidden transition-all duration-300 group" style={{ 
                    borderColor: 'var(--border-color) !important', 
                    color: 'var(--text-secondary) !important',
                    backgroundColor: 'var(--bg-card) !important'
                  }}>
                    <span className="relative z-10" style={{ color: 'var(--text-secondary) !important' }}>Create Portfolio</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--shimmer-color)] to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm" style={{ 
              borderColor: 'var(--border-color) !important', 
              color: 'var(--text-secondary) !important' 
            }}>
              ☰
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
