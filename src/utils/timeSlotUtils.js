/**
 * Utility functions for time slot management and overlap detection
 */

/**
 * Parse time string to minutes since midnight
 * @param {string} timeString - Time in format "HH:MM"
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Add hours to a time string
 * @param {string} timeString - Time in format "HH:MM"
 * @param {number} hours - Number of hours to add
 * @returns {string} New time in format "HH:MM"
 */
export const addHoursToTime = (timeString, hours) => {
  if (!timeString || !hours) return timeString;
  
  const totalMinutes = timeToMinutes(timeString) + (hours * 60);
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

/**
 * Check if two time slots overlap
 * @param {object} slot1 - First time slot {start: "HH:MM", end: "HH:MM"}
 * @param {object} slot2 - Second time slot {start: "HH:MM", end: "HH:MM"}
 * @returns {boolean} True if slots overlap
 */
export const doTimeSlotsOverlap = (slot1, slot2) => {
  const start1 = timeToMinutes(slot1.start);
  const end1 = timeToMinutes(slot1.end);
  const start2 = timeToMinutes(slot2.start);
  const end2 = timeToMinutes(slot2.end);
  
  // Check if slots overlap
  return (start1 < end2 && end1 > start2);
};

/**
 * Check if a job overlaps with existing jobs on the same date
 * @param {object} newJob - New job to check {serviceDate, scheduledTime, estimatedDuration, assignedTo}
 * @param {array} existingJobs - Array of existing jobs
 * @param {string} excludeJobId - Optional job ID to exclude from check (for editing)
 * @returns {object} {hasOverlap: boolean, overlappingJobs: array}
 */
export const checkJobOverlap = (newJob, existingJobs, excludeJobId = null) => {
  if (!newJob.serviceDate || !newJob.scheduledTime || !newJob.estimatedDuration) {
    return { hasOverlap: false, overlappingJobs: [] };
  }
  
  const newJobDate = new Date(newJob.serviceDate).toDateString();
  const newJobStartTime = newJob.scheduledTime;
  const newJobEndTime = addHoursToTime(newJobStartTime, newJob.estimatedDuration);
  
  const overlappingJobs = existingJobs.filter(job => {
    // Skip the job being edited
    if (excludeJobId && job._id === excludeJobId) {
      return false;
    }
    
    // Skip jobs without date, time, or duration
    if (!job.serviceDate || !job.scheduledTime || !job.estimatedDuration) {
      return false;
    }
    
    // Check if same date
    const jobDate = new Date(job.serviceDate).toDateString();
    if (jobDate !== newJobDate) {
      return false;
    }
    
    // Check if same worker (optional - only check if assignedTo is specified)
    if (newJob.assignedTo && job.assignedTo && newJob.assignedTo !== job.assignedTo) {
      return false;
    }
    
    // Check time overlap
    const jobStartTime = job.scheduledTime;
    const jobEndTime = addHoursToTime(jobStartTime, job.estimatedDuration);
    
    return doTimeSlotsOverlap(
      { start: newJobStartTime, end: newJobEndTime },
      { start: jobStartTime, end: jobEndTime }
    );
  });
  
  return {
    hasOverlap: overlappingJobs.length > 0,
    overlappingJobs
  };
};

/**
 * Get occupied time slots for a specific date and worker
 * @param {string} date - Date string
 * @param {string} workerId - Worker ID (optional)
 * @param {array} jobs - Array of jobs
 * @returns {array} Array of occupied time slots {start, end, jobId, clientName}
 */
export const getOccupiedTimeSlots = (date, workerId, jobs) => {
  const targetDate = new Date(date).toDateString();
  
  return jobs
    .filter(job => {
      // Must have date and time - duration is optional for display
      if (!job.serviceDate || !job.scheduledTime) {
        return false;
      }
      
      const jobDate = new Date(job.serviceDate).toDateString();
      if (jobDate !== targetDate) {
        return false;
      }
      
      if (workerId && job.assignedTo !== workerId) {
        return false;
      }
      
      return true;
    })
    .map(job => {
      // If no duration is specified, assume 1 hour default
      const duration = job.estimatedDuration || 1;
      return {
        start: job.scheduledTime,
        end: addHoursToTime(job.scheduledTime, duration),
        jobId: job._id,
        clientName: job.clientName,
        estimatedDuration: job.estimatedDuration || null, // Keep original value (null if not set)
        priority: job.priority
      };
    })
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
};

/**
 * Format time slot for display
 * @param {string} start - Start time "HH:MM"
 * @param {string} end - End time "HH:MM"
 * @returns {string} Formatted string "HH:MM - HH:MM"
 */
export const formatTimeSlot = (start, end) => {
  return `${start} - ${end}`;
};

/**
 * Check if a time slot is available
 * @param {string} date - Date string
 * @param {string} startTime - Start time "HH:MM"
 * @param {number} duration - Duration in hours
 * @param {string} workerId - Worker ID (optional)
 * @param {array} jobs - Array of jobs
 * @param {string} excludeJobId - Job ID to exclude from check
 * @returns {boolean} True if slot is available
 */
export const isTimeSlotAvailable = (date, startTime, duration, workerId, jobs, excludeJobId = null) => {
  const result = checkJobOverlap(
    {
      serviceDate: date,
      scheduledTime: startTime,
      estimatedDuration: duration,
      assignedTo: workerId
    },
    jobs,
    excludeJobId
  );
  
  return !result.hasOverlap;
};

