import React, { useState, useEffect } from 'react';
import HeaderSection from '../../header/HeaderSection.js';
import JobForm from '../../forms/JobForm.js';
import JobList from '../../lists/JobList.js';
import Calendar from '../../Calendar.js';
import { useNavigate } from 'react-router-dom';
import { getBusinessType } from '../../../utils/businessTypeUtils';
import { useSelector } from 'react-redux';

const JobsView = ({ title, onNavigateBack }) => {
  const [activeView, setActiveView] = useState('calendar');
  const [selectedJob, setSelectedJob] = useState(null);
  const businessType = getBusinessType();
  const navigate = useNavigate();
  const { jobs } = useSelector((state) => state.job);
  
  const showCalendar = () => {
    setActiveView('calendar');
    setSelectedJob(null);
  };
  
  const showAddForm = () => {
    setActiveView('add');
    setSelectedJob(null);
  };
  
  const showEditForm = (job) => {
    setActiveView('edit');
    setSelectedJob(job);
  };
  
  const onAdd = () => {
    showAddForm();
  };
  
  const onBack = () => {
    if (activeView !== 'calendar') {
      showCalendar();
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };

  const handleFormClose = () => {
    showCalendar();
  };
  
  // Listen for job-edit events
  useEffect(() => {
    const handleJobEdit = (event) => {
      console.log('Job edit event received', event.detail);
      showEditForm(event.detail);
    };
    
    window.addEventListener('job-edit', handleJobEdit);
    
    return () => {
      window.removeEventListener('job-edit', handleJobEdit);
    };
  }, []);

  // Format jobs for calendar
  const calendarEvents = jobs.map(job => ({
    id: job._id,
    title: `${job.clientName} - ${job.deviceType}`,
    start: new Date(job.serviceDate),
    description: job.issueDescription
  }));

  // Handle calendar event click
  const handleEventClick = (event) => {
    const job = jobs.find(j => j._id === event.id);
    if (job) {
      const editEvent = new CustomEvent('job-edit', { detail: job });
      window.dispatchEvent(editEvent);
    }
  };

  const getViewTitle = () => {
    if (activeView === 'calendar') {
      return `${businessType} Poslovi`;
    } else if (activeView === 'add') {
      return `Novi ${businessType} Posao`;
    } else if (activeView === 'edit') {
      return `Izmena ${businessType} Posla`;
    }
    return title || 'Poslovi';
  };
  
  return (
    <div className='w-full min-h-screen bg-gray-50'>
      <HeaderSection 
        title={getViewTitle()} 
        onAdd={activeView === 'calendar' ? onAdd : null}
        onBack={onBack}
      />
      
      <div className="w-full px-4 py-6">
        {activeView === 'calendar' ? (
          <div className="space-y-6 max-w-7xl mx-auto">
            <Calendar 
              events={calendarEvents}
              onEventClick={handleEventClick}
            />
            <JobList />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <JobForm 
              isEdit={activeView === 'edit'}
              jobData={selectedJob}
              onClose={handleFormClose}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsView;