import * as api from '../api';
import { 
  FETCH_CLIENTS_REQUEST,
  FETCH_CLIENTS_SUCCESS,
  FETCH_CLIENTS_FAILURE,
  ADD_CLIENT_REQUEST,
  ADD_CLIENT_SUCCESS,
  ADD_CLIENT_FAILURE
} from '../constants/actionTypes';

// Action Creators
export const getClients = () => async (dispatch) => {
  try {
    dispatch({ type: FETCH_CLIENTS_REQUEST });
    const { data } = await api.fetchClients();
    dispatch({ type: FETCH_CLIENTS_SUCCESS, payload: data });
  } catch (error) {
    console.error('Error fetching clients:', error);
    dispatch({ 
      type: FETCH_CLIENTS_FAILURE, 
      payload: error.response?.data?.message || 'Failed to fetch clients'
    });
  }
};

export const addClient = (clientData) => async (dispatch) => {
  try {
    dispatch({ type: ADD_CLIENT_REQUEST });
    const { data } = await api.createClient(clientData);
    dispatch({ type: ADD_CLIENT_SUCCESS, payload: data });
    return data;
  } catch (error) {
    console.error('Error adding client:', error);
    dispatch({ 
      type: ADD_CLIENT_FAILURE, 
      payload: error.response?.data?.message || 'Failed to add client'
    });
    throw error;
  }
}; 