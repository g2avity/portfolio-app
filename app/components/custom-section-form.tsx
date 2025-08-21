import { useState } from "react";
import { Form } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Plus, X, Settings, FileText } from "lucide-react";

interface CustomField {
  id: string;
  name: string;
  type: "text" | "textarea" | "date" | "number" | "url";
  required: boolean;
  placeholder?: string;
}

interface CustomSectionFormData {
  title: string;
  description: string;
  fields: CustomField[];
}

interface CustomSectionFormProps {
  onClose: () => void; // Changed from onSubmit/onCancel to onClose
  initialData?: Partial<CustomSectionFormData>;
  mode: "add" | "edit";
  templates?: {
    name: string;
    description: string;
    fields: CustomField[];
  }[];
}

const DEFAULT_TEMPLATES = [
  {
    name: "STAR Memo",
    description: "Situation, Task, Action, Result format for achievements",
    fields: [
      { id: "situation", name: "Situation", type: "textarea" as const, required: true, placeholder: "Describe the context and challenge..." },
      { id: "task", name: "Task", type: "textarea" as const, required: true, placeholder: "What needed to be accomplished?" },
      { id: "action", name: "Action", type: "textarea" as const, required: true, placeholder: "What did you do to address it?" },
      { id: "result", name: "Result", type: "textarea" as const, required: true, placeholder: "What was the outcome and impact?" },
    ]
  },
  {
    name: "Project Showcase",
    description: "Highlight a specific project or initiative",
    fields: [
      { id: "projectName", name: "Project Name", type: "text" as const, required: true, placeholder: "Project title" },
      { id: "role", name: "Your Role", type: "text" as const, required: true, placeholder: "Your position on the project" },
      { id: "description", name: "Description", type: "textarea" as const, required: true, placeholder: "Project overview and goals" },
      { id: "technologies", name: "Technologies Used", type: "text" as const, required: false, placeholder: "Tech stack, tools, frameworks" },
      { id: "outcome", name: "Outcome", type: "textarea" as const, required: true, placeholder: "Results and impact" },
    ]
  },
  {
    name: "Speaking Engagement",
    description: "Document presentations, talks, or workshops",
    fields: [
      { id: "eventName", name: "Event Name", type: "text" as const, required: true, placeholder: "Conference, meetup, or event" },
      { id: "title", name: "Talk Title", type: "text" as const, required: true, placeholder: "Title of your presentation" },
      { id: "date", name: "Date", type: "date" as const, required: true },
      { id: "audience", name: "Audience Size", type: "number" as const, required: false, placeholder: "Number of attendees" },
      { id: "description", name: "Description", type: "textarea" as const, required: true, placeholder: "What you presented and key takeaways" },
    ]
  }
];

export function CustomSectionForm({ onClose, initialData, mode, templates = DEFAULT_TEMPLATES }: CustomSectionFormProps) {
  const [formData, setFormData] = useState<CustomSectionFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    fields: initialData?.fields || [],
  });

  const [errors, setErrors] = useState<Partial<CustomSectionFormData>>({});
  const [showTemplates, setShowTemplates] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomSectionFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Section title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Section description is required";
    }
    if (formData.fields.length === 0) {
      newErrors.fields = "At least one field is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // No custom handleSubmit needed - let React Router handle form submission

  const handleInputChange = (field: keyof CustomSectionFormData, value: string | CustomField[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addField = () => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      name: "",
      type: "text",
      required: false,
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (index: number, field: Partial<CustomField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, ...field } : f)
    }));
  };

  const removeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const applyTemplate = (template: typeof DEFAULT_TEMPLATES[0]) => {
    setFormData({
      title: template.name,
      description: template.description,
      fields: template.fields.map(field => ({
        ...field,
        id: `${field.id}_${Date.now()}`
      }))
    });
    setShowTemplates(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {mode === "add" ? "Create Custom Section" : "Edit Custom Section"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post" className="space-y-6">
          {/* Hidden action field */}
          <input type="hidden" name="_action" value="createCustomSection" />
          {/* Section Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Section Title *
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={formData.title}
              placeholder="e.g., STAR Memos, Project Showcase, Speaking Engagements"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Section Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Section Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={formData.description}
              placeholder="Describe what this section will contain..."
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Templates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Quick Templates</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                {showTemplates ? "Hide" : "Show"} Templates
              </Button>
            </div>
            
            {showTemplates && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map((template) => (
                  <Card
                    key={template.name}
                    className="p-3 cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                    <div className="text-xs text-gray-500 mt-2">{template.fields.length} fields</div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Custom Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Section Fields</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {formData.fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No fields defined yet</p>
                <p className="text-sm">Add fields to define the structure of this section</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600">Field Name</Label>
                        <Input
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          placeholder="Field name"
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600">Type</Label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value as CustomField['type'] })}
                          className="w-full px-2 py-1 text-sm border rounded"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Long Text</option>
                          <option value="date">Date</option>
                          <option value="number">Number</option>
                          <option value="url">URL</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-xs text-gray-600">Required</span>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {field.type === "textarea" && (
                      <div className="mt-3">
                        <Label className="text-xs text-gray-600">Placeholder Text</Label>
                        <Input
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(index, { placeholder: e.target.value })}
                          placeholder="Optional placeholder text"
                          className="text-sm"
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            
            {errors.fields && (
              <p className="text-sm text-red-600">{errors.fields}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === "add" ? "Create Section" : "Save Changes"}
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
