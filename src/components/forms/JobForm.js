import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createJob, updateJob, clearCurrentJob, getJobs } from '../../redux/features/jobSlice';
import { getWorkers } from '../../redux/features/workerSlice';
import { createClientAsync, fetchClientsAsync } from '../../redux/features/clientSlice';
import { toast } from 'react-toastify';
import { getJobFormConfig, getJobFormInitialState } from '../../utils/formConfig';
import { getBusinessType } from '../../utils/businessTypeUtils';
import Select from 'react-select';
import FieldRenderer from './job/FieldRenderer';
import JobFormSection from './job/JobFormSection';
import { getSpareParts, createSparePart } from '../../redux/features/sparePartSlice';
import { COUNTRY_DATA } from '../../utils/countryData';
import { checkJobOverlap, formatTimeSlot, addHoursToTime } from '../../utils/timeSlotUtils';

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
  
  console.log('JobForm initialJobData:', initialJobData);
  console.log('JobForm isEdit:', isEdit);
  
  // Transform initialJobData to ensure serviceDateTime is properly structured
  const transformedInitialData = initialJobData ? {
    ...initialJobData,
    serviceDateTime: {
      date: initialJobData.serviceDate ? new Date(initialJobData.serviceDate).toISOString().slice(0, 10) : selectedSlot?.date || '',
      time: initialJobData.scheduledTime || selectedSlot?.time || '09:00',
    }
  } : {};
  
  console.log('JobForm transformedInitialData.serviceDateTime:', transformedInitialData.serviceDateTime);
  
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
    status: 'draft', // Default status for new jobs
    serviceLocation: 'OnSite',
    ...transformedInitialData,
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
  const { jobs } = useSelector((state) => state.job || { jobs: [] });
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
    console.log('🎯 JobForm: useEffect triggered - fetching workers and clients');
    console.log('🎯 Current user from Redux:', user);
    console.log('🎯 Current localStorage profile:', localStorage.getItem('profile'));
    
    // Fetch workers and clients when component mounts
    dispatch(getWorkers());
    dispatch(fetchClientsAsync());
  }, [dispatch]);
  
  useEffect(() => {
    // Use initialJobData if provided directly, otherwise use currentJob from Redux
    const jobToEdit = initialJobData || currentJob;
    
    if (isEdit && jobToEdit) {
      // Format the dates for the input fields (YYYY-MM-DD)
      const formattedServiceDate = jobToEdit.serviceDate ? new Date(jobToEdit.serviceDate).toISOString().slice(0, 10) : '';
      const formattedServiceTime = jobToEdit.scheduledTime || '09:00';
      
      // Ensure phone number has correct prefix when editing
      const phone = jobToEdit.clientPhone?.startsWith('+') ? 
        jobToEdit.clientPhone : 
        `+${phonePrefix}${jobToEdit.clientPhone?.replace(/^\+?[0-9]+/, '') || ''}`;
      
      console.log('Setting edit job data:', {
        serviceDate: formattedServiceDate,
        scheduledTime: formattedServiceTime,
        serviceDateTime: {
          date: formattedServiceDate,
          time: formattedServiceTime
        }
      });
      
      setJobData({
        ...jobToEdit,
        serviceDateTime: {
          date: formattedServiceDate,
          time: formattedServiceTime
        },
        clientPhone: phone
      });
    }
    
    return () => {
      // Clean up when the component unmounts
      if (isEdit) {
        dispatch(clearCurrentJob());
      }
    };
  }, [isEdit, currentJob, initialJobData, dispatch, phonePrefix]);
  
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
        label: part.name, // Show only name without description
        price: part.price,
        purchasePrice: part.purchasePrice,
        tax: part.tax,
        quantity: part.quantity,
        name: part.name,
        code: part.code
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
            label: existingPart.name, // Show only name without description
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
        label: result.name, // Show only name without description
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
  
  // Function to check if client exists and create if needed
  const handleClientCreation = async (clientData) => {
    try {
      // Check if client with this phone already exists
      const existingClient = clients?.find(client => 
        client.phone === clientData.phone || 
        client.phone === clientData.phone.replace(/\s/g, '')
      );

      if (existingClient) {
        toast.info(`Klijent "${existingClient.name}" već postoji u bazi`, {
          autoClose: 3000
        });
        return existingClient;
      }

      // Client doesn't exist, create new one
      const newClient = await dispatch(createClientAsync(clientData)).unwrap();
      toast.success(`Novi klijent "${newClient.name}" je sačuvan u bazi`, {
        autoClose: 3000
      });
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      toast.warning('Posao je kreiran, ali klijent nije mogao biti sačuvan u bazi');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting data:', jobData);

    // No validation - all fields are optional
    console.log('Submitting job data:', jobData);
    
    // Skip all validation and proceed directly to submission

    // Convert clientAddress object to string
    const addressString = jobData.clientAddress && typeof jobData.clientAddress === 'object' 
      ? `${jobData.clientAddress.street || ''} ${jobData.clientAddress.number || ''} ${jobData.clientAddress.floor || ''} ${jobData.clientAddress.apartment || ''}`.trim()
      : jobData.clientAddress || '';

    // Convert usedSpareParts to array of strings (IDs only)
    let sparePartsArray = [];
    if (jobData.usedSpareParts && Array.isArray(jobData.usedSpareParts)) {
      sparePartsArray = jobData.usedSpareParts.map(part => {
        if (typeof part === 'string') {
          return part;
        } else if (part && part.value) {
          return part.value;
        } else if (part && part._id) {
          return part._id;
        }
        return '';
      }).filter(id => id !== '');
    }

    // Create date with correct timezone handling - only if date is provided
    let serviceDateValue = null;
    let scheduledTimeValue = null;
    
    if (jobData.serviceDateTime.date) {
      // Create date at noon to avoid timezone issues
      const [year, month, day] = jobData.serviceDateTime.date.split('-');
      serviceDateValue = new Date(year, month - 1, day, 12, 0, 0);
      // Only set time if date is set
      scheduledTimeValue = jobData.serviceDateTime.time || null;
    }

    // Check for time slot overlap if date, time and duration are provided
    if (serviceDateValue && scheduledTimeValue && jobData.estimatedDuration) {
      const overlapCheck = checkJobOverlap(
        {
          serviceDate: serviceDateValue,
          scheduledTime: scheduledTimeValue,
          estimatedDuration: parseFloat(jobData.estimatedDuration),
          assignedTo: jobData.assignedTo
        },
        jobs || [],
        isEdit ? jobData._id : null
      );

      if (overlapCheck.hasOverlap) {
        const overlappingJob = overlapCheck.overlappingJobs[0];
        const endTime = addHoursToTime(scheduledTimeValue, parseFloat(jobData.estimatedDuration));
        const overlappingEndTime = addHoursToTime(overlappingJob.scheduledTime, overlappingJob.estimatedDuration);
        
        toast.warning(
          `⚠️ Preklapanje vremena!\n\nOvaj posao (${formatTimeSlot(scheduledTimeValue, endTime)}) se preklapa sa:\n"${overlappingJob.clientName}" (${formatTimeSlot(overlappingJob.scheduledTime, overlappingEndTime)})\n\nDa li želite da nastavite?`,
          {
            autoClose: 8000,
            position: "top-center"
          }
        );
        
        // Ask for confirmation
        const confirmed = window.confirm(
          `⚠️ UPOZORENJE: Preklapanje vremena!\n\n` +
          `Novi posao: ${scheduledTimeValue} - ${endTime} (${jobData.estimatedDuration}h)\n` +
          `Postojeći posao: "${overlappingJob.clientName}" ${overlappingJob.scheduledTime} - ${overlappingEndTime} (${overlappingJob.estimatedDuration}h)\n\n` +
          `Da li želite da nastavite sa kreiranjem posla?`
        );
        
        if (!confirmed) {
          return; // Cancel job creation
        }
      }
    }

    // Automatically create/check client if phone number is provided
    if (!isEdit && jobData.clientPhone && jobData.clientPhone !== 'No phone') {
      const clientDataToSave = {
        name: jobData.clientName || 'Unknown Client',
        phone: jobData.clientPhone,
        email: jobData.clientEmail && jobData.clientEmail !== 'no-email@example.com' ? jobData.clientEmail : undefined,
        address: jobData.clientAddress && typeof jobData.clientAddress === 'object' ? {
          street: jobData.clientAddress.street || '',
          number: jobData.clientAddress.number || '',
          floor: jobData.clientAddress.floor || undefined,
          apartment: jobData.clientAddress.apartment || undefined,
          isHouse: false,
          countryCode: countryCode
        } : undefined,
        description: undefined // Don't copy job description to client
      };

      // Wait for client creation/check before proceeding
      await handleClientCreation(clientDataToSave);
    }

    const transformedData = {
      clientName: jobData.clientName || 'Unknown Client',
      clientPhone: jobData.clientPhone || 'No phone',
      clientEmail: jobData.clientEmail || 'no-email@example.com',
      clientAddress: addressString,
      serviceLocation: jobData.serviceLocation || 'OnSite',
      deviceType: jobData.deviceType || 'Unknown Device',
      deviceBrand: jobData.deviceBrand || 'Unknown Brand',
      deviceModel: jobData.deviceModel || 'Unknown Model',
      deviceSerialNumber: jobData.deviceSerialNumber || 'N/A',
      issueDescription: jobData.issueDescription || 'No description provided',
      priority: jobData.priority ? jobData.priority.charAt(0).toUpperCase() + jobData.priority.slice(1).toLowerCase() : 'Medium',
      warranty: jobData.warranty || false,
      estimatedDuration: jobData.estimatedDuration ? parseFloat(jobData.estimatedDuration) : undefined,
      assignedTo: jobData.assignedTo || 'Unassigned',
      usedSpareParts: sparePartsArray,
      status: 'In Pending', // Use valid enum value
      businessType: businessType,
      creator: user?.result?.email || user?.result?.name || 'Unknown'
    };
    
    // Only add serviceDate and scheduledTime if they exist
    if (serviceDateValue) {
      transformedData.serviceDate = serviceDateValue;
    }
    if (scheduledTimeValue) {
      transformedData.scheduledTime = scheduledTimeValue;
    }

    console.log('🎯 JobForm: Transformed data:', transformedData);
    console.log('🎯 JobForm: Status being sent:', transformedData.status);

    try {
      if (isEdit) {
        dispatch(updateJob({ id: jobData._id, jobData: transformedData }));
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
  
  const renderAddressFields = () => null;
  const renderDateTimeField = () => null;
  const renderServiceLocation = () => null;

  // Update sections structure
  const sections = {
    clientInfo: {
      title: 'Client Info',
      fields: [
        'clientName',
        'clientPhone',
        'serviceLocation',
        'clientAddress',
        'clientEmail'
      ]
    },
    deviceInfo: {
      title: 'Device Info',
      fields: [
        'deviceType', 
        'deviceBrand', 
        'deviceModel', 
        'deviceSerialNumber'
      ]
    },
    serviceInfo: {
      title: 'Service Info',
      fields: [
        'serviceType',
        'serviceDateTime',
        'isEmergency',
        'preferredTimeSlot',
        'assignedTo',
        'usedSpareParts'
      ]
    },
    additionalInfo: {
      title: 'Additional Info',
      fields: [
        'issueDescription',
        'priority',
        'warranty',
        'estimatedDuration'
      ]
    }
  };

  // Update input class for smaller size
  const inputClass = "mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5 px-2";

  // Determine if a field should be visible for current config/state
  const isFieldVisible = (fieldName) => {
    if (!formConfig[fieldName]) return false;
    if (fieldName === 'clientAddress' && jobData.serviceLocation !== 'OnSite') return false;
    return true;
  };

  const renderField = (fieldName, fieldConfig) => {
    if (!fieldConfig) {
      return null;
    }
    if (fieldName === 'clientPhone') {
      return (
        <div key={fieldName} className="relative suggestions-container mb-3">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {fieldConfig.label}
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

    return (
      <div key={fieldName}>
        <FieldRenderer
          fieldName={fieldName}
          fieldConfig={fieldConfig}
          value={fieldName === 'clientAddress' ? jobData.clientAddress : jobData[fieldName]}
          onChange={(name, val) => {
            if (name === 'clientAddress' || name === 'serviceDateTime') return handleInputChange(name, val);
            if (name === 'usedSpareParts') return handleSparePartsChange(val);
            setJobData(prev => ({ ...prev, [name]: val }));
          }}
          inputClass={inputClass}
          workerOptions={workerOptions}
          sparePartsOptions={sparePartsOptions}
          serviceLocation={jobData.serviceLocation}
          onQuickAddSparePart={handleQuickAddSparePart}
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
          <JobFormSection
            key={sectionKey}
            title={section.title}
            fields={section.fields}
            formConfig={formConfig}
            jobData={jobData}
            inputClass={inputClass}
            workerOptions={workerOptions}
            sparePartsOptions={sparePartsOptions}
            serviceLocation={jobData.serviceLocation}
            onChange={(name, val) => {
              if (name === 'clientAddress' || name === 'serviceDateTime') return handleInputChange(name, val);
              if (name === 'usedSpareParts') return handleSparePartsChange(val);
              setJobData(prev => ({ ...prev, [name]: val }));
            }}
            onQuickAddSparePart={handleQuickAddSparePart}
          />
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
          type="button"
          onClick={() => {
            setJobData(prev => ({ ...prev, status: 'draft' }));
            handleSubmit({ preventDefault: () => {} });
          }}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500"
          disabled={jobState.loading}
        >
          {jobState.loading ? 'Saving...' : 'Save as Draft'}
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