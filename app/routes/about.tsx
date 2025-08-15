import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Nav } from "../components/nav";
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
    <>
      <Nav />
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Under Construction Card */}
          <Card className="shadow-lg mb-8 border-orange-200 bg-orange-50">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Construction className="w-12 h-12 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-orange-800">
                🚧 Under Construction! 🚧
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-orange-700 text-lg leading-relaxed max-w-3xl mx-auto">
                I'm actively building this portfolio platform to showcase modern web development practices 
                and create a scalable solution for professionals to display their work. This isn't just 
                another portfolio site—it's a demonstration of clean architecture, type safety, and 
                developer experience best practices. Every feature you see is built with scalability 
                and maintainability in mind.
              </p>
              <p className="text-orange-600 text-sm mt-4 font-medium">
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
                    PostgreSQL database
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                    Prisma Accelerate for hosting
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
                    Docker for containerization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-3 flex-shrink-0" />
                    ESLint for code quality
                  </li>
                  <li className="flex items-center">
                    <Cpu className="w-4 h-4 text-purple-600 mr-3 flex-shrink-0" />
                    Node.js 24.5.0 runtime
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
    </>
  );
}
