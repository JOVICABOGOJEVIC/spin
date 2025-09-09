import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createJob, updateJob, clearCurrentJob } from '../../redux/features/jobSlice';
import { getWorkers } from '../../redux/features/workerSlice';
import { toast } from 'react-toastify';
import { getJobFormConfig, getJobFormInitialState } from '../../utils/formConfig';
import { getBusinessType } from '../../utils/businessTypeUtils';
import Select from 'react-select';
import { getSpareParts, createSparePart } from '../../redux/features/sparePartSlice';
import { COUNTRY_DATA } from '../../utils/countryData';

// Phone prefixes mapping
const COUNTRY_PREFIXES = {
  rs: '381', // Serbia
  ba: '387', // Bosnia and Herzegovina
  hr: '385', // Croatia
  me: '382', // Montenegro
  mk: '389', // North Macedonia
  si: '386'  // Slovenia
};

const JobForm = ({ isEdit = false, jobData: initialJobData, onClose, className = '', isModal = false, selectedSlot = null }) => {
  const businessType = getBusinessType();
  const formConfig = getJobFormConfig(businessType);
  const [jobData, setJobData] = useState({
    clientName: '',
    clientPhone: '',
    clientAddress: {
      street: '',
      number: '',
      floor: '',
      apartment: '',
    },
    serviceDateTime: {
      date: selectedSlot?.date || '',
      time: selectedSlot?.time || '09:00',
    },
    ...initialJobData,
  });
  const [workerOptions, setWorkerOptions] = useState([]);
  const [sparePartsOptions, setSparePartsOptions] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState({
    clientName: [],
    clientPhone: [],
    clientEmail: [],
    clientAddress: []
  });
  const [showSuggestions, setShowSuggestions] = useState({
    clientName: false,
    clientPhone: false,
    clientEmail: false,
    clientAddress: false
  });
  const dispatch = useDispatch();
  
  const jobState = useSelector((state) => state.job);
  const currentJob = jobState ? jobState.currentJob : null;
  const { clients } = useSelector((state) => state.client || {});
  const { workers } = useSelector((state) => state.worker || { workers: [] });
  const { items: spareParts, loading: sparePartsLoading } = useSelector((state) => state.spareParts);
  const { user } = useSelector((state) => state.auth);
  const countryCode = user?.result?.countryCode?.toLowerCase() || 'ba';
  const phonePrefix = COUNTRY_PREFIXES[countryCode] || '387';
  
  // Add title display
  const formTitle = isEdit ? 'Edit Job' : 
    (initialJobData?.displayDateTime ? 
      `Adding job for ${initialJobData.displayDateTime}` : 
      'New Job');
  
  // Format clients for react-select
  const formattedClientOptions = clients ? clients.map(client => ({
    value: client._id,
    label: `${client.name} - ${client.phone}${client.email ? ` (${client.email})` : ''}`,
    ...client
  })) : [];
  
  useEffect(() => {
    // Fetch workers when component mounts
    dispatch(getWorkers());
  }, [dispatch]);
  
  useEffect(() => {
    if (isEdit && currentJob) {
      // Format the dates for the input fields (YYYY-MM-DD)
      const formattedServiceDate = currentJob.serviceDate ? new Date(currentJob.serviceDate).toISOString().slice(0, 10) : '';
      
      // Ensure phone number has correct prefix when editing
      const phone = currentJob.clientPhone?.startsWith('+') ? 
        currentJob.clientPhone : 
        `+${phonePrefix}${currentJob.clientPhone?.replace(/^\+?[0-9]+/, '') || ''}`;
      
      setJobData({
        ...currentJob,
        serviceDate: formattedServiceDate,
        clientPhone: phone
      });
    }
    
    return () => {
      // Clean up when the component unmounts
      if (isEdit) {
        dispatch(clearCurrentJob());
      }
    };
  }, [isEdit, currentJob, dispatch, phonePrefix]);
  
  // Update worker options when workers change
  useEffect(() => {
    if (workers && workers.length > 0) {
      console.log('Workers from Redux:', workers);
      const activeWorkers = workers.filter(worker => worker.active);
      console.log('Active workers:', activeWorkers);
      const mappedOptions = activeWorkers.map(worker => ({
        value: worker._id,
        label: `${worker.firstName} ${worker.lastName}${worker.specialization ? ` - ${worker.specialization}` : ''}`
      }));
      console.log('Mapped worker options:', mappedOptions);
      setWorkerOptions(mappedOptions);
    }
  }, [workers]);
  
  // Fetch spare parts
  useEffect(() => {
    dispatch(getSpareParts());
  }, [dispatch]);
  
  useEffect(() => {
    if (spareParts && spareParts.length > 0) {
      const mappedOptions = spareParts.map(part => ({
        value: part._id,
        label: `${part.name} - ${part.code} (Nabavna: ${part.purchasePrice}din, Prodajna: ${part.price}din, Porez: ${part.tax}%)`,
        price: part.price,
        purchasePrice: part.purchasePrice,
        tax: part.tax,
        quantity: part.quantity
      }));
      setSparePartsOptions(mappedOptions);
    }
  }, [spareParts]);
  
  useEffect(() => {
    // Initialize phone with prefix when form is reset
    if (!jobData.clientPhone) {
      setJobData(prev => ({
        ...prev,
        clientPhone: `+${phonePrefix}`
      }));
    }
  }, [phonePrefix]);
  
  // Function to filter clients based on input value and field
  const filterClients = (value, field) => {
    if (!value || value.length < 2 || !clients) return [];
    
    const searchValue = value.toLowerCase();
    return clients.filter(client => {
      switch(field) {
        case 'clientName':
          return client.name.toLowerCase().includes(searchValue);
        case 'clientPhone':
          return client.phone.includes(value);
        case 'clientEmail':
          return client.email?.toLowerCase().includes(searchValue);
        case 'clientAddress':
          const address = `${client.address?.street || ''} ${client.address?.number || ''}`.toLowerCase();
          return address.includes(searchValue);
        default:
          return false;
      }
    }).slice(0, 5); // Limit to 5 suggestions
  };

  // Handle input change with suggestions
  const handleClientFieldChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'clientPhone') {
      const prefix = COUNTRY_DATA[countryCode].code;
      let phoneValue = value.replace(/[^\d+]/g, '');
      
      // If the user is typing a new number (not pasting a complete one)
      if (!phoneValue.startsWith('+')) {
        phoneValue = `+${prefix}${phoneValue}`;
      }
      
      setJobData(prev => ({
        ...prev,
        [name]: phoneValue
      }));
      return;
    }
    
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (client, field) => {
    setJobData(prev => ({
      ...prev,
      clientName: field === 'clientName' ? client.name : prev.clientName,
      clientPhone: field === 'clientPhone' ? 
        (client.phone.startsWith('+') ? client.phone : `+${phonePrefix}${client.phone.replace(/^\+?[0-9]+/, '')}`) : 
        prev.clientPhone,
      clientEmail: field === 'clientEmail' ? client.email : prev.clientEmail,
      clientAddress: field === 'clientAddress' ? 
        `${client.address?.street || ''} ${client.address?.number || ''}` : 
        prev.clientAddress
    }));
    
    setShowSuggestions({
      clientName: false,
      clientPhone: false,
      clientEmail: false,
      clientAddress: false
    });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.suggestions-container')) {
        setShowSuggestions({
          clientName: false,
          clientPhone: false,
          clientEmail: false,
          clientAddress: false
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleInputChange = (field, value) => {
    if (field === 'clientAddress') {
      setJobData(prev => ({
        ...prev,
        clientAddress: {
          ...prev.clientAddress,
          ...value,
        },
      }));
    } else if (field === 'serviceDateTime') {
      setJobData(prev => ({
        ...prev,
        serviceDateTime: {
          ...prev.serviceDateTime,
          ...value,
        },
      }));
    } else {
      setJobData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };
  
  const handleSelectChange = (selectedOption, { name }) => {
    console.log('Select changed:', name, selectedOption); // Za debugging
    if (!selectedOption) {
      setJobData(prev => ({ ...prev, [name]: '' }));
      return;
    }
    setJobData(prev => ({ ...prev, [name]: selectedOption.value }));
  };
  
  const handleClientSelect = (selectedOption) => {
    if (selectedOption) {
      const phone = selectedOption.phone.startsWith('+') ? 
        selectedOption.phone : 
        `+${phonePrefix}${selectedOption.phone.replace(/^\+?[0-9]+/, '')}`;
      
      setJobData({
        ...jobData,
        clientName: selectedOption.name,
        clientPhone: phone,
        clientEmail: selectedOption.email
      });
    }
  };
  
  const handleSparePartsChange = (selectedOptions) => {
    setJobData({
      ...jobData,
      usedSpareParts: selectedOptions
    });
  };
  
  const handleQuickAddSparePart = async (e) => {
    e.preventDefault();
    
    try {
      const name = window.prompt('Naziv rezervnog dela:', '');
      if (!name) {
        toast.info('Dodavanje rezervnog dela otkazano');
        return;
      }

      // Check if part already exists in spareParts array
      const existingPart = spareParts.find(part => 
        part.name.toLowerCase() === name.toLowerCase() ||
        part.code.toLowerCase() === name.toLowerCase()
      );

      if (existingPart) {
        const quantity = window.prompt('Dodavanje količine\n\nKoličina koja se dodaje:', '1');
        if (!quantity || isNaN(quantity)) {
          toast.error('Neispravna količina. Molimo unesite broj.');
          return;
        }

        const additionalQuantity = parseInt(quantity);

        // Check if this part is already in usedSpareParts
        const existingUsedPartIndex = jobData.usedSpareParts ? 
          jobData.usedSpareParts.findIndex(part => part.value === existingPart._id) : -1;

        let updatedParts;
        if (existingUsedPartIndex !== -1) {
          // Update quantity of existing part in the job
          updatedParts = [...(jobData.usedSpareParts || [])];
          updatedParts[existingUsedPartIndex] = {
            ...updatedParts[existingUsedPartIndex],
            quantity: (updatedParts[existingUsedPartIndex].quantity || 0) + additionalQuantity
          };
        } else {
          // Add as new entry to the job
          const newOption = {
            value: existingPart._id,
            label: `${existingPart.name} - ${existingPart.code} (Nabavna: ${existingPart.purchasePrice}din, Prodajna: ${existingPart.price}din, Porez: ${existingPart.tax}%)`,
            price: existingPart.price,
            purchasePrice: existingPart.purchasePrice,
            tax: existingPart.tax,
            quantity: additionalQuantity,
            name: existingPart.name,
            code: existingPart.code
          };
          updatedParts = [...(jobData.usedSpareParts || []), newOption];
        }

        handleSparePartsChange(updatedParts);
        toast.success('Količina rezervnog dela uspešno dodata');
        return;
      }

      // If part doesn't exist, gather information for new part
      const purchasePrice = window.prompt('Dodavanje novog rezervnog dela\n\nNabavna cena (din):', '');
      if (!purchasePrice || isNaN(purchasePrice)) {
        toast.error('Neispravna nabavna cena. Molimo unesite broj.');
        return;
      }

      const price = window.prompt('Dodavanje novog rezervnog dela\n\nProdajna cena (din):', '');
      if (!price || isNaN(price)) {
        toast.error('Neispravna prodajna cena. Molimo unesite broj.');
        return;
      }

      const tax = window.prompt('Dodavanje novog rezervnog dela\n\nPorez (%):', '20');
      if (!tax || isNaN(tax)) {
        toast.error('Neispravan porez. Molimo unesite broj.');
        return;
      }

      const category = window.prompt('Dodavanje novog rezervnog dela\n\nKategorija:', 'Ostalo');
      if (!category) {
        toast.error('Kategorija je obavezna');
        return;
      }

      const quantity = window.prompt('Dodavanje novog rezervnog dela\n\nKoličina:', '1');
      if (!quantity || isNaN(quantity)) {
        toast.error('Neispravna količina. Molimo unesite broj.');
        return;
      }

      // Generate a unique code using timestamp and random number
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const code = `${name.substring(0, 3).toUpperCase()}${timestamp}${random}`;
      
      const sparePartData = {
        name: name.trim(),
        code: code,
        price: parseFloat(price),
        purchasePrice: parseFloat(purchasePrice),
        tax: parseFloat(tax),
        quantity: parseInt(quantity),
        category: category.trim(),
        description: '',
        isActive: true
      };

      console.log('Creating spare part with data:', sparePartData);
      
      const result = await dispatch(createSparePart(sparePartData)).unwrap();
      console.log('Server response:', result);
      
      const newOption = {
        value: result._id,
        label: `${result.name} - ${result.code} (Nabavna: ${result.purchasePrice}din, Prodajna: ${result.price}din, Porez: ${result.tax}%)`,
        price: result.price,
        purchasePrice: result.purchasePrice,
        tax: result.tax,
        quantity: result.quantity,
        name: result.name,
        code: result.code
      };
      
      setSparePartsOptions(prev => [...prev, newOption]);
      const updatedParts = [...(jobData.usedSpareParts || []), newOption];
      handleSparePartsChange(updatedParts);
      toast.success('Rezervni deo uspešno dodat');
    } catch (error) {
      console.error('Error adding spare part:', error);
      toast.error(`Greška: ${error.message || 'Greška pri dodavanju rezervnog dela'}`);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting data:', jobData);

    // Validate required fields
    const requiredFields = Object.entries(formConfig)
      .filter(([_, config]) => config.required)
      .map(([fieldName]) => ({
        name: fieldName,
        label: formConfig[fieldName].label
      }));

    const missingFields = requiredFields
      .filter(field => !jobData[field.name])
      .map(field => field.label);
    
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
      serviceDate: new Date(jobData.serviceDateTime.date).toISOString(),
      scheduledTime: jobData.serviceDateTime.time,
      assignedTo: jobData.assignedTo,
      usedSpareParts: jobData.usedSpareParts || [],
      status: 'pending'
    };

    console.log('Transformed data:', transformedData);

    try {
      if (isEdit) {
        dispatch(updateJob({ id: jobData._id, updatedJobData: transformedData }));
        toast.success('Job updated successfully');
      } else {
        dispatch(createJob({ jobData: transformedData }));
        toast.success('Job created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error submitting job:', error);
      toast.error('Failed to save job. Please try again.');
    }
  };
  
  const renderAddressFields = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            value={jobData.clientAddress?.street || ''}
            onChange={(e) => handleInputChange('clientAddress', { street: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
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
              value={jobData.clientAddress?.number || ''}
              onChange={(e) => handleInputChange('clientAddress', { number: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
              placeholder="No."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Floor
            </label>
            <input
              type="text"
              value={jobData.clientAddress?.floor || ''}
              onChange={(e) => handleInputChange('clientAddress', { floor: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
              placeholder="Floor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Apartment
            </label>
            <input
              type="text"
              value={jobData.clientAddress?.apartment || ''}
              onChange={(e) => handleInputChange('clientAddress', { apartment: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
              placeholder="Apt."
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDateTimeField = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Service Date *
          </label>
          <input
            type="date"
            value={jobData.serviceDateTime?.date || ''}
            onChange={(e) => handleInputChange('serviceDateTime', { date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Service Time *
          </label>
          <input
            type="time"
            value={jobData.serviceDateTime?.time || ''}
            onChange={(e) => handleInputChange('serviceDateTime', { time: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 px-3"
            required
          />
        </div>
      </div>
    );
  };

  // Update sections structure
  const sections = {
    clientInfo: {
      title: 'Client Information',
      fields: [
        'clientName', 
        'clientPhone', 
        'clientAddress',
        'clientEmail'
      ]
    },
    deviceInfo: {
      title: 'Device Information',
      fields: [
        'deviceType', 
        'deviceBrand', 
        'deviceModel', 
        'deviceSerialNumber'
      ]
    },
    serviceInfo: {
      title: 'Service Information',
      fields: [
        'serviceType',
        'serviceDateTime',
        'assignedTo',
        'usedSpareParts',
        'issueDescription'
      ]
    },
    additionalInfo: {
      title: 'Additional Information',
      fields: [
        'priority',
        'warranty'
      ]
    }
  };

  // Update input class for smaller size
  const inputClass = "mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5 px-2";

  const renderField = (fieldName, fieldConfig) => {
    if (fieldName === 'clientPhone') {
      return (
        <div key={fieldName} className="relative suggestions-container mb-3">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {fieldConfig.label} {fieldConfig.required && '*'}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="flex items-center px-2 py-1.5 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img
                  src={`https://flagcdn.com/${countryCode}.svg`}
                  alt={COUNTRY_DATA[countryCode]?.name}
                  className="h-4 w-6"
                  onError={(e) => {
                    console.error("Flag loading error:", e);
                    e.target.src = `https://flagcdn.com/ba.svg`;
                  }}
                />
                <svg
                  className="w-4 h-4 ml-1 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCountryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50">
                  {Object.entries(COUNTRY_DATA).map(([code, { name, code: prefix }]) => (
                    <button
                      key={code}
                      type="button"
                      className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-gray-600"
                      onClick={() => {
                        const oldPrefix = COUNTRY_DATA[countryCode].code;
                        setJobData(prev => ({
                          ...prev,
                          clientPhone: prev.clientPhone.replace(`+${oldPrefix}`, `+${prefix}`)
                        }));
                        setShowCountryDropdown(false);
                      }}
                    >
                      <img
                        src={`https://flagcdn.com/${code}.svg`}
                        alt={name}
                        className="h-4 w-6 mr-2"
                        onError={(e) => {
                          e.target.src = `https://flagcdn.com/ba.svg`;
                        }}
                      />
                      <span className="flex-1">{name}</span>
                      <span className="text-gray-400 ml-2">+{prefix}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="tel"
              name={fieldName}
              value={jobData[fieldName] || ''}
              onChange={handleClientFieldChange}
              className={inputClass}
              placeholder="Enter phone number"
              required={fieldConfig.required}
            />
          </div>
          {showSuggestions[fieldName] && suggestions[fieldName]?.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {suggestions[fieldName].map((client, index) => (
                <div
                  key={client._id || index}
                  className="cursor-pointer hover:bg-gray-600 px-4 py-2 transition-colors duration-150 text-white"
                  onClick={() => handleSuggestionSelect(client, fieldName)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{client.phone}</span>
                    <span className="text-xs text-gray-400">{client.name} - {client.email || 'No email'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (fieldName === 'priority') {
      return (
        <div key={fieldName} className="mb-3">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Priority
          </label>
          <select
            name={fieldName}
            value={jobData[fieldName] || 'medium'}
            onChange={handleClientFieldChange}
            className={inputClass}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      );
    }

    if (fieldName === 'warranty') {
      return (
        <div key={fieldName} className="mb-3">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Warranty
          </label>
          <select
            name={fieldName}
            value={jobData[fieldName] || 'no'}
            onChange={handleClientFieldChange}
            className={inputClass}
          >
            <option value="no">No Warranty</option>
            <option value="yes">Under Warranty</option>
          </select>
        </div>
      );
    }

    if (fieldName === 'clientAddress') {
      return renderAddressFields();
    }

    if (fieldName === 'serviceDateTime') {
      return renderDateTimeField();
    }

    if (fieldName === 'assignedTo') {
      return (
        <div key={fieldName} className="mb-3">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Assigned To
          </label>
          <Select
            value={workerOptions.find(opt => opt.value === jobData.assignedTo)}
            onChange={(selected) => handleSelectChange(selected, { name: 'assignedTo' })}
            options={workerOptions}
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
                '&:hover': {
                  borderColor: '#6B7280'
                }
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#374151'
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? '#4B5563' : '#374151',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#4B5563'
                }
              }),
              singleValue: (base) => ({
                ...base,
                color: 'white'
              }),
              input: (base) => ({
                ...base,
                color: 'white'
              }),
              placeholder: (base) => ({
                ...base,
                color: '#9CA3AF'
              })
            }}
          />
        </div>
      );
    }

    if (fieldName === 'usedSpareParts') {
      return (
        <div key={fieldName} className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Used Spare Parts
          </label>
          <Select
            value={jobData.usedSpareParts}
            onChange={handleSparePartsChange}
            options={sparePartsOptions}
            isMulti
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select spare parts"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#374151',
                borderColor: '#4B5563',
                '&:hover': {
                  borderColor: '#6B7280'
                }
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#374151'
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? '#4B5563' : '#374151',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#4B5563'
                }
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#4B5563'
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: 'white'
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: 'white',
                '&:hover': {
                  backgroundColor: '#6B7280',
                  color: 'white'
                }
              }),
              input: (base) => ({
                ...base,
                color: 'white'
              }),
              placeholder: (base) => ({
                ...base,
                color: '#9CA3AF'
              })
            }}
          />
          <button
            type="button"
            onClick={handleQuickAddSparePart}
            className="mt-2 text-sm text-blue-500 hover:text-blue-400"
          >
            + Quick Add Spare Part
          </button>
        </div>
      );
    }

    return (
      <div key={fieldName} className="mb-3">
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {fieldConfig?.label || fieldName} {fieldConfig?.required && '*'}
        </label>
        <input
          type={fieldConfig?.type || 'text'}
          name={fieldName}
          value={jobData[fieldName] || ''}
          onChange={handleClientFieldChange}
          className={inputClass}
          placeholder={fieldConfig?.placeholder}
          required={fieldConfig?.required}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      {isModal && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-200">{formTitle}</h2>
          {!isEdit && initialJobData?.displayDateTime && (
            <p className="text-sm text-gray-400 mt-1">
              Please fill in the job details below
            </p>
          )}
        </div>
      )}
      
      {/* Form sections in horizontal row - update to 4 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Object.entries(sections).map(([sectionKey, section]) => (
          <div key={sectionKey} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">{section.title}</h3>
            <div className="space-y-3">
              {section.fields.map(fieldName => renderField(fieldName, formConfig[fieldName]))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Form buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          disabled={jobState.loading}
        >
          {jobState.loading ? 'Saving...' : (isEdit ? 'Update Job' : 'Create Job')}
        </button>
      </div>
    </form>
  );
};

export default JobForm; 