import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      {/* Brand Logo - centered like in navbar */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-600 flex items-center cursor-pointer hover:text-green-500 transition-colors">
          SpinT<span className="text-white mx-0.5 animate-spin-slow inline-block" style={{ fontSize: '0.67em' }}>@</span>sker
        </h1>
      </div>

      {/* 404 Error Message */}
      <div className="text-center">
        <h2 className="text-9xl font-bold text-gray-700 mb-4">404</h2>
        <h3 className="text-3xl font-semibold text-white mb-4">{t('404.title')}</h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          {t('404.message')}
        </p>
        
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Home size={20} />
          {t('404.backToHome')}
        </button>
      </div>
    </div>
  );
};

export default NotFound;

