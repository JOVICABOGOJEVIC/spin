import { combineReducers } from 'redux';
import auth from './authReducer';
import sparePart from './sparePartReducer';

export default combineReducers({
  auth,
  sparePart,
}); 