import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Sparkles, Check, Brain } from 'lucide-react';

const PremiumView = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const subscriptionPackage = user?.result?.subscriptionPackage || 'free';
  const isCurrentPackage = subscriptionPackage === 'premium';

  const features = [
    { included: true, text: t('packages.premium.feature1', 'Neograničeno adresa') },
    { included: true, text: t('packages.premium.feature2', 'SMS slanje strankama') },
    { included: true, text: t('packages.premium.feature3', 'Web Shop kreiranje') },
    { included: true, text: t('packages.premium.feature4', 'AI model za optimizaciju') },
    { included: true, text: t('packages.premium.feature5', 'Potpuni dashboard') },
    { included: true, text: t('packages.premium.feature6', 'Napredno upravljanje poslovima') },
    { included: true, text: t('packages.premium.feature7', 'Prioritetni support') }
  ];

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-yellow-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-yellow-500/20 rounded-lg p-4">
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('packages.premium.title', 'Premium Paket')}</h1>
              <p className="text-gray-400 mt-1">{t('packages.premium.subtitle', 'Najnapredniji paket sa AI funkcionalnostima')}</p>
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
                <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-white">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Feature Highlight */}
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Brain className="h-8 w-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t('superAdmin.aiFeature', 'AI model za optimizaciju')}</h3>
              <p className="text-gray-300 mb-3">{t('packages.premium.aiDescription', 'Napredni AI model koji optimizuje raspored poslova, predviđa potrebe za zalihama, analizira trendove i predlaže poboljšanja za vaš posao.')}</p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-yellow-400" />
                  <span>{t('packages.premium.aiFeature1', 'Optimalno rutiranje servisera')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-yellow-400" />
                  <span>{t('packages.premium.aiFeature2', 'Predikcija zaliha')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-yellow-400" />
                  <span>{t('packages.premium.aiFeature3', 'Analiza trendova prodaje')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-yellow-400" />
                  <span>{t('packages.premium.aiFeature4', 'Pametna alokacija resursa')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Select Option */}
        {!isCurrentPackage && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">{t('packages.selectTitle', 'Izaberi ovaj paket')}</h3>
            <p className="text-gray-300">{t('packages.premium.selectDescription', 'Kontaktirajte nas za aktivaciju Premium paketa i pristup AI funkcionalnostima')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumView;
