import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../api';
import { toast } from 'react-toastify';

// Async thunks
export const getSubscriptionPayments = createAsyncThunk(
  'subscriptionPayments/getSubscriptionPayments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getSubscriptionPayments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const getSubscriptionPayment = createAsyncThunk(
  'subscriptionPayments/getSubscriptionPayment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getSubscriptionPayment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const createSubscriptionPayment = createAsyncThunk(
  'subscriptionPayments/createSubscriptionPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.createSubscriptionPayment(paymentData);
      toast.success('Zahtev za plaćanje je kreiran');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri kreiranju zahteva');
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const markSubscriptionPaymentAsPaid = createAsyncThunk(
  'subscriptionPayments/markSubscriptionPaymentAsPaid',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await api.markSubscriptionPaymentAsPaid(id, paymentData);
      toast.success('Plaćanje je evidentirano. Čekamo verifikaciju.');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri evidentiranju plaćanja');
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const getSubscriptionPaymentInfo = createAsyncThunk(
  'subscriptionPayments/getSubscriptionPaymentInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getSubscriptionPaymentInfo();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const getSubscriptionStats = createAsyncThunk(
  'subscriptionPayments/getSubscriptionStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getSubscriptionStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

const initialState = {
  payments: [],
  currentPayment: null,
  paymentInfo: null, // Tvoj žiro račun
  stats: null,
  loading: false,
  error: null
};

const subscriptionPaymentSlice = createSlice({
  name: 'subscriptionPayment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = state.payments.find(p => p._id === action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Subscription Payments
      .addCase(getSubscriptionPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(getSubscriptionPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Subscription Payment
      .addCase(getSubscriptionPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(getSubscriptionPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Subscription Payment
      .addCase(createSubscriptionPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscriptionPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
      })
      .addCase(createSubscriptionPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark Payment as Paid
      .addCase(markSubscriptionPaymentAsPaid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markSubscriptionPaymentAsPaid.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.currentPayment?._id === action.payload._id) {
          state.currentPayment = action.payload;
        }
      })
      .addCase(markSubscriptionPaymentAsPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Payment Info
      .addCase(getSubscriptionPaymentInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionPaymentInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentInfo = action.payload;
      })
      .addCase(getSubscriptionPaymentInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Stats
      .addCase(getSubscriptionStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getSubscriptionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentPayment } = subscriptionPaymentSlice.actions;
export default subscriptionPaymentSlice.reducer;

