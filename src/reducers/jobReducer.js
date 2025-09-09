// Define initial state
const initialState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null
};

// Job reducer
const jobReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_JOBS':
      return {
        ...state,
        jobs: action.payload,
        loading: false
      };
      
    case 'CREATE_JOB':
      return {
        ...state,
        jobs: [...state.jobs, action.payload],
        loading: false
      };
      
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job => 
          job._id === action.payload._id ? action.payload : job
        ),
        loading: false
      };
      
    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter(job => job._id !== action.payload),
        loading: false
      };
      
    case 'SET_CURRENT_JOB':
      return {
        ...state,
        currentJob: state.jobs.find(job => job._id === action.payload) || null
      };
      
    case 'CLEAR_CURRENT_JOB':
      return {
        ...state,
        currentJob: null
      };
      
    case 'LOAD_MOCK_JOBS':
      return {
        ...state,
        jobs: action.payload || [],
        loading: false
      };
      
    case 'JOB_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: true
      };
      
    default:
      return state;
  }
};

export default jobReducer; 