import React from 'react';
import { useTranslation } from 'react-i18next';

const PrioritySelect = ({ value, onChange, inputClass }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        {t('jobs.priority')}
      </label>
      <select
        name="priority"
        value={value || 'medium'}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="low">{t('jobs.priorityLow')}</option>
        <option value="medium">{t('jobs.priorityMedium')}</option>
        <option value="high">{t('jobs.priorityHigh')}</option>
        <option value="urgent">{t('jobs.priorityUrgent')}</option>
      </select>
    </div>
  );
};

export default PrioritySelect;


