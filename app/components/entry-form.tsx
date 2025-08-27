import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useState, useEffect } from "react";
import type { CustomSection } from "../lib/db.server";
import { RichTextDisplay } from "./rich-text-display";

interface EntryFormProps {
  section: CustomSection;
  entry?: any; // For editing existing entries
  onClose: () => void;
  onSubmit: (entryData: any) => void;
  mode: "add" | "edit";
}

export function EntryForm({
  section,
  entry,
  onClose,
  onSubmit,
  mode,
}: EntryFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (entry && mode === "edit") {
      setFormData(entry);
    } else {
      // Initialize with empty form based on section template
      setFormData(getInitialFormData());
    }
  }, [entry, mode, section.content]);

  const getInitialFormData = () => {
    const template = section.content?.template;
    if (!template) return {};

    const initialData: any = {};
    Object.keys(template).forEach(fieldName => {
      const fieldConfig = template[fieldName];
      
      // Set default values based on field type
      switch (fieldConfig.type) {
        case 'tags':
          initialData[fieldName] = [];
          break;
        case 'image-gallery':
          initialData[fieldName] = [];
          break;
        case 'number':
          initialData[fieldName] = '';
          break;
        default:
          initialData[fieldName] = '';
      }
    });

    return initialData;
  };

  const validateForm = () => {
    const template = section.content?.template;
    if (!template) return true;

    const newErrors: Record<string, string> = {};

    Object.entries(template).forEach(([fieldName, fieldConfig]: [string, any]) => {
      if (fieldConfig.required) {
        const value = formData[fieldName];
        
        if (!value || 
            (typeof value === 'string' && !value.trim()) ||
            (Array.isArray(value) && value.length === 0)) {
          newErrors[fieldName] = `${fieldConfig.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Add metadata for new entries
    const entryData = mode === "add" ? {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    onSubmit(entryData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePreview = (fieldName: string) => {
    setPreviewMode(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const renderField = (fieldName: string, fieldConfig: any) => {
    const value = formData[fieldName] || '';
    const hasError = !!errors[fieldName];
    const isPreviewMode = previewMode[fieldName];

    switch (fieldConfig.type) {
      case 'textarea':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={isPreviewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePreview(fieldName)}
                >
                  {isPreviewMode ? "Edit" : "Preview"}
                </Button>
              </div>
            </div>
            
            {isPreviewMode ? (
              <div className="border rounded-md p-3 bg-gray-50 min-h-[120px]">
                <RichTextDisplay content={value} />
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  id={fieldName}
                  value={value}
                  onChange={(e) => handleInputChange(fieldName, e.target.value)}
                  placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label.toLowerCase()}...`}
                  className={`min-h-[120px] ${hasError ? 'border-red-500' : ''}`}
                  required={fieldConfig.required}
                />
                <div className="text-xs text-gray-500">
                  <p>💡 <strong>Markdown Tips:</strong></p>
                  <p>• Use <code>**bold**</code> for emphasis</p>
                  <p>• Use <code>-</code> or <code>•</code> for bullet points</p>
                  <p>• Use <code>1.</code> for numbered lists</p>
                  <p>• Use <code>:</code> at the end for headers</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'tags':
        return (
          <Input
            id={fieldName}
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => handleInputChange(fieldName, e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder={fieldConfig.placeholder || "Enter tags separated by commas..."}
            className={hasError ? 'border-red-500' : ''}
            required={fieldConfig.required}
          />
        );

      case 'image-gallery':
        return (
          <div className="space-y-2">
            <Input
              id={fieldName}
              type="url"
              value={Array.isArray(value) ? value.join(', ') : value}
              onChange={(e) => handleInputChange(fieldName, e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              placeholder={fieldConfig.placeholder || "Enter image URLs separated by commas..."}
              className={hasError ? 'border-red-500' : ''}
              required={fieldConfig.required}
            />
            <p className="text-xs text-gray-500">Enter image URLs separated by commas</p>
          </div>
        );

      case 'number':
        return (
          <Input
            id={fieldName}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label.toLowerCase()}...`}
            className={hasError ? 'border-red-500' : ''}
            required={fieldConfig.required}
            min={fieldConfig.validation?.minLength}
            max={fieldConfig.validation?.maxLength}
          />
        );

      case 'date':
        return (
          <Input
            id={fieldName}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={hasError ? 'border-red-500' : ''}
            required={fieldConfig.required}
          />
        );

      case 'url':
        return (
          <Input
            id={fieldName}
            type="url"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={fieldConfig.placeholder || "https://..."}
            className={hasError ? 'border-red-500' : ''}
            required={fieldConfig.required}
          />
        );

      default: // 'text' and fallback
        return (
          <Input
            id={fieldName}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label.toLowerCase()}...`}
            className={hasError ? 'border-red-500' : ''}
            required={fieldConfig.required}
            minLength={fieldConfig.validation?.minLength}
            maxLength={fieldConfig.validation?.maxLength}
          />
        );
    }
  };

  const renderDynamicForm = () => {
    const template = section.content?.template;
    if (!template) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No template found for this section type.</p>
        </div>
      );
    }

    // Use the fields array for proper ordering, fallback to template keys if fields not available
    const fieldOrder = section.content?.fields || Object.keys(template);
    
    return fieldOrder.map((fieldName: string) => {
      const fieldConfig = template[fieldName];
      if (!fieldConfig) {
        console.warn(`Field config not found for: ${fieldName}`);
        return null;
      }

      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName} className="flex items-center gap-2">
            {fieldConfig.label}
            {fieldConfig.required && <span className="text-red-500">*</span>}
          </Label>
          
          {renderField(fieldName, fieldConfig)}
          
          {errors[fieldName] && (
            <p className="text-red-500 text-sm">{errors[fieldName]}</p>
          )}
          
          {fieldConfig.placeholder && (
            <p className="text-xs text-gray-500">{fieldConfig.placeholder}</p>
          )}
        </div>
      );
    }).filter(Boolean); // Remove any null entries
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === "add" ? "Add Entry" : "Edit Entry"}
        </h2>
        <p className="text-gray-600 mt-1">
          {section.title} - {section.type}
        </p>
        {section.content?.fields && (
          <p className="text-sm text-gray-500 mt-1">
            Fields: {section.content.fields.join(', ')}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderDynamicForm()}

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {mode === "add" ? "Add Entry" : "Update Entry"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
