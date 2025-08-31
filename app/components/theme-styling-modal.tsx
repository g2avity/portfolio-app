import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { 
  Palette, 
  Type, 
  Sun, 
  Moon, 
  Monitor,
  X, 
  Eye,
  RotateCcw,
  Sparkles,
  Layout,
  Palette as ColorPalette
} from "lucide-react";

interface ThemeStylingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ThemeSettings {
  colorScheme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  fontFamily: string;
  spacing: 'compact' | 'comfortable' | 'spacious';
  cardStyle: 'rounded' | 'sharp' | 'outlined';
}

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter', preview: 'Inter' },
  { value: 'roboto', label: 'Roboto', preview: 'Roboto' },
  { value: 'open-sans', label: 'Open Sans', preview: 'Open Sans' },
  { value: 'poppins', label: 'Poppins', preview: 'Poppins' },
  { value: 'montserrat', label: 'Montserrat', preview: 'Montserrat' },
  { value: 'system', label: 'System Default', preview: 'System' }
];

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Blue', name: 'blue' },
  { value: '#10B981', label: 'Green', name: 'green' },
  { value: '#F59E0B', label: 'Amber', name: 'amber' },
  { value: '#EF4444', label: 'Red', name: 'red' },
  { value: '#8B5CF6', label: 'Purple', name: 'purple' },
  { value: '#EC4899', label: 'Pink', name: 'pink' },
  { value: '#06B6D4', label: 'Cyan', name: 'cyan' },
  { value: '#84CC16', label: 'Lime', name: 'lime' }
];

const SPACING_OPTIONS = [
  { value: 'compact', label: 'Compact', description: 'Tighter spacing for more content' },
  { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing (default)' },
  { value: 'spacious', label: 'Spacious', description: 'Generous spacing for readability' }
];

const CARD_STYLES = [
  { value: 'rounded', label: 'Rounded', description: 'Soft, modern corners' },
  { value: 'sharp', label: 'Sharp', description: 'Clean, geometric edges' },
  { value: 'outlined', label: 'Outlined', description: 'Subtle border emphasis' }
];

export default function ThemeStylingModal({ isOpen, onClose }: ThemeStylingModalProps) {
  const [settings, setSettings] = useState<ThemeSettings>({
    colorScheme: 'light',
    primaryColor: '#3B82F6',
    fontFamily: 'inter',
    spacing: 'comfortable',
    cardStyle: 'rounded'
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Load saved theme settings on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setSettings(parsed);
        applyTheme(parsed);
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }
  }, []);

  // Apply theme to document
  const applyTheme = (theme: ThemeSettings) => {
    const root = document.documentElement;
    
    // Apply color scheme
    if (theme.colorScheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply primary color to CSS variables
    root.style.setProperty('--focus-ring', theme.primaryColor);
    
    // Apply font family
    root.style.setProperty('--font-family', theme.fontFamily);
    
    // Apply spacing
    root.style.setProperty('--spacing-scale', theme.spacing);
    
    // Apply card style
    root.style.setProperty('--card-style', theme.cardStyle);
  };

  // Handle setting changes
  const handleSettingChange = (key: keyof ThemeSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applyTheme(newSettings);
    
    // Save to localStorage
    localStorage.setItem('portfolio-theme', JSON.stringify(newSettings));
  };

  // Reset to defaults
  const handleReset = () => {
    const defaultSettings: ThemeSettings = {
      colorScheme: 'light',
      primaryColor: '#3B82F6',
      fontFamily: 'inter',
      spacing: 'comfortable',
      cardStyle: 'rounded'
    };
    
    setSettings(defaultSettings);
    applyTheme(defaultSettings);
    localStorage.setItem('portfolio-theme', JSON.stringify(defaultSettings));
  };

  // Preview mode toggle
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" style={{ 
        backgroundColor: 'var(--bg-modal)' 
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ 
          borderColor: 'var(--border-color)' 
        }}>
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Theme & Styling</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePreviewMode}
              className={isPreviewMode ? 'bg-blue-50 border-blue-200' : ''}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </Button>
            <button
              onClick={onClose}
              className="transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Color Scheme */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sun className="w-5 h-4 text-yellow-600" />
                Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light', description: 'Clean, bright interface' },
                  { value: 'dark', icon: Moon, label: 'Dark', description: 'Easy on the eyes' },
                  { value: 'auto', icon: Monitor, label: 'Auto', description: 'Follows system preference' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSettingChange('colorScheme', option.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.colorScheme === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <option.icon className={`w-6 h-6 mx-auto mb-2 ${
                      option.value === 'light' ? 'text-yellow-600' :
                      option.value === 'dark' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Primary Color */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ColorPalette className="w-5 h-4 text-purple-600" />
                Primary Color
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleSettingChange('primaryColor', color.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.primaryColor === color.value
                        ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-blue-500'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: color.value }}
                    />
                    <p className="text-xs font-medium text-gray-900 dark:text-white">{color.label}</p>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="custom-color" className="text-sm font-medium dark:text-white">Custom Color:</Label>
                <input
                  id="custom-color"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">{settings.primaryColor}</span>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Type className="w-5 h-4 text-green-600" />
                Typography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => handleSettingChange('fontFamily', font.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      settings.fontFamily === font.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    style={{ fontFamily: font.value === 'system' ? 'inherit' : font.value }}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">{font.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{font.preview}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layout & Spacing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="w-5 h-4 text-orange-600" />
                Layout & Spacing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Spacing */}
              <div>
                <Label className="text-sm font-medium dark:text-white mb-3 block">Spacing Scale</Label>
                <div className="grid grid-cols-3 gap-3">
                  {SPACING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSettingChange('spacing', option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        settings.spacing === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Style */}
              <div>
                <Label className="text-sm font-medium dark:text-white mb-3 block">Card Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {CARD_STYLES.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSettingChange('cardStyle', option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        settings.cardStyle === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future Features Preview */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-4 text-purple-600" />
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Custom CSS Editor</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Advanced styling with full CSS control</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🏪</span>
                  </div>
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Theme Marketplace</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">Download and share custom themes</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Advanced Layouts</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Drag & drop section arrangement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t" style={{ 
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-card-header)'
        }}>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
