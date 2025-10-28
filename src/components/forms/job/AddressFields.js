import React from 'react';

const AddressFields = ({ value, onChange, inputClass }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Street Address *
        </label>
        <input
          type="text"
          value={value?.street || ''}
          onChange={(e) => onChange({ street: e.target.value })}
          className={inputClass}
          placeholder="Enter street name"
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Number
          </label>
          <input
            type="text"
            value={value?.number || ''}
            onChange={(e) => onChange({ number: e.target.value })}
            className={inputClass}
            placeholder="No."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Floor
          </label>
          <input
            type="text"
            value={value?.floor || ''}
            onChange={(e) => onChange({ floor: e.target.value })}
            className={inputClass}
            placeholder="Floor"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Apartment
          </label>
          <input
            type="text"
            value={value?.apartment || ''}
            onChange={(e) => onChange({ apartment: e.target.value })}
            className={inputClass}
            placeholder="Apt."
          />
        </div>
      </div>
    </div>
  );
};

export default AddressFields;


