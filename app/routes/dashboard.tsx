import type { LoaderFunctionArgs } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { Plus, Edit, Eye, X } from "lucide-react";

import { requireUser } from "../lib/session.server";
import { ErrorBoundary as AppErrorBoundary } from "../components/error-boundary";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { ExperienceForm } from "../components/experience-form";
import { SkillsForm } from "../components/skills-form";
import { CustomSectionForm } from "../components/custom-section-form";

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <AppErrorBoundary 
      error={error} 
      title="Dashboard Error"
      showBackButton={true}
      showHomeButton={true}
    />
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  // TODO: Fetch real portfolio stats from database
  // For now, using mock stats
  const portfolioStats = {
    experiences: 0, // Will be fetched from database
    skills: 0,      // Will be fetched from database
    starMemos: 0    // Will be fetched from database
  };
  
  return { user, portfolioStats };
}

import { useLoaderData } from "react-router";
import { useState } from "react";

export default function Dashboard() {
  const { user, portfolioStats } = useLoaderData<typeof loader>();
  
  // Form state management
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [showCustomSectionForm, setShowCustomSectionForm] = useState(false);

  // Form handlers
  const handleExperienceSubmit = (data: any) => {
    console.log("Experience submitted:", data);
    // TODO: Save to database
    setShowExperienceForm(false);
  };

  const handleSkillsSubmit = (data: any) => {
    console.log("Skills submitted:", data);
    // TODO: Save to database
    setShowSkillsForm(false);
  };

  const handleCustomSectionSubmit = (data: any) => {
    console.log("Custom section submitted:", data);
    // TODO: Save to database
    setShowCustomSectionForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}'s Portfolio Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your professional portfolio and content</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Main Content Area - Vertically Aligned Cards */}
          <div className="flex-1 space-y-8">
            {/* Profile Information Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-medium text-gray-600">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{user.firstName} {user.lastName}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    {user.bio && (
                      <p className="text-gray-700 mt-2">{user.bio}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">
                      {user.city && user.state ? `${user.city}, ${user.state}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{user.phone || 'Not specified'}</p>
                  </div>
                  {user.linkedinUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">LinkedIn</label>
                      <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:text-blue-800">
                        View Profile
                      </a>
                    </div>
                  )}
                  {user.githubUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">GitHub</label>
                      <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:text-blue-800">
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experiences Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Experiences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolioStats.experiences === 0 ? (
                  <div className="space-y-4">
                    {/* Empty state message */}
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-lg">No experiences added yet</p>
                      <p className="text-sm">Start building your professional history</p>
                    </div>
                    
                    {/* Ghost Add Card */}
                    <div 
                      onClick={() => setShowExperienceForm(true)}
                      className="group cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-blue-700">
                              {portfolioStats.experiences === 0 ? 'Add Your First Experience' : 'Add Another Experience'}
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-600">
                              {portfolioStats.experiences === 0 
                                ? 'Click to create your first work experience' 
                                : 'Click to add another work experience'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* TODO: Render actual experiences from database */}
                    <p className="text-gray-600">Experiences will be displayed here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills & Abilities Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Skills & Abilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolioStats.skills === 0 ? (
                  <div className="space-y-4">
                    {/* Empty state message */}
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-lg">No skills added yet</p>
                      <p className="text-sm">Showcase your technical and soft skills</p>
                    </div>
                    
                    {/* Ghost Add Card */}
                    <div 
                      onClick={() => setShowSkillsForm(true)}
                      className="group cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-blue-700">
                              {portfolioStats.skills === 0 ? 'Add Your First Skill' : 'Add Another Skill'}
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-600">
                              {portfolioStats.skills === 0 
                                ? 'Click to create your first skill entry' 
                                : 'Click to add another skill'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* TODO: Render actual skills from database */}
                    <p className="text-gray-600">Skills will be displayed here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Sections Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Custom Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolioStats.starMemos === 0 ? (
                  <div className="space-y-4">
                    {/* Empty state message */}
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-lg">No custom sections added yet</p>
                      <p className="text-sm">Create custom content sections like STAR Memos, Project Showcases, or Speaking Engagements</p>
                    </div>
                    
                    {/* Ghost Add Card */}
                    <div 
                      onClick={() => setShowCustomSectionForm(true)}
                      className="group cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-blue-700">
                              {portfolioStats.starMemos === 0 ? 'Add Your First Custom Section' : 'Add Another Custom Section'}
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-600">
                              {portfolioStats.starMemos === 0 
                                ? 'Click to create your first custom content section' 
                                : 'Click to add another custom section'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* TODO: Render actual custom sections from database */}
                    <p className="text-gray-600">Custom sections will be displayed here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <DashboardSidebar user={user} />
        </div>
      </div>

      {/* Form Overlays */}
      {showExperienceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => setShowExperienceForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <ExperienceForm
                onSubmit={handleExperienceSubmit}
                onCancel={() => setShowExperienceForm(false)}
                mode="add"
              />
            </div>
          </div>
        </div>
      )}

      {showSkillsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => setShowSkillsForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <SkillsForm
                onSubmit={handleSkillsSubmit}
                onCancel={() => setShowSkillsForm(false)}
                mode="add"
              />
            </div>
          </div>
        </div>
      )}

      {showCustomSectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => setShowCustomSectionForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <CustomSectionForm
                onSubmit={handleCustomSectionSubmit}
                onCancel={() => setShowCustomSectionForm(false)}
                mode="add"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
