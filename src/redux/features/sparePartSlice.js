import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

// Async thunks
export const getSpareParts = createAsyncThunk(
  'spareParts/getSpareParts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/sparePart');
      return response.data;
    } catch (error) {
      console.error('Error fetching spare parts:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || 'Greška pri učitavanju rezervnih delova');
    }
  }
);

export const createSparePart = createAsyncThunk(
  'spareParts/createSparePart',
  async (sparePartData, { rejectWithValue }) => {
    try {
      console.log('Sending spare part data:', sparePartData);
      const response = await api.post('/api/sparePart', sparePartData);
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating spare part:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: sparePartData
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Greška pri čuvanju rezervnog dela'
      );
    }
  }
);

export const updateSparePart = createAsyncThunk(
  'spareParts/updateSparePart',
  async ({ id, ...sparePartData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/sparePart/${id}`, sparePartData);
      return response.data;
    } catch (error) {
      console.error('Error updating spare part:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || 'Greška pri ažuriranju rezervnog dela');
    }
  }
);

export const deleteSparePart = createAsyncThunk(
  'spareParts/deleteSparePart',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/sparePart/${id}`);
      return id;
    } catch (error) {
      console.error('Error deleting spare part:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.response?.data?.message || 'Greška pri brisanju rezervnog dela');
    }
  }
);

const sparePartSlice = createSlice({
  name: 'spareParts',
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentSparePart: null
  },
  reducers: {
    setCurrentSparePart: (state, action) => {
      state.currentSparePart = action.payload;
    },
    clearCurrentSparePart: (state) => {
      state.currentSparePart = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get spare parts
      .addCase(getSpareParts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpareParts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getSpareParts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create spare part
      .addCase(createSparePart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSparePart.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createSparePart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update spare part
      .addCase(updateSparePart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSparePart.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateSparePart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete spare part
      .addCase(deleteSparePart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSparePart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(deleteSparePart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { setCurrentSparePart, clearCurrentSparePart } = sparePartSlice.actions;
export default sparePartSlice.reducer; 