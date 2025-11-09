import React from 'react';
import { useTranslation } from 'react-i18next';

const WarrantySelect = ({ value, onChange, inputClass }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        {t('jobs.warranty')}
      </label>
      <select
        name="warranty"
        value={value || 'no'}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="no">{t('jobs.noWarranty')}</option>
        <option value="yes">{t('jobs.underWarranty')}</option>
      </select>
    </div>
  );
};

export default WarrantySelect;


