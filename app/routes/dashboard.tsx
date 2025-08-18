import type { LoaderFunctionArgs } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router";

import { requireUser } from "../lib/session.server";
import { ErrorBoundary as AppErrorBoundary } from "../components/error-boundary";

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

export default function Dashboard() {
  const { user, portfolioStats } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}'s Portfolio Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your professional portfolio and content</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Visibility:</span>
                  <span className="text-green-600 font-medium">Public</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">URL:</span>
                  <span className="text-blue-600">portfolios.{user.portfolioSlug}</span>
                </div>
                <Link to={`/portfolios/${user.portfolioSlug}`}>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Portfolio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="sm" className="w-full">
                Add Experience
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                Add Skill
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                Add STAR Memo
              </Button>
            </CardContent>
          </Card>

          {/* Portfolio Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{portfolioStats.experiences}</div>
                  <div className="text-sm text-gray-600">Experiences</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{portfolioStats.skills}</div>
                  <div className="text-sm text-gray-600">Skills</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{portfolioStats.starMemos}</div>
                  <div className="text-sm text-gray-600">STAR Memos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">No recent activity</p>
                <p className="text-gray-500">Start building your portfolio!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Information</span>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Portfolio Settings</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Security</span>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
