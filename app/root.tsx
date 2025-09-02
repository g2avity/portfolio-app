import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromSession } from "./lib/session.server";
import { getPortfolioConfig } from "./lib/portfolio-config.server";
import { Nav } from "./components/nav";
import { ErrorBoundary as AppErrorBoundary } from "./components/error-boundary";
import { Toaster } from "./components/ui/sonner";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

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
      // Keep default 'light' theme if database fails
      theme = 'light';
    }
  }
  // For non-logged-in users, we'll use CSS-only theme detection as fallback
  
  return { user, theme };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, user } = useLoaderData<typeof loader>();
  
  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical theme CSS - prevents FOUC */
              html {
                background-color: ${theme === 'dark' ? '#0a0a0a' : '#f9fafb'} !important;
              }
              body {
                background-color: ${theme === 'dark' ? '#0a0a0a' : '#f9fafb'} !important;
                color: ${theme === 'dark' ? '#ffffff' : '#000000'} !important;
              }
              /* Hide content until CSS variables are loaded */
              body > * {
                opacity: 0;
                transition: opacity 0.1s ease-in;
              }
              body.css-loaded > * {
                opacity: 1;
              }
            `,
          }}
        />
        {!user && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // CSS-only theme detection for non-logged-in users
                (function() {
                  try {
                    var theme = localStorage.getItem('theme');
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.backgroundColor = '#0a0a0a';
                      document.body.style.backgroundColor = '#0a0a0a';
                    } else if (theme === 'light') {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.style.backgroundColor = '#f9fafb';
                      document.body.style.backgroundColor = '#f9fafb';
                    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.backgroundColor = '#0a0a0a';
                      document.body.style.backgroundColor = '#0a0a0a';
                    }
                  } catch (e) {
                    // Fallback: use system preference
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.backgroundColor = '#0a0a0a';
                      document.body.style.backgroundColor = '#0a0a0a';
                    }
                  }
                })();
              `,
            }}
          />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Mark CSS as loaded when CSS variables are available
              (function() {
                function checkCSSReady() {
                  var computedStyle = getComputedStyle(document.documentElement);
                  var bgColor = computedStyle.getPropertyValue('--bg-primary');
                  
                  if (bgColor && bgColor.trim() !== '') {
                    document.body.classList.add('css-loaded');
                  } else {
                    setTimeout(checkCSSReady, 10);
                  }
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', checkCSSReady);
                } else {
                  checkCSSReady();
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user, theme } = useLoaderData<typeof loader>();
  
  return (
    <>
      <Nav user={user} />
      <Outlet />
      <Toaster />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <AppErrorBoundary error={error} />;
}
