import React from 'react';
import { useTranslation } from 'react-i18next';

const AddressFields = ({ value, onChange, inputClass }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {t('jobs.streetAddress')} *
        </label>
        <input
          type="text"
          value={value?.street || ''}
          onChange={(e) => onChange({ street: e.target.value })}
          className={inputClass}
          placeholder={t('jobs.enterStreetName')}
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {t('jobs.number')}
          </label>
          <input
            type="text"
            value={value?.number || ''}
            onChange={(e) => onChange({ number: e.target.value })}
            className={inputClass}
            placeholder={t('jobs.no')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {t('jobs.floor')}
          </label>
          <input
            type="text"
            value={value?.floor || ''}
            onChange={(e) => onChange({ floor: e.target.value })}
            className={inputClass}
            placeholder={t('jobs.floor')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {t('jobs.apartment')}
          </label>
          <input
            type="text"
            value={value?.apartment || ''}
            onChange={(e) => onChange({ apartment: e.target.value })}
            className={inputClass}
            placeholder={t('jobs.apt')}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressFields;


