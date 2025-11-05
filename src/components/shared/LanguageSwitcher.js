import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language || 'sr';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Globe size={16} className="text-gray-400" />
      <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
        <button
          onClick={() => changeLanguage('sr')}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            currentLanguage === 'sr'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          title="Srpski"
        >
          SR
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            currentLanguage === 'en'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;

