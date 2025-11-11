import React from 'react';
import FieldRenderer from './FieldRenderer';

const JobFormSection = ({
  title,
  fields,
  formConfig,
  jobData,
  inputClass,
  workerOptions,
  sparePartsOptions,
  serviceLocation,
  onChange,
  onQuickAddSparePart,
  variant = 'card',
  isOpen = true,
  onToggle = () => {}
}) => {
  const visibleFields = fields.filter((fieldName) => {
    const config = formConfig[fieldName];
    if (!config) return false;
    if (fieldName === 'clientAddress' && serviceLocation !== 'OnSite') return false;
    return true;
  });

  if (visibleFields.length === 0) return null;

  const renderFields = () => (
    <div className="space-y-3">
      {visibleFields.map((fieldName) => {
        let fieldValue;
        if (fieldName === 'clientAddress') {
          fieldValue = jobData.clientAddress;
        } else if (fieldName === 'serviceDateTime') {
          fieldValue = jobData.serviceDateTime;
        } else if (fieldName === 'deviceType') {
          fieldValue = jobData.deviceCategoryId || jobData.deviceTypeId || jobData.deviceType || '';
        } else if (fieldName === 'serviceId') {
          fieldValue = jobData.serviceId || '';
        } else {
          fieldValue = jobData[fieldName];
        }
        
        return (
          <FieldRenderer
            key={fieldName}
            fieldName={fieldName}
            fieldConfig={formConfig[fieldName]}
            value={fieldValue}
            onChange={onChange}
            inputClass={inputClass}
            workerOptions={workerOptions}
            sparePartsOptions={sparePartsOptions}
            serviceLocation={serviceLocation}
            onQuickAddSparePart={onQuickAddSparePart}
          />
        );
      })}
    </div>
  );

  if (variant === 'accordion') {
    return (
      <div className="rounded-md border border-gray-700 bg-gray-900">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between px-3 py-2 text-left"
        >
          <span className="text-sm font-medium text-gray-100">{title}</span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="border-t border-gray-800 px-3 py-3">
            {renderFields()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <h3 className="mb-4 text-lg font-medium text-white">{title}</h3>
      {renderFields()}
    </div>
  );
};

export default JobFormSection;


