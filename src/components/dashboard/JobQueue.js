import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Clock, AlertCircle, User, Phone, MapPin, Calendar, Edit, List, Trash2, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { updateJob, deleteJob, getJobs } from '../../redux/features/jobSlice';
import { toast } from 'react-toastify';
import JobForm from '../forms/JobForm';
import { API_BASE_URL } from '../../config/api.js';

const JobQueue = ({ jobs = [], loading = false, onJobSelect, selectedJobId, showStats = true, onJobSchedule }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [expandedJobs, setExpandedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const { user, userType } = useSelector((state) => state.auth);

  // Jobs are passed as props from parent component

  // Toggle expanded state for job details
  const toggleExpanded = (jobId) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  // Handle job click - open details modal
  const handleJobClick = (job) => {
    console.log('Job clicked:', job);
    
    // If onJobSelect is provided (WorkerDashboard), use that instead of local modal
    if (onJobSelect) {
      onJobSelect(job);
    } else {
      // Only open local modal if no onJobSelect callback (AdminDashboard)
      setSelectedJob(job);
    }
  };

  // Handle status action for workers
  const handleStatusAction = async (status, jobId, clientAddress) => {
    try {
      const token = user?.token;
      
      // Update worker status
      await axios.put(
        `${API_BASE_URL}/api/worker/${user.result._id}/status`,
        {
          status,
          currentJobId: jobId,
          location: clientAddress || 'Nepoznata adresa',
          notes: `Posao: ${jobId}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update job status
      const jobStatusMap = {
        'on_the_road': 'On Road',
        'at_client': 'In Progress',
        'completed': 'Completed'
      };
      
      const jobStatus = jobStatusMap[status];
      if (jobStatus) {
        await axios.put(
          `${API_BASE_URL}/api/jobs/${jobId}`,
          { status: jobStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Job status updated to:', jobStatus);
      }
      
      const statusLabels = {
        'on_the_road': t('jobs.onRoad'),
        'at_client': t('jobs.atClient'),
        'completed': t('jobs.completed')
      };
      
      toast.success(`${t('jobs.statusUpdated')}: ${statusLabels[status]}`);
      
      // Refresh jobs to show updated status
      const businessType = user?.result?.businessType || 'Home Appliance Technician';
      dispatch(getJobs(businessType));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('jobs.errorUpdatingStatus'));
    }
  };

  // Handle job edit
  const handleEditJob = (job) => {
    setEditingJob(job);
  };

  // Handle job update
  const handleJobUpdate = (updatedJob) => {
    dispatch(updateJob({ id: updatedJob._id, jobData: updatedJob }));
    setEditingJob(null);
  };

  // Handle job delete with confirmation
  const handleDeleteJob = (job) => {
    if (window.confirm(`${t('jobs.deleteConfirmation')} "${job.clientName}"?`)) {
      dispatch(deleteJob(job._id));
      toast.success(t('common.success'));
    }
  };

  // Filter jobs by status and search term
  // Job Queue shows only jobs WITHOUT scheduled date/time (unscheduled jobs)
  const filteredJobs = jobs?.filter(job => {
    // Only show jobs without serviceDate (unscheduled)
    const isUnscheduled = !job.serviceDate;
    
    // Exclude completed jobs
    const isNotCompleted = job.status !== 'Completed';
    
    const matchesStatus = filter === 'all' || job.status === filter;
    const matchesSearch = !searchTerm || 
      job.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.clientPhone?.includes(searchTerm) ||
      job.issueDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    return isUnscheduled && isNotCompleted && matchesStatus && matchesSearch;
  }) || [];

  console.log('JobQueue - jobs:', jobs);
  console.log('JobQueue - filteredJobs:', filteredJobs);
  console.log('JobQueue - loading:', loading);
  
  // Debug: Log first job to see structure
  if (jobs && jobs.length > 0) {
    console.log('First job structure:', {
      serviceDate: jobs[0].serviceDate,
      scheduledTime: jobs[0].scheduledTime,
      serviceDateTime: jobs[0].serviceDateTime,
      allKeys: Object.keys(jobs[0])
    });
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  const formatTime = (timeString) => {
    if (!timeString) return t('jobs.noTime');
    return timeString;
  };

  const formatDuration = (duration) => {
    if (!duration) return null;
    if (duration === 0.5) return '30min';
    if (duration === 1) return '1h';
    if (duration % 1 === 0) return `${duration}h`;
    return `${duration}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-2 sm:p-4 h-full">
      <div className="mb-3 sm:mb-4">
        <h2 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-4">{t('jobs.jobQueue')}</h2>
        
        {/* Filters - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-gray-700 text-white rounded border border-gray-600"
          >
            <option value="all">{t('jobs.allJobs')}</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
          </select>
          
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-gray-700 text-white rounded border border-gray-600"
          />
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-400">Loading jobs...</p>
        </div>
      ) : (
        // DragDropContext is now handled by parent JobSchedulingDashboard
        <Droppable droppableId="job-queue">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-2 max-h-96 overflow-y-auto ${
                  snapshot.isDraggingOver ? 'bg-gray-700' : ''
                }`}
              >
              {filteredJobs.map((job, index) => (
                <Draggable key={job._id} draggableId={job._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() => handleJobClick(job)}
                      className={`bg-gray-700 rounded-lg border-l-4 cursor-pointer ${
                        selectedJobId === job._id ? 'border-blue-500 bg-gray-600' : 'border-gray-600'
                      } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    >
                      {/* Ultra Compact Job Row - All Horizontal */}
                      <div className="p-1.5 sm:p-2">
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                          {/* All info in one horizontal line */}
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                            {/* Status Badge */}
                            <span className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] rounded whitespace-nowrap ${getStatusColor(job.status)}`}>
                              {job.status.substring(0, 3)}
                            </span>
                            
                            {/* Priority Badge */}
                            <span className={`text-[9px] sm:text-[10px] font-medium whitespace-nowrap ${getPriorityColor(job.priority)}`}>
                              {job.priority.substring(0, 1)}
                            </span>
                            
                            {/* Client Name */}
                            <span className="text-[10px] sm:text-xs font-medium text-white truncate min-w-[80px] max-w-[140px]">
                              {job.clientName}
                            </span>
                            
                            {/* Issue Description - Hidden on very small screens */}
                            <span className="hidden md:block text-[9px] sm:text-[10px] text-gray-300 truncate flex-1">
                              {job.clientAddress || '—'}
                            </span>
                            
                            {/* Date and Time */}
                            {job.serviceDate && (
                              <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-gray-400 whitespace-nowrap">
                                <Calendar className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                <span>{formatDate(job.serviceDate).split(',')[0]}</span>
                                {job.scheduledTime && (
                                  <span className="ml-0.5">@ {job.scheduledTime}</span>
                                )}
                                {job.estimatedDuration && (
                                  <span className="ml-0.5 text-blue-400">({formatDuration(job.estimatedDuration)})</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons - List, Edit, Delete */}
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(job._id);
                              }}
                              className="p-0.5 rounded hover:bg-gray-600 text-gray-300 hover:text-white"
                              title="View Details"
                            >
                              <List className="h-3 w-3 stroke-[2.5]" />
                            </button>
                            
                            {/* Admin Actions */}
                            {userType === 'company' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingJob(job);
                                  }}
                                  className="p-0.5 rounded hover:bg-blue-600 text-gray-300 hover:text-white"
                                  title={t('jobs.editJob')}
                                >
                                  <Edit className="h-3 w-3 stroke-[2.5]" />
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteJob(job);
                                  }}
                                  className="p-0.5 rounded hover:bg-red-600 text-gray-300 hover:text-white"
                                  title={t('jobs.deleteJob')}
                                >
                                  <Trash2 className="h-3 w-3 stroke-[2.5]" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded Details - Grid Layout */}
                        {expandedJobs.has(job._id) && (
                          <div 
                            className="mt-2 pt-2 border-t border-gray-600 bg-gray-800 rounded p-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Grid Layout - 2 columns on desktop, 1 on mobile */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              
                              {/* Column 1: Client & Device */}
                              <div className="space-y-3">
                                {/* Client Information */}
                                <div className="bg-gray-700 rounded p-2">
                                  <div className="font-semibold text-white text-xs mb-2 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {t('jobs.clientInfo')}
                                  </div>
                                  <div className="text-[10px] text-gray-300 space-y-1">
                                    <div className="flex gap-2">
                                      <span className="text-gray-400 min-w-[50px]">Name:</span>
                                      <span className="flex-1">{job.clientName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span className="text-gray-400 min-w-[50px]">Phone:</span>
                                      <span className="flex-1">{job.clientPhone}</span>
                                    </div>
                                    {job.clientEmail && (
                                      <div className="flex gap-2">
                                        <span className="text-gray-400 min-w-[50px]">Email:</span>
                                        <span className="flex-1 break-all">{job.clientEmail}</span>
                                      </div>
                                    )}
                                    {job.clientAddress && (
                                      <div className="flex gap-2">
                                        <span className="text-gray-400 min-w-[50px]">Address:</span>
                                        <span className="flex-1">{job.clientAddress}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Device Information */}
                                {job.deviceType && (
                                  <div className="bg-gray-700 rounded p-2">
                                    <div className="font-semibold text-white text-xs mb-2">Device Info</div>
                                    <div className="text-[10px] text-gray-300 space-y-1">
                                      <div className="flex gap-2">
                                        <span className="text-gray-400 min-w-[50px]">Type:</span>
                                        <span className="flex-1">{job.deviceType}</span>
                                      </div>
                                      {job.deviceBrand && (
                                        <div className="flex gap-2">
                                          <span className="text-gray-400 min-w-[50px]">Brand:</span>
                                          <span className="flex-1">{job.deviceBrand}</span>
                                        </div>
                                      )}
                                      {job.deviceModel && (
                                        <div className="flex gap-2">
                                          <span className="text-gray-400 min-w-[50px]">Model:</span>
                                          <span className="flex-1">{job.deviceModel}</span>
                                        </div>
                                      )}
                                      {job.deviceSerialNumber && (
                                        <div className="flex gap-2">
                                          <span className="text-gray-400 min-w-[50px]">Serial:</span>
                                          <span className="flex-1">{job.deviceSerialNumber}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Column 2: Service & Issue */}
                              <div className="space-y-3">
                                {/* Service Details */}
                                <div className="bg-gray-700 rounded p-2">
                                  <div className="font-semibold text-white text-xs mb-2 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Service Details
                                  </div>
                                  <div className="text-[10px] text-gray-300 space-y-1">
                                    <div className="flex gap-2">
                                      <span className="text-gray-400 min-w-[50px]">Date:</span>
                                      <span className="flex-1">{job.serviceDate ? formatDate(job.serviceDate) : 'Not scheduled'}</span>
                                    </div>
                                    {job.scheduledTime && (
                                      <div className="flex gap-2">
                                        <span className="text-gray-400 min-w-[50px]">{t('jobs.time')}:</span>
                                        <span className="flex-1">{job.scheduledTime}</span>
                                      </div>
                                    )}
                                    {job.estimatedDuration && (
                                      <div className="flex gap-2">
                                        <span className="text-gray-400 min-w-[50px]">Duration:</span>
                                        <span className="flex-1 text-blue-400">{formatDuration(job.estimatedDuration)}</span>
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <span className="text-gray-400 min-w-[50px]">Location:</span>
                                      <span className="flex-1">{job.serviceLocation}</span>
                                    </div>
                                    {job.assignedTo && (
                                      <div className="flex gap-2">
                                        <span className="text-gray-400 min-w-[50px]">Assigned:</span>
                                        <span className="flex-1">{job.assignedTo}</span>
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <span className="text-gray-400 min-w-[50px]">{t('jobs.status')}:</span>
                                      <span className="flex-1">{job.status}</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <span className="text-gray-400 min-w-[50px]">Priority:</span>
                                      <span className="flex-1">{job.priority}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Issue Description */}
                                {job.issueDescription && (
                                  <div className="bg-gray-700 rounded p-2">
                                    <div className="font-semibold text-white text-xs mb-2">Issue Description</div>
                                    <div className="text-[10px] text-gray-300">
                                      {job.issueDescription}
                                    </div>
                                  </div>
                                )}

                                {/* Job Status Controls for Workers */}
                                {/* Removed - now handled in WorkerDashboard */}

                                {/* Spare Parts */}
                                {job.usedSpareParts && job.usedSpareParts.length > 0 && (
                                  <div className="bg-gray-700 rounded p-2">
                                    <div className="font-semibold text-white text-xs mb-2">Spare Parts</div>
                                    <div className="text-[10px] text-gray-300">
                                      {job.usedSpareParts.length} part(s) used
                                    </div>
                                  </div>
                                )}
                                
                                {/* Job Metadata - Creator and Created Time */}
                                <div className="bg-gray-700 rounded p-2 mt-3 border-t border-gray-600">
                                  <div className="font-semibold text-white text-xs mb-2">Job Metadata</div>
                                  <div className="text-[10px] text-gray-300 space-y-1">
                                    {job.creator && (
                                      <div className="flex gap-2">
                                        <span className="text-gray-400 min-w-[60px]">Created by:</span>
                                        <span className="flex-1">{job.creator}</span>
                                      </div>
                                    )}
                                    {job.createdAt && (
                                      <div className="flex gap-2">
                                        <span className="text-gray-400 min-w-[60px]">Created at:</span>
                                        <span className="flex-1">{new Date(job.createdAt).toLocaleString('sr-RS')}</span>
                                      </div>
                                    )}
                                    {job.updatedAt && (
                                      <div className="flex gap-2">
                                        <span className="text-gray-400 min-w-[60px]">Updated at:</span>
                                        <span className="flex-1">{new Date(job.updatedAt).toLocaleString('sr-RS')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}

      {!loading && filteredJobs.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          {jobs && jobs.length === 0 ? (
            <div>
              <p className="text-lg font-medium mb-2">{t('jobs.noJobsFound')}</p>
              <p className="text-sm">{t('jobs.createJob')}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">{t('jobs.noJobsMatch')}</p>
              <p className="text-sm">{t('jobs.tryAdjustingFilters')}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Edit Job Modal - Mobile Responsive */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sm:mb-4 sticky top-0 bg-gray-800 pb-2 border-b border-gray-700">
              <h2 className="text-base sm:text-xl font-bold text-white">{t('jobs.editJob')}</h2>
              <button
                onClick={() => setEditingJob(null)}
                className="text-gray-400 hover:text-white text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>
            <JobForm
              isEdit={true}
              jobData={editingJob}
              onClose={() => setEditingJob(null)}
            />
          </div>
        </div>
      )}
      
      {/* Job Details Modal */}
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
              {/* Left Column */}
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
                    {selectedJob.clientEmail && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 min-w-[100px]">Email:</span>
                        <span className="flex-1">{selectedJob.clientEmail}</span>
                      </div>
                    )}
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
                    {selectedJob.estimatedDuration && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 min-w-[100px]">Duration:</span>
                        <span className="flex-1 text-blue-400 font-medium">{selectedJob.estimatedDuration}h</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <span className="text-gray-400 min-w-[100px]">Status:</span>
                      <span className="flex-1">{selectedJob.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-400 min-w-[100px]">Priority:</span>
                      <span className="flex-1">{selectedJob.priority}</span>
                    </div>
                    {selectedJob.assignedTo && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 min-w-[100px]">Assigned to:</span>
                        <span className="flex-1">{selectedJob.assignedTo}</span>
                      </div>
                    )}
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

              {/* Right Column */}
              <div className="space-y-4">
                {/* Admin Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={() => {
                      setEditingJob(selectedJob);
                      setSelectedJob(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    {t('jobs.editJob')}
                  </button>
                  <button
                    onClick={() => handleDeleteJob(selectedJob)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('jobs.deleteJob')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobQueue;
