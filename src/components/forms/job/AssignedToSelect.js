import React from 'react';
import Select from 'react-select';

const AssignedToSelect = ({ value, onChange, options }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        Assigned To
      </label>
      <Select
        value={options.find(opt => opt.value === value)}
        onChange={(selected) => onChange(selected)}
        options={options}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Select worker"
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


