import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Brain, Target, Clock, Tag } from "lucide-react";

interface SkillFormData {
  name: string;
  description: string;
  category: string;
  proficiency: number;
  yearsOfExperience: number;
}

interface SkillFormProps {
  onSubmit: (data: SkillFormData) => void;
  onCancel: () => void;
  initialData?: Partial<SkillFormData>;
  mode: "add" | "edit";
}

const PROFICIENCY_LEVELS = [
  { value: 1, label: "Beginner", description: "Basic understanding" },
  { value: 2, label: "Elementary", description: "Some practical experience" },
  { value: 3, label: "Intermediate", description: "Good working knowledge" },
  { value: 4, label: "Advanced", description: "Extensive experience" },
  { value: 5, label: "Expert", description: "Mastery level" },
];

const SKILL_CATEGORIES = [
  "Programming Languages",
  "Frameworks & Libraries",
  "Databases",
  "Cloud & DevOps",
  "Design & UI/UX",
  "Project Management",
  "Communication",
  "Leadership",
  "Analytics",
  "Other",
];

export function SkillsForm({ onSubmit, onCancel, initialData, mode }: SkillFormProps) {
  const [formData, setFormData] = useState<SkillFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    proficiency: initialData?.proficiency || 3,
    yearsOfExperience: initialData?.yearsOfExperience || 1,
  });

  const [errors, setErrors] = useState<Partial<SkillFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SkillFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Skill name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Skill description is required";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = "Years of experience cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof SkillFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {mode === "add" ? "Add New Skill" : "Edit Skill"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skill Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Skill Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., React, Python, Project Management"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Category *
            </Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a category</option>
              {SKILL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Proficiency Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Proficiency Level *
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {PROFICIENCY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.proficiency === level.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="proficiency"
                    value={level.value}
                    checked={formData.proficiency === level.value}
                    onChange={(e) => handleInputChange("proficiency", parseInt(e.target.value))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-gray-600">{level.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Years of Experience */}
          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Years of Experience
            </Label>
            <Input
              id="yearsOfExperience"
              type="number"
              min="0"
              max="50"
              value={formData.yearsOfExperience}
              onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value) || 0)}
              placeholder="e.g., 3"
              className={errors.yearsOfExperience ? "border-red-500" : ""}
            />
            {errors.yearsOfExperience && (
              <p className="text-sm text-red-600">{errors.yearsOfExperience}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Skill Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your experience with this skill, projects you've used it on, certifications, etc..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Add Skill" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
