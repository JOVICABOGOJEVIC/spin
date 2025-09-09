import {
  FETCH_ACTIVE_JOBS_COUNT,
  FETCH_ACTIVE_CLIENTS_COUNT,
  FETCH_TOTAL_REVENUE,
  FETCH_CALENDAR_JOBS
} from '../actions/dashboardActions';

const initialState = {
  activeJobsCount: 0,
  activeClientsCount: 0,
  totalRevenue: 0,
  calendarJobs: [],
  loading: true,
  error: null
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ACTIVE_JOBS_COUNT:
      return {
        ...state,
        activeJobsCount: action.payload,
        loading: false
      };
    
    case FETCH_ACTIVE_CLIENTS_COUNT:
      return {
        ...state,
        activeClientsCount: action.payload,
        loading: false
      };
    
    case FETCH_TOTAL_REVENUE:
      return {
        ...state,
        totalRevenue: action.payload,
        loading: false
      };
    
    case FETCH_CALENDAR_JOBS:
      return {
        ...state,
        calendarJobs: action.payload,
        loading: false
      };
    
    default:
      return state;
  }
};

export default dashboardReducer; 