import { combineReducers } from 'redux';
import dashboardReducer from './dashboardReducer';
import jobReducer from './jobReducer';

export default combineReducers({
  dashboard: dashboardReducer,
  job: jobReducer
  // Add other reducers here as the application grows
}); 