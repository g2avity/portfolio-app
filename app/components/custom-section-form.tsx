import { useState, useEffect } from "react";
import { Form } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Plus, X, Settings, FileText, CheckCircle } from "lucide-react";
import { 
  getAllSectionTypes, 
  getPredefinedSectionTemplate,
  type PredefinedSectionType 
} from "../lib/content-section-models";

interface CustomSectionFormData {
  id?: string;
  title: string;
  description: string;
  type: string;
}

interface CustomSectionFormProps {
  onClose: () => void;
  initialData?: Partial<CustomSectionFormData>;
  mode: "add" | "edit";
}

export function CustomSectionForm({ onClose, initialData, mode }: CustomSectionFormProps) {
  const [formData, setFormData] = useState<CustomSectionFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    type: initialData?.type || "",
  });

  const [errors, setErrors] = useState<Partial<CustomSectionFormData>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<PredefinedSectionType | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  const availableTypes = getAllSectionTypes();

  useEffect(() => {
    if (formData.type) {
      const template = getPredefinedSectionTemplate(formData.type);
      setSelectedTemplate(template);
    }
  }, [formData.type]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomSectionFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Section title is required";
    }
    if (!formData.type) {
      newErrors.type = "Please select a section type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };





  const getTemplateDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'star-memo': 'Professional achievements using the STAR method (Situation, Task, Action, Result)',
      'project-showcase': 'Showcase your technical projects with descriptions, technologies, and outcomes',
      'community-engagement': 'Highlight your involvement in professional communities, open source, and volunteer work',
      'speaking-engagements': 'Document your speaking engagements, presentations, and conference talks',
      'certifications': 'Showcase your professional certifications, licenses, and credentials'
    };
    return descriptions[type] || "No description available";
  };

  const getTemplateFields = (type: string): string[] => {
    const template = getPredefinedSectionTemplate(type);
    return template?.fields || [];
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {mode === "add" ? "Create New Custom Section" : "Edit Custom Section"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <input type="hidden" name="_action" value={mode === "add" ? "createCustomSection" : "updateCustomSection"} />
          {mode === "edit" && initialData && (
            <input type="hidden" name="sectionId" value={initialData.id} />
          )}
          
          <div className="space-y-6">
            {/* Section Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Section Type *
              </Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                disabled={mode === "edit"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a section type...</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type}</p>
              )}
              {formData.type && (
                <p className="text-sm text-gray-600">
                  {getTemplateDescription(formData.type)}
                </p>
              )}
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Template Preview</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplatePreview(!showTemplatePreview)}
                  >
                    {showTemplatePreview ? "Hide" : "Show"} Details
                  </Button>
                </div>
                
                {showTemplatePreview && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Layout:</span> {selectedTemplate.layout}
                      </div>
                      <div>
                        <span className="font-medium">Max Entries:</span> {selectedTemplate.maxEntries || 'Unlimited'}
                      </div>
                      <div>
                        <span className="font-medium">Images:</span> {selectedTemplate.allowImages ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="font-medium">Code:</span> {selectedTemplate.allowCode ? 'Yes' : 'No'}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="font-medium text-sm">Fields:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTemplate.fields.map((field) => (
                          <span 
                            key={field} 
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Section Title *
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., My Professional Certifications"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Section Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this section will contain..."
                rows={3}
              />
            </div>

            {/* Public/Private Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Visibility</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  defaultChecked={true}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPublic" className="text-sm">
                  Make this section public on my portfolio
                </Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!formData.title.trim() || !formData.type}
              >
                {mode === "add" ? "Create Section" : "Update Section"}
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
