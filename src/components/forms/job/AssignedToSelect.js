import React from 'react';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';

const AssignedToSelect = ({ value, onChange, options }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        {t('jobs.assignedTo')}
      </label>
      <Select
        value={options.find(opt => opt.value === value)}
        onChange={(selected) => onChange(selected)}
        options={options}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder={t('jobs.selectWorker')}
        isClearable
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '32px',
            height: '32px',
            backgroundColor: '#374151',
            borderColor: '#4B5563',
            '&:hover': { borderColor: '#6B7280' }
          }),
          menu: (base) => ({ ...base, backgroundColor: '#374151' }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#4B5563' : '#374151',
            color: 'white',
            '&:hover': { backgroundColor: '#4B5563' }
          }),
          singleValue: (base) => ({ ...base, color: 'white' }),
          input: (base) => ({ ...base, color: 'white' }),
          placeholder: (base) => ({ ...base, color: '#9CA3AF' })
        }}
      />
    </div>
  );
};

export default AssignedToSelect;


