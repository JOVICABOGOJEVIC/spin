import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationSR from '../locales/sr/translation.json';
import translationEN from '../locales/en/translation.json';

i18n
  // Detect user language from browser
  .use(LanguageDetector)
  // Pass i18n down to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Fallback language
    fallbackLng: 'sr',
    
    // Supported languages
    supportedLngs: ['sr', 'en'],
    
    // Default namespace
    defaultNS: 'translation',
    ns: 'translation',
    
    // Debug mode (set to false in production)
    debug: false,
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Resources (translations)
    resources: {
      sr: {
        translation: translationSR,
      },
      en: {
        translation: translationEN,
      },
    },
    
    // Detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator'],
      
      // Keys to lookup language from
      lookupLocalStorage: 'i18nextLng',
      
      // Cache user language
      caches: ['localStorage'],
    },
  });

export default i18n;

