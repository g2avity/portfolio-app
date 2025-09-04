import { useState, useEffect } from "react";
import { Form } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Briefcase, Building2, MapPin, Calendar } from "lucide-react";

interface ExperienceFormData {
  title: string;
  companyName: string;
  description: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  location: string;
  isPublic: boolean;
}

interface ExperienceFormProps {
  mode: "add" | "edit";
  initialData?: ExperienceFormData & { id?: string };
  onClose: () => void; // Changed from onSubmit/onCancel to onClose
}

export function ExperienceForm({ mode, initialData, onClose }: ExperienceFormProps) {
  const [formData, setFormData] = useState<ExperienceFormData>({
    title: initialData?.title || "",
    companyName: initialData?.companyName || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    isCurrent: initialData?.isCurrent || false,
    location: initialData?.location || "",
    isPublic: initialData?.isPublic ?? true,
  });

  const [errors, setErrors] = useState<Partial<ExperienceFormData>>({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ExperienceFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          {mode === "add" ? "Add New Experience" : "Edit Experience"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post" className="space-y-6">
          {/* Hidden action field */}
          <input 
            type="hidden" 
            name="_action" 
            value={mode === "edit" ? "updateExperience" : "createExperience"} 
          />
          
          {/* Hidden experience ID for edit mode */}
          {mode === "edit" && initialData?.id && (
            <input type="hidden" name="experienceId" value={initialData.id} />
          )}

          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Title *
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={formData.title}
              placeholder="e.g., Senior Software Engineer"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Name *
            </Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={formData.companyName}
              placeholder="e.g., Google Inc."
              className={errors.companyName ? "border-red-500" : ""}
            />
            {errors.companyName && (
              <p className="text-sm text-red-600">{errors.companyName}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              name="location"
              defaultValue={formData.location}
              placeholder="e.g., San Francisco, CA or Remote"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={formData.startDate}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={formData.endDate}
                disabled={formData.isCurrent}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Current Position Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              id="isCurrent"
              name="isCurrent"
              type="checkbox"
              defaultChecked={formData.isCurrent}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isCurrent">This is my current position</Label>
          </div>

          {/* Public Visibility Toggle */}
          <div className="flex items-center space-x-2">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              defaultChecked={formData.isPublic}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPublic">Show this experience on my public portfolio</Label>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={formData.description}
              placeholder="Describe your role, responsibilities, and achievements...&#10;&#10;You can use:&#10;• Bullet points&#10;- Or dashes&#10;1. Numbered lists&#10;&#10;Responsibilities:&#10;• Led development of...&#10;• Managed team of...&#10;&#10;Achievements:&#10;• Increased performance by 50%&#10;• Reduced costs by $100k"
              rows={6}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Add Experience" : "Save Changes"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
