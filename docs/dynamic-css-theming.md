# Dynamic CSS Theming System

## Overview
Our application uses a comprehensive CSS variable-based theming system that supports light/dark modes with server-side theme detection and client-side theme persistence.

## Architecture

### 1. CSS Variables (app.css)
```css
:root {
  /* Light theme variables */
  --bg-primary: #f9fafb;
  --bg-card: #ffffff;
  --bg-card-header: #f8fafc;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border-color: #e5e7eb;
  --border-light: #f3f4f6;
  --focus-ring: #3b82f6;
  --shimmer-color: #e5e7eb;
}

.dark {
  /* Dark theme variables */
  --bg-primary: #0a0a0a;
  --bg-card: #1a1a1a;
  --bg-card-header: #262626;
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  --border-color: #374151;
  --border-light: #4b5563;
  --focus-ring: #3b82f6;
  --shimmer-color: #374151;
}
```

### 2. Server-Side Theme Detection (root.tsx)
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromSession(request);
  
  // Get theme from portfolio config if user is logged in
  let theme = 'light'; // default for non-logged-in users
  
  if (user) {
    try {
      const portfolioConfig = await getPortfolioConfig(user.id);
      theme = portfolioConfig?.theme || 'light';
    } catch (error) {
      console.error('Failed to load theme from portfolio config:', error);
      theme = 'light';
    }
  }
  
  return { user, theme };
}
```

### 3. HTML Class Application (root.tsx Layout)
```typescript
export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, user } = useLoaderData<typeof loader>();
  
  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      {/* Critical theme CSS to prevent FOUC */}
      <style dangerouslySetInnerHTML={{
        __html: `
          html {
            background-color: ${theme === 'dark' ? '#0a0a0a' : '#f9fafb'} !important;
          }
          body {
            background-color: ${theme === 'dark' ? '#0a0a0a' : '#f9fafb'} !important;
            color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
          }
        `
      }} />
      {/* Rest of layout */}
    </html>
  );
}
```

## Implementation Patterns

### 1. Component Styling
```typescript
// ✅ Good: Use CSS variables with inline styles
<div style={{ 
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-color)'
}}>
  Content
</div>

// ❌ Bad: Hardcoded colors
<div className="bg-gray-50 text-gray-900 border-gray-200">
  Content
</div>
```

### 2. Route Theme Loading
```typescript
// Load theme from database in route loader
export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  const portfolioConfig = await getPortfolioConfig(user.id);
  return { user, portfolioConfig };
}

// Use theme in component
export default function MyRoute() {
  const { portfolioConfig } = useLoaderData<typeof loader>();
  const theme = portfolioConfig?.theme || 'light';
  
  return (
    <main style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Content */}
    </main>
  );
}
```

### 3. Theme Toggle Implementation
```typescript
const toggleTheme = () => {
  const newTheme = !isDark;
  setIsDark(newTheme);
  
  // Update UI immediately
  if (newTheme) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Save to database
  const formData = new FormData();
  formData.append("_action", "updateTheme");
  formData.append("theme", newTheme ? 'dark' : 'light');
  submit(formData, { method: "post" });
};
```

## Database Schema

### PortfolioConfig Table
```sql
model PortfolioConfig {
  id            String   @id @default(cuid())
  userId        String   @unique
  theme         String   @default("light")  -- 'light' | 'dark' | 'auto'
  primaryColor  String?  @default("#3B82F6")
  fontFamily    String?  @default("inter")
  spacing       String?  @default("comfortable")
  -- ... other fields
}
```

## FOUC Prevention

### 1. Critical CSS Inline
```typescript
// In root.tsx Layout component
<style dangerouslySetInnerHTML={{
  __html: `
    /* Critical theme CSS - prevents FOUC */
    html {
      background-color: ${theme === 'dark' ? '#0a0a0a' : '#f9fafb'} !important;
    }
    body {
      background-color: ${theme === 'dark' ? '#0a0a0a' : '#f9fafb'} !important;
      color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
    }
  `
}} />
```

### 2. CSS Variable Fallbacks
```css
/* In app.css */
html {
  background-color: var(--bg-primary, #0a0a0a) !important;
}
html:not(.dark) {
  background-color: var(--bg-primary, #f9fafb) !important;
}
```

## Best Practices

### 1. Always Use CSS Variables
- ✅ `style={{ color: 'var(--text-primary)' }}`
- ❌ `className="text-gray-900"`

### 2. Provide Fallbacks
- ✅ `var(--bg-primary, #f9fafb)`
- ❌ `var(--bg-primary)`

### 3. Use Semantic Variable Names
- ✅ `--text-primary`, `--text-secondary`, `--text-muted`
- ❌ `--color-1`, `--color-2`, `--color-3`

### 4. Test Both Themes
- Always verify components work in both light and dark modes
- Check contrast ratios for accessibility
- Ensure interactive elements are clearly visible

## Troubleshooting

### Common Issues

1. **FOUC (Flash of Unstyled Content)**
   - Ensure critical CSS is inline in root.tsx
   - Use CSS variable fallbacks
   - Check that theme class is applied to `<html>` element

2. **Theme Not Persisting**
   - Verify database save in action handler
   - Check that loader is reading from database
   - Ensure `useLoaderData` is used correctly

3. **Inconsistent Colors**
   - Replace all hardcoded Tailwind colors with CSS variables
   - Use inline styles instead of className for dynamic colors
   - Check that CSS variables are defined in both themes

### Debug Commands
```typescript
// Check current theme in browser console
console.log('Current theme:', document.documentElement.classList.contains('dark') ? 'dark' : 'light');

// Check CSS variables
console.log('CSS variables:', getComputedStyle(document.documentElement).getPropertyValue('--bg-primary'));
```

## File Structure
```
app/
├── app.css                    # CSS variables and theme definitions
├── root.tsx                   # Server-side theme detection and HTML class application
├── components/
│   ├── theme-toggle.tsx       # Theme toggle component
│   └── theme-styling-modal.tsx # Advanced theme settings
├── routes/
│   ├── dashboard.tsx          # Theme toggle action handler
│   └── account.tsx            # Example route with theme loading
└── lib/
    └── portfolio-config.server.ts # Database theme operations
```
