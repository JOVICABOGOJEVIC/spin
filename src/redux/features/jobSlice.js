import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api";
import { toast } from "react-toastify";

// Async thunks
export const createJob = createAsyncThunk(
  "job/createJob",
  async ({ jobData }, { rejectWithValue }) => {
    try {
      console.log('🎯 createJob thunk called with jobData:', jobData);
      console.log('🎯 Current localStorage profile:', localStorage.getItem('profile'));
      
      const response = await api.createJob(jobData);
      console.log('✅ createJob API response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ createJob API error:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error response:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const getJobs = createAsyncThunk(
  "job/getJobs",
  async (businessType, { rejectWithValue }) => {
    try {
      console.log('getJobs thunk called with businessType:', businessType);
      const response = await api.getJobs(businessType);
      console.log('getJobs API response:', response);
      return response.data;
    } catch (error) {
      console.error('getJobs API error:', error);
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const getJob = createAsyncThunk(
  "job/getJob",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getJob(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateJob = createAsyncThunk(
  "job/updateJob",
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      if (!id) {
        console.error('❌ updateJob called with undefined id');
        return rejectWithValue({ message: 'Job ID is required' });
      }
      const response = await api.updateJob({ id, jobData });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update job' });
    }
  }
);

export const deleteJob = createAsyncThunk(
  "job/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.deleteJob(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// No more mock data - using real API

const jobSlice = createSlice({
  name: "job",
  initialState: {
    jobs: [],
    currentJob: null,
    loading: false,
    error: "",
  },
  reducers: {
    setCurrentJob: (state, action) => {
      const jobId = action.payload;
      state.currentJob = state.jobs.find(job => job._id === jobId) || null;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    }
  },
  extraReducers: (builder) => {
    // Create job
    builder.addCase(createJob.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(createJob.fulfilled, (state, action) => {
      state.loading = false;
      state.jobs.push(action.payload);
    });
    builder.addCase(createJob.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
      toast.error(action.payload?.message || "An error occurred");
    });
    
    // Get all jobs
    builder.addCase(getJobs.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(getJobs.fulfilled, (state, action) => {
      state.loading = false;
      state.jobs = action.payload;
    });
    builder.addCase(getJobs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
    });
    
    // Get single job
    builder.addCase(getJob.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(getJob.fulfilled, (state, action) => {
      state.loading = false;
      state.currentJob = action.payload;
    });
    builder.addCase(getJob.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
    });
    
    // Update job
    builder.addCase(updateJob.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(updateJob.fulfilled, (state, action) => {
      state.loading = false;
      const updatedJobIndex = state.jobs.findIndex(
        (job) => job._id === action.payload._id
      );
      if (updatedJobIndex !== -1) {
        state.jobs[updatedJobIndex] = action.payload;
      }
      state.currentJob = action.payload;
    });
    builder.addCase(updateJob.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
      toast.error(action.payload?.message || "An error occurred");
    });
    
    // Delete job
    builder.addCase(deleteJob.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(deleteJob.fulfilled, (state, action) => {
      state.loading = false;
      state.jobs = state.jobs.filter((job) => job._id !== action.meta.arg);
      if (state.currentJob && state.currentJob._id === action.meta.arg) {
        state.currentJob = null;
      }
    });
    builder.addCase(deleteJob.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
      toast.error(action.payload?.message || "An error occurred");
    });
  },
});

export const { setCurrentJob, clearCurrentJob } = jobSlice.actions;

export default jobSlice.reducer; 