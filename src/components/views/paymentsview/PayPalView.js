import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';

const PayPalView = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-500/20 rounded-lg p-4">
              <Wallet className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {t('nav.paypal', 'PayPal')}
              </h1>
              <p className="text-gray-400 mt-1">
                {t('payments.paypal.description', 'Upravljanje PayPal plaćanjima')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <p className="text-gray-300">
            {t('payments.paypal.content', 'Funkcionalnost za PayPal plaćanje će biti implementirana uskoro.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayPalView;

