import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { 
  Wrench, 
  Car, 
  PaintBucket, 
  Monitor, 
  HardHat, 
  Zap,
  Wind
} from 'lucide-react';

const themes = [
  { 
    id: 'appliance-repair',
    name: 'Appliance Repair',
    icon: <Wrench className="w-5 h-5" />,
    description: 'Theme optimized for appliance repair businesses'
  },
  { 
    id: 'auto-service',
    name: 'Auto Service',
    icon: <Car className="w-5 h-5" />,
    description: 'Perfect for auto repair and service centers'
  },
  { 
    id: 'painting-service',
    name: 'Painting Service',
    icon: <PaintBucket className="w-5 h-5" />,
    description: 'Designed for painting and decoration services'
  },
  { 
    id: 'it-service',
    name: 'IT Service',
    icon: <Monitor className="w-5 h-5" />,
    description: 'Suitable for IT and tech services'
  },
  { 
    id: 'construction',
    name: 'Construction',
    icon: <HardHat className="w-5 h-5" />,
    description: 'Built for construction and building services'
  },
  { 
    id: 'electrical-service',
    name: 'Electrical Service',
    icon: <Zap className="w-5 h-5" />,
    description: 'Designed for electrical contractors'
  },
  { 
    id: 'hvac-service',
    name: 'HVAC Service',
    icon: <Wind className="w-5 h-5" />,
    description: 'Perfect for HVAC maintenance and repair'
  }
];

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [previewTheme, setPreviewTheme] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleThemeHover = (themeId) => {
    setPreviewTheme(themeId);
    setShowPreview(true);
    document.documentElement.setAttribute('data-theme-preview', themeId);
  };

  const handleThemeLeave = () => {
    setShowPreview(false);
    document.documentElement.removeAttribute('data-theme-preview');
  };

  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
    setShowPreview(false);
    document.documentElement.removeAttribute('data-theme-preview');
  };

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <div className="relative group">
      <button 
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-input text-text hover:bg-opacity-80"
      >
        <span className="text-primary">
          {currentTheme?.icon || themes[0].icon}
        </span>
        <span>Theme</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-64 py-2 bg-background border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => handleThemeSelect(t.id)}
            onMouseEnter={() => handleThemeHover(t.id)}
            onMouseLeave={handleThemeLeave}
            className={`w-full px-4 py-2 text-left hover:bg-input flex items-center space-x-2
              ${theme === t.id ? 'text-primary bg-input' : 'text-text'}`}
          >
            <span className={theme === t.id ? 'text-primary' : 'text-secondary'}>
              {t.icon}
            </span>
            <div className="flex flex-col">
              <span className="font-medium">{t.name}</span>
              <span className="text-xs text-secondary">{t.description}</span>
            </div>
            {theme === t.id && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector; 