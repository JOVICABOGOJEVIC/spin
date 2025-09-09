import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api";
import { toast } from "react-toastify";

// Async thunks
export const createModel = createAsyncThunk(
  "model/createModel",
  async ({ modelData }, { rejectWithValue }) => {
    try {
      const response = await api.createModel(modelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getModels = createAsyncThunk(
  "model/getModels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getModels();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getModel = createAsyncThunk(
  "model/getModel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getModel(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateModel = createAsyncThunk(
  "model/updateModel",
  async ({ id, updatedModelData }, { rejectWithValue }) => {
    try {
      const response = await api.updateModel(id, updatedModelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteModel = createAsyncThunk(
  "model/deleteModel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.deleteModel(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Generate mock data for testing
const generateMockModels = () => {
  const brands = ['Samsung', 'LG', 'Whirlpool', 'GE', 'Bosch', 'Maytag', 'KitchenAid', 'Frigidaire', 'Kenmore'];
  const types = ['Refrigerator', 'Washing Machine', 'Dryer', 'Dishwasher', 'Oven', 'Microwave', 'Air Conditioner'];
  
  const mockModels = [];
  
  for (let i = 0; i < 15; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const model = {
      _id: `model-${i + 1}`,
      brand: brand,
      modelName: `${brand}-${type.substring(0, 3)}-${Math.floor(Math.random() * 1000)}`,
      type: type,
      commonIssues: [
        `${type} not turning on`,
        `${type} making unusual noise`,
        `${type} overheating`,
      ],
      averageRepairTime: Math.floor(Math.random() * 5) + 1, // 1-5 hours
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    };
    
    mockModels.push(model);
  }
  
  return mockModels;
};

const modelSlice = createSlice({
  name: "model",
  initialState: {
    models: [],
    currentModel: null,
    loading: false,
    error: "",
  },
  reducers: {
    setCurrentModel: (state, action) => {
      const modelId = action.payload;
      state.currentModel = state.models.find(model => model._id === modelId) || null;
    },
    clearCurrentModel: (state) => {
      state.currentModel = null;
    },
    // Only for dev/testing
    loadMockModels: (state) => {
      state.models = generateMockModels();
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    // Create model
    builder.addCase(createModel.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(createModel.fulfilled, (state, action) => {
      state.loading = false;
      state.models.push(action.payload);
    });
    builder.addCase(createModel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
      toast.error(action.payload?.message || "An error occurred");
    });
    
    // Get all models
    builder.addCase(getModels.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(getModels.fulfilled, (state, action) => {
      state.loading = false;
      state.models = action.payload;
    });
    builder.addCase(getModels.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
    });
    
    // Get single model
    builder.addCase(getModel.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(getModel.fulfilled, (state, action) => {
      state.loading = false;
      state.currentModel = action.payload;
    });
    builder.addCase(getModel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
    });
    
    // Update model
    builder.addCase(updateModel.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(updateModel.fulfilled, (state, action) => {
      state.loading = false;
      const updatedModelIndex = state.models.findIndex(
        (model) => model._id === action.payload._id
      );
      if (updatedModelIndex !== -1) {
        state.models[updatedModelIndex] = action.payload;
      }
      state.currentModel = action.payload;
    });
    builder.addCase(updateModel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
      toast.error(action.payload?.message || "An error occurred");
    });
    
    // Delete model
    builder.addCase(deleteModel.pending, (state) => {
      state.loading = true;
      state.error = "";
    });
    builder.addCase(deleteModel.fulfilled, (state, action) => {
      state.loading = false;
      state.models = state.models.filter((model) => model._id !== action.meta.arg);
      if (state.currentModel && state.currentModel._id === action.meta.arg) {
        state.currentModel = null;
      }
    });
    builder.addCase(deleteModel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
      toast.error(action.payload?.message || "An error occurred");
    });
  },
});

export const { setCurrentModel, clearCurrentModel, loadMockModels } = modelSlice.actions;

export default modelSlice.reducer; 