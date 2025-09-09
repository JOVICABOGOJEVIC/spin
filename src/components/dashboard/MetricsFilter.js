import React, { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

const TIME_PERIODS = [
  { label: 'Juče', value: 'yesterday' },
  { label: 'Prošla nedelja', value: 'lastWeek' },
  { label: 'Prošli mesec', value: 'lastMonth' },
  { label: 'Prošla godina', value: 'lastYear' }
];

const MetricsFilter = ({ selectedPeriod, onChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50 transition-colors"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <Calendar size={16} className="text-primary" />
        <span>Uporedi sa: {TIME_PERIODS.find(p => p.value === selectedPeriod)?.label}</span>
        <ChevronDown size={16} />
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.value}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                selectedPeriod === period.value ? 'bg-gray-50 text-primary' : ''
              }`}
              onClick={() => {
                onChange(period.value);
                setDropdownOpen(false);
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricsFilter; 