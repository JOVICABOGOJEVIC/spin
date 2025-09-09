import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../api';

// Async thunks
export const getWorkers = createAsyncThunk(
  'workers/getWorkers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchWorkers();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching workers');
    }
  }
);

export const getWorker = createAsyncThunk(
  'workers/getWorker',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchWorker(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching worker');
    }
  }
);

export const createWorker = createAsyncThunk(
  'workers/createWorker',
  async ({ workerData }, { rejectWithValue }) => {
    try {
      const { data } = await api.createWorker(workerData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add worker');
    }
  }
);

export const updateWorker = createAsyncThunk(
  'workers/updateWorker',
  async ({ id, updatedWorkerData }, { rejectWithValue }) => {
    try {
      const { data } = await api.updateWorker(id, updatedWorkerData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update worker');
    }
  }
);

export const deleteWorker = createAsyncThunk(
  'workers/deleteWorker',
  async ({ id }, { rejectWithValue }) => {
    try {
      await api.deleteWorker(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete worker');
    }
  }
);

const workerSlice = createSlice({
  name: 'worker',
  initialState: {
    workers: [],
    worker: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentWorker: (state, action) => {
      state.worker = action.payload;
    },
    clearCurrentWorker: (state) => {
      state.worker = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get workers
      .addCase(getWorkers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWorkers.fulfilled, (state, action) => {
        state.loading = false;
        state.workers = action.payload;
        state.error = null;
      })
      .addCase(getWorkers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get single worker
      .addCase(getWorker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWorker.fulfilled, (state, action) => {
        state.loading = false;
        state.worker = action.payload;
        state.error = null;
      })
      .addCase(getWorker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create worker
      .addCase(createWorker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorker.fulfilled, (state, action) => {
        state.loading = false;
        state.workers.push(action.payload);
        state.error = null;
      })
      .addCase(createWorker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update worker
      .addCase(updateWorker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorker.fulfilled, (state, action) => {
        state.loading = false;
        state.workers = state.workers.map((worker) =>
          worker._id === action.payload._id ? action.payload : worker
        );
        state.worker = action.payload;
        state.error = null;
      })
      .addCase(updateWorker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete worker
      .addCase(deleteWorker.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorker.fulfilled, (state, action) => {
        state.loading = false;
        state.workers = state.workers.filter((worker) => worker._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteWorker.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentWorker, clearCurrentWorker } = workerSlice.actions;
export default workerSlice.reducer; 