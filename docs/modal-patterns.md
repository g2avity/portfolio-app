# Modal Patterns & Implementation

## Overview
This document outlines the patterns we use for implementing modals in our React Router application, including form handling, state management, and database integration.

## Core Modal Pattern

### 1. Modal Component Structure
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Additional props specific to modal content
}

export default function MyModal({ isOpen, onClose, ...props }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Modal Title</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Modal content */}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 2. Parent Component Integration
```typescript
// In parent component (e.g., dashboard.tsx)
export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      {/* Trigger button */}
      <Button onClick={() => setShowModal(true)}>
        Open Modal
      </Button>
      
      {/* Modal */}
      <MyModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
```

## Form Modal Patterns

### 1. Form Modal with Database Integration
```typescript
import { useSubmit, useActionData } from "react-router";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function FormModal({ isOpen, onClose, initialData }: FormModalProps) {
  const [formData, setFormData] = useState(initialData || {});
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();
  
  // Handle form submission
  const handleSave = () => {
    const form = new FormData();
    form.append("_action", "updateSettings");
    form.append("setting1", formData.setting1);
    form.append("setting2", formData.setting2);
    submit(form, { method: "post" });
  };
  
  // Handle action results
  useEffect(() => {
    if (actionData?.success) {
      onClose(); // Close modal on success
    }
  }, [actionData, onClose]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal content with form */}
    </div>
  );
}
```

### 2. Preview Modal Pattern
```typescript
export default function PreviewModal({ isOpen, onClose, data }: PreviewModalProps) {
  const [previewData, setPreviewData] = useState(data);
  
  // Apply changes immediately for preview
  const handleChange = (key: string, value: any) => {
    const newData = { ...previewData, [key]: value };
    setPreviewData(newData);
    // Apply changes to DOM for preview
    applyPreviewChanges(newData);
  };
  
  // Save changes to database
  const handleSave = () => {
    const form = new FormData();
    form.append("_action", "saveChanges");
    form.append("data", JSON.stringify(previewData));
    submit(form, { method: "post" });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal with preview and save functionality */}
    </div>
  );
}
```

## Theme-Aware Modal Pattern

### 1. CSS Variable Integration
```typescript
export default function ThemedModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative rounded-lg shadow-xl max-w-2xl w-full mx-4"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          borderWidth: '1px'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6"
          style={{ borderBottomColor: 'var(--border-color)', borderBottomWidth: '1px' }}
        >
          <h2 
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Modal Title
          </h2>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)' }}
            className="hover:opacity-80"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p style={{ color: 'var(--text-secondary)' }}>
            Modal content goes here
          </p>
        </div>
        
        {/* Footer */}
        <div 
          className="flex justify-end gap-3 p-6"
          style={{ borderTopColor: 'var(--border-color)', borderTopWidth: '1px' }}
        >
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Specific Modal Implementations

### 1. Theme & Styling Modal
```typescript
// Features: Preview changes, save to database, theme-aware
export default function ThemeStylingModal({ isOpen, onClose, portfolioConfig }: ThemeStylingModalProps) {
  const [settings, setSettings] = useState<ThemeSettings>({
    colorScheme: 'light',
    primaryColor: '#3B82F6',
    fontFamily: 'inter',
    spacing: 'comfortable'
  });
  
  const submit = useSubmit();
  
  // Load settings from database
  useEffect(() => {
    if (portfolioConfig) {
      setSettings({
        colorScheme: portfolioConfig.theme || 'light',
        primaryColor: portfolioConfig.primaryColor || '#3B82F6',
        fontFamily: portfolioConfig.fontFamily || 'inter',
        spacing: portfolioConfig.spacing || 'comfortable'
      });
    }
  }, [portfolioConfig]);
  
  // Apply changes for preview (don't save yet)
  const handleSettingChange = (key: keyof ThemeSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applyTheme(newSettings); // Apply to DOM for preview
  };
  
  // Save changes to database
  const handleSaveChanges = () => {
    const formData = new FormData();
    formData.append("_action", "updateTheme");
    formData.append("theme", settings.colorScheme);
    formData.append("primaryColor", settings.primaryColor);
    formData.append("fontFamily", settings.fontFamily);
    formData.append("spacing", settings.spacing);
    submit(formData, { method: "post" });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal content with theme options */}
    </div>
  );
}
```

### 2. SEO Settings Modal
```typescript
// Features: Form validation, character limits, preview
export default function SEOSettingsModal({ isOpen, onClose }: SEOSettingsModalProps) {
  const { portfolioConfig } = useLoaderData<typeof loader>();
  const [seoSettings, setSeoSettings] = useState({
    seoTitle: portfolioConfig?.seoTitle || '',
    seoDescription: portfolioConfig?.seoDescription || '',
    seoKeywords: portfolioConfig?.seoKeywords || '',
    // ... other SEO fields
  });
  
  const submit = useSubmit();
  
  // Form validation
  const validateForm = () => {
    const errors: string[] = [];
    
    if (seoSettings.seoTitle.length > 60) {
      errors.push('Title should be 60 characters or less');
    }
    
    if (seoSettings.seoDescription.length > 160) {
      errors.push('Description should be 160 characters or less');
    }
    
    return errors;
  };
  
  const handleSave = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      // Show validation errors
      return;
    }
    
    const formData = new FormData();
    formData.append("_action", "updateSEOSettings");
    formData.append("seoTitle", seoSettings.seoTitle);
    formData.append("seoDescription", seoSettings.seoDescription);
    // ... other fields
    submit(formData, { method: "post" });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal with SEO form and validation */}
    </div>
  );
}
```

## Modal State Management

### 1. Multiple Modals Pattern
```typescript
// In parent component
export default function Dashboard() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSEOModal, setShowSEOModal] = useState(false);
  
  return (
    <div>
      {/* Trigger buttons */}
      <Button onClick={() => setShowPrivacyModal(true)}>
        Privacy Settings
      </Button>
      <Button onClick={() => setShowThemeModal(true)}>
        Theme & Styling
      </Button>
      <Button onClick={() => setShowSEOModal(true)}>
        SEO Settings
      </Button>
      
      {/* Modals */}
      <PrivacySettingsModal 
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <ThemeStylingModal 
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        portfolioConfig={portfolioConfig}
      />
      <SEOSettingsModal 
        isOpen={showSEOModal}
        onClose={() => setShowSEOModal(false)}
      />
    </div>
  );
}
```

### 2. Modal with Sidebar Integration
```typescript
// In dashboard-sidebar.tsx
const sidebarItems: SidebarSection[] = [
  {
    title: "Portfolio Settings",
    icon: Palette,
    items: [
      { label: "Visibility & Privacy", icon: Eye, action: "privacy" },
      { label: "Custom Domain", icon: Link, action: "domain" },
      { label: "Theme & Styling", icon: Palette, action: "theme" },
      { label: "SEO Settings", icon: Settings, action: "seo" },
    ]
  }
];

// Handle sidebar item clicks
const handleItemClick = (item: SidebarItem) => {
  if (item.action === "privacy") {
    onOpenPrivacyModal?.();
  } else if (item.action === "theme") {
    onOpenThemeModal?.();
  } else if (item.action === "seo") {
    onOpenSEOModal?.();
  }
  // ... other actions
};
```

## Best Practices

### 1. Accessibility
- Use proper ARIA labels
- Implement keyboard navigation (Escape to close)
- Focus management (focus trap in modal)
- Screen reader support

### 2. Performance
- Lazy load modal content when possible
- Avoid unnecessary re-renders
- Use React.memo for modal components

### 3. User Experience
- Show loading states during form submission
- Provide clear success/error feedback
- Allow preview of changes before saving
- Implement proper form validation

### 4. Code Organization
- Keep modal logic separate from parent components
- Use consistent prop interfaces
- Implement proper TypeScript types
- Follow naming conventions

## File Structure
```
app/
├── components/
│   ├── modals/
│   │   ├── theme-styling-modal.tsx
│   │   ├── seo-settings-modal.tsx
│   │   ├── privacy-settings-modal.tsx
│   │   └── custom-domain-modal.tsx
│   └── ui/
│       ├── modal.tsx           # Base modal component
│       └── button.tsx
├── routes/
│   └── dashboard.tsx           # Parent component with modal state
└── lib/
    └── validation.ts           # Form validation utilities
```
