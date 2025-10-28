import axios from 'axios';
import { getBusinessType } from '../utils/businessTypeUtils';

// Konfiguracija API-ja
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Export the API instance
export { API };

// Automatsko dodavanje tokena na svaki API poziv
API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('profile');
  if (profile) {
    try {
      const { token } = JSON.parse(profile);
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error parsing profile:', error);
    }
  }
  return req;
});

// Interceptor za odgovore koji provjerava da li je token istekao
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('🚨 API Interceptor: 401 Unauthorized detected');
      console.log('  Request URL:', error.config?.url);
      console.log('  Request method:', error.config?.method);
      console.log('  Current pathname:', window.location.pathname);
      
      // Token je istekao ili nije validan
      localStorage.removeItem('profile');
      localStorage.removeItem('token');
      localStorage.removeItem('lastActive');
      sessionStorage.clear();
      
      // Create spinner with countdown message
      let countdown = 3;
      document.getElementById('session-message')?.remove();
      const messageDiv = document.createElement('div');
      messageDiv.id = 'session-message';
      messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 30px;
        border-radius: 8px;
        z-index: 9999;
        text-align: center;
        font-family: sans-serif;
        min-width: 300px;
      `;

      // Create spinner element
      const spinner = document.createElement('div');
      spinner.style.cssText = `
        width: 40px;
        height: 40px;
        margin: 0 auto 20px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      `;

      // Add keyframes for spinner animation
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleSheet);

      messageDiv.appendChild(spinner);
      const textDiv = document.createElement('div');
      textDiv.textContent = `Session expired. Redirecting to login page in ${countdown} seconds...`;
      messageDiv.appendChild(textDiv);
      document.body.appendChild(messageDiv);

      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          textDiv.textContent = `Session expired. Redirecting to login page in ${countdown} seconds...`;
        } else {
          clearInterval(countdownInterval);
          window.location.href = '/auth?role=company&type=login';
        }
      }, 1000);
    }
    return Promise.reject(error);
  }
);

// Koristi stvarni API

// Auth API
export const signIn = (formData) => {
  console.log('Sending sign in request with data:', formData);
  return API.post('/auth/company/signin', formData)
    .then(response => {
      console.log('Sign in response:', response);
      
      // Ensure we have the country code in the correct format
      let countryCode = response.data.result?.countryCode || response.data.countryCode;
      if (countryCode) {
        countryCode = countryCode.toLowerCase();
        // Update the response data to ensure consistent format
        if (response.data.result) {
          response.data.result.countryCode = countryCode;
        } else {
          response.data.countryCode = countryCode;
        }
      }
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Also store the profile data with correct country code
        localStorage.setItem('profile', JSON.stringify(response.data));
      }
      
      return response;
    })
    .catch(error => {
      console.error('Sign in error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });

      // Enhance error messages
      let errorMessage = 'An error occurred during login.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data.message === "User does not exist") {
              errorMessage = "Company with this email does not exist.";
            } else if (error.response.data.message === "Invalid credentials") {
              errorMessage = "Incorrect password.";
            } else if (error.response.data.message === "Email and password are required") {
              errorMessage = "Email and password are required.";
            }
            break;
          case 401:
            errorMessage = "Not authorized. Please log in again.";
            break;
          case 404:
            errorMessage = "Company with this email does not exist.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = "An unexpected error occurred. Please try again.";
        }
      }

      error.customMessage = errorMessage;
      throw error;
    });
};

export const signUp = (formData) => API.post('/auth/signup', formData);
export const signUpCompany = (formData) => API.post('/auth/registercompany', formData);

// Job API
export const createJob = (jobData) => {
  console.log('API createJob called with jobData:', jobData);
  console.log('API URL:', '/jobs');
  return API.post('/jobs', jobData);
};

export const getJobs = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  console.log('API getJobs called with businessType:', businessType);
  console.log('API URL:', `/jobs?businessType=${businessType}`);
  
  return API.get(`/jobs?businessType=${businessType}`);
};

export const getJob = (id) => API.get(`/jobs/${id}`);

export const updateJob = (id, updatedJobData) => API.patch(`/jobs/${id}`, updatedJobData);

export const deleteJob = (id) => API.delete(`/jobs/${id}`);

// Worker API calls
export const fetchWorkers = () => API.get('/worker');
export const fetchWorker = (id) => API.get(`/worker/${id}`);
export const createWorker = (workerData) => API.post('/worker', workerData);
export const updateWorker = (id, updatedWorkerData) => API.patch(`/worker/${id}`, updatedWorkerData);
export const deleteWorker = (id) => API.delete(`/worker/${id}`);

// Team API calls
export const fetchTeams = () => API.get('/team');
export const fetchTeam = (id) => API.get(`/team/${id}`);
export const createTeam = (teamData) => API.post('/team', teamData);
export const updateTeam = (id, updatedTeamData) => API.patch(`/team/${id}`, updatedTeamData);
export const deleteTeam = (id) => API.delete(`/team/${id}`);

// Model API calls
export const getModels = () => {
  return API.get('/models');
};

export const getModel = (id) => {
  return API.get(`/models/${id}`);
};

export const createModel = (modelData) => {
  return API.post('/models', modelData);
};

export const updateModel = (id, updatedModelData) => {
  return API.patch(`/models/${id}`, updatedModelData);
};

export const deleteModel = (id) => {
  return API.delete(`/models/${id}`);
};

// Client API
export const getClients = () => {
  return API.get('/client');
};

export const getClient = (id) => {
  return API.get(`/client/${id}`);
};

export const createClient = (clientData) => {
  return API.post('/client', clientData);
};

export const updateClient = (id, updatedClientData) => {
  return API.patch(`/client/${id}`, updatedClientData);
};

export const deleteClient = (id) => {
  return API.delete(`/client/${id}`);
};

// User profiles
export const getUser = () => API.get("/api/user/profile");
export const getCompany = () => API.get("/api/company/profile");
