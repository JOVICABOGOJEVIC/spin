import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ChevronLeft, ChevronRight, Plus, 
  Calendar as CalendarIcon, Clock, X, AlertCircle
} from 'lucide-react';
import { formatDate, getWeekRange, isToday } from '../../utils/dateUtils';
import JobForm from '../forms/JobForm';
import { getCalendarJobs } from '../../actions/dashboardActions';
import moment from 'moment';

// Create half-hour time slots from 7 AM to 8 PM
const HOURS = [];
for (let hour = 7; hour < 20; hour++) {
  HOURS.push({ hour, minute: 0 });
  HOURS.push({ hour, minute: 30 });
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarView = () => {
  const dispatch = useDispatch();
  const { jobs = [] } = useSelector((state) => state.job || { jobs: [] });
  const { calendarJobs = [] } = useSelector((state) => state.dashboard || { calendarJobs: [] });
  
  const [currentDate, setCurrentDate] = useState(moment());
  const [calendarView, setCalendarView] = useState(window.innerWidth < 768 ? 'mobile' : 'month');
  const [selectedDate, setSelectedDate] = useState(moment());
  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Group jobs by date for efficient rendering
  const jobsByDate = {};
  jobs.forEach(job => {
    const dateKey = moment(job.serviceDate).format('YYYY-MM-DD');
    if (!jobsByDate[dateKey]) {
      jobsByDate[dateKey] = [];
    }
    jobsByDate[dateKey].push(job);
  });

  // Handle touch events for swipe navigation
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      navigateNext();
    } else if (isRightSwipe) {
      navigatePrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Generate calendar days for month view
  const generateMonthDays = () => {
    const startDay = moment(currentDate).startOf('month').startOf('isoWeek'); // Use isoWeek for Monday start
    const endDay = moment(currentDate).endOf('month').endOf('isoWeek');
    const days = [];
    let day = startDay.clone();

    while (day.isSameOrBefore(endDay, 'day')) {
      days.push(day.clone());
      day.add(1, 'day');
    }

    return days;
  };
  
  // Calculate the week dates based on current date
  useEffect(() => {
    const weekDates = [];
    const firstDayOfWeek = new Date(currentDate);
    const day = currentDate.day();
    
    // Set to beginning of week (Sunday)
    firstDayOfWeek.setDate(currentDate.date() - day);
    
    // Generate dates for the week
    for (let i = 0; i < 7; i++) {
      weekDates.push(new Date(firstDayOfWeek));
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() + 1);
    }
  }, [currentDate]);

  // Fetch jobs when date changes
  useEffect(() => {
    const startDate = moment(currentDate).startOf('month').startOf('week').toDate();
    const endDate = moment(currentDate).endOf('month').endOf('week').toDate();
    dispatch(getCalendarJobs(startDate, endDate));
  }, [currentDate, dispatch]);
  
  // Handle responsive view switching
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setCalendarView(prev => {
        // Only switch to mobile if we're not already in mobile view
        if (isMobile && prev !== 'mobile') return 'mobile';
        // Switch to month view if we're moving from mobile to desktop
        if (!isMobile && prev === 'mobile') return 'month';
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Navigate through calendar
  const navigatePrevious = () => {
    if (calendarView === 'month') {
      setCurrentDate(moment(currentDate).subtract(1, 'month'));
    } else if (calendarView === 'week') {
      setCurrentDate(moment(currentDate).subtract(1, 'week'));
    } else if (calendarView === 'day' || calendarView === 'mobile') {
      const newDate = moment(selectedDate).subtract(1, 'day');
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    }
  };
  
  const navigateNext = () => {
    if (calendarView === 'month') {
      setCurrentDate(moment(currentDate).add(1, 'month'));
    } else if (calendarView === 'week') {
      setCurrentDate(moment(currentDate).add(1, 'week'));
    } else if (calendarView === 'day' || calendarView === 'mobile') {
      const newDate = moment(selectedDate).add(1, 'day');
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    }
  };
  
  const goToToday = () => {
    const today = moment();
    setCurrentDate(today);
    setSelectedDate(today);
  };
  
  // Get jobs for a specific date
  const getJobsForDate = (date) => {
    const dateKey = date.format('YYYY-MM-DD');
    return jobsByDate[dateKey] || [];
  };
  
  // Determine if a day has jobs
  const hasJobs = (date) => {
    return getJobsForDate(date).length > 0;
  };
  
  // Format time slot for display in 24-hour format (07:00, 07:30, etc)
  const formatTimeSlot = (timeSlot) => {
    const { hour, minute } = timeSlot;
    const displayHour = hour.toString().padStart(2, '0');
    const displayMinute = minute === 0 ? '00' : '30';
    return `${displayHour}:${displayMinute}`;
  };

  // Format date in European format (DD/MM/YYYY)
  const formatDateEU = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle click on a time slot
  const handleTimeSlotClick = (date, timeSlot) => {
    if (isSlotBooked(date, timeSlot)) {
      setErrorMessage('This time slot is already booked');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setErrorMessage('');
    const selectedDateTime = date.clone();
    selectedDateTime.hour(timeSlot.hour).minute(timeSlot.minute);
    
    const formattedTime = `${timeSlot.hour.toString().padStart(2, '0')}:${timeSlot.minute === 0 ? '00' : '30'}`;
    
    setSelectedSlot({
      date: selectedDateTime.toDate(),
      formattedDate: selectedDateTime.format('YYYY-MM-DD'),
      formattedTime,
      displayDate: selectedDateTime.format('DD.MM.YYYY'),
      displayTime: formattedTime
    });
    
    setShowForm(true);
  };
  
  // Check if a time slot is already booked
  const isSlotBooked = (date, timeSlot) => {
    const timeSlotJobs = getJobsForTimeSlot(date, timeSlot);
    return timeSlotJobs.length > 0;
  };
  
  // Get jobs for a specific date and time slot
  const getJobsForTimeSlot = (date, timeSlot) => {
    const regularJobs = Array.isArray(jobs) ? jobs.filter(job => {
      if (!job || !job.serviceDate) return false;
      
      const jobDate = moment(job.serviceDate);
      if (!job.scheduledTime) return false;
      
      const [jobHour, jobMinute] = job.scheduledTime.split(':').map(Number);
      
      return (
        jobDate.isSame(date, 'day') &&
        jobHour === timeSlot.hour &&
        jobMinute === timeSlot.minute
      );
    }) : [];
    
    const calEvents = Array.isArray(calendarJobs) ? calendarJobs.filter(event => {
      if (!event || !event.start) return false;
      
      const eventStart = moment(event.start);
      
      return (
        eventStart.isSame(date, 'day') &&
        eventStart.hour() === timeSlot.hour &&
        eventStart.minute() === timeSlot.minute
      );
    }) : [];
    
    return [...regularJobs, ...calEvents];
  };
  
  // Close job form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedSlot(null);
    setErrorMessage('');
  };
  
  // Update isToday function to work with moment objects
  const isToday = (date) => {
    return date.isSame(moment(), 'day');
  };

  // Update isSelected function to work with moment objects
  const isSelected = (date) => {
    return selectedDate && date.isSame(selectedDate, 'day');
  };
  
  // Render the month view calendar
  const renderMonthView = () => {
    const days = generateMonthDays();
    const weeks = [];
    const daysInWeek = 7;

    for (let i = 0; i < days.length; i += daysInWeek) {
      weeks.push(days.slice(i, i + daysInWeek));
    }

    return (
      <div className="calendar-month bg-white rounded-lg">
        {/* Day headers */}
        <div className="grid grid-cols-7 text-center border-b">
          {DAYS_SHORT.map(day => (
            <div key={day} className="py-3 font-semibold text-sm text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIdx) => (
            <React.Fragment key={weekIdx}>
              {week.map((date, dayIdx) => {
                const isCurrentMonth = date.month() === currentDate.month();
                const isToday = date.isSame(moment(), 'day');
                const isSelected = date.isSame(selectedDate, 'day');
                const dateJobs = getJobsForDate(date);
                
                return (
                  <div
                    key={dayIdx}
                    className={`
                      min-h-[120px] p-2 relative cursor-pointer border-b border-r
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                      ${isToday ? 'bg-blue-50' : ''}
                      ${isSelected ? 'ring-2 ring-inset ring-blue-500' : ''}
                      hover:bg-gray-50 transition-colors
                    `}
                    onClick={() => {
                      setSelectedDate(date);
                      if (window.innerWidth < 768) {
                        setCalendarView('mobile');
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`
                        flex items-center justify-center w-7 h-7 rounded-full
                        ${isToday ? 'bg-blue-500 text-white' : ''}
                        ${isSelected && !isToday ? 'bg-blue-500/20' : ''}
                      `}>
                        <span className={`
                          text-sm font-medium
                          ${isCurrentMonth ? (isToday ? 'text-white' : 'text-gray-900') : 'text-gray-400'}
                        `}>
                          {date.date()}
                        </span>
                      </div>
                      {isCurrentMonth && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateJob(date);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dateJobs.length > 0 ? (
                        <>
                          {dateJobs.slice(0, 3).map((job, idx) => (
                            <div 
                              key={idx} 
                              className="text-xs p-1.5 rounded bg-blue-50 text-blue-700 truncate hover:bg-blue-100"
                              title={`${job.clientName} - ${job.serviceType}`}
                            >
                              {job.scheduledTime || '00:00'} - {job.clientName}
                            </div>
                          ))}
                          {dateJobs.length > 3 && (
                            <div className="text-xs text-gray-500 pl-1">
                              +{dateJobs.length - 3} more
                            </div>
                          )}
                        </>
                      ) : isCurrentMonth && (
                        <div className="text-xs text-gray-400 text-center mt-2">
                          No jobs
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  // Render the mobile card view
  const renderMobileCardView = () => {
    const selectedDateJobs = getJobsForDate(selectedDate);
    const formattedDate = selectedDate.format('dddd, MMMM D, YYYY');
    
    return (
      <div className="p-4 space-y-4">
        {/* Header with date and create button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{formattedDate}</h2>
          <button
            onClick={() => handleCreateJob(selectedDate)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </button>
        </div>

        {/* Jobs list */}
        {selectedDateJobs.length > 0 ? (
          <div className="space-y-3">
            {selectedDateJobs.map((job, index) => (
              <div
                key={job._id || index}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{job.clientName}</h3>
                    <p className="text-sm text-gray-600">{job.serviceType}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {moment(job.serviceDate).format('HH:mm')}
                  </div>
                </div>
                {job.issueDescription && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {job.issueDescription}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <CalendarIcon className="w-12 h-12 mb-3" />
            <p className="text-center">No jobs scheduled for this day</p>
          </div>
        )}

        {/* Job creation modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Create New Job</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedSlot ? `Adding job for ${selectedSlot.displayDate} at ${selectedSlot.displayTime}` : 'Select date and time'}
                  </p>
                </div>
                <button
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <JobForm
                  isEdit={false}
                  jobData={{
                    serviceDate: selectedSlot?.formattedDate || '',
                    scheduledTime: selectedSlot?.formattedTime || '',
                    displayDateTime: selectedSlot ? `${selectedSlot.displayDate} ${selectedSlot.displayTime}` : ''
                  }}
                  onClose={handleCloseForm}
                  isModal={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render the week view calendar
  const renderWeekView = () => {
    const startOfWeek = moment(selectedDate).startOf('week');
    const weekDays = Array.from({ length: 7 }, (_, i) => moment(startOfWeek).add(i, 'days'));

    return (
      <div className="week-view">
        <div className="grid grid-cols-8 border-b border-gray-600">
          {/* Time column header */}
          <div className="p-2 text-center text-xs font-medium text-gray-300">Time</div>
          
          {/* Day headers */}
          {weekDays.map(day => (
            <div 
              key={day.format('YYYY-MM-DD')} 
              className={`p-2 text-center text-xs font-medium ${
                isToday(day) ? 'bg-gray-700' : ''
              }`}
              style={{ color: 'var(--calendar-text)' }}
            >
              <div>{day.format('ddd')}</div>
              <div className="font-bold">{day.format('D')}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8">
          {/* Time slots */}
          <div className="border-r border-gray-600">
            {HOURS.map((timeSlot, idx) => (
              <div 
                key={idx} 
                className="p-2 text-xs text-gray-400 h-20 border-b border-gray-600"
              >
                {formatTimeSlot(timeSlot)}
              </div>
            ))}
          </div>

          {/* Week grid */}
          {weekDays.map(day => (
            <div key={day.format('YYYY-MM-DD')}>
              {HOURS.map((timeSlot, idx) => {
                const jobs = getJobsForTimeSlot(day, timeSlot);
                const isSlotTaken = jobs.length > 0;
                
                return (
                  <div 
                    key={idx}
                    className={`p-1 h-20 border-r border-b border-gray-600 cursor-pointer
                      ${isToday(day) ? 'bg-gray-700/30' : ''}
                      ${isSlotTaken ? 'bg-blue-900/20' : 'hover:bg-gray-700/20'}
                    `}
                    onClick={() => {
                      if (!isSlotTaken) {
                        handleTimeSlotClick(day, timeSlot);
                      }
                    }}
                  >
                    {jobs.map((job, i) => (
                      <div
                        key={i}
                        className="text-xs p-1 mb-1 rounded bg-blue-900/50 text-blue-200 truncate"
                        title={`${job.clientName} - ${job.serviceType}`}
                      >
                        {job.clientName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the day view calendar
  const renderDayView = () => {
    return (
      <div className="day-view">
        <div className="text-center mb-4">
          <div className="text-lg font-semibold" style={{ color: 'var(--calendar-text)' }}>
            {selectedDate.format('dddd, MMMM D, YYYY')}
          </div>
        </div>

        <div className="grid grid-cols-1">
          {HOURS.map((timeSlot, idx) => {
            const jobs = getJobsForTimeSlot(selectedDate, timeSlot);
            return (
              <div 
                key={idx}
                className="grid grid-cols-[100px_1fr] border-b border-gray-600"
              >
                <div className="p-2 text-xs text-gray-400">
                  {formatTimeSlot(timeSlot)}
                </div>
                <div 
                  className="p-1 min-h-[80px] cursor-pointer"
                  onClick={() => handleTimeSlotClick(selectedDate, timeSlot)}
                >
                  {jobs.map((job, i) => (
                    <div
                      key={i}
                      className="text-sm p-2 mb-1 rounded"
                      style={{
                        backgroundColor: 'var(--calendar-event-bg)',
                        color: 'var(--calendar-event-text)'
                      }}
                    >
                      <div className="font-medium">{job.title}</div>
                      {job.clientName && (
                        <div className="text-xs opacity-75">{job.clientName}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Add new function to handle creating a job for selected date
  const handleCreateJob = (date) => {
    const selectedDateTime = moment(date);
    selectedDateTime.hour(9).minute(0); // Default to 09:00
    
    const formattedTime = '09:00';
    const formattedDate = selectedDateTime.format('YYYY-MM-DD');
    const displayDate = selectedDateTime.format('DD.MM.YYYY');
    
    setSelectedSlot({
      date: selectedDateTime.toDate(),
      formattedDate,
      formattedTime,
      displayDate,
      displayTime: formattedTime
    });
    
    setShowForm(true);
  };

  // Main render
  return (
    <div 
      className="rounded-lg shadow-lg"
      style={{
        backgroundColor: 'var(--calendar-bg)',
        border: '1px solid var(--calendar-border)',
        color: 'var(--calendar-text)',
        fontFamily: 'var(--font-family)'
      }}
    >
      {/* Calendar Header */}
      <div 
        className="p-4"
        style={{
          backgroundColor: 'var(--calendar-header-bg)',
          borderBottom: '1px solid var(--calendar-border)'
        }}
      >
        {!showForm && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCalendarView('month')}
                  style={{
                    backgroundColor: calendarView === 'month' ? 'var(--calendar-selected-bg)' : 'var(--nav-bg)',
                    color: calendarView === 'month' ? 'var(--calendar-selected-text)' : 'var(--nav-text)'
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded transition-colors"
                >
                  Month
                </button>
                <button
                  onClick={() => setCalendarView('week')}
                  style={{
                    backgroundColor: calendarView === 'week' ? 'var(--calendar-selected-bg)' : 'var(--nav-bg)',
                    color: calendarView === 'week' ? 'var(--calendar-selected-text)' : 'var(--nav-text)'
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded transition-colors"
                >
                  Week
                </button>
                <button
                  onClick={() => setCalendarView('day')}
                  style={{
                    backgroundColor: calendarView === 'day' ? 'var(--calendar-selected-bg)' : 'var(--nav-bg)',
                    color: calendarView === 'day' ? 'var(--calendar-selected-text)' : 'var(--nav-text)'
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded transition-colors"
                >
                  Day
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={navigatePrevious}
                  className="p-1.5 rounded-full hover:bg-gray-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm font-medium rounded hover:bg-gray-700"
                >
                  Today
                </button>
                <button
                  onClick={navigateNext}
                  className="p-1.5 rounded-full hover:bg-gray-700"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={() => handleCreateJob(selectedDate)}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Job
              </button>
            </div>

            <div className="text-xl font-semibold text-center">
              {currentDate.format('MMMM YYYY')}
            </div>
          </>
        )}
        
        {showForm && (
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">New Job</h2>
              {selectedSlot && (
                <p className="text-sm text-gray-400 mt-1">
                  Adding job for {selectedSlot.displayDate} at {selectedSlot.displayTime}
                </p>
              )}
            </div>
            <button
              onClick={handleCloseForm}
              className="flex items-center px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Back to Calendar
            </button>
          </div>
        )}
      </div>

      {/* Calendar Content or Form */}
      <div className="p-4 w-full">
        {!showForm ? (
          <>
            {calendarView === 'month' && renderMonthView()}
            {calendarView === 'week' && renderWeekView()}
            {calendarView === 'day' && renderDayView()}
            {calendarView === 'mobile' && renderMobileCardView()}
          </>
        ) : (
          <div className="w-full">
            <JobForm
              isEdit={false}
              jobData={{
                serviceDate: selectedSlot?.formattedDate || '',
                scheduledTime: selectedSlot?.formattedTime || '',
                displayDateTime: selectedSlot ? `${selectedSlot.displayDate} ${selectedSlot.displayTime}` : ''
              }}
              onClose={handleCloseForm}
              isModal={false}
              className="w-full"
            />
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-800 text-red-200 rounded-md flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default CalendarView; 