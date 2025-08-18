import type { LoaderFunctionArgs } from "react-router";
import { useParams, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

import { findUserBySlug } from "../lib/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  
  if (!slug) {
    throw new Error("Portfolio slug is required");
  }
  
  // Fetch real user data by slug from database
  const user = await findUserBySlug(slug);
  
  if (!user) {
    throw new Error("Portfolio not found");
  }
  
  if (!user.isPublic) {
    throw new Error("This portfolio is private");
  }
  
  // TODO: Fetch real experiences, skills, and star memos from database
  // For now, return mock data
  return {
    user,
    experiences: [],
    skills: [],
    starMemos: []
  };
}

export default function UserPortfolio() {
  const { slug } = useParams();
  
  // TODO: Get data from loader
  // For now, using mock data
  const user = {
    username: slug,
    firstName: "James",
    lastName: "McGhee",
    bio: "Professional developer with expertise in modern web technologies"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-xl text-gray-600 mb-6">{user.bio}</p>
          <div className="flex justify-center space-x-4">
            <Link to="/portfolios">
              <Button variant="outline">← Back to Portfolios</Button>
            </Link>
            <Button>Contact</Button>
          </div>
        </div>

        {/* Portfolio Content */}
        <div className="space-y-8">
          {/* Experience Section */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg">Senior Developer</h3>
                  <p className="text-gray-600">Tech Corp</p>
                  <p className="text-sm text-gray-500">2023 - Present</p>
                  <p className="text-gray-700 mt-2">
                    Led development of enterprise applications using modern web technologies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  React (Expert)
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  TypeScript (Advanced)
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Node.js (Advanced)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* STAR Memos Section */}
          <Card>
            <CardHeader>
              <CardTitle>Key Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Project Launch Success</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Situation:</span>
                      <p className="text-gray-600">Led team through complex project</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Task:</span>
                      <p className="text-gray-600">Deliver MVP on time</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Action:</span>
                      <p className="text-gray-600">Implemented agile methodology</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Result:</span>
                      <p className="text-gray-600">Launched 2 weeks early</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
