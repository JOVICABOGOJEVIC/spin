import {
  FETCH_CLIENTS_REQUEST,
  FETCH_CLIENTS_SUCCESS,
  FETCH_CLIENTS_FAILURE,
  ADD_CLIENT_REQUEST,
  ADD_CLIENT_SUCCESS,
  ADD_CLIENT_FAILURE
} from '../constants/actionTypes';

const initialState = {
  list: [],
  loading: false,
  error: null
};

const clientReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CLIENTS_REQUEST:
    case ADD_CLIENT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_CLIENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: action.payload,
        error: null
      };

    case ADD_CLIENT_SUCCESS:
      return {
        ...state,
        loading: false,
        list: [...state.list, action.payload],
        error: null
      };

    case FETCH_CLIENTS_FAILURE:
    case ADD_CLIENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default clientReducer; 