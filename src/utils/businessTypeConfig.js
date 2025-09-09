/**
 * Konfiguraciona datoteka koja definiše različite funkcionalnosti i prikaze
 * za različite tipove poslovanja (businessType)
 */

import { getBusinessType } from './businessTypeUtils';

const businessTypeConfig = {
  "Home Appliance Technician": {
    features: {
      hasInventory: true,
      hasWarranty: true,
      hasServiceRadius: true,
      hasOnSiteService: true
    },
    displayName: "Serviser kućnih aparata",
    description: "Tehničar specijalizovan za popravku i održavanje kućnih aparata.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "spareParts", 
      "warranty", 
      "models"
    ]
  },
  
  "Electrician": {
    features: {
      hasInventory: true,
      hasWarranty: true,
      hasServiceRadius: true,
      hasOnSiteService: true
    },
    displayName: "Električar",
    description: "Stručnjak koji instalira, održava i popravlja električne sisteme.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "spareParts", 
      "warranty"
    ]
  },
  
  "Plumber": {
    features: {
      hasInventory: true,
      hasWarranty: true,
      hasServiceRadius: true,
      hasOnSiteService: true
    },
    displayName: "Vodoinstalater",
    description: "Stručnjak koji instalira i popravlja vodovodne instalacije i uređaje.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "spareParts", 
      "warranty"
    ]
  },
  
  "Auto Mechanic": {
    features: {
      hasInventory: true,
      hasWarranty: true,
      hasVehicles: true,
      hasModels: true,
      hasOnSiteService: false
    },
    displayName: "Auto-mehaničar",
    description: "Stručnjak za dijagnozu, popravku i održavanje automobila.",
    dashboardComponents: [
      "appointments", 
      "vehicles", 
      "spareParts", 
      "warranty"
    ]
  },
  
  "Elevator Technician": {
    features: {
      hasWarranty: true,
      hasMaintenanceContracts: true
    },
    displayName: "Serviser liftova",
    description: "Stručnjak za instalaciju, održavanje i popravku liftova.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "recurringServices",
      "warranty"
    ]
  },
  
  "HVAC Technician": {
    features: {
      hasInventory: true,
      hasWarranty: true,
      hasMaintenanceContracts: true
    },
    displayName: "HVAC tehničar",
    description: "Stručnjak za sisteme grejanja, ventilacije i klimatizacije.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "recurringServices",
      "spareParts",
      "warranty"
    ]
  },
  
  "Carpenter": {
    features: {
      hasWarranty: true,
      hasProjects: true
    },
    displayName: "Stolar",
    description: "Zanatlija koji radi sa drvetom za konstrukciju i izradu nameštaja.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "projects", 
      "warranty"
    ]
  },
  
  "Locksmith": {
    features: {
      hasInventory: true,
      hasWarranty: true,
      hasServiceRadius: true
    },
    displayName: "Bravar",
    description: "Stručnjak za brave, ključeve i sigurnosne sisteme.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "spareParts", 
      "warranty"
    ]
  },
  
  "Tile Installer": {
    features: {
      hasWarranty: true,
      hasProjects: true
    },
    displayName: "Keramičar",
    description: "Stručnjak za postavljanje keramičkih, porcelanskih i kamenih pločica.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "projects", 
      "warranty"
    ]
  },
  
  "Painter": {
    features: {
      hasWarranty: true,
      hasProjects: true
    },
    displayName: "Moler",
    description: "Stručnjak koji nanosi boje i premaze na površine.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "projects", 
      "warranty"
    ]
  },
  
  "Facade Specialist": {
    features: {
      hasProjects: true
    },
    displayName: "Fasader",
    description: "Stručnjak za instalaciju i renoviranje fasada zgrada.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "projects"
    ]
  },
  
  "IT Technician": {
    features: {
      hasRemoteSupport: true,
      hasMaintenanceContracts: true
    },
    displayName: "IT tehničar",
    description: "Stručnjak za instalaciju, održavanje i popravku računara i mreža.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "remoteSupport",
      "recurringServices"
    ]
  },
  
  "Handyman": {
    features: {
      hasWarranty: true,
      hasServiceRadius: true
    },
    displayName: "Majstor",
    description: "Svestrani stručnjak koji može da obavlja razne popravke i održavanje.",
    dashboardComponents: [
      "appointments", 
      "clientAddresses", 
      "warranty"
    ]
  }
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
  if (businessType && businessTypeConfig[businessType]) {
    const components = businessTypeConfig[businessType].dashboardComponents;
    console.log("Found components for business type:", components);
    return components;
  }
  
  console.warn("No components defined for business type:", businessType);
  // Osnovne komponente za sve tipove biznisa
  return ["appointments", "clientAddresses"];
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
  
  if (businessType && businessTypeConfig[businessType]) {
    return !!businessTypeConfig[businessType].features[feature];
  }
  
  return false;
};

/**
 * Funkcija za dobijanje display imena za tip biznisa
 * @param {string} businessType Tip biznisa
 * @returns {string} Display ime za tip biznisa
 */
export const getBusinessTypeDisplayName = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  return businessTypeConfig[businessType]?.displayName || businessType;
};

export default businessTypeConfig; 