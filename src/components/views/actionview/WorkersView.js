import React, { useState } from 'react';
import WorkerList from '../../workers/WorkerList';
import TeamList from '../../teams/TeamList';

const WorkersView = () => {
  const [activeTab, setActiveTab] = useState('workers');

  // Simple tab button component
  const TabButton = ({ value, label, current, onClick }) => (
    <button
      className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-t-md ${
        value === current
          ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-500'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      onClick={() => onClick(value)}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full bg-gray-900">
      {/* Tabs at the very top */}
      <div className="flex space-x-1 mb-2 border-b border-gray-700 p-2 sm:p-4 pb-0">
        <TabButton 
          value="workers" 
          label="Radnici" 
          current={activeTab} 
          onClick={setActiveTab}
        />
        <TabButton 
          value="teams" 
          label="Timovi" 
          current={activeTab} 
          onClick={setActiveTab}
        />
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide pb-20 sm:pb-4">
        <div className="bg-gray-900">
          {activeTab === 'workers' && <WorkerList />}
          {activeTab === 'teams' && <TeamList />}
        </div>
      </div>
    </div>
  );
};

export default WorkersView;