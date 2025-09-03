import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Upload, 
  Download, 
  Trash2, 
  FolderOpen, 
  FileText, 
  Image, 
  Archive,
  HardDrive,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  User,
  ArrowLeft
} from "lucide-react";
import { requireUser } from "../lib/session.server";
import { ErrorBoundary as AppErrorBoundary } from "../components/error-boundary";
import { getPortfolioConfig } from "../lib/portfolio-config.server";
import { 
  getUserStorageUsage, 
  listUserMediaFiles, 
  uploadMediaFile, 
  deleteFile,
  canUserUploadFile
} from "../lib/blob.server";
import { 
  FILE_TYPES,
  validateFile,
  getFileCategory
} from "../lib/blob.constants";
import { redirect } from "react-router";
import { useState, useRef, useEffect } from "react";
import { useLoaderData, useSubmit, useActionData } from "react-router";

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <AppErrorBoundary 
      error={error} 
      title="Media Library Error"
      showBackButton={true}
      showHomeButton={true}
    />
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  try {
    const [storageUsage, mediaFiles, portfolioConfig] = await Promise.all([
      getUserStorageUsage(user.id),
      listUserMediaFiles(user.id),
      getPortfolioConfig(user.id)
    ]);
    
    return { user, storageUsage, mediaFiles, portfolioConfig };
  } catch (error) {
    console.error('Failed to load media library data:', error);
    throw new Error('Failed to load media library');
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const action = formData.get("_action");
  
  if (action === "uploadFile") {
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    
    if (!file || !category) {
      return { 
        success: false, 
        error: "Missing file or category" 
      };
    }
    
    try {
      // Validate file before upload
      const validation = validateFile(file);
      if (!validation.isValid) {
        return { 
          success: false, 
          error: validation.error || "File validation failed" 
        };
      }
      
      // Check storage quota
      const quotaCheck = await canUserUploadFile(file, user.id);
      if (!quotaCheck.canUpload) {
        return { 
          success: false, 
          error: quotaCheck.error || "Storage quota exceeded" 
        };
      }
      
      // Upload file
      const result = await uploadMediaFile(file, user.id, category);
      
      return { 
        success: true, 
        type: "file-uploaded",
        filename: file.name,
        url: result.url
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Upload failed" 
      };
    }
  }
  
  if (action === "deleteFile") {
    const fileUrl = formData.get("fileUrl") as string;
    
    if (!fileUrl) {
      return { 
        success: false, 
        error: "Missing file URL" 
      };
    }
    
    try {
      await deleteFile(fileUrl);
      
      return { 
        success: true, 
        type: "file-deleted",
        message: "File deleted successfully"
      };
    } catch (error) {
      console.error('Failed to delete file:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Delete failed" 
      };
    }
  }
  
  throw new Response("Invalid action", { status: 400 });
}

export default function MediaLibrary() {
  const { user, storageUsage, mediaFiles, portfolioConfig } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  // Extract theme from portfolio config
  const theme = portfolioConfig?.theme || 'light';
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter files based on category and search
  const filteredFiles = mediaFiles.filter(file => {
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Handle file upload
  const handleFileUpload = async (files: FileList, category: string) => {
    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("_action", "uploadFile");
        formData.append("file", file);
        formData.append("category", category);
        
        submit(formData, { method: "post" });
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };
  
  // Handle file deletion
  const handleDeleteFile = (fileUrl: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      const formData = new FormData();
      formData.append("_action", "deleteFile");
      formData.append("fileUrl", fileUrl);
      
      submit(formData, { method: "post" });
    }
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Auto-detect category from first file
      const firstFile = files[0];
      const category = getFileCategory(firstFile) || "images";
      handleFileUpload(files, category);
    }
  };
  
  // Get file category helper - now using imported function
  // const getFileCategory = (file: File): string => { ... } - removed, using imported version
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get file icon or preview based on category and file
  const getFileIcon = (category: string, file?: any) => {
    // Show image preview for images and avatars
    if ((category === 'images' || category === 'avatars') && file?.url) {
      return (
        <div 
          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-transform hover:scale-105" 
          style={{ backgroundColor: 'var(--border-light)' }}
          title={file.filename || 'Image preview'}
        >
          <img 
            src={file.url} 
            alt={file.filename || 'Image preview'}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => window.open(file.url, '_blank')}
            onError={(e) => {
              // Fallback to icon if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center">
            {category === 'avatars' ? <User className="w-8 h-8" /> : <Image className="w-8 h-8" />}
          </div>
        </div>
      );
    }
    
    // Default icons for other file types
    switch (category) {
      case 'avatars': return <User className="w-8 h-8" />;
      case 'portfolio': return <FolderOpen className="w-8 h-8" />;
      case 'images': return <Image className="w-8 h-8" />;
      case 'documents': return <FileText className="w-8 h-8" />;
      case 'archives': return <Archive className="w-8 h-8" />;
      default: return <FileText className="w-8 h-8" />;
    }
  };
  
  // Handle action responses
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert(`Error: ${actionData.error}`);
      }
    }
  }, [actionData]);
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b px-4 py-6 sm:px-6 lg:px-8" style={{ 
        backgroundColor: 'var(--bg-navbar)', 
        borderColor: 'var(--border-color)' 
      }}>
        <div className="max-w-7xl mx-auto">
          {/* Back Navigation */}
          <Link 
            to="/dashboard" 
            className="inline-flex items-center mb-4 transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Media Library
            </h1>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
              Manage your files and media content
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Storage Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {storageUsage.totalSizeMB} MB
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Used
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {storageUsage.quotaMB} MB
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {storageUsage.remainingMB} MB
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Available
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {storageUsage.fileCount}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Files
                </div>
              </div>
            </div>
            
            {/* Storage Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: 'var(--text-secondary)' }}>Storage Usage</span>
                <span style={{ color: 'var(--text-secondary)' }}>{storageUsage.usagePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2" style={{ backgroundColor: 'var(--border-light)' }}>
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(storageUsage.usagePercentage, 100)}%`,
                    backgroundColor: storageUsage.usagePercentage > 90 ? '#ef4444' : storageUsage.usagePercentage > 75 ? '#f59e0b' : '#3b82f6'
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(FILE_TYPES).map(([category, config]) => (
                <div
                  key={category}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                    dragOver ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  style={{ 
                    borderColor: dragOver ? 'var(--focus-ring)' : 'var(--border-color)',
                    backgroundColor: dragOver ? 'var(--bg-card-content)' : 'var(--bg-card)'
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-3">
                    {getFileIcon(category)}
                    <div>
                      <h3 className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                        {category}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Max {Math.round(config.maxSize / (1024 * 1024))}MB
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {config.extensions.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={Object.values(FILE_TYPES).map(config => config.mimeTypes.join(',')).join(',')}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  const files = e.target.files;
                  const category = getFileCategory(files[0]);
                  if (category) {
                    handleFileUpload(files, category);
                  }
                }
              }}
            />
            
            {uploading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--focus-ring)' }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>Uploading files...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Your Files
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  style={{
                    borderWidth: viewMode === "grid" ? "2px" : "1px",
                    borderColor: viewMode === "grid" ? "var(--focus-ring)" : "var(--border-color)",
                    backgroundColor: viewMode === "grid" ? "var(--bg-card)" : "var(--bg-card)",
                    color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-secondary)"
                  }}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  style={{
                    borderWidth: viewMode === "list" ? "2px" : "1px",
                    borderColor: viewMode === "list" ? "var(--focus-ring)" : "var(--border-color)",
                    backgroundColor: viewMode === "list" ? "var(--bg-card)" : "var(--bg-card)",
                    color: viewMode === "list" ? "var(--text-primary)" : "var(--text-secondary)"
                  }}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                  style={{ 
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="avatars">Profile Pictures</option>
                  <option value="portfolio">Portfolio Files</option>
                  <option value="images">Images</option>
                  <option value="documents">Documents</option>
                  <option value="archives">Archives</option>
                </select>
              </div>
            </div>

            {/* Files Display */}
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  No files found
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {searchQuery || selectedCategory !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Upload your first file to get started"
                  }
                </p>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-2"}>
                {filteredFiles.map((file) => (
                  <div
                    key={file.url}
                    className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                      viewMode === "list" ? "flex items-center gap-4" : ""
                    }`}
                    style={{ 
                      borderColor: 'var(--border-color)', 
                      backgroundColor: 'var(--bg-card-content)' 
                    }}
                  >
                    {viewMode === "grid" ? (
                      // Grid View
                      <div className="text-center">
                        <div className="mb-3 flex justify-center">
                          {getFileIcon(file.category, file)}
                        </div>
                                                 <h3 className="font-medium text-sm mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                           {file.category === 'avatars' ? 'Profile Picture' : file.filename}
                         </h3>
                         <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                           {formatFileSize(file.size)}
                           {file.category === 'avatars' && ' • Profile'}
                           {file.category === 'portfolio' && ' • Portfolio'}
                         </p>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFile(file.url)}
                            style={{ color: 'var(--error-text)' }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <>
                        <div className="flex-shrink-0">
                          {getFileIcon(file.category, file)}
                        </div>
                                                 <div className="flex-1 min-w-0">
                           <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                             {file.category === 'avatars' ? 'Profile Picture' : file.filename}
                           </h3>
                           <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                             {formatFileSize(file.size)} • {file.category}
                             {file.category === 'avatars' && ' (Profile)'}
                             {file.category === 'portfolio' && ' (Portfolio)'}
                           </p>
                         </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteFile(file.url)}
                            style={{ color: 'var(--error-text)' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
