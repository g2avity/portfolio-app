import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Search, 
  Eye, 
  Globe, 
  FileText, 
  Tag, 
  Image, 
  Link, 
  Bot, 
  Languages, 
  User,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Modal } from "./ui/modal";
import { useLoaderData, useSubmit, useActionData } from "react-router";

interface SEOSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SEOSettings {
  pageTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
  robotsMeta: string;
  language: string;
  author: string;
}

export default function SEOSettingsModal({ isOpen, onClose }: SEOSettingsModalProps) {
  const { portfolioConfig } = useLoaderData<typeof import("../routes/dashboard").loader>();
  const submit = useSubmit();
  const actionData = useActionData<typeof import("../routes/dashboard").action>();
  
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    pageTitle: "",
    metaDescription: "",
    keywords: "",
    ogImage: "",
    canonicalUrl: "",
    robotsMeta: "index, follow",
    language: "en-US",
    author: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load SEO settings on modal open
  useEffect(() => {
    if (isOpen) {
      loadSEOSettings();
    }
  }, [isOpen]);

  // Check for changes
  useEffect(() => {
    const hasAnyChanges = Object.values(seoSettings).some(value => value.trim() !== "");
    setHasChanges(hasAnyChanges);
  }, [seoSettings]);

  // Handle action response
  useEffect(() => {
    if (actionData?.success) {
      onClose();
    } else if (actionData?.error) {
      console.error('SEO settings update failed:', actionData.error);
    }
  }, [actionData, onClose]);

  const loadSEOSettings = () => {
    if (portfolioConfig) {
      setSeoSettings({
        pageTitle: portfolioConfig.seoTitle || "",
        metaDescription: portfolioConfig.seoDescription || "",
        keywords: portfolioConfig.seoKeywords || "",
        ogImage: portfolioConfig.seoOgImage || "",
        canonicalUrl: portfolioConfig.seoCanonicalUrl || "",
        robotsMeta: portfolioConfig.seoRobotsMeta || "index, follow",
        language: portfolioConfig.seoLanguage || "en-US",
        author: portfolioConfig.seoAuthor || ""
      });
    }
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'pageTitle':
        if (value.length > 60) return 'Page title should be 60 characters or less for optimal SEO';
        if (value.length < 10) return 'Page title should be at least 10 characters';
        break;
      case 'metaDescription':
        if (value.length > 160) return 'Meta description should be 160 characters or less';
        if (value.length > 0 && value.length < 50) return 'Meta description should be at least 50 characters';
        break;
      case 'keywords':
        if (value.length > 200) return 'Keywords should be 200 characters or less';
        break;
      case 'canonicalUrl':
        if (value && !isValidUrl(value)) return 'Please enter a valid URL';
        break;
      case 'ogImage':
        if (value && !isValidUrl(value)) return 'Please enter a valid image URL';
        break;
    }
    return '';
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFieldChange = (field: keyof SEOSettings, value: string) => {
    setSeoSettings(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Validate all fields
      const errors: Record<string, string> = {};
      Object.entries(seoSettings).forEach(([field, value]) => {
        const error = validateField(field, value);
        if (error) errors[field] = error;
      });

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setIsLoading(false);
        return;
      }

      // Submit to action
      const formData = new FormData();
      formData.append("_action", "updateSEOSettings");
      formData.append("seoTitle", seoSettings.pageTitle);
      formData.append("seoDescription", seoSettings.metaDescription);
      formData.append("seoKeywords", seoSettings.keywords);
      formData.append("seoOgImage", seoSettings.ogImage);
      formData.append("seoCanonicalUrl", seoSettings.canonicalUrl);
      formData.append("seoRobotsMeta", seoSettings.robotsMeta);
      formData.append("seoLanguage", seoSettings.language);
      formData.append("seoAuthor", seoSettings.author);

      submit(formData, { method: "post" });
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCharacterCount = (field: string, value: string) => {
    const limits: Record<string, number> = {
      pageTitle: 60,
      metaDescription: 160,
      keywords: 200
    };
    
    const limit = limits[field];
    if (!limit) return null;
    
    const isOverLimit = value.length > limit;
    const isNearLimit = value.length > limit * 0.8;
    
    return (
      <span 
        className={`text-xs ${
          isOverLimit ? 'text-red-500' : 
          isNearLimit ? 'text-yellow-500' : 
          'text-gray-500'
        }`}
        style={{ 
          color: isOverLimit ? 'var(--error-text)' : 
                 isNearLimit ? '#f59e0b' : 
                 'var(--text-muted)' 
        }}
      >
        {value.length}/{limit}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SEO Settings">
      <div className="space-y-6">
        {/* Essential SEO Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Essential SEO Fields
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Page Title */}
            <div className="space-y-2">
              <Label htmlFor="pageTitle" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Page Title
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pageTitle"
                value={seoSettings.pageTitle}
                onChange={(e) => handleFieldChange('pageTitle', e.target.value)}
                placeholder="Your Portfolio - Professional Developer"
                className={validationErrors.pageTitle ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center">
                {getCharacterCount('pageTitle', seoSettings.pageTitle)}
                {validationErrors.pageTitle && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.pageTitle}
                  </span>
                )}
              </div>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="metaDescription" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Meta Description
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="metaDescription"
                value={seoSettings.metaDescription}
                onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
                placeholder="Professional developer with expertise in React, Node.js, and modern web technologies. View my portfolio and projects."
                rows={3}
                className={validationErrors.metaDescription ? 'border-red-500' : ''}
              />
              <div className="flex justify-between items-center">
                {getCharacterCount('metaDescription', seoSettings.metaDescription)}
                {validationErrors.metaDescription && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.metaDescription}
                  </span>
                )}
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Keywords
              </Label>
              <Input
                id="keywords"
                value={seoSettings.keywords}
                onChange={(e) => handleFieldChange('keywords', e.target.value)}
                placeholder="developer, react, javascript, portfolio, web development"
              />
              <div className="flex justify-between items-center">
                {getCharacterCount('keywords', seoSettings.keywords)}
                {validationErrors.keywords && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.keywords}
                  </span>
                )}
              </div>
            </div>

            {/* Open Graph Image */}
            <div className="space-y-2">
              <Label htmlFor="ogImage" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Open Graph Image
              </Label>
              <Input
                id="ogImage"
                value={seoSettings.ogImage}
                onChange={(e) => handleFieldChange('ogImage', e.target.value)}
                placeholder="https://example.com/og-image.jpg"
                className={validationErrors.ogImage ? 'border-red-500' : ''}
              />
              {validationErrors.ogImage && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.ogImage}
                </span>
              )}
            </div>

            {/* Canonical URL */}
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl" className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Canonical URL
              </Label>
              <Input
                id="canonicalUrl"
                value={seoSettings.canonicalUrl}
                onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
                placeholder="https://yourportfolio.com"
                className={validationErrors.canonicalUrl ? 'border-red-500' : ''}
              />
              {validationErrors.canonicalUrl && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.canonicalUrl}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Optional SEO Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Optional SEO Fields
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Robots Meta */}
            <div className="space-y-2">
              <Label htmlFor="robotsMeta" className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Robots Meta
              </Label>
              <Input
                id="robotsMeta"
                value={seoSettings.robotsMeta}
                onChange={(e) => handleFieldChange('robotsMeta', e.target.value)}
                placeholder="index, follow"
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Controls how search engines crawl and index your page
              </p>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Language
              </Label>
              <Input
                id="language"
                value={seoSettings.language}
                onChange={(e) => handleFieldChange('language', e.target.value)}
                placeholder="en-US"
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Language code for your content (e.g., en-US, es-ES, fr-FR)
              </p>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Author
              </Label>
              <Input
                id="author"
                value={seoSettings.author}
                onChange={(e) => handleFieldChange('author', e.target.value)}
                placeholder="Your Name"
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Author name for meta tags and structured data
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Search Engine Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4" style={{ 
              borderColor: 'var(--border-color)', 
              backgroundColor: 'var(--bg-card-content)' 
            }}>
              <div className="space-y-2">
                <h3 
                  className="text-lg font-medium text-blue-600 hover:underline cursor-pointer"
                  style={{ color: 'var(--focus-ring)' }}
                >
                  {seoSettings.pageTitle || "Your Portfolio - Professional Developer"}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {seoSettings.canonicalUrl || "https://yourportfolio.com"}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {seoSettings.metaDescription || "Professional developer with expertise in React, Node.js, and modern web technologies. View my portfolio and projects."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !hasChanges}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'white' }}></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save SEO Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
