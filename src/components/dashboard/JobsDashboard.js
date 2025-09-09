import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadDashboardMetrics } from '../../actions/dashboardActions';
import { loadMockJobs } from '../../redux/features/jobSlice';
import { getBusinessType } from '../../utils/businessTypeUtils';
import CalendarView from './CalendarView';
import JobsManagementView from './JobsManagementView';
import ComparativeMetrics from './ComparativeMetrics';

const JobsDashboard = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('calendar');
  const businessType = getBusinessType();

  useEffect(() => {
    // Load dashboard metrics when component mounts
    dispatch(loadDashboardMetrics());
    
    // Load mock jobs data for the calendar and job list
    if (businessType) {
      dispatch(loadMockJobs(businessType));
    }
  }, [dispatch, businessType]);

  // Simple tab button component
  const TabButton = ({ value, label, current, onClick }) => (
    <button
      className={`px-2 py-1 text-xs font-medium rounded-t-md ${
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
      <div className="flex space-x-1 mb-2 border-b border-gray-700">
        <TabButton 
          value="calendar" 
          label="Calendar View" 
          current={activeTab} 
          onClick={setActiveTab}
        />
        <TabButton 
          value="list" 
          label="Job List" 
          current={activeTab} 
          onClick={setActiveTab}
        />
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide">
        <div className="bg-gray-900">
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'list' && <JobsManagementView />}
        </div>
        
        {/* Comparative Metrics Section */}
        <div className="bg-gray-900">
          <ComparativeMetrics />
        </div>
      </div>
    </div>
  );
};

export default JobsDashboard; 