import React, { useState } from 'react';
import SpareParts from './SpareParts';
// ... other imports ...

const CompanyView = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <CompanyProfile />;
      case 'settings':
        return <CompanySettings />;
      case 'spare-parts':
        return <SpareParts />;
      default:
        return <CompanyProfile />;
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-48 bg-gray-800 p-4">
        <nav className="space-y-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Company Profile
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveSection('spare-parts')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'spare-parts' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Spare Parts
          </button>
        </nav>
      </div>
      
      <div className="flex-1 p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default CompanyView; 