import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getJobs } from '../../redux/features/jobSlice';
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import CalendarWithDragDrop from '../dashboard/CalendarWithDragDrop';
import JobQueue from '../dashboard/JobQueue';
import JobStatusControls from '../worker/JobStatusControls';
import { useWebSocket } from '../../contexts/WebSocketContext';

const WorkerDashboard = () => {
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.job);
  const { user } = useSelector((state) => state.auth);
  const { socket, isConnected } = useWebSocket();
  const [viewMode, setViewMode] = useState('calendar');
  const [calendarViewMode, setCalendarViewMode] = useState('day'); // 'day', 'week', 'month'
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Callback to receive view mode from calendar
  const handleCalendarViewModeChange = (newViewMode) => {
    setCalendarViewMode(newViewMode);
  };

  // Callback to handle job selection
  const handleJobSelect = (job) => {
    console.log('Job selected:', job);
    setSelectedJob(job);
  };

  // Callback to handle job status update
  const handleJobStatusUpdate = (newStatus) => {
    console.log('Job status updated:', newStatus);
    // WebSocket will handle real-time updates automatically
    // No need to refresh jobs manually
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    const businessType = user?.result?.businessType || 'Home Appliance Technician';
    console.log('🔄 Manual refresh triggered by user');
    dispatch(getJobs(businessType));
  };

  useEffect(() => {
    // Get business type from user or use default
    const businessType = user?.result?.businessType || 'Home Appliance Technician';
    dispatch(getJobs(businessType));
    
    // No more auto-refresh - WebSocket will handle real-time updates
  }, [dispatch, user]);

  // WebSocket listener for real-time job updates
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('job_updated', (data) => {
        console.log('📋 Real-time job update received:', data);
        
        // Always refresh jobs to get latest data
        const businessType = user?.result?.businessType || 'Home Appliance Technician';
        dispatch(getJobs(businessType));
        
        // If this is the currently selected job and it's completed, close the modal
        if (selectedJob && data.jobId === selectedJob._id && data.status === 'Completed') {
          console.log('🎯 Job completed, closing modal and refreshing jobs');
          setSelectedJob(null);
        }
      });

      return () => {
        socket.off('job_updated');
      };
    }
  }, [socket, isConnected, dispatch, user, selectedJob]);

  useEffect(() => {
    if (jobs && user?.result?.firstName) {
      // Filter jobs assigned to this worker
      const workerName = `${user.result.firstName} ${user.result.lastName}`;
      const firstName = user.result.firstName;
      const lastName = user.result.lastName;
      
      console.log('🔍 Worker Dashboard - Filtering Jobs:');
      console.log('  Worker Name:', workerName);
      console.log('  First Name:', firstName);
      console.log('  Last Name:', lastName);
      console.log('  Worker ID:', user.result._id);
      console.log('  Total Jobs:', jobs.length);
      
      // Log all jobs and their assignedTo values
      console.log('  All Jobs with assignedTo:');
      jobs.forEach((job, index) => {
        console.log(`    ${index + 1}. Job: ${job.issueDescription?.substring(0, 30)}...`);
        console.log(`       assignedTo: "${job.assignedTo}"`);
        console.log(`       ID: ${job._id}`);
      });
      
      const assignedJobs = jobs.filter(job => {
        const workerId = user.result._id;
        const matches = job.assignedTo === workerName || 
                       job.assignedTo === firstName ||
                       job.assignedTo === lastName ||
                       job.assignedTo === workerId;
        console.log(`  Job "${job.issueDescription?.substring(0, 30)}..." assignedTo: "${job.assignedTo}" - Match: ${matches}`);
        return matches;
      });
      
      setFilteredJobs(assignedJobs);
      console.log('  ✅ Filtered Jobs:', assignedJobs.length);
      console.log('  Filtered Jobs:', assignedJobs.map(j => ({ 
        id: j._id, 
        title: j.issueDescription?.substring(0, 30), 
        assignedTo: j.assignedTo 
      })));
      
      // Also log unassigned jobs for debugging
      const unassignedJobs = jobs.filter(job => !job.assignedTo || job.assignedTo === '');
      if (unassignedJobs.length > 0) {
        console.log('  📋 Unassigned Jobs:', unassignedJobs.length);
        console.log('  Unassigned Jobs:', unassignedJobs.map(j => ({ 
          id: j._id, 
          title: j.issueDescription?.substring(0, 30), 
          clientAddress: j.clientAddress,
          assignedTo: j.assignedTo 
        })));
      }
    }
  }, [jobs, user]);

  // Calculate statistics based on calendar view mode
  const calculateStatistics = (viewMode = 'day') => {
    const today = new Date();
    let filteredJobsByDate = filteredJobs || [];
    
    if (viewMode === 'day') {
      // Filter jobs for today
      filteredJobsByDate = filteredJobs?.filter(job => {
        if (!job.serviceDate) return false;
        const jobDate = new Date(job.serviceDate);
        return jobDate.toDateString() === today.toDateString();
      }) || [];
    } else if (viewMode === 'week') {
      // Filter jobs for current week
      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diff = day === 0 ? -6 : 1 - day; // Monday start
      startOfWeek.setDate(today.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      filteredJobsByDate = filteredJobs?.filter(job => {
        if (!job.serviceDate) return false;
        const jobDate = new Date(job.serviceDate);
        return jobDate >= startOfWeek && jobDate <= endOfWeek;
      }) || [];
    } else if (viewMode === 'month') {
      // Filter jobs for current month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      filteredJobsByDate = filteredJobs?.filter(job => {
        if (!job.serviceDate) return false;
        const jobDate = new Date(job.serviceDate);
        return jobDate >= startOfMonth && jobDate <= endOfMonth;
      }) || [];
    }
    
    return {
      totalJobs: filteredJobsByDate.length,
      scheduledJobs: filteredJobsByDate.filter(job => job.serviceDate && job.status !== 'Completed' && job.status !== 'Cancelled').length,
      activeJobs: filteredJobsByDate.filter(job => job.status === 'In Repair' || job.status === 'Diagnosing' || job.status === 'On Road' || job.status === 'At Client').length,
      completedJobs: filteredJobsByDate.filter(job => job.status === 'Completed').length
    };
  };

  // Calculate progress percentage based on view mode
  const calculateProgress = (viewMode, currentCount) => {
    const limits = {
      day: 10,    // 10 jobs per day
      week: 50,   // 50 jobs per week  
      month: 200  // 200 jobs per month
    };
    
    const limit = limits[viewMode] || limits.day;
    return Math.min((currentCount / limit) * 100, 100);
  };

  const stats = calculateStatistics(calendarViewMode);
  const progressPercentage = calculateProgress(calendarViewMode, stats.totalJobs);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const scheduledJobs = filteredJobs.filter(job => job.serviceDate && job.scheduledTime);
  const unscheduledJobs = filteredJobs.filter(job => !job.serviceDate || !job.scheduledTime);

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-white">
                  Dobrodošli, {user?.result?.firstName} {user?.result?.lastName}
                </h1>
                <p className="text-sm text-gray-400">Vaši dodeljeni poslovi</p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Kalendar
              </button>
              <button
                onClick={() => setViewMode('queue')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'queue'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                Red čekanja
              </button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              title="Osveži podatke"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Osveži</span>
            </button>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Ukupno poslova</p>
                <p className="text-2xl font-semibold text-white">{stats.totalJobs}</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progressPercentage.toFixed(1)}% od maksimuma</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Zakazani poslovi</p>
                <p className="text-2xl font-semibold text-white">{stats.scheduledJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Aktivni poslovi</p>
                <p className="text-2xl font-semibold text-white">{stats.activeJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Završeni poslovi</p>
                <p className="text-2xl font-semibold text-white">{stats.completedJobs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-lg shadow-lg">
          {viewMode === 'calendar' ? (
            <CalendarWithDragDrop 
              jobs={filteredJobs}
              viewMode="day"
              showTimeSlots={true}
              onViewModeChange={handleCalendarViewModeChange}
              onJobSelect={handleJobSelect}
            />
          ) : (
            <JobQueue 
              jobs={filteredJobs}
              showStats={false}
              onJobSelect={handleJobSelect}
            />
          )}
        </div>

        {/* Job Details Modal with Worker Controls */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Job Details</h3>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Job Info */}
                <div className="space-y-4">
                  {/* Client Information */}
                  <div className="bg-gray-700 rounded p-4">
                    <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client Info
                    </h4>
                    <div className="text-sm text-gray-300 space-y-2">
                      <div className="flex gap-2">
                        <span className="text-gray-400 min-w-[100px]">Name:</span>
                        <span className="flex-1 font-medium">{selectedJob.clientName}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-400 min-w-[100px]">Phone:</span>
                        <span className="flex-1">{selectedJob.clientPhone}</span>
                      </div>
                      {selectedJob.clientAddress && (
                        <div className="flex gap-2">
                          <span className="text-gray-400 min-w-[100px]">Address:</span>
                          <span className="flex-1">{selectedJob.clientAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="bg-gray-700 rounded p-4">
                    <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Service Details
                    </h4>
                    <div className="text-sm text-gray-300 space-y-2">
                      {selectedJob.serviceDate && (
                        <div className="flex gap-2">
                          <span className="text-gray-400 min-w-[100px]">Date:</span>
                          <span className="flex-1">{new Date(selectedJob.serviceDate).toLocaleDateString('sr-RS')}</span>
                        </div>
                      )}
                      {selectedJob.scheduledTime && (
                        <div className="flex gap-2">
                          <span className="text-gray-400 min-w-[100px]">Time:</span>
                          <span className="flex-1">{selectedJob.scheduledTime}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className="text-gray-400 min-w-[100px]">Status:</span>
                        <span className="flex-1">{selectedJob.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Issue Description */}
                  {selectedJob.issueDescription && (
                    <div className="bg-gray-700 rounded p-4">
                      <h4 className="font-semibold text-white text-sm mb-3">Issue Description</h4>
                      <p className="text-sm text-gray-300">{selectedJob.issueDescription}</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Worker Controls */}
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Worker Controls
                    </h4>
                    <JobStatusControls 
                      job={selectedJob}
                      user={user}
                      onStatusUpdate={handleJobStatusUpdate}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
