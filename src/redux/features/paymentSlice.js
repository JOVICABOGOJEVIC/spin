import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../api';
import { toast } from 'react-toastify';

// Async thunks
export const getPayments = createAsyncThunk(
  'payments/getPayments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getPayments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const getPayment = createAsyncThunk(
  'payments/getPayment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getPayment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.createPayment(paymentData);
      toast.success('Račun je kreiran uspešno');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri kreiranju računa');
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const updatePayment = createAsyncThunk(
  'payments/updatePayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await api.updatePayment({ id, paymentData });
      toast.success('Račun je ažuriran uspešno');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri ažuriranju računa');
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const markPaymentAsPaid = createAsyncThunk(
  'payments/markPaymentAsPaid',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await api.markPaymentAsPaid(id, paymentData);
      toast.success('Plaćanje je evidentirano uspešno');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri evidentiranju plaćanja');
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const deletePayment = createAsyncThunk(
  'payments/deletePayment',
  async (id, { rejectWithValue }) => {
    try {
      await api.deletePayment(id);
      toast.success('Račun je obrisan uspešno');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri brisanju računa');
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const getPaymentStats = createAsyncThunk(
  'payments/getPaymentStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getPaymentStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

const initialState = {
  payments: [],
  currentPayment: null,
  stats: null,
  loading: false,
  error: null
};

const paymentSlice = createSlice({
  name: 'payment',
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
      // Get Payments
      .addCase(getPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Payment
      .addCase(getPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(getPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Payment
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.currentPayment?._id === action.payload._id) {
          state.currentPayment = action.payload;
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark Payment as Paid
      .addCase(markPaymentAsPaid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markPaymentAsPaid.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        if (state.currentPayment?._id === action.payload._id) {
          state.currentPayment = action.payload;
        }
      })
      .addCase(markPaymentAsPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Payment
      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = state.payments.filter(p => p._id !== action.payload);
        if (state.currentPayment?._id === action.payload) {
          state.currentPayment = null;
        }
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Payment Stats
      .addCase(getPaymentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getPaymentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;

