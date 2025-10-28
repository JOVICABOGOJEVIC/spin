import React from 'react';

const WarrantySelect = ({ value, onChange, inputClass }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        Warranty
      </label>
      <select
        name="warranty"
        value={value || 'no'}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="no">No Warranty</option>
        <option value="yes">Under Warranty</option>
      </select>
    </div>
  );
};

export default WarrantySelect;


