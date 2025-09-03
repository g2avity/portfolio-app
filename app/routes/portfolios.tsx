import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getAllPublicUsers } from "../lib/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const users = await getAllPublicUsers();
    return { users };
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
    return { users: [] };
  }
}



export default function Portfolios() {
  const { users } = useLoaderData<typeof loader>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Transform users data to match the expected format
  const portfolios = users.map(user => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    title: user.experiences[0]?.title || "Professional",
    bio: user.bio || "No bio available",
    skills: user.skills.map(skill => skill.name),
    avatar: user.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: user.location || "Location not specified"
  }));

  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Browse Portfolios</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Discover talented professionals and their amazing work. Find the perfect match for your next project.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="rounded-lg shadow-sm border p-6 mb-8" style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}>
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, title, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  } as React.CSSProperties}
                />
              </div>

              {/* Industry Filter */}
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)'
                } as React.CSSProperties}
              >
                <option value="all">All Industries</option>
                <option value="tech">Technology</option>
                <option value="design">Design</option>
                <option value="data">Data Science</option>
                <option value="marketing">Marketing</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)'
                } as React.CSSProperties}
              >
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="location">Location</option>
              </select>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPortfolios.map((portfolio) => (
              <Card key={portfolio.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={portfolio.avatar}
                      alt={`${portfolio.name}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {portfolio.name}
                      </CardTitle>
                      <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{portfolio.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col h-full">
                  <p className="text-sm line-clamp-3 flex-grow" style={{ color: 'var(--text-secondary)' }}>
                    {portfolio.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 min-h-[2rem]">
                    {portfolio.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: 'var(--bg-card-header)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {portfolio.skills.length > 3 && (
                      <span 
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: 'var(--bg-card-header)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        +{portfolio.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{portfolio.location}</span>
                    <Link to={`/portfolios/${portfolio.id}`}>
                      <Button 
                        size="sm" 
                        className="relative overflow-hidden transition-all duration-300 group"
                        style={{
                          backgroundColor: 'var(--focus-ring)',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        <span className="relative z-10">View Portfolio</span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              className="border transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              Load More Portfolios
            </Button>
          </div>
        </div>
      </main>
  );
}
