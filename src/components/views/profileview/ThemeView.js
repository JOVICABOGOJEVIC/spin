import React from 'react'
import HeaderSection from '../../header/HeaderSection.js'
import ThemeSelector from '../../ThemeSelector'
import { useTheme } from '../../../hooks/useTheme'
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
    icon: <Wrench className="w-8 h-8" />,
    description: 'Theme optimized for appliance repair businesses',
    features: [
      'Clean and professional design',
      'Easy-to-read repair forms',
      'Organized spare parts listings',
      'Service history tracking'
    ]
  },
  { 
    id: 'auto-service',
    name: 'Auto Service',
    icon: <Car className="w-8 h-8" />,
    description: 'Perfect for auto repair and service centers',
    features: [
      'Vehicle service tracking',
      'Parts inventory management',
      'Service scheduling interface',
      'Maintenance history logs'
    ]
  },
  { 
    id: 'painting-service',
    name: 'Painting Service',
    icon: <PaintBucket className="w-8 h-8" />,
    description: 'Designed for painting and decoration services',
    features: [
      'Project timeline views',
      'Material calculations',
      'Color scheme management',
      'Quote generation tools'
    ]
  },
  { 
    id: 'it-service',
    name: 'IT Service',
    icon: <Monitor className="w-8 h-8" />,
    description: 'Suitable for IT and tech services',
    features: [
      'Ticket tracking system',
      'Network monitoring tools',
      'Asset management',
      'Service level tracking'
    ]
  },
  { 
    id: 'construction',
    name: 'Construction',
    icon: <HardHat className="w-8 h-8" />,
    description: 'Built for construction and building services',
    features: [
      'Project management tools',
      'Material tracking',
      'Safety compliance forms',
      'Progress reporting'
    ]
  },
  { 
    id: 'electrical-service',
    name: 'Electrical Service',
    icon: <Zap className="w-8 h-8" />,
    description: 'Designed for electrical contractors',
    features: [
      'Installation tracking',
      'Safety compliance tools',
      'Parts inventory system',
      'Service scheduling'
    ]
  },
  { 
    id: 'hvac-service',
    name: 'HVAC Service',
    icon: <Wind className="w-8 h-8" />,
    description: 'Perfect for HVAC maintenance and repair',
    features: [
      'Maintenance scheduling',
      'System performance tracking',
      'Parts inventory management',
      'Service history logs'
    ]
  }
];

const ThemePreviewCard = ({ themeId, name, icon, description, features, isActive }) => {
  const { setTheme } = useTheme();
  
  return (
    <div 
      className={`p-6 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg
        ${isActive ? 'border-primary bg-background shadow-md' : 'border-border hover:border-primary'}`}
      onClick={() => setTheme(themeId)}
      style={{ backgroundImage: 'var(--form-bg-image)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-primary p-2 bg-background rounded-lg shadow-sm">
            {icon}
          </span>
          <h3 className="text-xl font-semibold text-text">{name}</h3>
        </div>
        {isActive && (
          <span className="text-primary text-xl">✓</span>
        )}
      </div>
      <p className="text-secondary mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-text">
            <span className="mr-2 text-primary">•</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ThemeView = ({ title }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6">
      <HeaderSection 
        title={title} 
        onAdd={null}
        onRead={null}
        onBack={null}
      />
      
      <div className="p-6 bg-background rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-text mb-4">Theme Settings</h2>
        <p className="text-secondary mb-6">
          Choose a theme that best matches your business type. Each theme is specially designed
          with colors, layouts and features optimized for your industry.
        </p>
        
        <div className="flex items-center space-x-4 mb-8">
          <span className="text-text">Current theme:</span>
          <ThemeSelector />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {themes.map((t) => (
            <ThemePreviewCard
              key={t.id}
              themeId={t.id}
              name={t.name}
              icon={t.icon}
              description={t.description}
              features={t.features}
              isActive={theme === t.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ThemeView