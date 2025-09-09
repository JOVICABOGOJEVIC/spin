/**
 * Utility functions for standardizing section titles across the application
 */

// Map of section keys to their standardized display titles
const SECTION_TITLES = {
  action: 'Actions',
  company: 'Company',
  package: 'Packages',
  profile: 'Profile',
  jobs: 'Jobs',
};

// Map of view keys to their standardized display titles
const VIEW_TITLES = {
  // Action views
  jobs: 'Jobs',
  status: 'Status',
  live: 'Live View',
  services: 'Services',
  workers: 'Workers',
  clients: 'Clients',
  archive: 'Archive',
  remote: 'Remote Access',

  // Company views
  storage: 'Storage',
  models: 'Models',
  issued: 'Issued Items',
  supplies: 'Supplies',
  'spare-parts': 'Spare Parts',
  vehicles: 'Vehicles',
  partners: 'Partners',
  'cash-bills': 'Cash Bills',
  analytics: 'Analytics',

  // Package views
  repairs: 'Repairs',
  'fixed-price': 'Fixed Price',
  subscriptions: 'Subscriptions',
  parts: 'Parts',
  transport: 'Transport',
  maintenance: 'Maintenance',
  'service-contracts': 'Service Contracts',
  installation: 'Installation',
  materials: 'Materials',
  emergency: 'Emergency',
  standard: 'Standard',
  interior: 'Interior',
  exterior: 'Exterior',
  renovation: 'Renovation',
  support: 'Support',
  hourly: 'Hourly Rate',

  // Profile views
  info: 'Information',
  notes: 'Notes',
  address: 'Address',
  devices: 'Devices',
  calls: 'Calls',
  theme: 'Theme',
  logout: 'Logout',
  installations: 'Installations',
  history: 'History',
  buildings: 'Buildings',
  elevators: 'Elevators',
  systems: 'Systems',
  projects: 'Projects',
  networks: 'Networks',
};

/**
 * Get the standardized display title for a section
 * @param {string} sectionKey - The section key from sectionConfig
 * @returns {string} The standardized section title
 */
export const getSectionTitle = (sectionKey) => {
  return SECTION_TITLES[sectionKey.toLowerCase()] || sectionKey;
};

/**
 * Get the standardized display title for a view
 * @param {string} viewKey - The view key from sectionConfig
 * @returns {string} The standardized view title
 */
export const getViewTitle = (viewKey) => {
  const key = viewKey.toLowerCase().replace(/\s+/g, '-');
  return VIEW_TITLES[key] || viewKey;
};

/**
 * Format a custom title according to the application's standards
 * @param {string} title - The title to format
 * @returns {string} The formatted title
 */
export const formatCustomTitle = (title) => {
  if (!title) return '';
  return title.split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}; 