import type { LoaderFunctionArgs } from "react-router";
import { useParams, Link, useLoaderData } from "react-router";
import type { Route } from "./+types/portfolios.$slug";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ErrorBoundary as AppErrorBoundary } from "../components/error-boundary";

import { 
  findUserBySlug, 
  getPublicUserExperiences, 
  getPublicUserSkills, 
  getPublicCustomSections 
} from "../lib/db.server";
import { getPortfolioConfig, type SectionConfig } from "../lib/portfolio-config.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;
  
  if (!slug) {
    throw new Response("Portfolio slug is required", { status: 400 });
  }
  
  // Fetch real user data by slug from database
  const user = await findUserBySlug(slug);
  
  if (!user) {
    throw new Response("Portfolio not found", { status: 404 });
  }
  
  if (!user.isPublic) {
    throw new Response("This portfolio is private", { status: 403 });
  }
  
  // Fetch all portfolio data in parallel
  const [portfolioConfig, experiences, skills, customSections] = await Promise.all([
    getPortfolioConfig(user.id),
    getPublicUserExperiences(user.id),
    getPublicUserSkills(user.id),
    getPublicCustomSections(slug)
  ]);
  
  return {
    user,
    portfolioConfig,
    experiences,
    skills,
    customSections
  };
}

// SEO Meta Tags Export
export const meta: Route.MetaFunction = ({ data }: { data: any }) => {
  if (!data) {
    return [
      { title: "Portfolio Not Found" },
      { name: "description", content: "The requested portfolio could not be found." }
    ];
  }

  const { user, portfolioConfig } = data;
  const seoTitle = portfolioConfig?.seoTitle || `${user.firstName} ${user.lastName} - Portfolio`;
  const seoDescription = portfolioConfig?.seoDescription || user.bio || `Professional portfolio of ${user.firstName} ${user.lastName}`;
  const seoKeywords = portfolioConfig?.seoKeywords || `${user.firstName} ${user.lastName}, portfolio, professional, experience, skills`;
  const seoAuthor = portfolioConfig?.seoAuthor || `${user.firstName} ${user.lastName}`;
  const seoLanguage = portfolioConfig?.seoLanguage || 'en-US';
  const seoRobotsMeta = portfolioConfig?.seoRobotsMeta || 'index, follow';
  const seoOgImage = portfolioConfig?.seoOgImage || user.avatarUrl || '';
  const seoCanonicalUrl = portfolioConfig?.seoCanonicalUrl || `https://yourdomain.com/portfolios/${user.portfolioSlug}`;

  return [
    { title: seoTitle },
    { name: "description", content: seoDescription },
    { name: "keywords", content: seoKeywords },
    { name: "author", content: seoAuthor },
    { name: "language", content: seoLanguage },
    { name: "robots", content: seoRobotsMeta },
    { tagName: "link", rel: "canonical", href: seoCanonicalUrl },
    { property: "og:title", content: seoTitle },
    { property: "og:description", content: seoDescription },
    { property: "og:type", content: "profile" },
    { property: "og:url", content: seoCanonicalUrl },
    ...(seoOgImage ? [{ property: "og:image", content: seoOgImage }] : []),
    { property: "og:site_name", content: "Portfolio Platform" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: seoTitle },
    { name: "twitter:description", content: seoDescription },
    ...(seoOgImage ? [{ name: "twitter:image", content: seoOgImage }] : [])
  ];
};

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <AppErrorBoundary 
      error={error} 
      title="Portfolio Error"
      showBackButton={true}
      showHomeButton={true}
    />
  );
}

// Function to map section order to rendered components
function getOrderedSections(
  sectionOrder: SectionConfig[],
  experiences: any[],
  skills: any[],
  customSections: any[]
) {
  const sections: Array<{ type: string; data: any; order: number; isVisible: boolean }> = [];
  
  // Sort section order by order property
  const sortedOrder = [...sectionOrder].sort((a, b) => a.order - b.order);
  
  for (const section of sortedOrder) {
    if (!section.isVisible) continue;
    
    switch (section.type) {
      case 'experiences':
        if (experiences.length > 0) {
          sections.push({ type: 'experiences', data: experiences, order: section.order, isVisible: true });
        }
        break;
      case 'skills':
        if (skills.length > 0) {
          sections.push({ type: 'skills', data: skills, order: section.order, isVisible: true });
        }
        break;
      case 'custom':
        const customSection = customSections.find(cs => cs.slug === section.sectionId);
        if (customSection) {
          sections.push({ type: 'custom', data: customSection, order: section.order, isVisible: true });
        }
        break;
    }
  }
  
  return sections.sort((a, b) => a.order - b.order);
}

export default function UserPortfolio() {
  const { user, portfolioConfig, experiences, skills, customSections } = useLoaderData<typeof loader>();

  // Get theme and styling from portfolio config
  const theme = portfolioConfig?.theme || 'light';
  const primaryColor = portfolioConfig?.primaryColor || '#3b82f6';
  const fontFamily = portfolioConfig?.fontFamily || 'Inter';
  const spacing = portfolioConfig?.spacing || 'comfortable';
  const layoutType = portfolioConfig?.layoutType || 'default';
  const showProfileImage = portfolioConfig?.showProfileImage ?? true;
  const showSocialLinks = portfolioConfig?.showSocialLinks ?? true;
  const showContactInfo = portfolioConfig?.showContactInfo ?? true;

  // Get ordered sections based on PortfolioConfig
  const orderedSections = getOrderedSections(
    portfolioConfig?.sectionOrder || [],
    experiences,
    skills,
    customSections
  );

  // Generate dynamic CSS variables based on layout type and settings
  const getLayoutStyles = () => {
    const baseStyles = {
      '--portfolio-primary': primaryColor,
      '--portfolio-font-family': fontFamily,
    } as React.CSSProperties & Record<string, string>;

    // Apply responsive spacing based on user preference
    switch (spacing) {
      case 'compact':
        baseStyles['--portfolio-spacing'] = '0.75rem'; // Mobile: 12px, Desktop: 16px
        baseStyles['--portfolio-card-padding'] = '0.75rem';
        break;
      case 'spacious':
        baseStyles['--portfolio-spacing'] = '2rem'; // Mobile: 32px, Desktop: 48px
        baseStyles['--portfolio-card-padding'] = '1.5rem';
        break;
      default: // comfortable
        baseStyles['--portfolio-spacing'] = '1.5rem'; // Mobile: 24px, Desktop: 32px
        baseStyles['--portfolio-card-padding'] = '1rem';
    }

    // Apply layout-specific styles
    switch (layoutType) {
      case 'minimal':
        baseStyles['--portfolio-card-radius'] = '0.5rem';
        baseStyles['--portfolio-card-border'] = '1px solid var(--border-color)';
        baseStyles['--portfolio-card-shadow'] = 'none';
        break;
      case 'creative':
        baseStyles['--portfolio-card-radius'] = '1.5rem';
        baseStyles['--portfolio-card-border'] = 'none';
        baseStyles['--portfolio-card-shadow'] = '0 10px 25px rgba(0, 0, 0, 0.1)';
        break;
      case 'professional':
        baseStyles['--portfolio-card-radius'] = '0.25rem';
        baseStyles['--portfolio-card-border'] = '2px solid var(--border-color)';
        baseStyles['--portfolio-card-shadow'] = '0 2px 4px rgba(0, 0, 0, 0.1)';
        break;
      default: // default
        baseStyles['--portfolio-card-radius'] = '0.75rem';
        baseStyles['--portfolio-card-border'] = '1px solid var(--border-color)';
        baseStyles['--portfolio-card-shadow'] = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }

    return baseStyles;
  };

  const dynamicStyles = getLayoutStyles();

  return (
    <>
      {/* Responsive CSS Variables */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --portfolio-primary: ${primaryColor};
            --portfolio-font-family: ${fontFamily};
            --portfolio-spacing: ${spacing === 'compact' ? '0.75rem' : spacing === 'spacious' ? '2rem' : '1.5rem'};
            --portfolio-card-padding: ${spacing === 'compact' ? '0.75rem' : spacing === 'spacious' ? '1.5rem' : '1rem'};
            --portfolio-card-radius: ${layoutType === 'minimal' ? '0.5rem' : layoutType === 'creative' ? '1.5rem' : layoutType === 'professional' ? '0.25rem' : '0.75rem'};
            --portfolio-card-border: ${layoutType === 'minimal' ? '1px solid var(--border-color)' : layoutType === 'creative' ? 'none' : layoutType === 'professional' ? '2px solid var(--border-color)' : '1px solid var(--border-color)'};
            --portfolio-card-shadow: ${layoutType === 'minimal' ? 'none' : layoutType === 'creative' ? '0 10px 25px rgba(0, 0, 0, 0.1)' : layoutType === 'professional' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.1)'};
          }
          
          @media (min-width: 640px) {
            :root {
              --portfolio-spacing: ${spacing === 'compact' ? '1rem' : spacing === 'spacious' ? '3rem' : '2rem'};
              --portfolio-card-padding: ${spacing === 'compact' ? '1rem' : spacing === 'spacious' ? '2rem' : '1.5rem'};
            }
          }
        `
      }} />
      
      <div 
        className="min-h-screen py-6 px-4 sm:py-8 sm:px-6 lg:py-12 lg:px-8"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontFamily: fontFamily,
          ...dynamicStyles
        }}
      >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          {showProfileImage && user.avatarUrl && (
            <div className="mb-4 sm:mb-6">
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full mx-auto object-cover border-4"
                style={{ borderColor: primaryColor }}
              />
            </div>
          )}
          
          <h1 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 px-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {user.firstName} {user.lastName}
          </h1>
          
          {user.bio && (
            <p 
              className="text-base sm:text-lg lg:text-xl mb-4 sm:mb-6 max-w-2xl mx-auto px-4"
              style={{ color: 'var(--text-secondary)' }}
            >
              {user.bio}
            </p>
          )}

          {showSocialLinks && (user.linkedinUrl || user.githubUrl || user.websiteUrl) && (
            <div className="flex justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              {user.linkedinUrl && (
                <a 
                  href={user.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg sm:text-xl hover:opacity-75 transition-opacity"
                  style={{ color: primaryColor }}
                  aria-label="LinkedIn Profile"
                >
                  LinkedIn
                </a>
              )}
              {user.githubUrl && (
                <a 
                  href={user.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg sm:text-xl hover:opacity-75 transition-opacity"
                  style={{ color: primaryColor }}
                  aria-label="GitHub Profile"
                >
                  GitHub
                </a>
              )}
              {user.websiteUrl && (
                <a 
                  href={user.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg sm:text-xl hover:opacity-75 transition-opacity"
                  style={{ color: primaryColor }}
                  aria-label="Personal Website"
                >
                  Website
                </a>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link to="/portfolios">
              <Button variant="outline" className="w-full sm:w-auto">
                ← Back to Portfolios
              </Button>
            </Link>
            {showContactInfo && (
              <Button 
                className="w-full sm:w-auto"
                style={{ backgroundColor: primaryColor }}
              >
                Contact
              </Button>
            )}
          </div>
        </div>

        {/* Portfolio Content - Ordered Sections */}
        <div className="space-y-6 sm:space-y-8" style={{ gap: 'var(--portfolio-spacing)' }}>
          {orderedSections.map((section) => (
            <Card 
              key={`${section.type}-${section.data.id || section.data[0]?.id || 'section'}`}
              className="mx-2 sm:mx-0"
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                borderColor: 'var(--border-color)',
                borderRadius: 'var(--portfolio-card-radius)',
                border: 'var(--portfolio-card-border)',
                boxShadow: 'var(--portfolio-card-shadow)',
                padding: 'var(--portfolio-card-padding)'
              }}
            >
              {section.type === 'experiences' && (
                <>
                  <CardHeader className="px-4 sm:px-6" style={{ borderBottomColor: 'var(--border-color)' }}>
                    <CardTitle className="text-lg sm:text-xl" style={{ color: 'var(--text-primary)' }}>
                      Professional Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="space-y-4 sm:space-y-6">
                      {section.data.map((experience: any) => (
                        <div 
                          key={experience.id}
                          className="border-l-4 pl-3 sm:pl-4"
                          style={{ borderLeftColor: primaryColor }}
                        >
                          <h3 
                            className="font-semibold text-base sm:text-lg"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {experience.title}
                          </h3>
                          <p 
                            className="font-medium text-sm sm:text-base"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {experience.companyName}
                          </p>
                          <p 
                            className="text-xs sm:text-sm"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {new Date(experience.startDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })} - {' '}
                            {experience.isCurrent 
                              ? 'Present' 
                              : experience.endDate 
                                ? new Date(experience.endDate).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })
                                : 'Present'
                            }
                          </p>
                          {experience.location && (
                            <p 
                              className="text-xs sm:text-sm"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              📍 {experience.location}
                            </p>
                          )}
                          <p 
                            className="mt-2 text-sm sm:text-base"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {experience.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {section.type === 'skills' && (
                <>
                  <CardHeader className="px-4 sm:px-6" style={{ borderBottomColor: 'var(--border-color)' }}>
                    <CardTitle className="text-lg sm:text-xl" style={{ color: 'var(--text-primary)' }}>
                      Skills & Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {section.data.map((skill: any) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium"
                          style={{
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor,
                            border: `1px solid ${primaryColor}40`
                          }}
                        >
                          {skill.name}
                          {skill.proficiency && (
                            <span className="ml-1 text-xs">
                              ({['Beginner', 'Intermediate', 'Advanced', 'Expert'][skill.proficiency - 1] || 'Beginner'})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {section.type === 'custom' && (
                <>
                  <CardHeader className="px-4 sm:px-6" style={{ borderBottomColor: 'var(--border-color)' }}>
                    <CardTitle className="text-lg sm:text-xl" style={{ color: 'var(--text-primary)' }}>
                      {section.data.title}
                    </CardTitle>
                    {section.data.description && (
                      <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                        {section.data.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <div className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                      {/* TODO: Parse and render JSONB content based on section type */}
                      <p>Custom section content will be rendered here based on the JSONB data.</p>
                      <pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                        {JSON.stringify(section.data.content, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
