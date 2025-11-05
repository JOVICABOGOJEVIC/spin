import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loadDashboardMetrics } from '../../actions/dashboardActions';
import { getJobs } from '../../redux/features/jobSlice';
import { getBusinessType } from '../../utils/businessTypeUtils';
import CalendarView from './CalendarView';
import JobsManagementView from './JobsManagementView';
import JobSchedulingDashboard from './JobSchedulingDashboard';
import ComparativeMetrics from './ComparativeMetrics';

const JobsDashboard = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('scheduling');
  const businessType = getBusinessType();

  useEffect(() => {
    // Load dashboard metrics when component mounts
    dispatch(loadDashboardMetrics());
    
    // Load jobs when component mounts (for all tabs)
    if (businessType) {
      dispatch(getJobs(businessType));
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
          value="scheduling" 
          label={t('jobs.jobScheduling')} 
          current={activeTab} 
          onClick={setActiveTab}
        />
        <TabButton 
          value="calendar" 
          label={t('jobs.calendarView')} 
          current={activeTab} 
          onClick={setActiveTab}
        />
        <TabButton 
          value="list" 
          label={t('jobs.jobList')} 
          current={activeTab} 
          onClick={setActiveTab}
        />
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide pb-20 sm:pb-4">
        <div className="bg-gray-900 mb-4">
          {activeTab === 'scheduling' && <JobSchedulingDashboard />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'list' && <JobsManagementView />}
        </div>
        
        {/* Comparative Metrics Section */}
        <div className="bg-gray-900 mt-4">
          <ComparativeMetrics />
        </div>
      </div>
    </div>
  );
};

export default JobsDashboard; 