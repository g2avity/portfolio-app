import { isRouteErrorResponse } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, Home, ArrowLeft, Copy, Check } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

interface ErrorBoundaryProps {
  error: unknown;
  title?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

// Helper function to safely stringify errors
function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (isRouteErrorResponse(error)) {
    return `${error.status}: ${error.statusText || 'Unknown error'}`;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }
  
  return String(error);
}

export function ErrorBoundary({ 
  error, 
  title = "Something went wrong",
  showHomeButton = true,
  showBackButton = true 
}: ErrorBoundaryProps) {
  let message = "An unexpected error occurred.";
  let details = "";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    
    switch (error.status) {
      case 404:
        title = "Page Not Found";
        message = "The page you're looking for doesn't exist.";
        break;
      case 401:
        title = "Unauthorized";
        message = "You need to be logged in to access this page.";
        break;
      case 403:
        title = "Access Denied";
        message = "You don't have permission to view this content.";
        break;
      case 500:
        title = "Server Error";
        message = "Something went wrong on our end. Please try again.";
        break;
      default:
        title = `Error ${error.status}`;
        message = error.statusText || "An error occurred.";
    }
  } else if (error instanceof Error) {
    message = error.message;
    
    // Handle specific error types
    if (error.message.includes("portfolio is private")) {
      title = "Portfolio is Private";
      message = "This portfolio is not publicly accessible. The owner may have set it to private.";
    } else if (error.message.includes("not found")) {
      title = "Not Found";
      message = "The requested content could not be found.";
    } else if (error.message.includes("authentication")) {
      title = "Authentication Required";
      message = "Please log in to access this content.";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
            
            {details && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 font-mono">
                  {details}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {showBackButton && (
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              )}
              
              {showHomeButton && (
                <Link to="/">
                  <Button className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </Link>
              )}
            </div>
            
            {process.env.NODE_ENV === "development" && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Show Technical Details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Technical Details</span>
                    <CopyButton 
                      text={`Status: ${status}\nError: ${stringifyError(error)}\n${error instanceof Error && error.stack ? `Stack:\n${error.stack}` : ''}`}
                    />
                  </div>
                  <p><strong>Status:</strong> {status}</p>
                  <p><strong>Error:</strong> {stringifyError(error)}</p>
                  {error instanceof Error && error.stack && (
                    <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Copy button component for technical details
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-6 px-2 text-xs hover:bg-gray-200"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3 h-3 text-green-600" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
    </Button>
  );
}
