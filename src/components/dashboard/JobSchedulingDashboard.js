import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateJob } from '../../redux/features/jobSlice';
import JobQueue from './JobQueue';
import CalendarWithDragDrop from './CalendarWithDragDrop';
import JobForm from '../forms/JobForm';
import { Plus, Calendar, List } from 'lucide-react';

const JobSchedulingDashboard = () => {
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.job);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'queue', 'calendar'

  // Jobs are already loaded by JobsDashboard parent component
  // No need to load them again here

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  const handleJobSchedule = async (jobId, scheduledDate, scheduledTime) => {
    try {
      const job = jobs.find(j => j._id === jobId);
      if (!job) return;

      const updatedJob = {
        ...job,
        serviceDate: scheduledDate.toISOString(),
        scheduledTime: scheduledTime,
        status: 'scheduled'
      };

      await dispatch(updateJob({ id: jobId, jobData: updatedJob }));
      
      // Show success message
      console.log(`Job ${job.clientName} scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledTime}`);
      
      // Jobs will be refreshed by parent component
    } catch (error) {
      console.error('Error scheduling job:', error);
    }
  };

  const handleJobMove = async (jobId, newDate, newTime) => {
    try {
      const job = jobs.find(j => j._id === jobId);
      if (!job) return;

      const updatedJob = {
        ...job,
        serviceDate: newDate.toISOString(),
        scheduledTime: newTime
      };

      await dispatch(updateJob({ id: jobId, jobData: updatedJob }));
      
      console.log(`Job ${job.clientName} moved to ${newDate.toLocaleDateString()} at ${newTime}`);
      
      // Jobs will be refreshed by parent component
    } catch (error) {
      console.error('Error moving job:', error);
    }
  };

  const handleJobFormClose = () => {
    setShowJobForm(false);
    setSelectedJob(null);
  };

  const handleJobFormSubmit = () => {
    setShowJobForm(false);
    setSelectedJob(null);
    // Jobs will be refreshed by parent component
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-2 sm:p-4">
      {/* Header - Mobile Responsive */}
      <div className="mb-3 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-base sm:text-2xl font-bold text-white">Job Scheduling</h1>
          
          {/* View Mode Buttons - Mobile Responsive */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded ${
                viewMode === 'split' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="hidden sm:inline">Split View</span>
              <span className="sm:hidden">Split</span>
            </button>
            <button
              onClick={() => setViewMode('queue')}
              className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded flex items-center ${
                viewMode === 'queue' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Queue Only</span>
              <span className="sm:hidden ml-1">Queue</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded flex items-center ${
                viewMode === 'calendar' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Calendar Only</span>
              <span className="sm:hidden ml-1">Calendar</span>
            </button>
            <button
              onClick={() => setShowJobForm(true)}
              className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Job</span>
              <span className="sm:hidden ml-1">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className="grid gap-3 sm:gap-6 mb-20 sm:mb-4">
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            <JobQueue 
              onJobSelect={handleJobSelect}
              selectedJobId={selectedJob?._id}
            />
            <CalendarWithDragDrop
              jobs={jobs}
              onJobSchedule={handleJobSchedule}
              onJobMove={handleJobMove}
            />
          </div>
        )}

        {viewMode === 'queue' && (
          <div className="max-w-4xl mx-auto">
            <JobQueue 
              onJobSelect={handleJobSelect}
              selectedJobId={selectedJob?._id}
            />
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="w-full">
            <CalendarWithDragDrop
              jobs={jobs}
              onJobSchedule={handleJobSchedule}
              onJobMove={handleJobMove}
            />
          </div>
        )}
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <JobForm
              onClose={handleJobFormClose}
              onSubmit={handleJobFormSubmit}
              initialJobData={selectedJob}
            />
          </div>
        </div>
      )}

      {/* Selected Job Details */}
      {selectedJob && viewMode !== 'split' && (
        <div className="fixed right-4 top-20 w-80 bg-gray-800 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-2">Job Details</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div><strong>Client:</strong> {selectedJob.clientName}</div>
            <div><strong>Phone:</strong> {selectedJob.clientPhone}</div>
            <div><strong>Issue:</strong> {selectedJob.issueDescription}</div>
            <div><strong>Status:</strong> {selectedJob.status}</div>
            <div><strong>Priority:</strong> {selectedJob.priority}</div>
            {selectedJob.serviceDate && (
              <div><strong>Scheduled:</strong> {new Date(selectedJob.serviceDate).toLocaleDateString()} {selectedJob.scheduledTime}</div>
            )}
          </div>
          <button
            onClick={() => setSelectedJob(null)}
            className="mt-4 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default JobSchedulingDashboard;
