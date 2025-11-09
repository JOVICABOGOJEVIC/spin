import React from 'react';
import { useTranslation } from 'react-i18next';

const ServiceLocationField = ({ value, onChange, inputClass }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        {t('jobs.serviceLocation')}
      </label>
        <select
          name="serviceLocation"
          value={value || 'OnSite'}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          <option value="OnSite">{t('jobs.onSiteAddress')}</option>
          <option value="InWorkshop">{t('jobs.serviceWorkshop')}</option>
        </select>
    </div>
  );
};

export default ServiceLocationField;


