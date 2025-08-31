import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router";

export function Hero() {
  return (
    <main className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container mx-auto px-4 py-16">
          {/* Hero Cards - Side by Side */}
          <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center max-w-6xl mx-auto">
            {/* Portfolios Title Card */}
            <Card className="lg:w-80 shadow-lg">
              <CardContent className="p-8 text-center">
                <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Portfolios
                </h1>
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    by
                  </p>
                  <div className="flex justify-center">
                    <img src="/g2avity-grey-crop.png" alt="G2avity Logo" className="h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Description Card */}
            <Card className="flex-1 shadow-lg">
              <CardContent className="p-8 space-y-6">
                <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Professional Portfolio Platform
                </h2>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Create and showcase your professional portfolio with our modern, 
                  customizable platform. Share your experience, skills, and achievements 
                  in a beautifully designed, mobile-responsive format.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/portfolios">
                    <Button variant="outline" className="relative overflow-hidden transition-all duration-300 group" style={{ 
                      borderColor: 'var(--border-color) !important', 
                      color: 'var(--text-secondary) !important',
                      backgroundColor: 'var(--bg-card) !important'
                    }}>
                      <span className="relative z-10" style={{ color: 'var(--text-secondary) !important' }}>Browse Portfolios</span>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--shimmer-color)] to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" className="relative overflow-hidden transition-all duration-300 group" style={{ 
                      borderColor: 'var(--border-color) !important', 
                      color: 'var(--text-secondary) !important',
                      backgroundColor: 'var(--bg-card) !important'
                    }}>
                      <span className="relative z-10" style={{ color: 'var(--text-secondary) !important' }}>Get Started</span>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--shimmer-color)] to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
  );
}
