/**
 * Konfiguraciona datoteka koja definiše koje sekcije treba da budu dostupne
 * za različite tipove poslovanja (businessType)
 */

import { getBusinessType } from './businessTypeUtils';

/**
 * Konfiguracija sekcija po tipu biznisa
 * Definiše koje sekcije su dostupne za svaki tip biznisa
 */
const sectionConfig = {
  "Home Appliance Technician": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Services", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Models", "Issued", "Supplies", "Spare Parts", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Repairs", "Fixed Price", "Subscriptions", "Parts", "Transport"],
    profileViews: ["Info", "Notes", "Address", "Devices", "Calls", "Support", "Theme", "Logout"]
  },
  
  "Electrician": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Services", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Spare Parts", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Repairs", "Fixed Price", "Subscriptions", "Parts", "Transport"],
    profileViews: ["Info", "Notes", "Address", "Installations", "Calls", "Support", "Theme", "Logout"]
  },
  
  "Plumber": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Services", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Repairs", "Fixed Price", "Subscriptions", "Parts", "Transport"],
    profileViews: ["Info", "Notes", "Address", "Installations", "Calls", "Support", "Theme", "Logout"]
  },
  
  "Auto Mechanic": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Services", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Repairs", "Service", "Parts", "Transport"],
    profileViews: ["Info", "Notes", "Vehicles", "History", "Calls", "Support", "Theme", "Logout"]
  },
  
  "Elevator Technician": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Services", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Maintenance", "Repairs", "Service Contracts", "Parts"],
    profileViews: ["Info", "Notes", "Buildings", "Elevators", "Calls", "Support", "Theme", "Logout"]
  },
  
  "HVAC Technician": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Services", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Maintenance", "Repairs", "Installation", "Service Contracts", "Parts"],
    profileViews: ["Info", "Notes", "Address", "Systems", "Calls", "Support", "Theme", "Logout"]
  },
  
  "Carpenter": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Projects", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Custom Work", "Fixed Price", "Repairs", "Materials"],
    profileViews: ["Info", "Notes", "Address", "Projects", "Calls", "Support", "Theme", "Logout"]
  },
  
  "Locksmith": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Services", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Emergency", "Standard", "Installation", "Parts"],
    profileViews: ["Info", "Notes", "Address", "Systems", "Calls", "Support", "Theme", "Logout"]
  },
  
  "Tile Installer": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Projects", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Installation", "Repairs", "Materials", "Transport"],
    profileViews: ["Info", "Notes", "Address", "Projects", "Calls", "Support", "Theme", "Logout"]
  },
  
  "Painter": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Projects", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Interior", "Exterior", "Fixed Price", "Materials"],
    profileViews: ["Info", "Notes", "Address", "Projects", "Calls", "Support", "Theme", "Logout"]
  },
  
  "Facade Specialist": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Projects", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Renovation", "Installation", "Fixed Price", "Materials"],
    profileViews: ["Info", "Notes", "Address", "Buildings", "Projects", "Support", "Theme", "Logout"]
  },
  
  "IT Technician": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Remote", "Services", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Support", "Service Contracts", "Hourly", "Parts"],
    profileViews: ["Info", "Notes", "Address", "Devices", "Networks", "Support", "Theme", "Logout"]
  },
  
  "Handyman": {
    sections: {
      action: true,
      company: true,
      package: true,
      profile: true
    },
    actionViews: ["Jobs", "Status", "Live", "Services", "Workers", "Clients", "Archive"],
    companyViews: ["Storage", "Issued", "Supplies", "Vehicles", "Partners", "Cash Bills", "Analytics"],
    packageViews: ["Hourly", "Fixed Price", "Materials", "Transport"],
    profileViews: ["Info", "Notes", "Address", "Projects", "Calls", "Support", "Theme", "Logout"]
  }
};

/**
 * Funkcija za dobijanje dostupnih sekcija za određeni tip biznisa
 * @param {string} businessType Tip biznisa
 * @returns {Object} Dostupne sekcije
 */
export const getAvailableSections = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  if (businessType && sectionConfig[businessType]) {
    return sectionConfig[businessType].sections;
  }
  
  // Osnovne sekcije za sve tipove biznisa ako konfiguracija ne postoji
  return {
    action: true,
    company: true,
    package: true,
    profile: true
  };
};

/**
 * Funkcija za dobijanje view-ova u action sekciji za određeni tip biznisa
 * @param {string} businessType Tip biznisa
 * @returns {Array} Lista view-ova
 */
export const getActionViews = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  if (businessType && sectionConfig[businessType]) {
    return sectionConfig[businessType].actionViews;
  }
  
  // Osnovni view-ovi za sve tipove biznisa ako konfiguracija ne postoji
  return ["Jobs", "Status", "Live", "Services", "Workers", "Archive"];
};

/**
 * Funkcija za dobijanje view-ova u company sekciji za određeni tip biznisa
 * @param {string} businessType Tip biznisa
 * @returns {Array} Lista view-ova
 */
export const getCompanyViews = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  if (businessType && sectionConfig[businessType]) {
    return sectionConfig[businessType].companyViews;
  }
  
  // Osnovni view-ovi za sve tipove biznisa ako konfiguracija ne postoji
  return ["Storage", "Issued", "Supplies", "Spare Parts", "Vehicles", "Partners", "Cash Bills", "Analytics"];
};

/**
 * Funkcija za dobijanje view-ova u package sekciji za određeni tip biznisa
 * @param {string} businessType Tip biznisa
 * @returns {Array} Lista view-ova
 */
export const getPackageViews = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  if (businessType && sectionConfig[businessType]) {
    return sectionConfig[businessType].packageViews;
  }
  
  // Osnovni view-ovi za sve tipove biznisa ako konfiguracija ne postoji
  return ["Repairs", "Fixed Price", "Subscriptions", "Parts", "Transport"];
};

/**
 * Funkcija za dobijanje view-ova u profile sekciji za određeni tip biznisa
 * @param {string} businessType Tip biznisa
 * @returns {Array} Lista view-ova
 */
export const getProfileViews = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  if (businessType && sectionConfig[businessType]) {
    return sectionConfig[businessType].profileViews;
  }
  
  // Default profile views ako konfiguracija ne postoji
  return ["Info", "Notes", "Address", "Calls", "Support", "Theme", "Logout"];
};

export default sectionConfig; 