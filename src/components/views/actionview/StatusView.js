import React, { useEffect } from 'react';
import HeaderSection from '../../header/HeaderSection.js';
import { useDispatch, useSelector } from 'react-redux';
import { getJobs } from '../../../redux/features/jobSlice';

const StatusView = ({ title, onNavigateBack }) => {
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.job);
  
  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);
  
  const onAdd = () => {};
  const onRead = () => {};
  
  const onBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    }
  };
  
  // Group jobs by status
  const receivedJobs = jobs.filter(job => job.status === 'Received');
  const inProgressJobs = jobs.filter(job => ['Diagnosing', 'Waiting for Parts'].includes(job.status));
  const inRepairJobs = jobs.filter(job => job.status === 'In Repair');
  const completedJobs = jobs.filter(job => ['Completed', 'Delivered', 'Cancelled'].includes(job.status));
  
  const StatusRow = ({ title, jobs, bgColor }) => (
    <div className="mb-6">
      <h3 className={`text-lg font-bold mb-2 ${bgColor} p-2 rounded-md text-white`}>{title}</h3>
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No jobs in this status</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {jobs.map(job => (
            <div 
              key={job._id} 
              className="bg-white p-3 rounded-md shadow-sm border-l-4 hover:shadow-md transition-all"
              style={{ 
                borderLeftColor: 
                  job.priority === 'Urgent' ? '#ef4444' : 
                  job.priority === 'High' ? '#f97316' : 
                  job.priority === 'Medium' ? '#f59e0b' : 
                  '#84cc16'
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold">{job.clientName}</h4>
                <span className="text-xs text-gray-500">{job.priority} Priority</span>
              </div>
              <p className="text-sm text-gray-700">{job.deviceType} {job.brand && job.model ? `- ${job.brand} ${job.model}` : ''}</p>
              <p className="text-xs text-gray-600 line-clamp-1 mt-1">{job.issueDescription}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading status information...</div>;
  }
  
  return (
    <div className='w-full p-4'>
      <HeaderSection 
        title={title} 
        onAdd={onAdd}
        onRead={onRead}
        onBack={onBack} 
      />
      
      <div className="mt-6 w-full">
        <StatusRow title="Received" jobs={receivedJobs} bgColor="bg-gray-600" />
        <StatusRow title="In Progress" jobs={inProgressJobs} bgColor="bg-blue-600" />
        <StatusRow title="In Repair" jobs={inRepairJobs} bgColor="bg-yellow-600" />
        <StatusRow title="Completed" jobs={completedJobs} bgColor="bg-green-600" />
      </div>
    </div>
  );
};

export default StatusView;