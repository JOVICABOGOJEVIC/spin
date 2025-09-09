import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api";
import { toast } from "react-toastify";

// Async thunks
export const createJob = createAsyncThunk(
  "job/createJob",
  async ({ jobData }, { rejectWithValue }) => {
    try {
      const response = await api.createJob(jobData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getJobs = createAsyncThunk(
  "job/getJobs",
  async (businessType, { rejectWithValue }) => {
    try {
      const response = await api.getJobs(businessType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
  async ({ id, updatedJobData }, { rejectWithValue }) => {
    try {
      const response = await api.updateJob(id, updatedJobData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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

// Generate mock data for testing
const generateMockJobs = (businessType) => {
  const statuses = ['Received', 'Diagnosing', 'Waiting for Parts', 'In Repair', 'Completed', 'Delivered', 'Cancelled'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const clients = [
    { name: 'Client 1', phone: '111-222-3333', address: '123 Main St' },
    { name: 'Client 2', phone: '444-555-6666', address: '456 Oak Ave' },
    { name: 'Client 3', phone: '777-888-9999', address: '789 Pine Blvd' }
  ];
  
  let deviceTypes = ['Refrigerator', 'Washing Machine', 'Dryer', 'Dishwasher', 'Oven']; // Default for appliance tech
  
  switch (businessType) {
    case 'Electrician':
      deviceTypes = ['Electrical Panel', 'Wiring', 'Lighting', 'Outlets', 'Circuit Breaker'];
      break;
    case 'Plumber':
      deviceTypes = ['Pipes', 'Faucets', 'Toilet', 'Sink', 'Drain'];
      break;
    case 'Auto Mechanic':
      deviceTypes = ['Car', 'SUV', 'Truck', 'Van', 'Motorcycle'];
      break;
    case 'HVAC Technician':
      deviceTypes = ['Air Conditioner', 'Heater', 'Furnace', 'Heat Pump', 'Ductwork'];
      break;
    case 'Elevator Technician':
      deviceTypes = ['Passenger', 'Freight', 'Residential', 'Hydraulic', 'Traction'];
      break;
    case 'IT Technician':
      deviceTypes = ['Desktop', 'Laptop', 'Server', 'Network', 'Printer'];
      break;
    default:
      // Use default device types
      break;
  }
  
  const brands = ['Samsung', 'LG', 'Whirlpool', 'GE', 'Bosch', 'Maytag', 'KitchenAid', 'Frigidaire', 'Kenmore'];
  
  const mockJobs = [];
  
  for (let i = 0; i < 10; i++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const isWarranty = Math.random() > 0.7;
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const job = {
      _id: `job-${i + 1}`,
      clientName: client.name,
      clientPhone: client.phone,
      clientAddress: client.address,
      deviceType: deviceType,
      brand: brands[Math.floor(Math.random() * brands.length)],
      model: `Model-${Math.floor(Math.random() * 1000)}`,
      serialNumber: `SN-${Math.floor(Math.random() * 100000)}`,
      issueDescription: `Problem with ${deviceType} that requires servicing`,
      hasWarranty: isWarranty,
      warrantyExpiration: isWarranty ? new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString() : null,
      priority: priority,
      status: status,
      serviceDate: new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: ['Alex', 'Brian', 'Chris', 'David', 'Emma'][Math.floor(Math.random() * 5)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    };
    
    mockJobs.push(job);
  }
  
  return mockJobs;
};

// Load Mock Jobs
export const loadMockJobs = createAsyncThunk(
  "job/loadMockJobs",
  async (businessType = "General", { rejectWithValue }) => {
    try {
      const mockJobs = generateMockJobs(businessType || "General");
      return mockJobs;
    } catch (error) {
      console.error("Error generating mock jobs:", error);
      return rejectWithValue(error.message || "Failed to generate mock jobs");
    }
  }
);

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