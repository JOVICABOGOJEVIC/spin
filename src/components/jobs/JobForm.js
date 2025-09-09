const handleSubmit = (e) => {
  e.preventDefault();
  console.log('Submitting data:', jobData);

  // Validate required fields
  const requiredFields = [
    'clientName',
    'clientPhone',
    'clientEmail',
    'clientAddress',
    'deviceType',
    'deviceBrand',
    'deviceModel',
    'deviceSerialNumber',
    'issueDescription',
    'serviceDate',
    'assignedTo'
  ];

  const missingFields = requiredFields.filter(field => !jobData[field]);
  
  if (missingFields.length > 0) {
    toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
    return;
  }

  const transformedData = {
    clientName: jobData.clientName,
    clientPhone: jobData.clientPhone,
    clientEmail: jobData.clientEmail,
    clientAddress: jobData.clientAddress,
    deviceType: jobData.deviceType,
    deviceBrand: jobData.deviceBrand,
    deviceModel: jobData.deviceModel,
    deviceSerialNumber: jobData.deviceSerialNumber,
    issueDescription: jobData.issueDescription,
    priority: jobData.priority || 'medium',
    warranty: jobData.warranty,
    serviceDate: new Date(jobData.serviceDate).toISOString(),
    assignedTo: jobData.assignedTo,
    usedSpareParts: jobData.usedSpareParts || [],
    status: 'pending'
  };

  console.log('Transformed data:', transformedData);

  try {
    if (isEdit) {
      dispatch(updateJob({ id: jobData._id, updatedJobData: transformedData }));
    } else {
      dispatch(createJob({ jobData: transformedData }));
    }
    onClose();
  } catch (error) {
    console.error('Error submitting job:', error);
    toast.error('Failed to save job. Please try again.');
  }
};

// Update renderField to add required attribute
const renderField = (fieldName, fieldConfig) => {
  const { type = 'text', label, placeholder, options, rows, dependsOn, showWhen, required } = fieldConfig;
  
  // ... existing code ...
  
  const baseInputClass = "w-full border border-gray-600 rounded px-2 py-1.5 text-xs text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-8";
  const labelClass = "block text-xs font-medium text-white mb-1";
  const helpTextClass = "text-xs text-blue-500 mt-1";
  
  switch (type) {
    case 'select':
      return (
        <div className="mb-2">
          <label className={labelClass}>{label || placeholder} {required && '*'}</label>
          <select
            name={fieldName}
            value={jobData[fieldName] || ''}
            onChange={handleChange}
            className={baseInputClass}
            required={required}
          >
            <option value="">{placeholder}</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    // ... existing code ...
  }
}; 