import React from 'react';
import { useSelector } from 'react-redux';
import JobCard from './JobCard';

const JobList = ({ onEdit, onDelete }) => {
  const { jobs, loading, error } = useSelector((state) => state.jobs);

  if (loading) {
    return <div className="text-center p-8">Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-xl text-gray-600">No repair jobs found</h3>
        <p className="text-gray-500 mt-2">Click the "Add" button to create your first job</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard
          key={job._id}
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default JobList; 