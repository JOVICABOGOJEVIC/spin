import React from 'react';

const ServiceLocationField = ({ value, onChange, inputClass }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        Service Location
      </label>
        <select
          name="serviceLocation"
          value={value || 'OnSite'}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          <option value="OnSite">On site address</option>
          <option value="InWorkshop">Service workshop</option>
        </select>
    </div>
  );
};

export default ServiceLocationField;


