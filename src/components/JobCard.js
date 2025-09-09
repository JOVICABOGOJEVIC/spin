import React from 'react';

const JobCard = ({ job, onEdit, onDelete }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-3 mb-3 border-l-4 hover:shadow-lg transition-all duration-200"
      style={{ 
        borderLeftColor: 
          job.priority === 'Urgent' ? '#ef4444' : 
          job.priority === 'High' ? '#f97316' : 
          job.priority === 'Medium' ? '#f59e0b' : 
          '#84cc16'
      }}
    >
      {/* Row 1: Client name and status */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{job.clientName}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          job.status === 'Completed' ? 'bg-green-100 text-green-800' :
          job.status === 'In Repair' ? 'bg-blue-100 text-blue-800' :
          job.status === 'Waiting for Parts' ? 'bg-yellow-100 text-yellow-800' :
          job.status === 'Diagnosing' ? 'bg-purple-100 text-purple-800' :
          job.status === 'Delivered' ? 'bg-teal-100 text-teal-800' :
          job.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {job.status}
        </span>
      </div>
      
      {/* Row 2: Device info, description and action buttons */}
      <div className="flex justify-between items-center">
        <div className="mr-2 flex-grow">
          <div className="text-sm text-gray-500 mb-1">
            {job.deviceType}{job.brand && job.model ? ` • ${job.brand} ${job.model}` : ''}
            {job.assignedTo && <span className="ml-1 text-primary">({job.assignedTo})</span>}
          </div>
          <p className="text-sm text-gray-600 line-clamp-1">{job.issueDescription}</p>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={() => onEdit(job._id)}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(job._id)}
            className="p-1 text-red-600 hover:text-red-800 transition-colors ml-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard; 