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
        required: true,
      },
      clientPhone: {
        label: 'Phone Number',
        type: 'tel',
        required: true,
      },
      clientAddress: {
        label: 'Address',
        type: 'address',
        required: true,
      },
      serviceDateTime: {
        label: 'Service Date & Time',
        type: 'datetime',
        required: true,
      },
    },
    // Section 1: Client Information
    clientName: {
      required: true,
      label: 'Name',
      placeholder: 'Enter client name',
      type: 'text'
    },
    clientPhone: {
      required: true,
      label: 'Phone Number',
      placeholder: 'Enter phone number',
      type: 'tel'
    },
    clientAddress: {
      required: true,
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
      options: [
        { value: 'refrigerator', label: 'Refrigerator' },
        { value: 'freezer', label: 'Freezer' },
        { value: 'washingMachine', label: 'Washing Machine' },
        { value: 'dryer', label: 'Dryer' },
        { value: 'dishwasher', label: 'Dishwasher' },
        { value: 'oven', label: 'Oven' },
        { value: 'stove', label: 'Stove' },
        { value: 'microwave', label: 'Microwave' },
        { value: 'waterHeater', label: 'Water Heater' },
        { value: 'airConditioner', label: 'Air Conditioner' }
      ]
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
      required: true,
      label: 'Issue Description',
      placeholder: 'Describe the issue',
      type: 'textarea',
      rows: 3
    },

    // Section 4: Additional Details
    serviceDate: {
      required: true,
      label: 'Service Date',
      type: 'datetime-local',
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
    }
  };
  
  switch (businessType) {
    case 'Home Appliance Technician':
      return {
        ...baseConfig,
        deviceType: {
          required: true,
          label: 'Appliance Type',
          placeholder: 'Select appliance type',
          type: 'select',
          options: [
            { value: 'refrigerator', label: 'Refrigerator' },
            { value: 'freezer', label: 'Freezer' },
            { value: 'washingMachine', label: 'Washing Machine' },
            { value: 'dryer', label: 'Dryer' },
            { value: 'dishwasher', label: 'Dishwasher' },
            { value: 'oven', label: 'Oven' },
            { value: 'stove', label: 'Stove' },
            { value: 'microwave', label: 'Microwave' },
            { value: 'waterHeater', label: 'Water Heater' },
            { value: 'airConditioner', label: 'Air Conditioner' }
          ]
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
      const plumberConfig = {
        // Client Information Section
        clientName: {
          ...baseConfig.clientName,
          required: false
        },
        clientPhone: {
          ...baseConfig.clientPhone,
          required: false,
          pattern: '[0-9]*',
          maxLength: 9,
          minLength: 6,
          usePrefix: true
        },
        clientEmail: {
          ...baseConfig.clientEmail,
          required: false
        },
        clientAddress: {
          ...baseConfig.clientAddress,
          required: false
        },

        // Work Type
        workType: {
          required: false,
          label: 'Vrsta posla',
          placeholder: 'Izaberite vrstu posla',
          type: 'select',
          options: [
            { value: 'newBathroom', label: 'Novo kupatilo' },
            { value: 'bathroomRenovation', label: 'Renoviranje kupatila' },
            { value: 'kitchen', label: 'Kuhinja' },
            { value: 'unclogging', label: 'Odgušenje' },
            { value: 'pool', label: 'Bazeni' },
            { value: 'tiles', label: 'Pločice' },
            { value: 'sewage', label: 'Kanalizacija' },
            { value: 'waterHeater', label: 'Bojler' },
            { value: 'pipes', label: 'Vodovodne instalacije' },
            { value: 'faucets', label: 'Slavine i armature' },
            { value: 'toilet', label: 'WC šolja' },
            { value: 'shower', label: 'Tuš kabina' },
            { value: 'emergency', label: 'Hitne intervencije' },
            { value: 'maintenance', label: 'Održavanje' },
            { value: 'inspection', label: 'Pregled instalacija' },
            { value: 'other', label: 'Ostalo' }
          ]
        },

        // Additional Details
        workDetails: {
          required: false,
          label: 'Detalji posla',
          placeholder: 'Izaberite detalje posla',
          type: 'multi-select',
          options: [
            { value: 'ceramicTiles', label: 'Keramičke pločice' },
            { value: 'porcelainTiles', label: 'Porcelanske pločice' },
            { value: 'marbleTiles', label: 'Mermerne pločice' },
            { value: 'waterproofing', label: 'Hidroizolacija' },
            { value: 'drainInstallation', label: 'Ugradnja odvoda' },
            { value: 'pipeReplacement', label: 'Zamena cevi' },
            { value: 'toiletInstallation', label: 'Montaža WC šolje' },
            { value: 'sinkInstallation', label: 'Montaža lavaboa' },
            { value: 'showerInstallation', label: 'Montaža tuš kabine' },
            { value: 'bathtubInstallation', label: 'Montaža kade' },
            { value: 'faucetInstallation', label: 'Montaža slavina' }
          ]
        },

        // Materials Needed
        materialsNeeded: {
          required: false,
          label: 'Potreban materijal',
          placeholder: 'Izaberite potreban materijal',
          type: 'multi-select',
          options: [
            { value: 'tiles', label: 'Pločice' },
            { value: 'grout', label: 'Fug masa' },
            { value: 'sealant', label: 'Silikon' },
            { value: 'pipes', label: 'Cevi' },
            { value: 'fittings', label: 'Fitinzi' },
            { value: 'toilet', label: 'WC šolja' },
            { value: 'sink', label: 'Lavabo' },
            { value: 'faucet', label: 'Slavina' },
            { value: 'shower', label: 'Tuš kabina' },
            { value: 'bathtub', label: 'Kada' },
            { value: 'waterproofing', label: 'Hidroizolacija' },
            { value: 'tools', label: 'Alat' }
          ]
        },

        // Description
        description: {
          required: false,
          label: 'Opis posla',
          placeholder: 'Unesite opis posla',
          type: 'textarea',
          rows: 3
        },

        // Area Size
        areaSize: {
          required: false,
          label: 'Površina (m²)',
          placeholder: 'Unesite površinu u kvadratnim metrima',
          type: 'text'
        },

        // Water Shutoff Required
        requiresWaterShutoff: {
          required: false,
          label: 'Potrebno isključenje vode',
          type: 'select',
          options: [
            { value: 'yes', label: 'Da' },
            { value: 'no', label: 'Ne' },
            { value: 'unknown', label: 'Nije poznato' }
          ]
        },

        // Access Information
        accessInfo: {
          required: false,
          label: 'Informacije o pristupu',
          placeholder: 'Unesite informacije o pristupu objektu',
          type: 'textarea',
          rows: 2
        },

        // Scheduling
        serviceDate: {
          required: false,
          label: 'Datum izvođenja',
          type: 'datetime-local',
          placeholder: 'Izaberite datum i vreme'
        },

        estimatedDuration: {
          required: false,
          label: 'Procenjeno trajanje',
          type: 'select',
          options: [
            { value: '1', label: '1 dan' },
            { value: '2', label: '2 dana' },
            { value: '3', label: '3 dana' },
            { value: '4', label: '4 dana' },
            { value: '5', label: '5 dana' },
            { value: '7', label: '1 nedelja' },
            { value: '14', label: '2 nedelje' },
            { value: 'more', label: 'Više od 2 nedelje' }
          ]
        },

        // Priority
        priority: {
          required: false,
          label: 'Prioritet',
          placeholder: 'Izaberite prioritet',
          type: 'select',
          options: [
            { value: 'low', label: 'Nizak' },
            { value: 'medium', label: 'Srednji' },
            { value: 'high', label: 'Visok' },
            { value: 'urgent', label: 'Hitno' }
          ]
        },

        // Assignment
        assignedTo: {
          required: false,
          label: 'Dodeljeno',
          placeholder: 'Izaberite vodoinstalatera',
          type: 'select',
          options: []
        }
      };
      return plumberConfig;
      
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
        ...baseConfig,
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
        }
      };
      
    case 'IT Technician':
      return {
        ...baseConfig,
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
        }
      };
      
    // Dodati ostale tipove biznisa po potrebi
      
    default:
      return {
        ...baseConfig,
        deviceType: {
          required: true,
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
    deviceType: '',
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
        serviceLocation: 'InWorkshop', // Default na radionicu
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