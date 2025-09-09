import { getBusinessType } from './businessTypeUtils';

/**
 * Mapiranje tipova biznisa na dashboard komponente
 * Određuje koje komponente treba prikazati za svaki tip biznisa
 */
const dashboardComponentMap = {
  "Home Appliance Technician": [
    "appointments",
    "clientAddresses",
    "spareParts",
    "warranty"
  ],
  "Electrician": [
    "appointments",
    "clientAddresses",
    "spareParts",
    "warranty"
  ],
  "Plumber": [
    "appointments",
    "clientAddresses",
    "spareParts",
    "warranty"
  ],
  "Auto Mechanic": [
    "appointments", 
    "clientAddresses", 
    "vehicles",
    "models",
    "spareParts", 
    "warranty"
  ],
  "Elevator Technician": [
    "appointments",
    "clientAddresses",
    "recurringServices",
    "warranty"
  ],
  "HVAC Technician": [
    "appointments",
    "clientAddresses",
    "recurringServices",
    "spareParts",
    "warranty"
  ],
  "Carpenter": [
    "appointments",
    "clientAddresses",
    "projects",
    "warranty"
  ],
  "Locksmith": [
    "appointments",
    "clientAddresses",
    "spareParts",
    "warranty"
  ],
  "Tile Installer": [
    "appointments",
    "clientAddresses",
    "projects",
    "warranty"
  ],
  "Painter": [
    "appointments",
    "clientAddresses",
    "projects",
    "warranty"
  ],
  "Facade Specialist": [
    "appointments",
    "clientAddresses",
    "projects"
  ],
  "IT Technician": [
    "appointments",
    "clientAddresses",
    "remoteSupport",
    "recurringServices"
  ],
  "Handyman": [
    "appointments",
    "clientAddresses",
    "warranty"
  ]
};

/**
 * Funkcija za dobijanje komponenti za određeni tip biznisa
 * @param {string} businessType Tip biznisa
 * @returns {Array} Lista komponenti
 */
export const getBusinessTypeComponents = (businessType) => {
  console.log("Getting components for business type:", businessType);
  
  // Ako tip biznisa nije prosleđen, pokušaj da ga dobiješ iz sessionStorage ili localStorage
  if (!businessType) {
    businessType = getBusinessType();
    console.log("Retrieved business type from utils:", businessType);
  }
  
  // Vrati komponente za taj tip biznisa ili osnovne komponente za nepoznati tip
  if (businessType && dashboardComponentMap[businessType]) {
    console.log("Found components for business type:", dashboardComponentMap[businessType]);
    return dashboardComponentMap[businessType];
  }
  
  console.warn("No components defined for business type:", businessType);
  // Osnovne komponente za sve tipove biznisa
  return ["appointments", "clientAddresses"];
};

/**
 * Konfiguracija funkcionalnosti za različite tipove biznisa
 */
const businessTypeFeatures = {
  "Home Appliance Technician": {
    hasInventory: true,
    hasWarranty: true,
    hasServiceRadius: true,
    hasOnSiteService: true
  },
  "Electrician": {
    hasInventory: true,
    hasWarranty: true,
    hasServiceRadius: true,
    hasOnSiteService: true
  },
  "Plumber": {
    hasInventory: true,
    hasWarranty: true,
    hasServiceRadius: true,
    hasOnSiteService: true
  },
  "Auto Mechanic": {
    hasInventory: true,
    hasWarranty: true,
    hasVehicles: true,
    hasModels: true,
    hasOnSiteService: false
  },
  "Elevator Technician": {
    hasWarranty: true,
    hasMaintenanceContracts: true,
    hasOnSiteService: true
  },
  "HVAC Technician": {
    hasInventory: true,
    hasWarranty: true,
    hasMaintenanceContracts: true,
    hasOnSiteService: true
  },
  "Carpenter": {
    hasWarranty: true,
    hasProjects: true,
    hasOnSiteService: true
  },
  "Locksmith": {
    hasInventory: true,
    hasWarranty: true,
    hasServiceRadius: true,
    hasOnSiteService: true
  },
  "Tile Installer": {
    hasWarranty: true,
    hasProjects: true,
    hasOnSiteService: true
  },
  "Painter": {
    hasWarranty: true,
    hasProjects: true,
    hasOnSiteService: true
  },
  "Facade Specialist": {
    hasProjects: true,
    hasOnSiteService: true
  },
  "IT Technician": {
    hasRemoteSupport: true,
    hasMaintenanceContracts: true,
    hasOnSiteService: true
  },
  "Handyman": {
    hasWarranty: true,
    hasServiceRadius: true,
    hasOnSiteService: true
  }
};

/**
 * Funkcija za proveru da li tip biznisa ima određenu funkcionalnost
 * @param {string} businessType Tip biznisa
 * @param {string} feature Naziv funkcionalnosti
 * @returns {boolean} Da li tip biznisa ima funkcionalnost
 */
export const businessTypeHasFeature = (businessType, feature) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  if (businessType && businessTypeFeatures[businessType]) {
    return !!businessTypeFeatures[businessType][feature];
  }
  
  return false;
}; 