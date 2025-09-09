/**
 * Utility functions for handling business type specific functionality
 */

// Get the business type from session storage or profile settings
export const getBusinessType = () => {
  try {
    // First try to get from session storage (for active session)
    const sessionType = sessionStorage.getItem('businessType');
    if (sessionType) return sessionType;
    
    // Then try to get from local storage (for logged in users)
    const profile = localStorage.getItem('profile');
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        
        // Check different paths where business type might be stored
        if (parsedProfile && parsedProfile.result && parsedProfile.result.businessType) {
          return parsedProfile.result.businessType;
        } else if (parsedProfile && parsedProfile.businessType) {
          return parsedProfile.businessType;
        } else if (parsedProfile && parsedProfile.user && parsedProfile.user.businessType) {
          return parsedProfile.user.businessType;
        }
      } catch (parseError) {
        console.error('Error parsing profile from localStorage:', parseError);
      }
    }
    
    // Business type should be set in the Admin/Profile section
    return null;
  } catch (error) {
    console.error('Error retrieving business type:', error);
    return null;
  }
};

// Check if the business is of a specific type
export const isBusinessType = (type) => {
  const businessType = getBusinessType();
  // If no business type is found, return false instead of comparing with null
  return businessType ? businessType === type : false;
};

// Check if the business is one of multiple types
export const isOneOfBusinessTypes = (types) => {
  const businessType = getBusinessType();
  // If no business type is found, return false instead of checking includes
  return businessType ? types.includes(businessType) : false;
};

// Get business-specific configuration
export const getBusinessConfig = () => {
  // Default configuration - all specific fields are disabled
  const config = {
    needsServiceAddress: true, // Keep only basic address
    needsGarageAddress: false,
    needsSpecializations: false,
    needsServiceableApplianceTypes: false,
    needsServiceRadius: false,
    needsWarranty: false,
    needsInventory: false,
    needsMaintenanceContracts: false
  };
  
  return config;
};

// Get field names specific to a business type
export const getBusinessSpecificFields = () => {
  const config = getBusinessConfig();
  const fields = [];
  
  if (config.needsGarageAddress) fields.push('garageAddress');
  if (config.needsSpecializations) fields.push('specializations');
  if (config.needsServiceableApplianceTypes) fields.push('serviceableApplianceTypes');
  if (config.needsServiceRadius) fields.push('serviceRadius');
  if (config.needsWarranty) fields.push('defaultWarrantyDuration');
  if (config.needsInventory) fields.push('hasInventory');
  if (config.needsMaintenanceContracts) fields.push('offersMaintenanceContracts');
  
  return fields;
};

// Get specialization options for business type
export const getSpecializationOptions = (businessType) => {
  const options = {
    "Auto Mechanic": [
      "Engine Repair", 
      "Transmission", 
      "Brake Systems", 
      "Electrical Systems", 
      "Suspension", 
      "Air Conditioning"
    ],
    "HVAC Technician": [
      "Residential", 
      "Commercial", 
      "Industrial", 
      "Heating Systems", 
      "Cooling Systems", 
      "Ventilation"
    ],
    "Elevator Technician": [
      "Residential Elevators", 
      "Commercial Elevators", 
      "Freight Elevators", 
      "Maintenance", 
      "Installation", 
      "Repair"
    ]
  };
  
  return options[businessType] || [];
};

// Get appliance types for Home Appliance Technicians
export const getApplianceTypes = () => {
  return [
    "Refrigerators", 
    "Freezers", 
    "Washing Machines", 
    "Dryers", 
    "Dishwashers", 
    "Ovens", 
    "Stoves", 
    "Microwaves", 
    "Water Heaters", 
    "Air Conditioners"
  ];
}; 