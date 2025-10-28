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
  onQuickAddSparePart
}) => {
  const visibleFields = fields.filter((fieldName) => {
    const config = formConfig[fieldName];
    if (!config) return false;
    if (fieldName === 'clientAddress' && serviceLocation !== 'OnSite') return false;
    return true;
  });

  if (visibleFields.length === 0) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {visibleFields.map((fieldName) => {
          let fieldValue;
          if (fieldName === 'clientAddress') {
            fieldValue = jobData.clientAddress;
          } else if (fieldName === 'serviceDateTime') {
            fieldValue = jobData.serviceDateTime;
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
    </div>
  );
};

export default JobFormSection;


