import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

// Sample portfolio data - replace with real data later
const samplePortfolios = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Full Stack Developer",
    bio: "Passionate developer with 5+ years building scalable web applications. Specialized in React, Node.js, and cloud architecture.",
    skills: ["React", "Node.js", "AWS", "TypeScript"],
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    location: "San Francisco, CA"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    title: "UX/UI Designer",
    bio: "Creative designer focused on user-centered design principles. Creating intuitive interfaces that users love to interact with.",
    skills: ["Figma", "Sketch", "User Research", "Prototyping"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: "New York, NY"
  },
  {
    id: 3,
    name: "Aisha Patel",
    title: "Data Scientist",
    bio: "Data-driven professional transforming complex information into actionable insights. Expert in machine learning and statistical analysis.",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    location: "Austin, TX"
  },
  {
    id: 4,
    name: "David Kim",
    title: "DevOps Engineer",
    bio: "Infrastructure specialist building robust, scalable systems. Passionate about automation and cloud-native technologies.",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: "Seattle, WA"
  }
];

export default function Portfolios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredPortfolios = samplePortfolios.filter(portfolio => {
    const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Portfolios</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover talented professionals and their amazing work. Find the perfect match for your next project.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, title, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Industry Filter */}
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <Card key={portfolio.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={portfolio.avatar}
                      alt={`${portfolio.name}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {portfolio.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 truncate">{portfolio.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {portfolio.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {portfolio.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{portfolio.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{portfolio.location}</span>
                    <Button 
                      size="sm" 
                      className="relative overflow-hidden bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 group"
                    >
                      <span className="relative z-10">View Portfolio</span>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                    </Button>
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
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              Load More Portfolios
            </Button>
          </div>
        </div>
      </main>
  );
}
