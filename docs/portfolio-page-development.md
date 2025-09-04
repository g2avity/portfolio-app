# Portfolio Page Development Guidelines

## Overview
This document outlines the development approach for the public-facing portfolio page (`portfolios.$slug.tsx`), which will be a highly customizable, theme-aware page that reflects each user's artistic expression and content preferences.

## Core Philosophy
The portfolio page should be "MySpace-esque" in flexibility, allowing users to define both **what content** is displayed and **how it's styled** to the greatest possible extent. This includes theme preferences, layout types, section ordering, and custom styling.

## Data Integration Requirements

### 1. PortfolioConfig Integration
- **Theme Application**: Apply user's custom theme (light/dark), but only for the portfolio owner's preview/navigation
- **Styling Application**: Apply colors, spacing, font family, and custom CSS for all visitors
- **Section Ordering**: Use `sectionOrder` from PortfolioConfig to determine which sections show and in what order
- **Layout Type**: Implement different UI components based on `layoutType` setting
- **SEO Integration**: Use SEO fields for meta tags and social sharing

### 2. Content Visibility
- **User Level**: Only show portfolios where `User.isPublic = true`
- **Section Level**: Only show sections where `isPublic = true` (needs to be added to Experience and Skill models)
- **Custom Sections**: Already have `isPublic` field, respect this setting

### 3. Required Database Schema Updates
```sql
-- Add isPublic fields to Experience and Skill models
ALTER TABLE "experiences" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "skills" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
```

## Theme & Styling Implementation

### 1. Theme Inheritance Strategy
- **Portfolio Owner**: Inherits their dashboard theme for navigation/preview
- **Public Visitors**: Portfolio styling is determined by the portfolio owner's preferences
- **CSS Application**: Use CSS variables with dynamic injection based on PortfolioConfig

### 2. CSS Implementation Approach (Recommended)
**Dynamic CSS Variable Injection**: 
- Generate CSS variables from PortfolioConfig on the server
- Inject as inline `<style>` tag in the document head
- Use CSS custom properties for all styling (colors, spacing, fonts)
- **Reasoning**: This approach provides maximum flexibility, allows for custom CSS injection, and maintains performance while enabling real-time theme changes

### 3. Styling Fields to Apply
- `theme`: Light/dark mode (for owner only)
- `primaryColor`: Main accent color
- `fontFamily`: Typography choice
- `spacing`: Layout spacing (comfortable/compact)
- `customCSS`: User-defined custom styles
- `animationsEnabled`: Animation preferences

## Content Structure

### 1. Section Types
- **Profile Section**: User info, bio, avatar (if `showProfileImage = true`)
- **Experiences**: Professional experience entries (where `isPublic = true`)
- **Skills**: Skills and expertise (where `isPublic = true`)
- **Custom Sections**: User-defined sections with JSONB content (where `isPublic = true`)

### 2. Section Ordering
- Use `PortfolioConfig.sectionOrder` array to determine display order
- Only render sections that are both in the order array AND marked as public
- Handle missing sections gracefully

### 3. Custom Sections JSONB Content
- Parse JSONB content to render dynamic section layouts
- Support different content types (text, images, lists, etc.)
- Maintain flexibility for future content types

## Layout & Design

### 1. Layout Types
Implement different UI component arrangements based on `layoutType`:
- `default`: Standard card-based layout
- `minimal`: Clean, minimal design
- `creative`: More artistic, flexible layout
- `professional`: Corporate-style layout

### 2. Responsive Design
- Mobile-first approach using Tailwind CSS
- Ensure all layout types work across device sizes
- Test with different content lengths and image sizes

### 3. Component Architecture
- Use shadcn/ui components as base
- Create portfolio-specific components that respect theme variables
- Implement layout-specific component variations

## SEO Implementation

### 1. Meta Tags
Use PortfolioConfig SEO fields:
- `seoTitle`: Page title
- `seoDescription`: Meta description
- `seoKeywords`: Meta keywords
- `seoAuthor`: Author meta tag
- `seoLanguage`: Language specification
- `seoRobotsMeta`: Robots meta tag
- `seoCanonicalUrl`: Canonical URL

### 2. Open Graph & Social Sharing
- `seoOgImage`: Social media preview image
- Generate Open Graph meta tags
- Implement Twitter Card meta tags
- **Recommendation**: Use the user's avatar as fallback if no custom OG image is set

## Performance Considerations

### 1. Caching Strategy
- **Immediate**: Use localStorage for theme preferences
- **Future**: Implement Redis/Vercel cache for portfolio data
- Cache portfolio config and content data
- Implement cache invalidation on updates

### 2. Image Optimization
- Optimize avatar images for different sizes
- Implement lazy loading for custom section images
- Use WebP format when possible
- Consider CDN integration for better performance

## Implementation Phases

### Phase 1: Core Data Integration
1. Update database schema to add `isPublic` fields
2. Update portfolio loader to fetch all required data
3. Implement basic data display without theming

### Phase 2: Theme Awareness & Core Features ✅ COMPLETED
1. ✅ Implement dynamic CSS variable injection
2. ✅ Apply PortfolioConfig styling preferences  
3. ✅ Test theme switching and custom CSS
4. ✅ Fix TypeScript errors with Prisma client refresh
5. ✅ Implement section ordering logic based on PortfolioConfig.sectionOrder
6. ✅ Add SEO meta tags from PortfolioConfig
7. ✅ Implement layout types with dynamic CSS variables
8. ✅ Add isPublic toggles to experience/skill forms
9. ✅ Discuss and implement custom CSS injection strategy

### Phase 3: Responsive Design ✅ COMPLETED
1. ✅ Mobile-first responsive design implementation
2. ✅ Responsive typography and spacing
3. ✅ Mobile-optimized card layouts
4. ✅ Responsive CSS variables with media queries
5. ✅ Touch-friendly button and link sizing
6. ✅ Optimized for all device sizes (mobile, tablet, desktop)

### Phase 3: Layout & Design
1. Implement different layout types
2. Create responsive design
3. Add section ordering logic

### Phase 4: SEO & Performance
1. Implement SEO meta tags
2. Add social sharing optimization
3. Implement caching strategies

## File Structure
```
app/
├── routes/
│   └── portfolios.$slug.tsx     # Main portfolio page
├── components/
│   ├── portfolio/
│   │   ├── portfolio-header.tsx
│   │   ├── portfolio-section.tsx
│   │   ├── experience-section.tsx
│   │   ├── skills-section.tsx
│   │   └── custom-section.tsx
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── portfolio.server.ts      # Portfolio-specific server functions
│   └── theme-injection.server.ts # CSS variable generation
└── docs/
    └── portfolio-page-development.md
```

## Development Guidelines

### 1. Code Organization
- Keep portfolio components separate from dashboard components
- Use consistent naming conventions
- Implement proper TypeScript types
- Follow existing patterns from documentation

### 2. Testing Strategy
- Test with different theme configurations
- Verify responsive design across devices
- Test with various content lengths
- Validate SEO meta tag generation

### 3. Accessibility
- Ensure proper contrast ratios with custom themes
- Implement keyboard navigation
- Add proper ARIA labels
- Test with screen readers

## Future Enhancements

### 1. Drag & Drop Design
- Implement visual portfolio builder
- Allow real-time preview of changes
- Save layout configurations

### 2. Advanced Customization
- More layout types and components
- Advanced CSS editor
- Template system
- Component marketplace

### 3. Analytics & Insights
- Portfolio view tracking
- Performance metrics
- User engagement analytics

## Phase 2 Implementation Notes

### **Current Status & Findings:**

1. **SectionConfig Interface**: ✅ Already defined in `portfolio-config.server.ts`
   ```typescript
   interface SectionConfig {
     id: string;
     type: 'profile' | 'experiences' | 'skills' | 'custom';
     order: number;
     isVisible: boolean;
     layout: string;
     sectionId?: string; // For custom sections
   }
   ```

2. **Theme Modal Settings**: ✅ Already has spacing, typography, and card styling
   - `spacing`: 'compact' | 'comfortable' | 'spacious'
   - `cardStyle`: 'rounded' | 'sharp' | 'outlined'
   - `fontFamily`: Multiple font options
   - `primaryColor`: Color picker with presets

3. **isPublic Fields**: ❌ **Missing from Experience/Skill Forms**
   - Database schema: ✅ Updated with `isPublic` fields
   - Database functions: ✅ Updated to handle `isPublic`
   - Dashboard forms: ❌ Need to add `isPublic` toggles

4. **Profile Section**: Should always be at top, separate from drag-and-drop ordering

### **Layout Types Strategy:**
Use dynamic CSS variables for maximum flexibility:
- **Default**: Standard card layout with current styling
- **Minimal**: Clean, reduced padding, subtle borders
- **Creative**: More artistic spacing, rounded corners, gradients
- **Professional**: Corporate styling, sharp edges, formal typography

### **Custom CSS Injection Discussion:**
**Pros:**
- Maximum flexibility for users
- Real-time preview capability
- Can override any styling
- Enables advanced customization

**Cons:**
- Security concerns (XSS potential)
- CSS conflicts and specificity issues
- Performance impact
- Maintenance complexity

**Recommended Approach:**
- Sanitize CSS input on server-side
- Inject as `<style>` tag in document head
- Use CSS custom properties for safe overrides
- Provide CSS validation and preview

### **Responsive Design Implementation:**

**Mobile-First Approach:**
- Base styles optimized for mobile devices (320px+)
- Progressive enhancement for larger screens
- Touch-friendly button sizes (44px minimum)
- Readable typography on small screens

**Breakpoint Strategy:**
- **Mobile**: 320px - 639px (base styles)
- **Tablet**: 640px - 1023px (sm: prefix)
- **Desktop**: 1024px+ (lg: prefix)

**Responsive Features:**
- **Typography**: Scales from 14px (mobile) to 18px (desktop)
- **Spacing**: Compact mobile spacing, generous desktop spacing
- **Cards**: Full-width on mobile, constrained width on desktop
- **Buttons**: Full-width on mobile, auto-width on desktop
- **Images**: Responsive sizing with proper aspect ratios

**CSS Variables with Media Queries:**
```css
:root {
  --portfolio-spacing: 1.5rem; /* Mobile */
  --portfolio-card-padding: 1rem;
}

@media (min-width: 640px) {
  :root {
    --portfolio-spacing: 2rem; /* Desktop */
    --portfolio-card-padding: 1.5rem;
  }
}
```

**Layout Type Responsiveness:**
- **Default**: Balanced spacing across all devices
- **Minimal**: Reduced padding, clean mobile experience
- **Creative**: Enhanced shadows and spacing on larger screens
- **Professional**: Consistent corporate styling across devices

## Success Metrics
- Portfolio pages load quickly (< 2 seconds)
- All theme configurations work correctly
- Responsive design works on all devices
- SEO meta tags are properly generated
- Custom sections render correctly
- Section ordering works as expected
- isPublic toggles work in dashboard forms
- Layout types render correctly with CSS variables
