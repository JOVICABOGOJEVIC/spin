import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import * as api from '../api';
import { toast } from "react-toastify";
import { 
  getClients,
  createClient, 
  updateClient, 
  deleteClient 
} from '../api';

// Update API URL to match the server configuration
const API_URL = '/client'; // No need for full URL as it's handled by API instance

// Mock clients for development
const generateMockClients = () => {
  return [
    {
      _id: '1',
      name: 'Marko Petrović',
      phone: '+381601234567',
      email: 'marko@example.com',
      address: 'Bulevar Oslobođenja 56, Beograd',
      apartmentNumber: '12',
      floor: '3',
      locationDescription: 'Zgrada pored pekare, interfon ne radi, pozvati na mobilni.',
      lastVisit: '2023-05-01'
    },
    {
      _id: '2',
      name: 'Ana Jovanović',
      phone: '+381603214567',
      email: 'ana@example.com',
      address: 'Cara Dušana 14, Beograd',
      apartmentNumber: '5A',
      floor: '1',
      locationDescription: 'Stara zgrada, lift ne radi.',
      lastVisit: '2023-04-20'
    },
    {
      _id: '3',
      name: 'Nikola Nikolić',
      phone: '+381641234567',
      email: 'nikola@example.com',
      address: 'Knez Mihailova 22, Beograd',
      apartmentNumber: '8',
      floor: '2',
      locationDescription: '',
      lastVisit: null
    }
  ];
};

// Update the thunk to use getClients
export const fetchClientsAsync = createAsyncThunk(
  'clients/fetchClients',
  async () => {
    try {
      const response = await getClients(); // Changed from fetchClients
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }
);

export const createClientAsync = createAsyncThunk(
  'client/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      console.log('Making API request with data:', clientData);
      const response = await api.API.post(API_URL, clientData);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data || 
        error.message || 
        'Failed to create client'
      );
    }
  }
);

export const updateClientAsync = createAsyncThunk(
  'client/updateClient',
  async ({ id, updatedClientData }, { rejectWithValue }) => {
    try {
      console.log('Updating client:', id, updatedClientData);
      const response = await api.API.put(`${API_URL}/${id}`, updatedClientData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to update client';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteClientAsync = createAsyncThunk(
  'client/deleteClient',
  async (id, { rejectWithValue }) => {
    try {
      await api.API.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to delete client';
      return rejectWithValue(errorMessage);
    }
  }
);

export const searchClients = createAction('client/searchClients');

const initialState = {
  clients: [],
  filteredClients: [],
  currentClient: null,
  loading: false,
  error: null
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setCurrentClient: (state, action) => {
      state.currentClient = state.clients.find(client => client._id === action.payload);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Clients
      .addCase(fetchClientsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
        state.filteredClients = action.payload;
      })
      .addCase(fetchClientsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Client
      .addCase(createClientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClientAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
        state.filteredClients = state.clients;
      })
      .addCase(createClientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Client
      .addCase(updateClientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClientAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client._id === action.payload._id);
        if (index !== -1) {
          state.clients[index] = action.payload;
          state.filteredClients = state.clients;
        }
      })
      .addCase(updateClientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Client
      .addCase(deleteClientAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClientAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client._id !== action.payload);
        state.filteredClients = state.clients;
      })
      .addCase(deleteClientAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update the search functionality
      .addCase(searchClients, (state, action) => {
        const searchTerm = action.payload.toLowerCase().trim();
        
        if (!searchTerm) {
          state.filteredClients = state.clients;
          return;
        }

        state.filteredClients = state.clients.filter(client => {
          // Search in name
          const nameMatch = client.name?.toLowerCase().includes(searchTerm);
          
          // Search in phone
          const phoneMatch = client.phone?.toLowerCase().includes(searchTerm);
          
          // Search in email
          const emailMatch = client.email?.toLowerCase().includes(searchTerm);
          
          // Search in address
          const addressMatch = [
            client.address?.street,
            client.address?.number,
            client.address?.floor,
            client.address?.apartment
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(searchTerm);
          
          // Search in description
          const descriptionMatch = client.locationDescription?.toLowerCase().includes(searchTerm);
          
          // Return true if any field matches
          return nameMatch || phoneMatch || emailMatch || addressMatch || descriptionMatch;
        });
      });
  }
});

export const { setCurrentClient, clearError } = clientSlice.actions;
export default clientSlice.reducer; 