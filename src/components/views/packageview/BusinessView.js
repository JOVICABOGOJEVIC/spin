import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Star, Check, X, ArrowRight, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const subscriptionPackage = user?.result?.subscriptionPackage || 'free';
  const isCurrentPackage = subscriptionPackage === 'business';

  const features = [
    { included: true, text: t('packages.business.feature1', 'Neograničeno adresa') },
    { included: true, text: t('packages.business.feature2', 'SMS slanje strankama') },
    { included: true, text: t('packages.business.feature3', 'Web Shop kreiranje') },
    { included: true, text: t('packages.business.feature4', 'Potpuni dashboard') },
    { included: true, text: t('packages.business.feature5', 'Upravljanje poslovima') },
    { included: true, text: t('packages.business.feature6', 'Upravljanje klijentima') },
    { included: false, text: t('packages.business.feature7', 'AI optimizacija') }
  ];

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-purple-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-500/20 rounded-lg p-4">
              <Star className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('packages.business.title', 'Business Paket')}</h1>
              <p className="text-gray-400 mt-1">{t('packages.business.subtitle', 'Web Shop i profesionalne funkcionalnosti')}</p>
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

        {/* Web Shop Feature Highlight */}
        <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <ShoppingCart className="h-8 w-8 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t('superAdmin.webShopFeature', 'Web Shop kreiranje')}</h3>
              <p className="text-gray-300">{t('packages.business.webShopDescription', 'Kreirajte svoj online shop za prodaju delova i usluga. Integrisano sa sistemom za upravljanje zalihama i automatskim ažuriranjem cena.')}</p>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        {!isCurrentPackage && (
          <div className="bg-purple-900/20 border border-purple-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">{t('packages.selectTitle', 'Izaberi ovaj paket')}</h3>
            <p className="text-gray-300 mb-4">{t('packages.selectDescription', 'Kontaktirajte nas za aktivaciju Business paketa')}</p>
            <button
              onClick={() => navigate('/dashboard/packages/premium')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {t('packages.upgradeToPremium', 'Premium')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessView;
