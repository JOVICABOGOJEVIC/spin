/**
 * Format a date to a human-readable string
 * @param {Date|string} date - Date object or date string to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format time to a readable format
 * @param {string} timeString - Time string in HH:MM format
 * @param {boolean} use12Hour - Whether to use 12-hour format
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString, use12Hour = true) => {
  if (!timeString) return '';
  
  // If it's already in HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    if (!use12Hour) return timeString;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
  // If it's a Date object or ISO string
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: use12Hour
    });
  } catch (error) {
    return timeString;
  }
};

/**
 * Get start and end dates for a week containing the given date
 * @param {Date} date - Date object to get week for
 * @returns {Object} Object with start and end dates
 */
export const getWeekRange = (date) => {
  const startDate = new Date(date);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Set to beginning of week (Sunday)
  startDate.setDate(date.getDate() - day);
  startDate.setHours(0, 0, 0, 0);
  
  // Set to end of week (Saturday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

/**
 * Get start and end dates for a month containing the given date
 * @param {Date} date - Date object to get month for
 * @returns {Object} Object with start and end dates
 */
export const getMonthRange = (date) => {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return { startDate, endDate };
};

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} Whether the date is today
 */
export const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}; 