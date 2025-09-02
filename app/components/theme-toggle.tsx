import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import { useLoaderData, useSubmit } from "react-router";

export function ThemeToggle() {
  const { user, portfolioConfig } = useLoaderData<typeof import("../routes/dashboard").loader>();
  const submit = useSubmit();
  const [isDark, setIsDark] = useState(portfolioConfig?.theme === 'dark');

  useEffect(() => {
    // Initialize theme from portfolio config
    if (portfolioConfig?.theme) {
      setIsDark(portfolioConfig.theme === 'dark');
    }
  }, [portfolioConfig]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Update UI immediately
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage as fallback
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Save to database
    const formData = new FormData();
    formData.append("_action", "updateTheme");
    formData.append("theme", newTheme ? 'dark' : 'light');
    submit(formData, { method: "post" });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
      style={{ 
        borderColor: 'var(--border-color) !important', 
        color: 'var(--text-secondary) !important',
        backgroundColor: 'var(--bg-card) !important'
      }}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {isDark ? 'Light' : 'Dark'}
    </Button>
  );
}
