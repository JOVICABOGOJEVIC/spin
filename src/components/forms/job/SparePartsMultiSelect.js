import React from 'react';
import Select from 'react-select';

const SparePartsMultiSelect = ({ value, onChange, options }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        Used Spare Parts
      </label>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        isMulti
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Select spare parts"
        styles={{
          control: (base) => ({
            ...base,
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
          multiValue: (base) => ({ ...base, backgroundColor: '#4B5563' }),
          multiValueLabel: (base) => ({ ...base, color: 'white' }),
          multiValueRemove: (base) => ({
            ...base,
            color: 'white',
            '&:hover': { backgroundColor: '#6B7280', color: 'white' }
          }),
          input: (base) => ({ ...base, color: 'white' }),
          placeholder: (base) => ({ ...base, color: '#9CA3AF' })
        }}
      />
    </div>
  );
};

export default SparePartsMultiSelect;


