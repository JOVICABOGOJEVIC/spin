import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Award, Check, X, ArrowRight, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StandardView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const subscriptionPackage = user?.result?.subscriptionPackage || 'free';
  const isCurrentPackage = subscriptionPackage === 'standard';

  const features = [
    { included: true, text: t('packages.standard.feature1', 'Neograničeno adresa') },
    { included: true, text: t('packages.standard.feature2', 'SMS slanje strankama') },
    { included: true, text: t('packages.standard.feature3', 'Osnovni dashboard') },
    { included: true, text: t('packages.standard.feature4', 'Upravljanje poslovima') },
    { included: true, text: t('packages.standard.feature5', 'Upravljanje klijentima') },
    { included: false, text: t('packages.standard.feature6', 'Web Shop') },
    { included: false, text: t('packages.standard.feature7', 'AI optimizacija') }
  ];

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-blue-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500/20 rounded-lg p-4">
              <Award className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('packages.standard.title', 'Standard Paket')}</h1>
              <p className="text-gray-400 mt-1">{t('packages.standard.subtitle', 'SMS slanje i neograničene adrese')}</p>
            </div>
          </div>
          
          {isCurrentPackage && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="h-5 w-5" />
                <span className="font-medium">{t('packages.currentPackage', 'Trenutni paket')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">{t('packages.features', 'Karakteristike')}</h2>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                {feature.included ? (
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-gray-600 flex-shrink-0" />
                )}
                <span className={feature.included ? 'text-white' : 'text-gray-500 line-through'}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SMS Feature Highlight */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <MessageSquare className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t('superAdmin.smsFeature', 'SMS slanje strankama')}</h3>
              <p className="text-gray-300">{t('packages.standard.smsDescription', 'Šaljite SMS poruke svojim strankama direktno iz aplikacije. Podržano slanje obaveštenja, podsesta i prilagođenih poruka.')}</p>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        {!isCurrentPackage && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">{t('packages.selectTitle', 'Izaberi ovaj paket')}</h3>
            <p className="text-gray-300 mb-4">{t('packages.selectDescription', 'Kontaktirajte nas za aktivaciju Standard paketa')}</p>
            <button
              onClick={() => navigate('/dashboard/packages/business')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {t('packages.upgradeToBusiness', 'Business')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardView;
