import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Gift, Check, X, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FreeView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const subscriptionPackage = user?.result?.subscriptionPackage || 'free';
  const packageUsage = user?.result?.packageUsage || {};
  const isCurrentPackage = subscriptionPackage === 'free';

  const features = [
    { included: true, text: t('packages.free.feature1', 'Do 100 adresa mesečno') },
    { included: true, text: t('packages.free.feature2', 'Osnovni dashboard') },
    { included: true, text: t('packages.free.feature3', 'Upravljanje poslovima') },
    { included: true, text: t('packages.free.feature4', 'Upravljanje klijentima') },
    { included: false, text: t('packages.free.feature5', 'SMS slanje') },
    { included: false, text: t('packages.free.feature6', 'Web Shop') },
    { included: false, text: t('packages.free.feature7', 'AI optimizacija') }
  ];

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/10 rounded-lg p-4">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('packages.free.title', 'Free Paket')}</h1>
              <p className="text-gray-400 mt-1">{t('packages.free.subtitle', 'Idealno za početak')}</p>
            </div>
          </div>
          
          {isCurrentPackage && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="h-5 w-5" />
                <span className="font-medium">{t('packages.currentPackage', 'Trenutni paket')}</span>
              </div>
              {packageUsage.addressesThisMonth !== undefined && (
                <div className="mt-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <span>{t('superAdmin.addressesUsed', 'Iskorišćeno adresa')}:</span>
                    <span className="font-medium">{packageUsage.addressesThisMonth || 0} / {packageUsage.addressesLimit || 100}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(((packageUsage.addressesThisMonth || 0) / (packageUsage.addressesLimit || 100)) * 100, 100)}%` }}
                    />
                  </div>
                  {packageUsage.addressesThisMonth >= (packageUsage.addressesLimit || 100) && (
                    <div className="flex items-center gap-2 text-red-400 mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">{t('superAdmin.addressLimitReached', 'Limit dostignut!')}</span>
                    </div>
                  )}
                </div>
              )}
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

        {/* Upgrade Options */}
        {isCurrentPackage && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">{t('packages.upgradeTitle', 'Nadogradi paket')}</h3>
            <p className="text-gray-300 mb-4">{t('packages.upgradeDescription', 'Nadogradi za više funkcionalnosti i neograničene adrese')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/dashboard/packages/standard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {t('packages.upgradeToStandard', 'Standard')}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard/packages/business')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {t('packages.upgradeToBusiness', 'Business')}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard/packages/premium')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {t('packages.upgradeToPremium', 'Premium')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeView;
