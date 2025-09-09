import {
  FETCH_SPARE_PARTS,
  CREATE_SPARE_PART,
  UPDATE_SPARE_PART,
  DELETE_SPARE_PART,
} from '../constants/actionTypes';

const initialState = {
  spareParts: [],
  loading: false,
  error: null
};

const sparePartReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SPARE_PARTS:
      return {
        ...state,
        spareParts: action.payload,
        loading: false
      };
    case CREATE_SPARE_PART:
      return {
        ...state,
        spareParts: [...state.spareParts, action.payload]
      };
    case UPDATE_SPARE_PART:
      return {
        ...state,
        spareParts: state.spareParts.map((sparePart) =>
          sparePart._id === action.payload._id ? action.payload : sparePart
        )
      };
    case DELETE_SPARE_PART:
      return {
        ...state,
        spareParts: state.spareParts.filter((sparePart) => sparePart._id !== action.payload)
      };
    default:
      return state;
  }
};

export default sparePartReducer; 