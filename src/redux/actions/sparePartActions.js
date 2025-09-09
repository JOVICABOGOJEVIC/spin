import * as api from '../../api';
import {
  FETCH_SPARE_PARTS,
  CREATE_SPARE_PART,
  UPDATE_SPARE_PART,
  DELETE_SPARE_PART,
} from '../constants/actionTypes';

// Action Creators
export const getSpareParts = () => async (dispatch) => {
  try {
    console.log('Fetching spare parts...');
    const { data } = await api.fetchSpareParts();
    console.log('Fetched spare parts:', data);
    dispatch({ type: FETCH_SPARE_PARTS, payload: data });
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    throw error;
  }
};

export const addSparePart = (sparePartData) => async (dispatch) => {
  try {
    console.log('Creating spare part with data:', sparePartData);
    const { data } = await api.createSparePart(sparePartData);
    console.log('Created spare part:', data);
    dispatch({ type: CREATE_SPARE_PART, payload: data });
    // After creating, fetch the updated list
    dispatch(getSpareParts());
    return data;
  } catch (error) {
    console.error('Error creating spare part:', error);
    throw error;
  }
};

export const updateSparePart = (id, sparePartData) => async (dispatch) => {
  try {
    console.log('Updating spare part with id:', id, 'data:', sparePartData);
    const { data } = await api.updateSparePart(id, sparePartData);
    console.log('Updated spare part:', data);
    dispatch({ type: UPDATE_SPARE_PART, payload: data });
    // After updating, fetch the updated list
    dispatch(getSpareParts());
    return data;
  } catch (error) {
    console.error('Error updating spare part:', error);
    throw error;
  }
};

export const deleteSparePart = (id) => async (dispatch) => {
  try {
    console.log('Deleting spare part with id:', id);
    await api.deleteSparePart(id);
    console.log('Deleted spare part with id:', id);
    dispatch({ type: DELETE_SPARE_PART, payload: id });
    // After deleting, fetch the updated list
    dispatch(getSpareParts());
  } catch (error) {
    console.error('Error deleting spare part:', error);
    throw error;
  }
}; 