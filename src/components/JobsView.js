import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentJob, clearCurrentJob, getJobs, deleteJob } from '../redux/features/jobSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import JobList from './JobList';
import JobForm from './forms/JobForm';

const JobsView = () => {
  const [view, setView] = useState('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { currentJob, loading } = useSelector((state) => state.jobs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  const handleAddClick = () => {
    setView('form');
    setIsFormOpen(true);
    setIsEditMode(false);
    dispatch(clearCurrentJob());
  };

  const handleListClick = () => {
    setView('list');
    setIsFormOpen(false);
  };

  const handleEditJob = (jobId) => {
    setIsEditMode(true);
    setIsFormOpen(true);
    setView('form');
    dispatch(setCurrentJob(jobId));
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      dispatch(deleteJob(jobId));
    }
  };

  const handleGoBack = () => {
    if (view === 'form') {
      setView('list');
      setIsFormOpen(false);
      dispatch(clearCurrentJob());
    } else {
      // Ako smo na listi, idemo na početnu stranu
      navigate('/');
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setView('list');
    dispatch(clearCurrentJob());
  };

  if (loading) {
    return <div className="p-6 text-center">Loading jobs...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button 
            onClick={handleGoBack}
            className="mr-4 text-gray-600 hover:text-primary transition-colors"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Repair Jobs</h1>
        </div>
        
        <div className="space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${
              view === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
            onClick={handleListClick}
          >
            List
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              view === 'form' && !isEditMode ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
            onClick={handleAddClick}
          >
            Add
          </button>
        </div>
      </div>

      {view === 'list' && (
        <JobList onEdit={handleEditJob} onDelete={handleDeleteJob} />
      )}

      {isFormOpen && (
        <JobForm
          isEdit={isEditMode}
          jobData={currentJob}
          onClose={closeForm}
        />
      )}
    </div>
  );
};

export default JobsView; 