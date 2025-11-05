import React from 'react';
import { useTranslation } from 'react-i18next';
import ThemeSelector from '../../ThemeSelector';
import { useTheme } from '../../../hooks/useTheme';
import { 
  Wrench, 
  Car, 
  PaintBucket, 
  Monitor, 
  HardHat, 
  Zap,
  Wind,
  Check
} from 'lucide-react';

const themes = [
  { 
    id: 'appliance-repair',
    nameKey: 'applianceRepair',
    icon: <Wrench className="w-8 h-8" />,
    descriptionKey: 'applianceRepairDesc',
    features: [
      'feature1',
      'feature2',
      'feature3',
      'feature4'
    ]
  },
  { 
    id: 'auto-service',
    nameKey: 'autoService',
    icon: <Car className="w-8 h-8" />,
    descriptionKey: 'autoServiceDesc',
    features: [
      'feature1',
      'feature2',
      'feature3',
      'feature4'
    ]
  },
  { 
    id: 'painting-service',
    nameKey: 'paintingService',
    icon: <PaintBucket className="w-8 h-8" />,
    descriptionKey: 'paintingServiceDesc',
    features: [
      'feature1',
      'feature2',
      'feature3',
      'feature4'
    ]
  },
  { 
    id: 'it-service',
    nameKey: 'itService',
    icon: <Monitor className="w-8 h-8" />,
    descriptionKey: 'itServiceDesc',
    features: [
      'feature1',
      'feature2',
      'feature3',
      'feature4'
    ]
  },
  { 
    id: 'construction',
    nameKey: 'construction',
    icon: <HardHat className="w-8 h-8" />,
    descriptionKey: 'constructionDesc',
    features: [
      'feature1',
      'feature2',
      'feature3',
      'feature4'
    ]
  },
  { 
    id: 'electrical-service',
    nameKey: 'electricalService',
    icon: <Zap className="w-8 h-8" />,
    descriptionKey: 'electricalServiceDesc',
    features: [
      'feature1',
      'feature2',
      'feature3',
      'feature4'
    ]
  },
  { 
    id: 'hvac-service',
    nameKey: 'hvacService',
    icon: <Wind className="w-8 h-8" />,
    descriptionKey: 'hvacServiceDesc',
    features: [
      'feature1',
      'feature2',
      'feature3',
      'feature4'
    ]
  }
];

const ThemePreviewCard = ({ themeId, nameKey, icon, descriptionKey, features, isActive }) => {
  const { t } = useTranslation();
  const { setTheme } = useTheme();
  
  return (
    <div 
      className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-xl ${
        isActive 
          ? 'border-blue-500 bg-blue-900/20 shadow-lg' 
          : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
      }`}
      onClick={() => setTheme(themeId)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`p-3 rounded-lg ${
            isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'
          }`}>
            {icon}
          </span>
          <h3 className="text-xl font-semibold text-white">{t(`theme.${nameKey}`, nameKey)}</h3>
        </div>
        {isActive && (
          <div className="bg-blue-500 rounded-full p-1">
            <Check className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      <p className="text-gray-400 mb-4">{t(`theme.${descriptionKey}`, descriptionKey)}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-300">
            <span className="mr-2 text-blue-400">•</span>
            {t(`theme.${themeId}.${feature}`, feature)}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ThemeView = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500/20 rounded-lg p-4">
              <PaintBucket className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {t('theme.title', 'Postavke teme')}
              </h1>
              <p className="text-gray-400 mt-1">
                {t('theme.subtitle', 'Izaberite temu koja najbolje odgovara vašem tipu poslovanja')}
              </p>
            </div>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  {t('theme.currentTheme', 'Trenutna tema:')}
                </p>
                <ThemeSelector />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <p className="text-gray-300 leading-relaxed">
            {t('theme.description', 'Svaka tema je posebno dizajnirana sa bojama, rasporedima i funkcionalnostima optimizovanim za vašu industriju. Izaberite onu koja najbolje predstavlja vašu kompaniju.')}
          </p>
        </div>

        {/* Theme Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {themes.map((themeItem) => (
            <ThemePreviewCard
              key={themeItem.id}
              themeId={themeItem.id}
              nameKey={themeItem.nameKey}
              icon={themeItem.icon}
              descriptionKey={themeItem.descriptionKey}
              features={themeItem.features}
              isActive={theme === themeItem.id}
            />
          ))}
        </div>

        {/* Info */}
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Zap className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t('theme.infoTitle', 'Saveti')}
              </h3>
              <p className="text-gray-300 text-sm">
                {t('theme.info', 'Tema će se primeniti odmah nakon izbora. Sve promene se čuvaju automatski i biće vidljive u celoj aplikaciji.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeView;
