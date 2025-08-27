import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Globe, 
  Database, 
  Settings, 
  Code2, 
  Palette, 
  Layers,
  Shield,
  Zap,
  Container,
  CheckCircle,
  Cpu,
  Route,
  Wind,
  Sparkles,
  Construction
} from "lucide-react";

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Platform Status Card */}
          <Card className="shadow-lg mb-8 border-blue-200 bg-blue-50">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Construction className="w-12 h-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-800">
                🚧 Platform Development in Progress 🚧
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-700 text-lg leading-relaxed max-w-3xl mx-auto">
                This portfolio platform is actively being developed to showcase modern web development practices 
                and create a scalable solution for professionals to display their work. While the core architecture 
                and dashboard functionality are taking shape, we're still building out key features including 
                the public portfolio routes and finalizing the user experience.
              </p>
              <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-semibold text-sm mb-2">
                  🎯 Development Roadmap:
                </p>
                <ul className="text-blue-700 text-sm space-y-1 text-left max-w-2xl mx-auto">
                  <li>• Complete dashboard functionality and user management</li>
                  <li>• Develop public portfolio viewing routes</li>
                  <li>• Implement advanced content display options</li>
                  <li>• Polish user experience and responsive design</li>
                </ul>
                <p className="text-blue-800 font-medium text-sm mt-3">
                  🚀 Targeting Limited Beta Release: <span className="font-bold">September 2025</span>
                </p>
              </div>
              <p className="text-blue-600 text-sm mt-4 font-medium">
                Built with ❤️ and lots of ☕
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                About This Site
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6 text-gray-700">
              <div className="prose prose-gray max-w-none">
                <div className="mt-2 pt-2 border-gray-200">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    This platform demonstrates modern full-stack development practices, 
                    emphasizing clean architecture, type safety, and scalable design patterns. 
                    Built with developer experience in mind, it serves as both a functional 
                    portfolio showcase and a testament to current web development best practices.
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mt-4">
                    Current features include dynamic custom sections, markdown support, collapsible content, 
                    session management, and responsive design—all built with modern React patterns 
                    and a robust backend architecture. The platform is designed to be highly extensible 
                    and will support advanced portfolio customization options in the final release.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tech Stack Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Frontend Card */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Globe className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                  Frontend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <Route className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                    React Router v7 (Remix-based)
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                    TypeScript for type safety
                  </li>
                  <li className="flex items-center">
                    <Wind className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                    Tailwind CSS for styling
                  </li>
                  <li className="flex items-center">
                    <Layers className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                    shadcn/ui components
                  </li>
                  <li className="flex items-center">
                    <Code2 className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                    React Markdown rendering
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Backend & Database Card */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Database className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  Backend & Database
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <Sparkles className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                    Prisma ORM for database management
                  </li>
                  <li className="flex items-center">
                    <Database className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                    PostgreSQL hosted on Prisma Accelerate
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                    Session-based authentication
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Infrastructure & Tools Card */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                  Infrastructure & Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <Container className="w-4 h-4 text-purple-600 mr-3 flex-shrink-0" />
                    Vercel for hosting & deployment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-3 flex-shrink-0" />
                    ESLint for code quality
                  </li>
                  <li className="flex items-center">
                    <Cpu className="w-4 h-4 text-purple-600 mr-3 flex-shrink-0" />
                    Node.js 24.5.0 runtime
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-purple-600 mr-3 flex-shrink-0" />
                    Vite for fast builds
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Signature */}
          <div className="text-center">
            <div className="inline-block text-right">
              <p className="text-gray-600 text-sm">Best regards,</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">James McGhee</p>
              <p className="text-xs text-gray-500 mt-1">Full Stack Developer</p>
            </div>
          </div>
        </div>
      </main>
  );
}
