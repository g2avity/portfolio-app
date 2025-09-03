# Loader & Database Patterns

## Overview
This document outlines the patterns we use for loading data from the database in React Router loaders and handling form submissions through actions.

## Core Patterns

### 1. Route Loader Pattern
```typescript
// Standard loader pattern for authenticated routes
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  // Load user-specific data
  const portfolioConfig = await getPortfolioConfig(user.id);
  const experiences = await getUserExperiences(user.id);
  const skills = await getUserSkills(user.id);
  
  return { 
    user, 
    portfolioConfig, 
    experiences, 
    skills 
  };
}
```

### 2. Component Data Access
```typescript
// Access loader data in components
export default function MyComponent() {
  const { user, portfolioConfig, experiences } = useLoaderData<typeof loader>();
  
  // Use data in component
  return (
    <div>
      <h1>Welcome, {user.firstName}</h1>
      <p>Theme: {portfolioConfig?.theme || 'light'}</p>
    </div>
  );
}
```

### 3. Form Action Pattern
```typescript
// Standard action pattern for form submissions
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const action = formData.get("_action") as string;
  
  switch (action) {
    case "updateTheme":
      const theme = formData.get("theme") as string;
      await updatePortfolioConfig(user.id, { theme });
      return { success: true, message: "Theme updated" };
      
    case "createExperience":
      const title = formData.get("title") as string;
      await createExperience(user.id, { title });
      return { success: true, message: "Experience created" };
      
    default:
      return { success: false, error: "Unknown action" };
  }
}
```

## Database Integration Patterns

### 1. Portfolio Config Pattern
```typescript
// Load portfolio config with fallback creation
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  let portfolioConfig = await getPortfolioConfig(user.id);
  
  // Create default config if none exists
  if (!portfolioConfig) {
    portfolioConfig = await createPortfolioConfig({
      userId: user.id,
      theme: 'light',
      primaryColor: '#3B82F6',
      fontFamily: 'inter',
      spacing: 'comfortable'
    });
  }
  
  return { user, portfolioConfig };
}
```

### 2. Theme Loading Pattern
```typescript
// Load theme from database for any route
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const portfolioConfig = await getPortfolioConfig(user.id);
  
  return { 
    user, 
    portfolioConfig,
    theme: portfolioConfig?.theme || 'light' 
  };
}
```

### 3. Error Handling Pattern
```typescript
// Robust error handling in loaders
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    
    const [portfolioConfig, experiences] = await Promise.all([
      getPortfolioConfig(user.id),
      getUserExperiences(user.id)
    ]);
    
    return { user, portfolioConfig, experiences };
  } catch (error) {
    console.error('Loader error:', error);
    throw new Response("Failed to load data", { status: 500 });
  }
}
```

## Form Submission Patterns

### 1. Client-Side Form Submission
```typescript
// Using useSubmit hook
import { useSubmit } from "react-router";

export function MyComponent() {
  const submit = useSubmit();
  
  const handleSave = () => {
    const formData = new FormData();
    formData.append("_action", "updateSettings");
    formData.append("setting", "value");
    submit(formData, { method: "post" });
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

### 2. Form Component Pattern
```typescript
// Using Form component
import { Form } from "react-router";

export function MyForm() {
  return (
    <Form method="post">
      <input type="hidden" name="_action" value="updateSettings" />
      <input name="setting" defaultValue="value" />
      <button type="submit">Save</button>
    </Form>
  );
}
```

### 3. Action Data Handling
```typescript
// Handle action results in components
export default function MyComponent() {
  const actionData = useActionData<typeof action>();
  
  useEffect(() => {
    if (actionData?.success) {
      // Show success message
      console.log(actionData.message);
    } else if (actionData?.error) {
      // Show error message
      console.error(actionData.error);
    }
  }, [actionData]);
  
  return <div>{/* Component content */}</div>;
}
```

## Server-Only Module Pattern

### 1. Database Operations
```typescript
// lib/db.server.ts - Server-only database operations
import { prisma } from "./db.server";

export async function getPortfolioConfig(userId: string) {
  return await prisma.portfolioConfig.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      theme: true,
      primaryColor: true,
      fontFamily: true,
      spacing: true
    }
  });
}

export async function updatePortfolioConfig(userId: string, data: any) {
  return await prisma.portfolioConfig.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data }
  });
}
```

### 2. Client-Safe Constants
```typescript
// lib/constants.ts - Client-safe constants
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
};

export const FILE_SIZE_LIMITS = {
  IMAGES: 5 * 1024 * 1024, // 5MB
  DOCUMENTS: 10 * 1024 * 1024, // 10MB
  ARCHIVES: 25 * 1024 * 1024 // 25MB
};
```

## Type Safety Patterns

### 1. Loader Data Types
```typescript
// Define loader return type
export type LoaderData = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  portfolioConfig: {
    id: string;
    theme: string;
    primaryColor: string;
    fontFamily: string;
    spacing: string;
  } | null;
};

// Use in component
export default function MyComponent() {
  const { user, portfolioConfig } = useLoaderData<typeof loader>() as LoaderData;
  // TypeScript now knows the exact shape of the data
}
```

### 2. Action Data Types
```typescript
// Define action return type
export type ActionData = {
  success: boolean;
  message?: string;
  error?: string;
};

// Use in component
export default function MyComponent() {
  const actionData = useActionData<typeof action>() as ActionData | undefined;
  
  if (actionData?.success) {
    // TypeScript knows message exists
    console.log(actionData.message);
  }
}
```

## Common Patterns

### 1. Dynamic Back Navigation
```typescript
// Store navigation context in sessionStorage
const handleNavigation = (to: string, from: string) => {
  sessionStorage.setItem(`${to}From`, from);
  navigate(to);
};

// Read in destination component
useEffect(() => {
  const from = sessionStorage.getItem('securityFrom') || 'account';
  setFrom(from);
  sessionStorage.removeItem('securityFrom');
}, []);
```

### 2. Optimistic Updates
```typescript
// Update UI immediately, then sync with server
const handleUpdate = async (newValue: string) => {
  // Update local state immediately
  setValue(newValue);
  
  // Sync with server
  const formData = new FormData();
  formData.append("_action", "updateValue");
  formData.append("value", newValue);
  submit(formData, { method: "post" });
};
```

### 3. Loading States
```typescript
// Show loading state during form submission
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (formData: FormData) => {
  setIsSubmitting(true);
  try {
    await submit(formData, { method: "post" });
  } finally {
    setIsSubmitting(false);
  }
};
```

## Best Practices

### 1. Always Use TypeScript
- Define types for loader and action data
- Use `typeof loader` for automatic type inference
- Handle null/undefined cases explicitly

### 2. Error Handling
- Wrap database operations in try-catch
- Return meaningful error messages
- Handle network failures gracefully

### 3. Performance
- Use `Promise.all()` for parallel database queries
- Implement proper caching strategies
- Minimize data transfer with selective queries

### 4. Security
- Always validate user authentication
- Sanitize form data before database operations
- Use parameterized queries to prevent SQL injection

## File Structure
```
app/
├── routes/
│   ├── dashboard.tsx          # Main dashboard with loader/action
│   ├── account.tsx            # Account route with theme loading
│   └── account.security.tsx   # Nested route pattern
├── lib/
│   ├── db.server.ts           # Database operations (server-only)
│   ├── portfolio-config.server.ts # Portfolio config operations
│   └── constants.ts           # Client-safe constants
└── components/
    ├── forms/                 # Reusable form components
    └── modals/                # Modal components with actions
```
