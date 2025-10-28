import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../api';
import { toast } from 'react-toastify';

// Async thunks
export const getTeams = createAsyncThunk(
  'teams/getTeams',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchTeams();
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getTeam = createAsyncThunk(
  'teams/getTeam',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchTeam(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async ({ teamData }, { rejectWithValue }) => {
    try {
      const { data } = await api.createTeam(teamData);
      toast.success('Tim je uspešno kreiran');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri kreiranju tima');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, updatedTeamData }, { rejectWithValue }) => {
    try {
      const { data } = await api.updateTeam(id, updatedTeamData);
      toast.success('Tim je uspešno ažuriran');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri ažuriranju tima');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async ({ id }, { rejectWithValue }) => {
    try {
      await api.deleteTeam(id);
      toast.success('Tim je uspešno obrisan');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Greška pri brisanju tima');
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState: {
    teams: [],
    team: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentTeam: (state, action) => {
      state.team = action.payload;
    },
    clearCurrentTeam: (state) => {
      state.team = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get teams
      .addCase(getTeams.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(getTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get single team
      .addCase(getTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.team = action.payload;
      })
      .addCase(getTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.map((team) =>
          team._id === action.payload._id ? action.payload : team
        );
        state.team = action.payload;
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter((team) => team._id !== action.payload);
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentTeam, clearCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer; 