import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, Clock, User, MapPin, Edit, Trash2, X, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateJob, deleteJob, getJobs } from '../../redux/features/jobSlice';
import { toast } from 'react-toastify';
import JobForm from '../forms/JobForm';
import { getOccupiedTimeSlots, formatTimeSlot } from '../../utils/timeSlotUtils';
import axios from 'axios';
import TimeTracker from '../worker/TimeTracker';

// Helper function to parse date string as local date (avoiding timezone shift)
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  
  // Extract date parts from ISO string
  const dateOnly = dateString.split('T')[0];
  const [year, month, day] = dateOnly.split('-').map(Number);
  
  // Create date in local timezone
  return new Date(year, month - 1, day);
};

const CalendarWithDragDrop = ({ jobs = [], onJobSchedule, onJobMove, onViewModeChange, onJobSelect }) => {
  const dispatch = useDispatch();
  const { user, userType } = useSelector((state) => state.auth);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState({});
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [selectedJob, setSelectedJob] = useState(null); // For job details modal
  const [editingJob, setEditingJob] = useState(null); // For job edit modal
  const [showJobForm, setShowJobForm] = useState(false); // For job form modal

  // Notify parent component when view mode changes
  useEffect(() => {
    if (onViewModeChange) {
      onViewModeChange(viewMode);
    }
  }, [viewMode, onViewModeChange]);

  // Generate time slots for each day
  const generateTimeSlots = (date) => {
    const slots = [];
    // 00:00 to 24:00 (full day), 30 min intervals
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push({
          id: `${date.toISOString().split('T')[0]}-${hour}-${minute}`,
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          date: date.toISOString().split('T')[0],
          hour,
          minute
        });
      }
    }
    return slots;
  };

  // Get jobs for a specific date - sorted chronologically by time
  const getJobsForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log('Calendar checking for date:', dateStr);
    
    const filteredJobs = jobs.filter(job => {
      if (!job.serviceDate) return false;
      if (job.status === 'Completed') return false; // Exclude completed jobs
      
      // Parse job date as local date
      const jobDate = parseLocalDate(job.serviceDate);
      if (!jobDate) return false;
      
      const jobYear = jobDate.getFullYear();
      const jobMonth = String(jobDate.getMonth() + 1).padStart(2, '0');
      const jobDay = String(jobDate.getDate()).padStart(2, '0');
      const jobDateStr = `${jobYear}-${jobMonth}-${jobDay}`;
      
      console.log('Job serviceDate (raw):', job.serviceDate);
      console.log('Job date (parsed):', jobDateStr);
      console.log('Match:', jobDateStr === dateStr);
      
      return jobDateStr === dateStr;
    });
    
    // Sort jobs by scheduled time (chronologically)
    return filteredJobs.sort((a, b) => {
      const timeA = a.scheduledTime || '00:00';
      const timeB = b.scheduledTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  };

  // Helper: Convert time to minutes since midnight
  const timeToMinutes = (hour, minute) => {
    return hour * 60 + minute;
  };

  // Get jobs for a specific time slot - checks if slot falls within job duration
  const getJobsForTimeSlot = (date, hour, minute) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const slotStartMinutes = timeToMinutes(hour, minute);
    const slotEndMinutes = slotStartMinutes + 30; // Each slot is 30 minutes
    
    return jobs.filter(job => {
      if (!job.serviceDate || !job.scheduledTime) return false;
      if (job.status === 'Completed') return false; // Exclude completed jobs
      
      // Parse job date as local date
      const jobDate = parseLocalDate(job.serviceDate);
      if (!jobDate) return false;
      
      const jobYear = jobDate.getFullYear();
      const jobMonth = String(jobDate.getMonth() + 1).padStart(2, '0');
      const jobDay = String(jobDate.getDate()).padStart(2, '0');
      const jobDateStr = `${jobYear}-${jobMonth}-${jobDay}`;
      
      // Check if same date
      if (jobDateStr !== dateStr) return false;
      
      // Get job start and end times
      const [jobHour, jobMinute] = job.scheduledTime.split(':').map(Number);
      const jobStartMinutes = timeToMinutes(jobHour, jobMinute);
      
      // If no duration, assume 1 hour
      const duration = job.estimatedDuration || 1;
      const jobEndMinutes = jobStartMinutes + (duration * 60);
      
      // Check if slot overlaps with job time range
      // Slot overlaps if: slot starts before job ends AND slot ends after job starts
      return slotStartMinutes < jobEndMinutes && slotEndMinutes > jobStartMinutes;
    });
  };

  // Handle drag end
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // If dropped on a time slot
    if (destination.droppableId.startsWith('time-slot-')) {
      const [, , dateStr, hour, minute] = destination.droppableId.split('-');
      const scheduledDate = new Date(dateStr);
      const scheduledTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      
      onJobSchedule(draggableId, scheduledDate, scheduledTime);
    }
  };

  // Handle job click - open details modal
  const handleJobClick = (job, e) => {
    e.stopPropagation();
    console.log('🔍 Job clicked:', job);
    console.log('👤 User type from Redux:', userType);
    console.log('👤 User:', user);
    
    // If onJobSelect is provided (WorkerDashboard), use that instead of local modal
    if (onJobSelect) {
      onJobSelect(job);
    } else {
      // Only open local modal if no onJobSelect callback (AdminDashboard)
      setSelectedJob(job);
    }
  };

  // Handle job edit
  const handleEditJob = (job) => {
    setSelectedJob(null);
    setEditingJob(job);
  };

  // Handle job delete
  const handleDeleteJob = (job) => {
    if (window.confirm(`Da li ste sigurni da želite obrisati posao za klijenta "${job.clientName}"?`)) {
      dispatch(deleteJob(job._id));
      setSelectedJob(null);
      toast.success('Posao uspešno obrisan');
    }
  };

  // Handle status action for workers
  const handleStatusAction = async (status, jobId, clientAddress) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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
        'on_the_road': 'U putu ka stranci',
        'at_client': 'Kod stranke',
        'completed': 'Završeno'
      };
      
      toast.success(`Status ažuriran: ${statusLabels[status]}`);
      
      // Refresh jobs to show updated status
      const businessType = user?.result?.businessType || 'Home Appliance Technician';
      dispatch(getJobs(businessType));
      
      setSelectedJob(null); // Close modal after action
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Greška pri ažuriranju statusa');
    }
  };

  // Generate calendar days based on view mode
  const generateCalendarDays = () => {
    if (viewMode === 'day') {
      // Just current day
      return [new Date(currentDate)];
    } else if (viewMode === 'week') {
      // Current week (7 days) - starting from Monday
      const startDate = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go to Monday
      startDate.setDate(currentDate.getDate() + diff);
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push(date);
      }
      return days;
    } else {
      // Month view (full calendar grid - 35 or 42 days) - starting from Monday
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const startDate = new Date(firstDay);
      const firstDayOfWeek = firstDay.getDay();
      const diff = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
      startDate.setDate(firstDay.getDate() + diff);
      
      const days = [];
      for (let i = 0; i < 35; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push(date);
      }
      return days;
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get display title based on view mode
  const getDisplayTitle = () => {
    if (viewMode === 'day') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(currentDate.getDate() + diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startMonth = monthNames[startOfWeek.getMonth()];
      const endMonth = monthNames[endOfWeek.getMonth()];
      const startDay = startOfWeek.getDate();
      const endDay = endOfWeek.getDate();
      const year = currentDate.getFullYear();
      
      if (startMonth === endMonth) {
        return `${startMonth} ${startDay}-${endDay}, ${year}`;
      } else {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
      }
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-2 sm:p-4 h-full">
      {/* Header with view mode buttons and navigation - Compact */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
        <h2 className="text-sm sm:text-base font-semibold text-white">
          {getDisplayTitle()}
        </h2>
        
        <div className="flex gap-1 flex-wrap">
          {/* View Mode Buttons */}
          <div className="flex gap-0.5 border border-gray-600 rounded">
            <button
              onClick={() => setViewMode('day')}
              className={`px-2 py-0.5 text-xs rounded-l ${
                viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2 py-0.5 text-xs ${
                viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-2 py-0.5 text-xs rounded-r ${
                viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Month
            </button>
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="px-2 py-0.5 text-xs bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2 py-0.5 text-xs bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="px-2 py-0.5 text-xs bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            →
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Week View - Special Layout: 6 days in 2 rows, Sunday wide below */}
        {viewMode === 'week' ? (
          <div className="space-y-2">
            {/* First 6 days - 2 rows of 3 */}
            <div className="grid grid-cols-3 gap-2">
              {calendarDays.slice(0, 6).map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                const dayJobs = getJobsForDate(date);

                return (
                  <div key={index} className="flex flex-col">
                    {/* Day Name */}
                    <div className="p-1 text-center text-xs font-medium text-gray-400 bg-gray-800 rounded-t">
                      {dayNames[index]}
                    </div>
                    {/* Day Content */}
                    <div
                      className={`min-h-32 p-2 border border-gray-600 rounded-b bg-gray-700 ${
                        isToday ? 'ring-2 ring-blue-500' : ''
                      } ${isSelected ? 'bg-blue-600' : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      {/* Date Header */}
                      <div className="text-sm text-gray-300 mb-2 font-medium">
                        {monthNamesShort[date.getMonth()]} {date.getDate()}
                      </div>
                      
                      {/* Jobs List */}
                      <div className="space-y-1.5 flex flex-col">
                        {dayJobs.slice(0, 5).map(job => (
                          <div
                            key={job._id}
                            onClick={(e) => handleJobClick(job, e)}
                            className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2 ${
                              job.isEmergency === 'yes' 
                                ? 'bg-red-100 text-red-900' 
                                : 'bg-white text-blue-900'
                            }`}
                          >
                            <span className="font-semibold text-[11px] text-blue-700 whitespace-nowrap">
                              {job.scheduledTime || 'No time'}
                            </span>
                            <span className="text-[10px] truncate flex-1">
                              {job.clientAddress || job.clientName}
                            </span>
                          </div>
                        ))}
                        {dayJobs.length > 5 && (
                          <div className="text-xs text-gray-400 pl-1">
                            +{dayJobs.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sunday - Wide, short row below */}
            {calendarDays[6] && (() => {
              const date = calendarDays[6];
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const dayJobs = getJobsForDate(date);

              return (
                <div className="flex flex-col">
                  {/* Day Name */}
                  <div className="p-1 text-center text-xs font-medium text-gray-400 bg-gray-800 rounded-t">
                    {dayNames[6]}
                  </div>
                  {/* Day Content - Wide and Short */}
                  <div
                    className={`min-h-20 p-2 border border-gray-600 rounded-b bg-gray-700 ${
                      isToday ? 'ring-2 ring-blue-500' : ''
                    } ${isSelected ? 'bg-blue-600' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    {/* Date Header */}
                    <div className="text-sm text-gray-300 mb-2 font-medium inline-block mr-4">
                      {monthNamesShort[date.getMonth()]} {date.getDate()}
                    </div>
                    
                    {/* Jobs List - Horizontal flex */}
                    <div className="flex gap-2 flex-wrap">
                      {dayJobs.slice(0, 8).map(job => (
                        <div
                          key={job._id}
                          onClick={(e) => handleJobClick(job, e)}
                          className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center gap-2 ${
                            job.isEmergency === 'yes' 
                              ? 'bg-red-100 text-red-900' 
                              : 'bg-white text-blue-900'
                          }`}
                        >
                          <span className="font-semibold text-[11px] text-blue-700">
                            {job.scheduledTime || 'No time'}
                          </span>
                          <span className="text-[10px]">
                            {job.clientAddress || job.clientName}
                          </span>
                        </div>
                      ))}
                      {dayJobs.length > 8 && (
                        <div className="text-xs text-gray-400">
                          +{dayJobs.length - 8} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          /* Day and Month Views - Original Layout */
          <>
            {/* Day Names Header */}
            {viewMode !== 'day' && (
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
            )}

            {/* Calendar Grid */}
            <div className={`grid ${
              viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'
            } gap-2`}>
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                const dayJobs = getJobsForDate(date);

                return (
                  <div
                    key={index}
                    className={`p-2 border border-gray-600 rounded ${
                      isCurrentMonth || viewMode !== 'month' ? 'bg-gray-700' : 'bg-gray-800'
                    } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                      isSelected ? 'bg-blue-600' : ''
                    } ${viewMode !== 'day' ? 'min-h-20' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    {/* Date Header */}
                    <div className={`${viewMode === 'day' ? 'text-lg' : 'text-sm'} text-gray-300 mb-2 font-medium`}>
                      {viewMode === 'day' ? dayNames[date.getDay()] + ', ' : ''}{monthNamesShort[date.getMonth()]} {date.getDate()}
                    </div>
                    
                    {/* Jobs List */}
                    <div className="space-y-1 flex flex-col">
                      {/* Show all jobs in month view, limited in day view */}
                      {dayJobs.slice(0, viewMode === 'day' ? 20 : undefined).map(job => (
                        <div
                          key={job._id}
                          onClick={(e) => handleJobClick(job, e)}
                          className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                            job.isEmergency === 'yes' 
                              ? 'bg-red-100 text-red-900' 
                              : 'bg-white text-blue-900'
                          }`}
                        >
                          {viewMode === 'day' ? (
                            // Day view - compact horizontal
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-blue-700 whitespace-nowrap">
                                {job.scheduledTime || 'No time'}
                                {job.estimatedDuration && (
                                  <span className="text-[9px] text-blue-500 ml-1">({job.estimatedDuration}h)</span>
                                )}
                              </span>
                              <span className="truncate flex-1">
                                {job.clientAddress || job.clientName}
                              </span>
                              <span className="text-[10px] text-gray-600 whitespace-nowrap">
                                {job.priority}
                              </span>
                            </div>
                          ) : (
                            // Month view - show all, compact
                            <div className="truncate">
                              {job.scheduledTime ? `${job.scheduledTime}` : ''}
                              {job.estimatedDuration && <span className="text-blue-600">({job.estimatedDuration}h)</span>}
                              {job.scheduledTime && ' - '}
                              {job.clientAddress || job.clientName}
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Only show "more" indicator in day view */}
                      {viewMode === 'day' && dayJobs.length > 20 && (
                        <div className="text-xs text-gray-400 pl-1">
                          +{dayJobs.length - 20} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Time slots grid for day view - 30min intervals, 00:00-24:00 */}
        {viewMode === 'day' && calendarDays[0] && (
          <div className="mt-6 bg-gray-800 rounded-lg p-3">
            <h3 className="text-base font-medium text-white mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Termini za {calendarDays[0].toLocaleDateString('sr-RS')} (00:00 - 24:00)
            </h3>
            
            {/* All time slots in one grid */}
            <div className="grid grid-cols-12 sm:grid-cols-16 md:grid-cols-24 lg:grid-cols-24 xl:grid-cols-48 gap-1">
              {generateTimeSlots(calendarDays[0]).map(slot => {
                const slotJobs = getJobsForTimeSlot(calendarDays[0], slot.hour, slot.minute);
                const isOccupied = slotJobs.length > 0;

                return (
                  <Droppable key={slot.id} droppableId={`time-slot-${slot.id}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-1 rounded text-center text-[9px] sm:text-[10px] transition-colors ${
                          isOccupied 
                            ? 'bg-red-600 text-white cursor-not-allowed' 
                            : snapshot.isDraggingOver 
                              ? 'bg-green-500 text-white' 
                              : 'bg-blue-600 text-white hover:bg-blue-500 cursor-pointer'
                        }`}
                        title={isOccupied ? `Zauzeto: ${slotJobs[0].clientName}` : 'Slobodan termin'}
                      >
                        <div className="font-semibold leading-tight">{slot.time}</div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
            
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Slobodno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span>Zauzeto</span>
              </div>
            </div>
          </div>
        )}
      </DragDropContext>

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
                  Edit Job
                </button>
                <button
                  onClick={() => handleDeleteJob(selectedJob)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Job
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-800 pb-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Edit Job</h2>
              <button
                onClick={() => setEditingJob(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
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

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowJobForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <JobForm
              onClose={() => setShowJobForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWithDragDrop;
