/**
 * Konfiguraciona datoteka koja definira polja i opcije formi
 * prema različitim tipovima poslovanja (businessType)
 */

import { getBusinessType } from './businessTypeUtils';

const baseInputClass = "w-full border border-gray-600 rounded px-2 py-1.5 text-xs text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow h-8";

/**
 * Vraća konfiguraciju polja za job formu prema tipu biznisa
 * @param {string} businessType Tip biznisa
 * @returns {Object} Konfiguracija forme
 */
export const getJobFormConfig = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  const baseConfig = {
    clientInfo: {
      clientName: {
        label: 'Client Name',
        type: 'text',
        required: false,
      },
      clientPhone: {
        label: 'Phone Number',
        type: 'tel',
        required: false,
      },
      clientAddress: {
        label: 'Address',
        type: 'address',
        required: false,
      },
      serviceDateTime: {
        label: 'Service Date & Time',
        type: 'datetime',
        required: false,
      },
    },
    // Section 1: Client Information
    clientName: {
      required: false,
      label: 'Name',
      placeholder: 'Enter client name',
      type: 'text'
    },
    clientPhone: {
      required: false,
      label: 'Phone Number',
      placeholder: 'Enter phone number',
      type: 'tel'
    },
    clientAddress: {
      required: false,
      label: 'Street',
      placeholder: 'Enter street name',
      type: 'text'
    },
    addressNumber: {
      required: false,
      label: 'Number',
      placeholder: 'Enter street number',
      type: 'text'
    },
    floor: {
      required: false,
      label: 'Floor',
      placeholder: 'Enter floor number',
      type: 'text'
    },
    apartmentNumber: {
      required: false,
      label: 'Apartment',
      placeholder: 'Enter apartment number',
      type: 'text'
    },
    clientEmail: {
      required: false,
      label: 'Email',
      placeholder: 'Enter email address',
      type: 'email'
    },

    // Section 2: Device Information
    deviceType: {
      required: false,
      label: 'Device Type',
      placeholder: 'Select device type',
      type: 'select',
      options: []
    },
    serviceId: {
      required: false,
      label: 'Service',
      placeholder: 'Select service',
      type: 'select',
      options: []
    },
    deviceBrand: {
      required: false,
      label: 'Brand',
      placeholder: 'Enter device brand',
      type: 'text'
    },
    deviceModel: {
      required: false,
      label: 'Model',
      placeholder: 'Enter device model',
      type: 'text'
    },
    deviceSerialNumber: {
      required: false,
      label: 'Serial Number',
      placeholder: 'Enter serial number',
      type: 'text'
    },

    // Section 3: Service Details
    issueDescription: {
      required: false,
      label: 'Issue Description',
      placeholder: 'Describe the issue',
      type: 'textarea',
      rows: 4,
      className: 'text-xs'
    },

    // Service location toggle
    serviceLocation: {
      required: false,
      label: 'Service Location',
      placeholder: 'Select location',
      type: 'select',
      options: [
        { value: 'OnSite', label: 'On site address' },
        { value: 'InWorkshop', label: 'Service workshop' }
      ]
    },

    // Section 4: Additional Details
    serviceDate: {
      required: false,
      label: 'Service Date',
      type: 'datetime-local',
      placeholder: 'Select service date and time'
    },
    serviceDateTime: {
      required: false,
      label: 'Service Date & Time',
      type: 'datetime',
      placeholder: 'Select service date and time'
    },
    assignedTo: {
      required: false,
      label: 'Assigned To',
      placeholder: 'Select worker',
      type: 'select',
      options: []
    },
    usedSpareParts: {
      required: false,
      label: 'Used Spare Parts',
      placeholder: 'Select spare parts',
      type: 'multi-select',
      options: []
    },
    priority: {
      required: false,
      label: 'Priority',
      placeholder: 'Select priority',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ]
    },
    warranty: {
      required: false,
      label: 'Warranty End Date',
      type: 'date',
      placeholder: 'Select warranty end date'
    },
    estimatedDuration: {
      required: false,
      label: 'Estimated Duration',
      placeholder: 'Select estimated repair time',
      type: 'select',
      options: [
        { value: '0.5', label: '0.5h (30 min)' },
        { value: '1', label: '1h' },
        { value: '1.5', label: '1.5h' },
        { value: '2', label: '2h' },
        { value: '2.5', label: '2.5h' },
        { value: '3', label: '3h' },
        { value: '3.5', label: '3.5h' },
        { value: '4', label: '4h' },
        { value: '4.5', label: '4.5h' },
        { value: '5', label: '5h' },
        { value: '5.5', label: '5.5h' },
        { value: '6', label: '6h' },
        { value: '6.5', label: '6.5h' },
        { value: '7', label: '7h' },
        { value: '7.5', label: '7.5h' },
        { value: '8', label: '8h' }
      ]
    }
  };
  
  switch (businessType) {
    case 'Home Appliance Technician':
      return {
        ...baseConfig,
        deviceType: {
          ...baseConfig.deviceType,
          required: true,
          label: 'Appliance Type',
          placeholder: 'Select appliance type'
        },
        serviceId: {
          ...baseConfig.serviceId,
          label: 'Service',
          placeholder: 'Select service'
        }
      };
      
    case 'Electrician':
      const electricianConfig = {
        // Client Information Section
        clientName: {
          ...baseConfig.clientName,
          type: 'text'
        },
        clientPhone: {
          ...baseConfig.clientPhone,
          type: 'tel'
        },
        clientEmail: {
          ...baseConfig.clientEmail,
          type: 'email'
        },
        clientAddress: {
          ...baseConfig.clientAddress,
          type: 'text'
        },

        // Service Type
        serviceType: {
          required: true,
          label: 'Service Type',
          placeholder: 'Select service type',
          type: 'select',
          options: [
            { value: 'electricalPanel', label: 'Electrical Panel' },
            { value: 'wiring', label: 'Wiring' },
            { value: 'lighting', label: 'Lighting' },
            { value: 'outlets', label: 'Outlets' },
            { value: 'circuitBreaker', label: 'Circuit Breaker' },
            { value: 'generator', label: 'Generator' },
            { value: 'installation', label: 'Installation' },
            { value: 'inspection', label: 'Inspection' },
            { value: 'troubleshooting', label: 'Troubleshooting' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'upgrade', label: 'Electrical Upgrade' },
            { value: 'emergency', label: 'Emergency Service' },
            { value: 'other', label: 'Other' }
          ]
        },

        // Installation Details
        installationType: {
          required: false,
          label: 'Installation Type',
          placeholder: 'Select installation type',
          type: 'select',
          options: [
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
            { value: 'industrial', label: 'Industrial' }
          ]
        },

        voltageType: {
          required: false,
          label: 'Voltage Type',
          placeholder: 'Select voltage type',
          type: 'select',
          options: [
            { value: '110v', label: '110V' },
            { value: '220v', label: '220V' },
            { value: '380v', label: '380V' },
            { value: 'other', label: 'Other' }
          ]
        },

        // Materials Section
        requiredMaterials: {
          required: true,
          label: 'Required Materials',
          placeholder: 'Select required materials',
          type: 'multi-select',
          options: [
            { value: 'cables', label: 'Electrical Cables' },
            { value: 'switches', label: 'Switches' },
            { value: 'outlets', label: 'Power Outlets' },
            { value: 'circuitBreakers', label: 'Circuit Breakers' },
            { value: 'conduits', label: 'Conduits' },
            { value: 'junctionBoxes', label: 'Junction Boxes' },
            { value: 'lightFixtures', label: 'Light Fixtures' },
            { value: 'wireNuts', label: 'Wire Nuts' },
            { value: 'electricalTape', label: 'Electrical Tape' },
            { value: 'groundingWire', label: 'Grounding Wire' },
            { value: 'insulators', label: 'Insulators' },
            { value: 'transformers', label: 'Transformers' },
            { value: 'panelBoards', label: 'Panel Boards' },
            { value: 'gfci', label: 'GFCI Outlets' },
            { value: 'afci', label: 'AFCI Breakers' },
            { value: 'dimmerSwitches', label: 'Dimmer Switches' },
            { value: 'timers', label: 'Timers' },
            { value: 'sensors', label: 'Sensors' },
            { value: 'other', label: 'Other' }
          ]
        },

        // Safety Requirements
        safetyRequirements: {
          required: true,
          label: 'Safety Requirements',
          placeholder: 'Select safety requirements',
          type: 'multi-select',
          options: [
            { value: 'permitRequired', label: 'Electrical Permit Required' },
            { value: 'inspectionRequired', label: 'Safety Inspection Required' },
            { value: 'powerShutoff', label: 'Power Shutoff Required' },
            { value: 'lockoutTagout', label: 'Lockout/Tagout Required' },
            { value: 'ppe', label: 'PPE Required' },
            { value: 'confinedSpace', label: 'Confined Space Entry' },
            { value: 'heightWork', label: 'Height Work Required' }
          ]
        },

        // Technical Specifications
        specifications: {
          required: false,
          label: 'Technical Specifications',
          placeholder: 'Enter technical specifications',
          type: 'textarea',
          rows: 3
        },

        // Scheduling
        serviceDate: {
          ...baseConfig.serviceDate,
          type: 'datetime-local'
        },

        isEmergency: {
          required: false,
          label: 'Emergency',
          type: 'select',
          options: [
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' }
          ]
        },

        preferredTimeSlot: {
          required: false,
          label: 'Preferred Time',
          type: 'select',
          options: [
            { value: 'morning', label: 'Morning (08-12)' },
            { value: 'afternoon', label: 'Afternoon (12-16)' },
            { value: 'evening', label: 'Evening (16-20)' }
          ]
        },

        estimatedDuration: {
          required: false,
          label: 'Estimated Duration',
          placeholder: 'Select estimated duration',
          type: 'select',
          options: [
            { value: '1hour', label: '1 Hour' },
            { value: '2hours', label: '2 Hours' },
            { value: '4hours', label: '4 Hours' },
            { value: '6hours', label: '6 Hours' },
            { value: '8hours', label: '8 Hours' },
            { value: 'multiday', label: 'Multiple Days' }
          ]
        },

        // Assignment and Priority
        assignedTo: {
          ...baseConfig.assignedTo,
          type: 'select'
        },
        priority: {
          ...baseConfig.priority,
          type: 'select'
        },

        // Compliance
        codeCompliance: {
          required: true,
          label: 'Code Compliance',
          placeholder: 'Select applicable codes',
          type: 'multi-select',
          options: [
            { value: 'nec', label: 'National Electrical Code (NEC)' },
            { value: 'local', label: 'Local Electrical Code' },
            { value: 'building', label: 'Building Code' },
            { value: 'energy', label: 'Energy Code' },
            { value: 'other', label: 'Other Standards' }
          ]
        }
      };
      return electricianConfig;
      
    case 'Plumber':
      return {
        // Client Information Section
        clientName: { ...baseConfig.clientName, required: true },
        clientPhone: { ...baseConfig.clientPhone, required: true },
        clientEmail: baseConfig.clientEmail,
        clientAddress: { ...baseConfig.clientAddress, required: true },
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },

        // Device info (boiler/water heater/heating)
        deviceType: {
          required: false,
          label: 'Device Type',
          type: 'select',
          options: [
            { value: 'waterHeater', label: 'Water Heater (Bojler)' },
            { value: 'boiler', label: 'Boiler' },
            { value: 'heatingSystem', label: 'Heating System' },
            { value: 'pump', label: 'Pump' },
            { value: 'pipes', label: 'Pipes' },
            { value: 'other', label: 'Other' }
          ]
        },
        deviceBrand: baseConfig.deviceBrand,
        deviceModel: baseConfig.deviceModel,
        deviceSerialNumber: baseConfig.deviceSerialNumber,

        // Work type
        workType: {
          required: true,
          label: 'Vrsta posla',
          type: 'select',
          options: [
            { value: 'installation', label: 'Ugradnja' },
            { value: 'repair', label: 'Popravka' },
            { value: 'maintenance', label: 'Održavanje' },
            { value: 'unclogging', label: 'Odgušenje' },
            { value: 'inspection', label: 'Pregled' }
          ]
        },

        isEmergency: { required: false, label: 'Hitna intervencija', type: 'select', options: [
          { value: 'no', label: 'Ne' },
          { value: 'yes', label: 'Da' }
        ] },
        preferredTimeSlot: { required: false, label: 'Preferirani termin', type: 'select', options: [
          { value: 'morning', label: 'Jutro (08-12)' },
          { value: 'afternoon', label: 'Popodne (12-16)' },
          { value: 'evening', label: 'Veče (16-20)' }
        ] },
        issueDescription: { ...baseConfig.issueDescription, label: 'Opis posla' },
        assignedTo: baseConfig.assignedTo,
        priority: baseConfig.priority
      };
      
    case 'Auto Mechanic':
      return {
        // Client Information Section
        clientName: {
          ...baseConfig.clientName,
          required: false
        },
        clientPhone: {
          ...baseConfig.clientPhone,
          required: false
        },
        clientEmail: {
          ...baseConfig.clientEmail,
          required: false
        },
        clientAddress: {
          ...baseConfig.clientAddress,
          required: false
        },

        // Vehicle Basic Information
        vehicleType: {
          required: false,
          label: 'Vehicle Type',
          placeholder: 'Select vehicle type',
          type: 'select',
          options: [
            { value: 'car', label: 'Car' },
            { value: 'suv', label: 'SUV' },
            { value: 'truck', label: 'Truck' },
            { value: 'van', label: 'Van' },
            { value: 'motorcycle', label: 'Motorcycle' },
            { value: 'bus', label: 'Bus' },
            { value: 'commercial', label: 'Commercial Vehicle' },
            { value: 'other', label: 'Other' }
          ]
        },

        // Vehicle Make
        vehicleMake: {
          required: false,
          label: 'Make',
          placeholder: 'Select vehicle make',
          type: 'select',
          options: [
            { value: 'acura', label: 'Acura' },
            { value: 'alfa-romeo', label: 'Alfa Romeo' },
            { value: 'aston-martin', label: 'Aston Martin' },
            { value: 'audi', label: 'Audi' },
            { value: 'bentley', label: 'Bentley' },
            { value: 'bmw', label: 'BMW' },
            { value: 'buick', label: 'Buick' },
            { value: 'cadillac', label: 'Cadillac' },
            { value: 'chevrolet', label: 'Chevrolet' },
            { value: 'chrysler', label: 'Chrysler' },
            { value: 'citroen', label: 'Citroën' },
            { value: 'dodge', label: 'Dodge' },
            { value: 'ferrari', label: 'Ferrari' },
            { value: 'fiat', label: 'Fiat' },
            { value: 'ford', label: 'Ford' },
            { value: 'genesis', label: 'Genesis' },
            { value: 'gmc', label: 'GMC' },
            { value: 'honda', label: 'Honda' },
            { value: 'hyundai', label: 'Hyundai' },
            { value: 'infiniti', label: 'Infiniti' },
            { value: 'jaguar', label: 'Jaguar' },
            { value: 'jeep', label: 'Jeep' },
            { value: 'kia', label: 'Kia' },
            { value: 'lamborghini', label: 'Lamborghini' },
            { value: 'land-rover', label: 'Land Rover' },
            { value: 'lexus', label: 'Lexus' },
            { value: 'lincoln', label: 'Lincoln' },
            { value: 'lotus', label: 'Lotus' },
            { value: 'maserati', label: 'Maserati' },
            { value: 'mazda', label: 'Mazda' },
            { value: 'mercedes-benz', label: 'Mercedes-Benz' },
            { value: 'mini', label: 'MINI' },
            { value: 'mitsubishi', label: 'Mitsubishi' },
            { value: 'nissan', label: 'Nissan' },
            { value: 'opel', label: 'Opel' },
            { value: 'peugeot', label: 'Peugeot' },
            { value: 'porsche', label: 'Porsche' },
            { value: 'ram', label: 'RAM' },
            { value: 'renault', label: 'Renault' },
            { value: 'rolls-royce', label: 'Rolls-Royce' },
            { value: 'saab', label: 'Saab' },
            { value: 'subaru', label: 'Subaru' },
            { value: 'suzuki', label: 'Suzuki' },
            { value: 'tesla', label: 'Tesla' },
            { value: 'toyota', label: 'Toyota' },
            { value: 'volkswagen', label: 'Volkswagen' },
            { value: 'volvo', label: 'Volvo' },
            { value: 'other', label: 'Other' }
          ]
        },

        // Vehicle Model Year
        vehicleYear: {
          required: false,
          label: 'Year',
          placeholder: 'Enter vehicle year',
          type: 'text'
        },

        // Vehicle Model
        vehicleModel: {
          required: false,
          label: 'Model',
          placeholder: 'Enter vehicle model',
          type: 'text'
        },

        // Vehicle Identification
        vin: {
          required: false,
          label: 'VIN',
          placeholder: 'Enter vehicle VIN',
          type: 'text'
        },

        licensePlate: {
          required: false,
          label: 'License Plate',
          placeholder: 'Enter license plate number',
          type: 'text'
        },

        mileage: {
          required: false,
          label: 'Mileage',
          placeholder: 'Enter current mileage',
          type: 'text'
        },

        // Service Information
        serviceType: {
          required: false,
          label: 'Service Type',
          placeholder: 'Select service type',
          type: 'multi-select',
          options: [
            { value: 'regular-maintenance', label: 'Regular Maintenance' },
            { value: 'oil-change', label: 'Oil Change' },
            { value: 'brake-service', label: 'Brake Service' },
            { value: 'tire-service', label: 'Tire Service' },
            { value: 'engine-repair', label: 'Engine Repair' },
            { value: 'transmission', label: 'Transmission Service' },
            { value: 'electrical', label: 'Electrical System' },
            { value: 'ac-service', label: 'A/C Service' },
            { value: 'diagnostic', label: 'Diagnostic' },
            { value: 'bodywork', label: 'Body Work' },
            { value: 'painting', label: 'Painting' },
            { value: 'inspection', label: 'Inspection' },
            { value: 'other', label: 'Other' }
          ]
        },

        // Problem Description
        issueDescription: {
          required: false,
          label: 'Issue Description',
          placeholder: 'Describe the issue',
          type: 'textarea',
          rows: 3
        },

        // Additional Vehicle Information
        engineType: {
          required: false,
          label: 'Engine Type',
          placeholder: 'Select engine type',
          type: 'select',
          options: [
            { value: 'gasoline', label: 'Gasoline' },
            { value: 'diesel', label: 'Diesel' },
            { value: 'electric', label: 'Electric' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'other', label: 'Other' }
          ]
        },

        transmission: {
          required: false,
          label: 'Transmission',
          placeholder: 'Select transmission type',
          type: 'select',
          options: [
            { value: 'automatic', label: 'Automatic' },
            { value: 'manual', label: 'Manual' },
            { value: 'cvt', label: 'CVT' },
            { value: 'semi-automatic', label: 'Semi-Automatic' }
          ]
        },

        // Parts and Materials
        requiredParts: {
          required: false,
          label: 'Required Parts',
          placeholder: 'Select required parts',
          type: 'multi-select',
          options: [
            { value: 'oil-filter', label: 'Oil Filter' },
            { value: 'air-filter', label: 'Air Filter' },
            { value: 'fuel-filter', label: 'Fuel Filter' },
            { value: 'brake-pads', label: 'Brake Pads' },
            { value: 'brake-rotors', label: 'Brake Rotors' },
            { value: 'brake-fluid', label: 'Brake Fluid' },
            { value: 'tires', label: 'Tires' },
            { value: 'battery', label: 'Battery' },
            { value: 'spark-plugs', label: 'Spark Plugs' },
            { value: 'belts', label: 'Belts' },
            { value: 'hoses', label: 'Hoses' },
            { value: 'coolant', label: 'Coolant' },
            { value: 'transmission-fluid', label: 'Transmission Fluid' },
            { value: 'power-steering-fluid', label: 'Power Steering Fluid' },
            { value: 'windshield-wipers', label: 'Windshield Wipers' },
            { value: 'headlights', label: 'Headlights' },
            { value: 'tail-lights', label: 'Tail Lights' },
            { value: 'other', label: 'Other' }
          ]
        },

        // Service Status
        status: {
          required: false,
          label: 'Status',
          placeholder: 'Select status',
          type: 'select',
          options: [
            { value: 'received', label: 'Received' },
            { value: 'diagnosing', label: 'Diagnosing' },
            { value: 'waiting-for-parts', label: 'Waiting for Parts' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'testing', label: 'Testing' },
            { value: 'completed', label: 'Completed' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' }
          ]
        },

        // Scheduling
        serviceDate: {
          required: false,
          label: 'Service Date',
          type: 'datetime-local',
          placeholder: 'Select service date and time'
        },

        estimatedCompletionDate: {
          required: false,
          label: 'Estimated Completion',
          type: 'datetime-local',
          placeholder: 'Select estimated completion date'
        },

        // Assignment
        assignedTo: {
          required: false,
          label: 'Assigned To',
          placeholder: 'Select mechanic',
          type: 'select',
          options: []
        },

        // Priority
        priority: {
          required: false,
          label: 'Priority',
          placeholder: 'Select priority',
          type: 'select',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' }
          ]
        }
      };
      
    case 'HVAC Technician':
      return {
        // Client info
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: baseConfig.clientAddress,
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: {
          required: true,
          label: 'Service Date & Time',
          type: 'datetime'
        },
        // System type
        deviceType: {
          required: true,
          label: 'System Type',
          placeholder: 'Select system type',
          type: 'select',
          options: [
            { value: 'airConditioner', label: 'Air Conditioner' },
            { value: 'heater', label: 'Heater' },
            { value: 'furnace', label: 'Furnace' },
            { value: 'heatPump', label: 'Heat Pump' },
            { value: 'ductwork', label: 'Ductwork' },
            { value: 'ventilation', label: 'Ventilation' },
            { value: 'thermostat', label: 'Thermostat' },
            { value: 'other', label: 'Other' }
          ]
        },
        // Service details
        serviceType: {
          required: true,
          label: 'Service Type',
          type: 'select',
          options: [
            { value: 'installation', label: 'Installation' },
            { value: 'repair', label: 'Repair' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'inspection', label: 'Inspection' }
          ]
        },
        assignedTo: baseConfig.assignedTo,
        issueDescription: baseConfig.issueDescription,
        priority: baseConfig.priority
      };

    // Elevator Technician should strongly rely on on-site address and access
    case 'Elevator Technician':
      return {
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: { ...baseConfig.clientAddress, required: true },
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },
        isEmergency: { required: false, label: 'Emergency', type: 'select', options: [
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' }
        ] },
        preferredTimeSlot: { required: false, label: 'Preferred Time', type: 'select', options: [
          { value: 'morning', label: 'Morning (08-12)' },
          { value: 'afternoon', label: 'Afternoon (12-16)' },
          { value: 'evening', label: 'Evening (16-20)' }
        ] },
        buildingId: { required: false, label: 'Building ID/Name', type: 'text' },
        floor: { required: false, label: 'Floor', type: 'text' },
        accessInfo: { required: false, label: 'Access Info', type: 'textarea', rows: 2 },
        issueDescription: baseConfig.issueDescription,
        assignedTo: baseConfig.assignedTo,
        priority: baseConfig.priority
      };
      
    case 'IT Technician':
      return {
        // Client info
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: baseConfig.clientAddress,
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: {
          required: true,
          label: 'Service Date & Time',
          type: 'datetime'
        },
        // Device category (no brand/model/serial)
        deviceType: {
          required: true,
          label: 'Device Type',
          placeholder: 'Select device type',
          type: 'select',
          options: [
            { value: 'desktop', label: 'Desktop' },
            { value: 'laptop', label: 'Laptop' },
            { value: 'server', label: 'Server' },
            { value: 'network', label: 'Network' },
            { value: 'printer', label: 'Printer' },
            { value: 'software', label: 'Software' },
            { value: 'phoneTablet', label: 'Phone/Tablet' },
            { value: 'other', label: 'Other' }
          ]
        },
        serviceType: {
          required: true,
          label: 'Service Type',
          type: 'select',
          options: [
            { value: 'repair', label: 'Repair' },
            { value: 'installation', label: 'Installation' },
            { value: 'diagnostics', label: 'Diagnostics' },
            { value: 'software', label: 'Software' }
          ]
        },
        assignedTo: baseConfig.assignedTo,
        issueDescription: baseConfig.issueDescription,
        priority: baseConfig.priority
      };

    case 'Painter':
      return {
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: baseConfig.clientAddress,
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },
        serviceType: {
          required: true,
          label: 'Work Type',
          type: 'select',
          options: [
            { value: 'interior', label: 'Interior Painting' },
            { value: 'exterior', label: 'Exterior Painting' },
            { value: 'decorative', label: 'Decorative' },
            { value: 'commercial', label: 'Commercial' },
            { value: 'residential', label: 'Residential' },
            { value: 'other', label: 'Other' }
          ]
        },
        assignedTo: baseConfig.assignedTo,
        issueDescription: { ...baseConfig.issueDescription, label: 'Job Details' },
        priority: baseConfig.priority
      };

    case 'Tile Installer':
      return {
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: baseConfig.clientAddress,
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },
        serviceType: {
          required: true,
          label: 'Work Area',
          type: 'select',
          options: [
            { value: 'bathroom', label: 'Bathroom' },
            { value: 'kitchen', label: 'Kitchen' },
            { value: 'floor', label: 'Floor' },
            { value: 'outdoor', label: 'Outdoor' },
            { value: 'backsplash', label: 'Backsplash' },
            { value: 'other', label: 'Other' }
          ]
        },
        assignedTo: baseConfig.assignedTo,
        issueDescription: { ...baseConfig.issueDescription, label: 'Job Details' },
        priority: baseConfig.priority
      };

    case 'Carpenter':
      return {
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: baseConfig.clientAddress,
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },
        serviceType: {
          required: true,
          label: 'Project Type',
          type: 'select',
          options: [
            { value: 'customFurniture', label: 'Custom Furniture' },
            { value: 'kitchenRemodel', label: 'Kitchen Remodel' },
            { value: 'deckPatio', label: 'Deck/Patio' },
            { value: 'cabinets', label: 'Cabinets' },
            { value: 'flooring', label: 'Flooring' },
            { value: 'other', label: 'Other' }
          ]
        },
        assignedTo: baseConfig.assignedTo,
        issueDescription: { ...baseConfig.issueDescription, label: 'Project Details' },
        priority: baseConfig.priority
      };

    // Facade Specialist removed as separate type; painters can cover facade work

    case 'Handyman':
      return {
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: baseConfig.clientAddress,
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },
        serviceType: {
          required: true,
          label: 'Service Type',
          type: 'select',
          options: [
            { value: 'repair', label: 'Repair' },
            { value: 'installation', label: 'Installation' },
            { value: 'assembly', label: 'Furniture Assembly' },
            { value: 'maintenance', label: 'Maintenance' }
          ]
        },
        assignedTo: baseConfig.assignedTo,
        issueDescription: baseConfig.issueDescription,
        priority: baseConfig.priority
      };

    case 'House Cleaning':
      return {
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: { ...baseConfig.clientAddress, required: true },
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },
        serviceType: {
          required: true,
          label: 'Cleaning Type',
          type: 'select',
          options: [
            { value: 'standard', label: 'Standard Cleaning' },
            { value: 'deep', label: 'Deep Cleaning' },
            { value: 'moveInOut', label: 'Move-in/Move-out' },
            { value: 'postConstruction', label: 'Post-Construction' }
          ]
        },
        areaSize: { required: false, label: 'Area (m²)', type: 'text' },
        issueDescription: { ...baseConfig.issueDescription, label: 'Notes' },
        assignedTo: baseConfig.assignedTo,
        priority: baseConfig.priority
      };

    case 'Pest Control':
      return {
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: { ...baseConfig.clientAddress, required: true },
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },
        serviceType: {
          required: true,
          label: 'Infestation Type',
          type: 'select',
          options: [
            { value: 'insects', label: 'Insects' },
            { value: 'rodents', label: 'Rodents' },
            { value: 'termites', label: 'Termites' },
            { value: 'bedBugs', label: 'Bed Bugs' },
            { value: 'other', label: 'Other' }
          ]
        },
        isEmergency: { required: false, label: 'Emergency', type: 'select', options: [
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' }
        ] },
        preferredTimeSlot: { required: false, label: 'Preferred Time', type: 'select', options: [
          { value: 'morning', label: 'Morning (08-12)' },
          { value: 'afternoon', label: 'Afternoon (12-16)' },
          { value: 'evening', label: 'Evening (16-20)' }
        ] },
        accessInfo: { required: false, label: 'Access Info', type: 'textarea', rows: 2 },
        issueDescription: { ...baseConfig.issueDescription, label: 'Notes' },
        assignedTo: baseConfig.assignedTo,
        priority: baseConfig.priority
      };

    case 'Window Cleaning':
      return {
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: { ...baseConfig.clientAddress, required: true },
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },
        serviceType: {
          required: true,
          label: 'Service Type',
          type: 'select',
          options: [
            { value: 'residential', label: 'Residential' },
            { value: 'commercial', label: 'Commercial' },
            { value: 'highRise', label: 'High-rise' }
          ]
        },
        floorCount: { required: false, label: 'Floors', type: 'text' },
        issueDescription: { ...baseConfig.issueDescription, label: 'Notes' },
        assignedTo: baseConfig.assignedTo,
        priority: baseConfig.priority
      };
    case 'Carpet Cleaning':
      return {
        clientName: baseConfig.clientName,
        clientPhone: baseConfig.clientPhone,
        clientEmail: baseConfig.clientEmail,
        clientAddress: { ...baseConfig.clientAddress, required: true },
        serviceLocation: baseConfig.serviceLocation,
        serviceDateTime: { required: false, label: 'Service Date & Time (Optional)', type: 'datetime' },
        serviceType: {
          required: true,
          label: 'Cleaning Type',
          type: 'select',
          options: [
            { value: 'carpet', label: 'Carpet' },
            { value: 'rug', label: 'Rug' },
            { value: 'upholstery', label: 'Upholstery' },
            { value: 'mattress', label: 'Mattress' },
            { value: 'other', label: 'Other' }
          ]
        },
        areaSize: {
          required: false,
          label: 'Area (m²)',
          type: 'text',
          placeholder: 'Approximate area'
        },
        issueDescription: { ...baseConfig.issueDescription, label: 'Notes' },
        assignedTo: baseConfig.assignedTo,
        priority: baseConfig.priority
      };
      
    // Dodati ostale tipove biznisa po potrebi
      
    default:
      return {
        ...baseConfig,
        deviceType: {
          required: false,
          label: 'Service Type',
          placeholder: 'Select service type',
          type: 'select',
          options: [
            { value: 'repair', label: 'Repair' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'installation', label: 'Installation' },
            { value: 'inspection', label: 'Inspection' },
            { value: 'consultation', label: 'Consultation' },
            { value: 'other', label: 'Other' }
          ]
        }
      };
  }
};

/**
 * Koristi se za dobijanje početnog stanja job forme prema tipu biznisa
 * @param {string} businessType Tip biznisa
 * @returns {Object} Početno stanje forme
 */
export const getJobFormInitialState = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  const baseState = {
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    clientEmail: '',
    deviceCategoryId: '',
    deviceCategoryName: '',
    deviceTypeId: '',
    deviceType: '',
    serviceId: '',
    serviceName: '',
    servicePrice: '',
    issueDescription: '',
    priority: 'Medium',
    status: 'Received',
    serviceDate: '',
    assignedTo: ''
  };
  
  // Dodajemo posebne field-ove za određene tipove biznisa
  switch (businessType) {
    case 'Home Appliance Technician':
      return {
        ...baseState,
        serviceLocation: 'OnSite', // Default na teren
        apartmentNumber: '',
        floor: '',
        locationDescription: '',
        scheduledTime: '',
        deviceBrand: '',
        deviceModel: '',
        deviceSerialNumber: '',
        usedSpareParts: ''
      };
    
    case 'HVAC Technician':
    case 'Auto Mechanic':
    case 'IT Technician':
    case 'Elevator Technician':
      return {
        ...baseState,
        deviceBrand: '',
        deviceModel: '',
        deviceSerialNumber: ''
      };
      
    default:
      return baseState;
  }
};

export const getClientFormConfig = () => {
  return {
    fullName: {
      type: 'text',
      placeholder: 'Full Name',
      required: true,
      className: baseInputClass
    },
    phone: {
      type: 'tel',
      placeholder: 'Phone Number',
      required: true,
      className: baseInputClass,
      pattern: '[0-9]*',
      maxLength: 15,
      minLength: 6,
      showCountrySelect: true,
      countryOptions: [
        { value: 'af', label: 'Afghanistan', prefix: '+93' },
        { value: 'al', label: 'Albania', prefix: '+355' },
        { value: 'ba', label: 'Bosnia and Herzegovina', prefix: '+387' },
        { value: 'hr', label: 'Croatia', prefix: '+385' },
        { value: 'me', label: 'Montenegro', prefix: '+382' },
        { value: 'mk', label: 'Macedonia', prefix: '+389' },
        { value: 'rs', label: 'Serbia', prefix: '+381' },
        { value: 'si', label: 'Slovenia', prefix: '+386' },
        // Add more countries as needed
      ]
    },
    email: {
      type: 'email',
      placeholder: 'Email Address',
      required: true,
      className: baseInputClass
    },
    address: {
      type: 'text',
      placeholder: 'Address',
      required: true,
      className: baseInputClass
    },
    birthDate: {
      type: 'date',
      placeholder: 'Birth Date',
      required: false,
      className: baseInputClass
    }
  };
}; 