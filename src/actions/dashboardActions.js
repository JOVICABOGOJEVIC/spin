import axios from 'axios';

// Dashboard Action Types
export const FETCH_ACTIVE_JOBS_COUNT = 'FETCH_ACTIVE_JOBS_COUNT';
export const FETCH_ACTIVE_CLIENTS_COUNT = 'FETCH_ACTIVE_CLIENTS_COUNT';
export const FETCH_TOTAL_REVENUE = 'FETCH_TOTAL_REVENUE';
export const FETCH_CALENDAR_JOBS = 'FETCH_CALENDAR_JOBS';

// Helper function to get date range based on period
const getDateRangeForPeriod = (period) => {
  const now = new Date();
  let startDate, endDate, prevStartDate, prevEndDate;
  
  switch(period) {
    case 'yesterday':
      // Yesterday
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      
      startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
      
      // Day before yesterday
      prevEndDate = new Date(startDate);
      prevEndDate.setMilliseconds(-1);
      
      prevStartDate = new Date(prevEndDate);
      prevStartDate.setHours(0, 0, 0, 0);
      break;
      
    case 'lastWeek':
      // Last week
      endDate = new Date(now);
      endDate.setDate(now.getDate() - (now.getDay() + 1));
      endDate.setHours(23, 59, 59, 999);
      
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      
      // Week before last week
      prevEndDate = new Date(startDate);
      prevEndDate.setMilliseconds(-1);
      
      prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevEndDate.getDate() - 6);
      prevStartDate.setHours(0, 0, 0, 0);
      break;
      
    case 'lastMonth':
      // Last month
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      
      // Month before last month
      prevEndDate = new Date(startDate);
      prevEndDate.setDate(0);
      prevEndDate.setHours(23, 59, 59, 999);
      
      prevStartDate = new Date(prevEndDate.getFullYear(), prevEndDate.getMonth() - 1, 1, 0, 0, 0, 0);
      break;
      
    case 'lastYear':
      // Last year
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      startDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      
      // Year before last year
      prevEndDate = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
      prevStartDate = new Date(now.getFullYear() - 2, 0, 1, 0, 0, 0, 0);
      break;
      
    default:
      // Default to last 30 days
      endDate = new Date(now);
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      
      prevEndDate = new Date(startDate);
      prevEndDate.setMilliseconds(-1);
      
      prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevEndDate.getDate() - 30);
  }
  
  return {
    current: { start: startDate, end: endDate },
    previous: { start: prevStartDate, end: prevEndDate }
  };
};

// Action Creators
export const fetchActiveJobsCount = (count) => ({
  type: FETCH_ACTIVE_JOBS_COUNT,
  payload: count
});

export const fetchActiveClientsCount = (count) => ({
  type: FETCH_ACTIVE_CLIENTS_COUNT,
  payload: count
});

export const fetchTotalRevenue = (amount) => ({
  type: FETCH_TOTAL_REVENUE,
  payload: amount
});

export const fetchCalendarJobs = (jobs) => ({
  type: FETCH_CALENDAR_JOBS,
  payload: jobs
});

// Thunk action creators for API calls
export const loadDashboardMetrics = () => async (dispatch) => {
  try {
    // Sample API calls - replace with actual API endpoints
    const activeJobsResponse = await fetch('/api/metrics/active-jobs');
    const activeJobsData = await activeJobsResponse.json();
    dispatch(fetchActiveJobsCount(activeJobsData.count));

    const activeClientsResponse = await fetch('/api/metrics/active-clients');
    const activeClientsData = await activeClientsResponse.json();
    dispatch(fetchActiveClientsCount(activeClientsData.count));

    const revenueResponse = await fetch('/api/metrics/total-revenue');
    const revenueData = await revenueResponse.json();
    dispatch(fetchTotalRevenue(revenueData.amount));

    const calendarJobsResponse = await fetch('/api/metrics/calendar-jobs');
    const calendarJobsData = await calendarJobsResponse.json();
    dispatch(fetchCalendarJobs(calendarJobsData.jobs));
  } catch (error) {
    console.error('Error loading dashboard metrics:', error);
    // Optionally dispatch error actions
  }
};

// Get active jobs count
export const getActiveJobsCount = (period) => async (dispatch) => {
  try {
    const dateRanges = getDateRangeForPeriod(period);
    
    // In a real application, these would be API calls
    // For demo purposes, we're using mock data
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in real app, this would come from API
    const current = Math.floor(Math.random() * 50) + 20;
    const previous = Math.floor(Math.random() * 50) + 10;
    
    dispatch({
      type: FETCH_ACTIVE_JOBS_COUNT,
      payload: {
        current,
        previous,
        period
      }
    });
    
    return { current, previous, period };
  } catch (error) {
    console.error('Error fetching active jobs count:', error);
    
    // Still dispatch with default values to prevent UI errors
    dispatch({
      type: FETCH_ACTIVE_JOBS_COUNT,
      payload: {
        current: 0,
        previous: 0,
        period
      }
    });
    
    return { current: 0, previous: 0, period };
  }
};

// Get active clients count
export const getActiveClientsCount = (period) => async (dispatch) => {
  try {
    const dateRanges = getDateRangeForPeriod(period);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in real app, this would come from API
    const current = Math.floor(Math.random() * 30) + 15;
    const previous = Math.floor(Math.random() * 30) + 10;
    
    dispatch({
      type: FETCH_ACTIVE_CLIENTS_COUNT,
      payload: {
        current,
        previous,
        period
      }
    });
    
    return { current, previous, period };
  } catch (error) {
    console.error('Error fetching active clients count:', error);
    
    // Still dispatch with default values to prevent UI errors
    dispatch({
      type: FETCH_ACTIVE_CLIENTS_COUNT,
      payload: {
        current: 0,
        previous: 0,
        period
      }
    });
    
    return { current: 0, previous: 0, period };
  }
};

// Get total revenue
export const getTotalRevenue = (period) => async (dispatch) => {
  try {
    const dateRanges = getDateRangeForPeriod(period);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in real app, this would come from API
    const current = Math.floor(Math.random() * 50000) + 20000;
    const previous = Math.floor(Math.random() * 40000) + 15000;
    
    dispatch({
      type: FETCH_TOTAL_REVENUE,
      payload: {
        current,
        previous,
        period
      }
    });
    
    return { current, previous, period };
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    
    // Still dispatch with default values to prevent UI errors
    dispatch({
      type: FETCH_TOTAL_REVENUE,
      payload: {
        current: 0,
        previous: 0,
        period
      }
    });
    
    return { current: 0, previous: 0, period };
  }
};

// Get jobs for calendar view
export const getCalendarJobs = (startDate, endDate) => async (dispatch) => {
  try {
    // Ensure we have valid dates
    if (!startDate || !endDate) {
      throw new Error('Invalid date range');
    }

    // Get jobs from the API
    const response = await axios.get('/api/jobs', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });

    dispatch({
      type: FETCH_CALENDAR_JOBS,
      payload: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching calendar jobs:', error);
    
    // Dispatch empty array to prevent UI errors
    dispatch({
      type: FETCH_CALENDAR_JOBS,
      payload: []
    });
    
    return [];
  }
}; 