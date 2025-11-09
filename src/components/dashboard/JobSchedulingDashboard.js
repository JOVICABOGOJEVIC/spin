import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DragDropContext } from 'react-beautiful-dnd';
import { updateJob } from '../../redux/features/jobSlice';
import JobQueue from './JobQueue';
import CalendarWithDragDrop from './CalendarWithDragDrop';
import JobForm from '../forms/JobForm';
import { Plus, Calendar, List } from 'lucide-react';
import { toast } from 'react-toastify';

const JobSchedulingDashboard = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { jobs, loading } = useSelector((state) => state.job);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'queue', 'calendar'
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const hasSeenLoadingRef = useRef(false);

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
      toast.success(t('jobs.statusUpdated'));
      console.log(`Job ${job.clientName} scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledTime}`);
      
      // Jobs will be refreshed by parent component
    } catch (error) {
      console.error('Error scheduling job:', error);
      toast.error(t('jobs.errorUpdatingStatus'));
    }
  };

  // Handle drag end for both JobQueue and Calendar
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // If dropped on a time slot in calendar
    if (destination.droppableId.startsWith('time-slot-')) {
      const [, , dateStr, hour, minute] = destination.droppableId.split('-');
      const scheduledDate = new Date(dateStr);
      const scheduledTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      
      handleJobSchedule(draggableId, scheduledDate, scheduledTime);
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
  
  useEffect(() => {
    if (loading) {
      hasSeenLoadingRef.current = true;
      return;
    }

    if (hasSeenLoadingRef.current && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [loading, hasLoadedOnce]);

  useEffect(() => {
    if (!hasLoadedOnce && Array.isArray(jobs) && jobs.length > 0) {
      setHasLoadedOnce(true);
    }
  }, [jobs, hasLoadedOnce]);

  const showInitialLoader = loading && !hasLoadedOnce;

  if (showInitialLoader) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900 p-2 sm:p-4">
      {loading && hasLoadedOnce && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {/* Header - Mobile Responsive */}
      <div className="mb-3 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-base sm:text-2xl font-bold text-white">{t('jobs.jobScheduling')}</h1>
          
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
              <span className="hidden sm:inline">{t('jobs.splitView')}</span>
              <span className="sm:hidden">{t('jobs.split')}</span>
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
              <span className="hidden sm:inline">{t('jobs.queueOnly')}</span>
              <span className="sm:hidden ml-1">{t('jobs.queue')}</span>
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
              <span className="hidden sm:inline">{t('jobs.calendarOnly')}</span>
              <span className="sm:hidden ml-1">{t('jobs.calendar')}</span>
            </button>
            <button
              onClick={() => setShowJobForm(true)}
              className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('jobs.newJob')}</span>
              <span className="sm:hidden ml-1">{t('common.new')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-3 sm:gap-6 mb-20 sm:mb-4">
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
              <JobQueue 
                jobs={jobs}
                loading={loading}
                onJobSelect={handleJobSelect}
                selectedJobId={selectedJob?._id}
                onJobSchedule={handleJobSchedule}
              />
              <CalendarWithDragDrop
                jobs={jobs}
                onJobSchedule={handleJobSchedule}
                onJobMove={handleJobMove}
                isNested={true}
              />
            </div>
          )}

          {viewMode === 'queue' && (
            <div className="max-w-4xl mx-auto">
              <JobQueue 
                jobs={jobs}
                loading={loading}
                onJobSelect={handleJobSelect}
                selectedJobId={selectedJob?._id}
                onJobSchedule={handleJobSchedule}
              />
            </div>
          )}

          {viewMode === 'calendar' && (
            <div className="w-full">
              <CalendarWithDragDrop
                jobs={jobs}
                onJobSchedule={handleJobSchedule}
                onJobMove={handleJobMove}
                isNested={true}
              />
            </div>
          )}
        </div>
      </DragDropContext>

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
            <div><strong>{t('jobs.client')}:</strong> {selectedJob.clientName}</div>
            <div><strong>{t('jobs.phone')}:</strong> {selectedJob.clientPhone}</div>
            <div><strong>Issue:</strong> {selectedJob.issueDescription}</div>
            <div><strong>{t('jobs.status')}:</strong> {selectedJob.status}</div>
            <div><strong>Priority:</strong> {selectedJob.priority}</div>
            {selectedJob.serviceDate && (
              <div><strong>{t('jobs.scheduled')}:</strong> {new Date(selectedJob.serviceDate).toLocaleDateString()} {selectedJob.scheduledTime}</div>
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
