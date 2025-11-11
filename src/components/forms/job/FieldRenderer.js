import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
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
          + {t('jobs.quickAddSparePart')}
        </button>
      </div>
    );
  }

  // Translation mapping for field labels and placeholders
  const getTranslatedLabel = (fieldName, defaultLabel) => {
    const translationMap = {
      'clientName': t('jobs.name'),
      'clientPhone': t('jobs.phone'),
      'clientEmail': t('jobs.email'),
      'clientAddress': t('jobs.address'),
      'deviceType': t('jobs.deviceType'),
      'deviceBrand': t('jobs.brand'),
      'deviceModel': t('jobs.model'),
      'deviceSerialNumber': t('jobs.serialNumber'),
      'issueDescription': t('jobs.issueDescription'),
      'priority': t('jobs.priority'),
      'warranty': t('jobs.warranty'),
      'estimatedDuration': t('jobs.duration'),
      'assignedTo': t('jobs.assignedTo'),
      'serviceDate': t('jobs.serviceDate'),
      'serviceTime': t('jobs.serviceTime'),
      'serviceDateTime': t('jobs.serviceDate') + ' & ' + t('jobs.time')
    };
    return translationMap[fieldName] || defaultLabel || fieldName;
  };

  const getTranslatedPlaceholder = (fieldName, defaultPlaceholder) => {
    const translationMap = {
      'clientName': t('jobs.enterClientName'),
      'clientPhone': t('jobs.enterPhoneNumber'),
      'clientEmail': t('jobs.enterEmailAddress'),
      'clientAddress': t('jobs.enterStreetName'),
      'deviceType': t('jobs.selectDeviceType'),
      'deviceBrand': t('jobs.enterDeviceBrand'),
      'deviceModel': t('jobs.enterDeviceModel'),
      'deviceSerialNumber': t('jobs.enterSerialNumber'),
      'issueDescription': t('jobs.describeIssue'),
      'priority': t('jobs.selectPriority'),
      'estimatedDuration': t('jobs.selectEstimatedRepairTime')
    };
    return translationMap[fieldName] || defaultPlaceholder || '';
  };

  // Handle textarea
  if (fieldConfig?.type === 'textarea') {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {getTranslatedLabel(fieldName, fieldConfig?.label)} {fieldConfig?.required && '*'}
        </label>
        <textarea
          name={fieldName}
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className={`${inputClass} ${fieldConfig?.className || ''}`}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={getTranslatedPlaceholder(fieldName, fieldConfig?.placeholder)}
          required={fieldConfig?.required}
          rows={fieldConfig?.rows || 3}
        />
      </div>
    );
  }

  // Handle select
  if (fieldConfig?.type === 'select' && fieldConfig?.options) {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {getTranslatedLabel(fieldName, fieldConfig?.label)} {fieldConfig?.required && '*'}
        </label>
        <select
          name={fieldName}
          value={value || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className={inputClass}
          required={fieldConfig?.required}
        >
          <option value="">{getTranslatedPlaceholder(fieldName, fieldConfig?.placeholder) || t('common.select')}</option>
          {fieldConfig.options.map(option => {
            // Translate option labels for device types and other common options
            const getTranslatedOptionLabel = (value, label) => {
              const deviceTypeMap = {
                'refrigerator': t('jobs.deviceTypes.refrigerator'),
                'freezer': t('jobs.deviceTypes.freezer'),
                'washingMachine': t('jobs.deviceTypes.washingMachine'),
                'dryer': t('jobs.deviceTypes.dryer'),
                'dishwasher': t('jobs.deviceTypes.dishwasher'),
                'oven': t('jobs.deviceTypes.oven'),
                'stove': t('jobs.deviceTypes.stove'),
                'microwave': t('jobs.deviceTypes.microwave'),
                'waterHeater': t('jobs.deviceTypes.waterHeater'),
                'airConditioner': t('jobs.deviceTypes.airConditioner')
              };
              const serviceTypeMap = {
                'repair': t('jobs.serviceTypes.repair'),
                'maintenance': t('jobs.serviceTypes.maintenance'),
                'installation': t('jobs.serviceTypes.installation'),
                'inspection': t('jobs.serviceTypes.inspection'),
                'consultation': t('jobs.serviceTypes.consultation'),
                'other': t('jobs.serviceTypes.other')
              };
              return deviceTypeMap[value] || serviceTypeMap[value] || label;
            };
            return (
              <option key={option.value} value={option.value}>
                {getTranslatedOptionLabel(option.value, option.label)}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-200 mb-1">
        {getTranslatedLabel(fieldName, fieldConfig?.label)} {fieldConfig?.required && '*'}
      </label>
      <input
        type={fieldConfig?.type || 'text'}
        name={fieldName}
        value={value || ''}
        onChange={(e) => onChange(fieldName, e.target.value)}
        className={inputClass}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder={getTranslatedPlaceholder(fieldName, fieldConfig?.placeholder)}
        required={fieldConfig?.required}
      />
    </div>
  );
};

export default FieldRenderer;


