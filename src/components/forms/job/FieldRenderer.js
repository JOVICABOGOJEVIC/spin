import React from 'react';
import AssignedToSelect from './AssignedToSelect';
import PrioritySelect from './PrioritySelect';
import WarrantySelect from './WarrantySelect';
import AddressFields from './AddressFields';
import DateTimeField from './DateTimeField';
import ServiceLocationField from './ServiceLocationField';
import SparePartsMultiSelect from './SparePartsMultiSelect';

const FieldRenderer = ({
  fieldName,
  fieldConfig,
  value,
  onChange,
  inputClass,
  workerOptions,
  sparePartsOptions,
  serviceLocation,
  onQuickAddSparePart
}) => {
  if (!fieldConfig) return null;

  if (fieldName === 'serviceLocation') {
    return (
      <ServiceLocationField
        value={serviceLocation}
        onChange={(val) => onChange('serviceLocation', val)}
        inputClass={inputClass}
      />
    );
  }

  if (fieldName === 'clientAddress') {
    if (serviceLocation !== 'OnSite') return null;
    return (
      <AddressFields
        value={value}
        onChange={(val) => onChange('clientAddress', val)}
        inputClass={inputClass.replace('py-1.5 px-2', 'py-2.5 px-3')}
      />
    );
  }

  if (fieldName === 'serviceDateTime') {
    return (
      <DateTimeField
        value={value}
        onChange={(val) => onChange('serviceDateTime', val)}
        inputClass={inputClass}
      />
    );
  }

  if (fieldName === 'assignedTo') {
    return (
      <AssignedToSelect
        value={value}
        onChange={(selected) => onChange('assignedTo', selected ? selected.value : '')}
        options={workerOptions}
      />
    );
  }

  if (fieldName === 'priority') {
    return (
      <PrioritySelect
        value={value}
        onChange={(val) => onChange('priority', val)}
        inputClass={inputClass}
      />
    );
  }

  if (fieldName === 'warranty') {
    return (
      <WarrantySelect
        value={value}
        onChange={(val) => onChange('warranty', val)}
        inputClass={inputClass}
      />
    );
  }

  if (fieldName === 'usedSpareParts') {
    return (
      <div>
        <SparePartsMultiSelect
          value={value}
          onChange={(val) => onChange('usedSpareParts', val)}
          options={sparePartsOptions}
        />
        <button
          type="button"
          onClick={onQuickAddSparePart}
          className="mt-2 text-sm text-blue-500 hover:text-blue-400"
        >
          + Quick Add Spare Part
        </button>
      </div>
    );
  }

  // Handle textarea
  if (fieldConfig?.type === 'textarea') {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {fieldConfig?.label || fieldName} {fieldConfig?.required && '*'}
        </label>
        <textarea
          name={fieldName}
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className={`${inputClass} ${fieldConfig?.className || ''}`}
          placeholder={fieldConfig?.placeholder}
          required={fieldConfig?.required}
          rows={fieldConfig?.rows || 3}
        />
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        {fieldConfig?.label || fieldName} {fieldConfig?.required && '*'}
      </label>
      <input
        type={fieldConfig?.type || 'text'}
        name={fieldName}
        value={value || ''}
        onChange={(e) => onChange(fieldName, e.target.value)}
        className={inputClass}
        placeholder={fieldConfig?.placeholder}
        required={fieldConfig?.required}
      />
    </div>
  );
};

export default FieldRenderer;


