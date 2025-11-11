import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
import { extractJobDataFromMessage, fetchDeviceCategories, fetchServicesList } from '../../redux/api';

// Phone prefixes mapping
const COUNTRY_PREFIXES = {
  rs: '381', // Serbia
  ba: '387', // Bosnia and Herzegovina
  hr: '385', // Croatia
  me: '382', // Montenegro
  mk: '389', // North Macedonia
  si: '386'  // Slovenia
};

const SECTION_KEYS = ['clientInfo', 'deviceInfo', 'serviceInfo', 'additionalInfo'];

const extractFieldValue = (jobData, fieldName) => {
  if (!jobData) return undefined;
  if (fieldName === 'clientAddress') {
    return jobData.clientAddress;
  }
  if (fieldName === 'serviceDateTime') {
    return jobData.serviceDateTime;
  }
  if (fieldName === 'deviceType') {
    return jobData.deviceCategoryId || jobData.deviceTypeId || jobData.deviceType || '';
  }
  if (fieldName === 'serviceId') {
    return jobData.serviceId || '';
  }
  return jobData[fieldName];
};

const hasTruthyContent = (value) => {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'object') {
    return Object.values(value).some((val) => hasTruthyContent(val));
  }
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  if (typeof value === 'number') {
    return !Number.isNaN(value);
  }
  if (typeof value === 'boolean') {
    return value === true;
  }
  return Boolean(value);
};

const fieldHasContent = (fieldName, value) => {
  if (fieldName === 'serviceDateTime') {
    if (!value || typeof value !== 'object') return false;
    return Boolean(value.date);
  }
  if (fieldName === 'serviceLocation') {
    if (!value) return false;
    return value !== 'OnSite';
  }
  if (fieldName === 'clientAddress') {
    if (!value) return false;
    if (typeof value === 'string') {
      return value.trim() !== '';
    }
    if (typeof value === 'object') {
      return Object.values(value).some((val) => hasTruthyContent(val));
    }
    return false;
  }
  return hasTruthyContent(value);
};

const JobForm = ({ isEdit = false, jobData: initialJobData, onClose, className = '', isModal = false, selectedSlot = null }) => {
  const { t } = useTranslation();
  const businessType = getBusinessType();
  const baseFormConfig = useMemo(() => getJobFormConfig(businessType), [businessType]);
  
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
    deviceCategoryId: '',
    deviceCategoryName: '',
    deviceTypeId: '',
    serviceId: '',
    serviceName: '',
    servicePrice: '',
    serviceDurationMinutes: '',
    status: 'draft', // Default status for new jobs
    serviceLocation: 'OnSite',
    ...transformedInitialData,
  });
  const [workerOptions, setWorkerOptions] = useState([]);
  const [sparePartsOptions, setSparePartsOptions] = useState([]);
  const [deviceCategories, setDeviceCategories] = useState([]);
  const [serviceTemplates, setServiceTemplates] = useState([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);
  const hierarchyErrorShownRef = useRef(false);
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
  const [showAiExtraction, setShowAiExtraction] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [openSections, setOpenSections] = useState(() =>
    SECTION_KEYS.reduce((acc, key, index) => {
      acc[key] = index === 0;
      return acc;
    }, {})
  );
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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSection = useCallback((key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);
  
  // Add title display
  const formTitle = isEdit ? t('jobs.editJob') : 
    (initialJobData?.displayDateTime ? 
      `${t('jobs.newJob')} - ${initialJobData.displayDateTime}` : 
      t('jobs.newJob'));
  
  // Format clients for react-select
  const formattedClientOptions = clients ? clients.map(client => ({
    value: client._id,
    label: `${client.name} - ${client.phone}${client.email ? ` (${client.email})` : ''}`,
    ...client
  })) : [];

  const normalizeId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if (value.id) return value.id.toString();
      if (value._id) return value._id.toString();
    }
    return value.toString();
  };

  const deviceTypeOptions = useMemo(() => {
    return deviceCategories.map((category) => {
      const categoryId = normalizeId(category.id || category._id);
      return {
        value: categoryId,
        label: category.name,
        categoryId,
        categoryName: category.name,
      };
    }).filter((option) => Boolean(option.value));
  }, [deviceCategories]);

  const selectedDeviceCategory = useMemo(() => {
    const categoryIdCandidate = jobData.deviceCategoryId || jobData.deviceTypeId;
    if (!categoryIdCandidate) return null;
    const normalized = normalizeId(categoryIdCandidate);
    return deviceCategories.find((category) => normalizeId(category.id || category._id) === normalized) || null;
  }, [deviceCategories, jobData.deviceCategoryId, jobData.deviceTypeId]);

  const servicesForSelectedCategory = useMemo(() => {
    if (!serviceTemplates || serviceTemplates.length === 0) return [];
    const selectedCategoryId = normalizeId(jobData.deviceCategoryId || jobData.deviceTypeId);
    if (!selectedCategoryId) return serviceTemplates;
    return serviceTemplates.filter(
      (service) => normalizeId(service.deviceCategoryId || service.deviceCategory?.id) === selectedCategoryId
    );
  }, [serviceTemplates, jobData.deviceCategoryId, jobData.deviceTypeId]);

  const serviceOptions = useMemo(() => {
    return servicesForSelectedCategory.map((service) => ({
      value: normalizeId(service.id || service._id),
      label: service.name,
      deviceCategoryId: normalizeId(service.deviceCategoryId || service.deviceCategory?.id),
      price: service.price ?? '',
      durationMinutes: service.durationMinutes ?? null,
      name: service.name,
    }));
  }, [servicesForSelectedCategory]);

  const resolvedFormConfig = useMemo(() => {
    const config = { ...baseFormConfig };
    if (config.deviceType) {
      config.deviceType = {
        ...config.deviceType,
        required: false,
        options: deviceTypeOptions,
      };
    }
    if (config.serviceId) {
      config.serviceId = {
        ...config.serviceId,
        required: false,
        options: serviceOptions,
      };
    }
    return config;
  }, [baseFormConfig, deviceTypeOptions, serviceOptions]);

  const selectedService = useMemo(() => {
    if (!jobData.serviceId) return null;
    return serviceTemplates.find((service) => normalizeId(service.id || service._id) === normalizeId(jobData.serviceId)) || null;
  }, [serviceTemplates, jobData.serviceId]);

  const sections = useMemo(() => ({
    clientInfo: {
      title: t('jobs.clientInfo'),
      fields: ['clientName', 'clientPhone', 'serviceLocation', 'clientAddress', 'clientEmail']
    },
    deviceInfo: {
      title: t('jobs.deviceInfo'),
      fields: ['deviceType', 'serviceId', 'deviceBrand', 'deviceModel', 'deviceSerialNumber']
    },
    serviceInfo: {
      title: t('jobs.serviceInfo'),
      fields: ['serviceType', 'serviceDateTime', 'isEmergency', 'preferredTimeSlot', 'assignedTo', 'usedSpareParts']
    },
    additionalInfo: {
      title: t('jobs.additionalInfo'),
      fields: ['issueDescription', 'priority', 'warranty', 'estimatedDuration']
    }
  }), [t]);

  const sectionFieldNames = useMemo(
    () => SECTION_KEYS.flatMap((key) => sections[key]?.fields || []),
    [sections]
  );
  
  useEffect(() => {
    if (jobData.deviceCategoryId || !jobData.deviceType || deviceCategories.length === 0) {
      return;
    }
    const match = deviceCategories.find(
      (category) => category.name?.toLowerCase() === jobData.deviceType.toLowerCase()
    );
    if (!match) return;
    const matchId = normalizeId(match.id || match._id);

    setJobData((prev) => {
      if (normalizeId(prev.deviceCategoryId) === matchId) {
        return prev;
      }
      return {
        ...prev,
        deviceCategoryId: matchId,
        deviceCategoryName: match.name || prev.deviceCategoryName || '',
        deviceTypeId: matchId,
      };
    });
  }, [deviceCategories, jobData.deviceType, jobData.deviceCategoryId]);

  useEffect(() => {
    if (jobData.serviceId || !jobData.serviceName || serviceTemplates.length === 0) {
      return;
    }
    const match = serviceTemplates.find((service) => service.name?.toLowerCase() === jobData.serviceName.toLowerCase());
    if (!match) return;
    const matchId = normalizeId(match.id || match._id);
    setJobData((prev) => {
      if (normalizeId(prev.serviceId) === matchId) {
        return prev;
      }
      return {
        ...prev,
        serviceId: matchId,
        servicePrice: match.price ?? prev.servicePrice,
        deviceCategoryId: normalizeId(match.deviceCategoryId || match.deviceCategory?.id) || prev.deviceCategoryId,
        deviceCategoryName: match.deviceCategory?.name || prev.deviceCategoryName,
        deviceTypeId: normalizeId(match.deviceCategoryId || match.deviceCategory?.id) || prev.deviceTypeId,
      };
    });
  }, [serviceTemplates, jobData.serviceName, jobData.serviceId]);
  
  useEffect(() => {
    console.log('🎯 JobForm: useEffect triggered - fetching workers and clients');
    console.log('🎯 Current user from Redux:', user);
    console.log('🎯 Current localStorage profile:', localStorage.getItem('profile'));
    
    // Fetch workers and clients when component mounts
    dispatch(getWorkers());
    dispatch(fetchClientsAsync());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;
    const loadHierarchy = async () => {
      if (!user?.token) {
        return;
      }
      setHierarchyLoading(true);
      hierarchyErrorShownRef.current = false;
      try {
        const [categoriesResult, servicesResult] = await Promise.allSettled([
          fetchDeviceCategories(),
          fetchServicesList()
        ]);

        if (!isMounted) return;

        if (categoriesResult.status === 'fulfilled') {
          setDeviceCategories(Array.isArray(categoriesResult.value?.data) ? categoriesResult.value.data : []);
        } else {
          console.error('Greška pri učitavanju kategorija uređaja:', categoriesResult.reason);
          setDeviceCategories([]);
          if (!hierarchyErrorShownRef.current) {
            toast.error('Ne možemo da učitamo kategorije uređaja. Proveri vezu sa serverom.');
            hierarchyErrorShownRef.current = true;
          }
        }

        if (servicesResult.status === 'fulfilled') {
          setServiceTemplates(Array.isArray(servicesResult.value?.data) ? servicesResult.value.data : []);
        } else {
          console.error('Greška pri učitavanju usluga:', servicesResult.reason);
          setServiceTemplates([]);
          if (!hierarchyErrorShownRef.current) {
            const status = servicesResult.reason?.response?.status;
            const backendMessage = servicesResult.reason?.response?.data?.message;
            let message = 'Ne možemo da učitamo usluge. Proveri vezu sa serverom.';
            if (status === 401) {
              message = 'Sesija je istekla ili nemaš dozvolu za listu usluga.';
            } else if (status === 404) {
              message = 'Usluge još nisu podešene. Dodaj ih u sekciji "Usluge".';
            } else if (backendMessage) {
              message += ` (${backendMessage})`;
            }
            toast.error(message);
            hierarchyErrorShownRef.current = true;
          }
        }
      } catch (error) {
        console.error('Greška pri učitavanju liste usluga:', error);
        setDeviceCategories([]);
        setServiceTemplates([]);
        if (!hierarchyErrorShownRef.current) {
          const status = error?.response?.status;
          const backendMessage = error?.response?.data?.message;
          let message = 'Ne možemo da učitamo hijerarhiju usluga. Proveri da li je backend pokrenut.';
          if (status === 401) {
            message = 'Sesija je istekla ili nemaš dozvolu za hijerarhiju usluga.';
          } else if (status === 404) {
            message = 'Hijerarhija usluga još nije podešena. Dodaj kategorije i usluge u sekciji "Usluge".';
          } else if (backendMessage) {
            message += ` (${backendMessage})`;
          }
          toast.error(message);
          hierarchyErrorShownRef.current = true;
        }
      } finally {
        if (isMounted) {
          setHierarchyLoading(false);
        }
      }
    };

    loadHierarchy();

    return () => {
      isMounted = false;
    };
  }, [user?.token]);
  
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

  const handleDeviceTypeSelect = useCallback((categoryId) => {
    if (!categoryId) {
      setJobData(prev => ({
        ...prev,
        deviceCategoryId: '',
        deviceCategoryName: '',
        deviceTypeId: '',
        deviceType: '',
        serviceId: '',
        serviceName: '',
        servicePrice: '',
        serviceDurationMinutes: '',
      }));
      return;
    }

    const category = deviceCategories.find((item) => normalizeId(item.id || item._id) === categoryId);
    const label = category?.name || deviceTypeOptions.find(option => option.value === categoryId)?.categoryName || '';

    setJobData(prev => ({
      ...prev,
      deviceTypeId: categoryId,
      deviceType: label || prev.deviceType,
      deviceCategoryId: categoryId,
      deviceCategoryName: label || prev.deviceCategoryName,
      serviceId: '',
      serviceName: '',
      servicePrice: '',
      serviceDurationMinutes: '',
    }));
  }, [deviceCategories, deviceTypeOptions, normalizeId]);

  const handleServiceSelect = useCallback((serviceId) => {
    if (!serviceId) {
      setJobData(prev => ({
        ...prev,
        serviceId: '',
        serviceName: '',
        servicePrice: '',
        serviceDurationMinutes: null,
      }));
      return;
    }

    const serviceOption = serviceOptions.find(option => option.value === serviceId);
    const serviceEntity = serviceTemplates.find(service => normalizeId(service.id || service._id) === serviceId);
    const relatedCategoryId = serviceOption?.deviceCategoryId || normalizeId(serviceEntity?.deviceCategoryId || serviceEntity?.deviceCategory?.id);
    const relatedCategory = deviceCategories.find(category => normalizeId(category.id || category._id) === relatedCategoryId);

    setJobData(prev => ({
      ...prev,
      serviceId,
      serviceName: serviceEntity?.name || serviceOption?.label || prev.serviceName,
      servicePrice: serviceEntity?.price ?? serviceOption?.price ?? prev.servicePrice,
      deviceCategoryId: relatedCategoryId || prev.deviceCategoryId,
      deviceCategoryName: relatedCategory?.name || prev.deviceCategoryName,
      deviceTypeId: relatedCategoryId || prev.deviceTypeId,
      deviceType: relatedCategory?.name || prev.deviceType,
      serviceDurationMinutes: serviceEntity?.durationMinutes ?? serviceOption?.durationMinutes ?? prev.serviceDurationMinutes ?? null,
      estimatedDuration:
        serviceEntity?.durationMinutes !== undefined && serviceEntity?.durationMinutes !== null
          ? Number((serviceEntity.durationMinutes / 60).toFixed(2))
          : prev.estimatedDuration,
    }));
  }, [deviceCategories, serviceOptions, serviceTemplates, normalizeId]);
  
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
  
  const handleSparePartsChange = useCallback((selectedOptions) => {
    setJobData(prev => ({
      ...prev,
      usedSpareParts: selectedOptions,
    }));
  }, []);

  const handleFieldChange = useCallback(
    (field, value) => {
      if (field === 'clientAddress' || field === 'serviceDateTime') {
        handleInputChange(field, value);
        return;
      }
      if (field === 'usedSpareParts') {
        handleSparePartsChange(value);
        return;
      }
      if (field === 'deviceType') {
        handleDeviceTypeSelect(value);
        return;
      }
      if (field === 'serviceId') {
        handleServiceSelect(value);
        return;
      }
      handleInputChange(field, value);
    },
    [handleDeviceTypeSelect, handleInputChange, handleServiceSelect, handleSparePartsChange]
  );
  
  // Handle AI extraction from message
  const handleAiExtraction = async () => {
    if (!aiMessage.trim()) {
      toast.error('Molimo unesite poruku za ekstrakciju');
      return;
    }

    setAiLoading(true);
    try {
      const response = await extractJobDataFromMessage(aiMessage.trim());
      
      if (response.data && response.data.success && response.data.data) {
        const extractedData = response.data.data;
        
        // Process and populate form with extracted data
        const updatedJobData = {
          ...jobData,
          clientName: extractedData.clientName || jobData.clientName || '',
          clientPhone: extractedData.clientPhone || jobData.clientPhone || '',
          clientEmail: extractedData.clientEmail || jobData.clientEmail || '',
          deviceType: extractedData.deviceType || jobData.deviceType || '',
          deviceBrand: extractedData.deviceBrand || jobData.deviceBrand || '',
          deviceModel: extractedData.deviceModel || jobData.deviceModel || '',
          deviceSerialNumber: extractedData.deviceSerialNumber || jobData.deviceSerialNumber || '',
          issueDescription: extractedData.issueDescription || jobData.issueDescription || '',
          priority: extractedData.priority || jobData.priority || 'medium',
        };

        // Handle address
        if (extractedData.clientAddress) {
          // Try to parse address if it's a string
          if (typeof extractedData.clientAddress === 'string') {
            updatedJobData.clientAddress = {
              street: extractedData.clientAddress,
              number: '',
              floor: '',
              apartment: '',
            };
          } else {
            updatedJobData.clientAddress = {
              ...jobData.clientAddress,
              ...extractedData.clientAddress,
            };
          }
        }

        // Handle service date and time
        if (extractedData.serviceDate) {
          updatedJobData.serviceDateTime = {
            ...jobData.serviceDateTime,
            date: extractedData.serviceDate,
            time: extractedData.serviceTime || jobData.serviceDateTime.time || '09:00',
          };
        } else if (extractedData.serviceTime) {
          updatedJobData.serviceDateTime = {
            ...jobData.serviceDateTime,
            time: extractedData.serviceTime,
          };
        }

        // Update phone prefix if phone is provided
        if (extractedData.clientPhone && !extractedData.clientPhone.startsWith('+')) {
          const phoneWithoutPrefix = extractedData.clientPhone.replace(/^\+?[0-9]+/, '');
          updatedJobData.clientPhone = `+${phonePrefix}${phoneWithoutPrefix}`;
        }

        setJobData(updatedJobData);
        setShowAiExtraction(false);
        setAiMessage('');
        toast.success('Podaci su uspešno izvučeni i popunjeni u formu!');
      } else {
        toast.error('Nije moguće izvući podatke iz poruke. Molimo pokušajte ponovo.');
      }
    } catch (error) {
      console.error('Error extracting data from message:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Greška pri ekstrakciji podataka';
      toast.error(errorMessage);
    } finally {
      setAiLoading(false);
    }
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

    const hasUserInput = sectionFieldNames.some((fieldName) => {
      const value = extractFieldValue(jobData, fieldName);
      return fieldHasContent(fieldName, value);
    });

    if (!hasUserInput) {
      toast.error('Unesite makar jedan podatak pre čuvanja posla.');
      return;
    }

    const addressStringRaw =
      jobData.clientAddress && typeof jobData.clientAddress === 'object'
        ? `${jobData.clientAddress.street || ''} ${jobData.clientAddress.number || ''} ${jobData.clientAddress.floor || ''} ${jobData.clientAddress.apartment || ''}`
      : jobData.clientAddress || '';

    const addressString = addressStringRaw.replace(/\s+/g, ' ').trim();

    let sparePartsArray = [];
    if (Array.isArray(jobData.usedSpareParts)) {
      sparePartsArray = jobData.usedSpareParts
        .map((part) => {
        if (typeof part === 'string') {
          return part;
          }
          if (part && part.value) {
          return part.value;
          }
          if (part && part._id) {
          return part._id;
        }
        return '';
        })
        .filter((id) => id !== '');
    }

    let serviceDateValue = null;
    let scheduledTimeValue = null;
    
    if (jobData.serviceDateTime?.date) {
      const [year, month, day] = jobData.serviceDateTime.date.split('-');
      serviceDateValue = new Date(year, month - 1, day, 12, 0, 0);
      scheduledTimeValue = jobData.serviceDateTime.time || null;
    }

    if (serviceDateValue && scheduledTimeValue && jobData.estimatedDuration) {
      const overlapCheck = checkJobOverlap(
        {
          serviceDate: serviceDateValue,
          scheduledTime: scheduledTimeValue,
          estimatedDuration: parseFloat(jobData.estimatedDuration),
          assignedTo: jobData.assignedTo,
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
            position: 'top-center',
          }
        );
        
        const confirmed = window.confirm(
          `⚠️ UPOZORENJE: Preklapanje vremena!\n\n` +
          `Novi posao: ${scheduledTimeValue} - ${endTime} (${jobData.estimatedDuration}h)\n` +
          `Postojeći posao: "${overlappingJob.clientName}" ${overlappingJob.scheduledTime} - ${overlappingEndTime} (${overlappingJob.estimatedDuration}h)\n\n` +
          `Da li želite da nastavite sa kreiranjem posla?`
        );
        
        if (!confirmed) {
          return;
        }
      }
    }

    const trimmedClientName = jobData.clientName ? jobData.clientName.trim() : '';
    const trimmedClientPhone = jobData.clientPhone ? jobData.clientPhone.toString().trim() : '';
    const trimmedClientEmail = jobData.clientEmail ? jobData.clientEmail.trim() : '';

    if (!isEdit && trimmedClientPhone) {
      const clientDataToSave = {
        name: trimmedClientName || trimmedClientPhone,
        phone: trimmedClientPhone,
        email: trimmedClientEmail || undefined,
        address:
          jobData.clientAddress && typeof jobData.clientAddress === 'object'
            ? {
          street: jobData.clientAddress.street || '',
          number: jobData.clientAddress.number || '',
          floor: jobData.clientAddress.floor || undefined,
          apartment: jobData.clientAddress.apartment || undefined,
          isHouse: false,
                countryCode: countryCode,
              }
            : undefined,
        description: undefined,
      };

      await handleClientCreation(clientDataToSave);
    }

    const effectiveBusinessType = jobData.businessType || businessType;
    const payload = {};

    if (isEdit) {
      if (jobData.status) {
        payload.status = jobData.status;
      }
      if (effectiveBusinessType) {
        payload.businessType = effectiveBusinessType;
      }
      if (jobData.creator) {
        payload.creator = jobData.creator;
      }
    } else {
      payload.status = 'In Pending';
      if (effectiveBusinessType) {
        payload.businessType = effectiveBusinessType;
      }
      payload.creator = user?.result?.email || user?.result?.name || 'Unknown';
    }

    if (jobData.serviceLocation) {
      payload.serviceLocation = jobData.serviceLocation;
    }

    if (trimmedClientName) {
      payload.clientName = trimmedClientName;
    }

    if (trimmedClientPhone) {
      payload.clientPhone = trimmedClientPhone;
    }

    if (trimmedClientEmail) {
      payload.clientEmail = trimmedClientEmail;
    }

    if (addressString) {
      payload.clientAddress = addressString;
    }

    if (jobData.deviceCategoryId) {
      payload.deviceCategoryId = jobData.deviceCategoryId;
    }

    if (jobData.deviceCategoryName && jobData.deviceCategoryName.trim()) {
      payload.deviceCategoryName = jobData.deviceCategoryName.trim();
    }

    if (jobData.deviceTypeId) {
      payload.deviceTypeId = jobData.deviceTypeId;
    }

    const resolvedDeviceType = typeof jobData.deviceType === 'string' ? jobData.deviceType.trim() : '';
    if (resolvedDeviceType) {
      payload.deviceType = resolvedDeviceType;
    }

    if (jobData.deviceBrand && jobData.deviceBrand.trim()) {
      payload.deviceBrand = jobData.deviceBrand.trim();
    }

    if (jobData.deviceModel && jobData.deviceModel.trim()) {
      payload.deviceModel = jobData.deviceModel.trim();
    }

    if (jobData.deviceSerialNumber && jobData.deviceSerialNumber.trim()) {
      payload.deviceSerialNumber = jobData.deviceSerialNumber.trim();
    }

    if (jobData.serviceId) {
      payload.serviceId = jobData.serviceId;
    }

    if (jobData.serviceName && jobData.serviceName.trim()) {
      payload.serviceName = jobData.serviceName.trim();
    }

    if (jobData.servicePrice !== '' && jobData.servicePrice !== null && jobData.servicePrice !== undefined) {
      const numericPrice = Number(jobData.servicePrice);
      if (Number.isFinite(numericPrice)) {
        payload.servicePrice = numericPrice;
      }
    }

    if (
      jobData.serviceDurationMinutes !== undefined &&
      jobData.serviceDurationMinutes !== null &&
      jobData.serviceDurationMinutes !== ''
    ) {
      const durationMinutes = Number(jobData.serviceDurationMinutes);
      if (Number.isFinite(durationMinutes)) {
        payload.serviceDurationMinutes = durationMinutes;
      }
    }

    if (jobData.issueDescription && jobData.issueDescription.trim()) {
      payload.issueDescription = jobData.issueDescription.trim();
    }

    if (jobData.priority && jobData.priority.trim()) {
      const normalizedPriority =
        jobData.priority.charAt(0).toUpperCase() + jobData.priority.slice(1).toLowerCase();
      payload.priority = normalizedPriority;
    }

    if (jobData.warranty === true) {
      payload.warranty = true;
    }

    if (
      jobData.estimatedDuration !== undefined &&
      jobData.estimatedDuration !== null &&
      jobData.estimatedDuration !== ''
    ) {
      const estimatedDurationNumeric = parseFloat(jobData.estimatedDuration);
      if (Number.isFinite(estimatedDurationNumeric)) {
        payload.estimatedDuration = estimatedDurationNumeric;
      }
    }

    if (jobData.assignedTo && jobData.assignedTo !== 'Unassigned') {
      payload.assignedTo = jobData.assignedTo;
    }

    if (sparePartsArray.length > 0) {
      payload.usedSpareParts = sparePartsArray;
    }

    if (serviceDateValue) {
      payload.serviceDate = serviceDateValue;
    }

    if (scheduledTimeValue) {
      payload.scheduledTime = scheduledTimeValue;
    }

    console.log('🎯 JobForm: Transformed data:', payload);
    console.log('🎯 JobForm: Mode:', isEdit ? 'edit' : 'create');
    try {
      if (isEdit) {
        if (!jobData?._id) {
          console.error('❌ Cannot update job: jobData._id is undefined');
          toast.error('Greška: ID posla nije definisan');
          return;
        }
        await dispatch(updateJob({ id: jobData._id, jobData: payload })).unwrap();
        toast.success('Job updated successfully');
      } else {
        await dispatch(createJob({ jobData: payload })).unwrap();
        toast.success('Job created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error submitting job:', error);
      const errorMessage =
        error?.message ||
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.error ||
        (typeof error === 'string' ? error : null) ||
        'Failed to save job. Please try again.';
      toast.error(errorMessage);
    }
  };
  // Update input class for smaller size
  const inputClass = "mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-1.5 px-2";

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      {isModal && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-200">{formTitle}</h2>
          {!isEdit && initialJobData?.displayDateTime && (
            <p className="text-sm text-gray-400 mt-1">
              {t('jobs.fillJobDetails')}
            </p>
          )}
        </div>
      )}

      {/* AI Extraction Section */}
      {!isEdit && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <button
            type="button"
            onClick={() => setShowAiExtraction(!showAiExtraction)}
            className="flex items-center justify-between w-full text-left focus:outline-none"
          >
            <div className="flex items-center">
              <svg
                className={`w-5 h-5 mr-2 text-blue-400 transition-transform ${showAiExtraction ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-200">
                🤖 AI Ekstrakcija iz SMS/Viber poruke
              </span>
            </div>
            <span className="text-xs text-gray-400">
              Nalepite poruku i automatski izvuci podatke
            </span>
          </button>

          {showAiExtraction && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nalepite tekst SMS ili Viber poruke:
                </label>
                <textarea
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Primer: Zdravo, ja sam Marko Petrović, telefon 0651234567. Imam problem sa Samsung Galaxy S21, ne pali se ekran. Možete li doći sutra u 14h na adresu Bulevar kralja Aleksandra 15?"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={aiLoading}
                />
              </div>
              <button
                type="button"
                onClick={handleAiExtraction}
                disabled={aiLoading || !aiMessage.trim()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesiranje...
                  </>
                ) : (
                  'Procesiraj poruku i popuni formu'
                )}
              </button>
              <p className="text-xs text-gray-400">
                AI će automatski izvući: ime, telefon, adresu, uređaj, problem i ostale podatke iz poruke.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Form sections */}
      {isMobile ? (
        <div className="space-y-3">
          {SECTION_KEYS.map((sectionKey) => {
            const section = sections[sectionKey];
            if (!section) return null;
            return (
          <JobFormSection
            key={sectionKey}
            title={section.title}
            fields={section.fields}
            formConfig={resolvedFormConfig}
            jobData={jobData}
            inputClass={inputClass}
            workerOptions={workerOptions}
            sparePartsOptions={sparePartsOptions}
            serviceLocation={jobData.serviceLocation}
            onChange={handleFieldChange}
            onQuickAddSparePart={handleQuickAddSparePart}
                variant="accordion"
                isOpen={openSections[sectionKey]}
                onToggle={() => toggleSection(sectionKey)}
          />
            );
          })}
      </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {SECTION_KEYS.map((sectionKey) => {
            const section = sections[sectionKey];
            if (!section) return null;
            return (
              <JobFormSection
                key={sectionKey}
                title={section.title}
                fields={section.fields}
                formConfig={resolvedFormConfig}
                jobData={jobData}
                inputClass={inputClass}
                workerOptions={workerOptions}
                sparePartsOptions={sparePartsOptions}
                serviceLocation={jobData.serviceLocation}
                onChange={handleFieldChange}
                onQuickAddSparePart={handleQuickAddSparePart}
              />
            );
          })}
        </div>
      )}
      
      {/* Form buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
        >
          {t('common.cancel')}
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
          {jobState.loading ? t('common.saving') : t('jobs.saveAsDraft')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          disabled={jobState.loading}
        >
          {jobState.loading ? t('common.saving') : (isEdit ? t('jobs.updateJob') : t('jobs.createJob'))}
        </button>
      </div>
    </form>
  );
};

export default JobForm; 