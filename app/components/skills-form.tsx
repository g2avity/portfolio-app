import { useState, useEffect } from "react";
import { Form } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Brain, Target, Clock, Tag } from "lucide-react";

interface SkillFormData {
  id?: string;
  name: string;
  description: string;
  category: string;
  proficiency: number;
  yearsOfExperience: number;
}

interface SkillFormErrors {
  name?: string;
  description?: string;
  category?: string;
  proficiency?: string;
  yearsOfExperience?: string;
}

interface SkillFormProps {
  onClose: () => void; // Changed from onSubmit/onCancel to onClose
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

export function SkillsForm({ onClose, initialData, mode }: SkillFormProps) {
  const [formData, setFormData] = useState<SkillFormData>({
    id: initialData?.id,
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    proficiency: initialData?.proficiency || 3,
    yearsOfExperience: initialData?.yearsOfExperience || 1,
  });

  const [errors, setErrors] = useState<SkillFormErrors>({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        proficiency: initialData.proficiency || 3,
        yearsOfExperience: initialData.yearsOfExperience || 1,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: SkillFormErrors = {};

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

  // No custom handleSubmit needed - let React Router handle form submission

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {mode === "add" ? "Add New Skill" : "Edit Skill"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post" className="space-y-6">
          {/* Hidden action field */}
          <input 
            type="hidden" 
            name="_action" 
            value={mode === "edit" ? "updateSkill" : "createSkill"} 
          />
          
          {/* Hidden skill ID for edit mode */}
          {mode === "edit" && formData.id && (
            <input type="hidden" name="skillId" value={formData.id} />
          )}

          {/* Skill Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Skill Name *
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={formData.name}
              placeholder="e.g., React, Python, Project Management"
              className={errors.name ? "border-red-500" : ""}
              required
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
              name="category"
              defaultValue={formData.category}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
              required
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
                      value={level.value.toString()}
                      defaultChecked={formData.proficiency === level.value}
                      className="mr-3"
                      required
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
              name="yearsOfExperience"
              min="0"
              max="50"
              defaultValue={formData.yearsOfExperience.toString()}
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
              name="description"
              defaultValue={formData.description}
              placeholder="Describe your experience with this skill, projects you've used it on, certifications, etc..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
              required
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
              {mode === "add" ? "Add Skill" : "Save Changes"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
