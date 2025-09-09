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

// Koristi mock podatke ili stvarni API
const useMockData = false;

// Auth API
export const signIn = (formData) => {
  if (useMockData) {
    // Simuliraj uspešnu prijavu
    return new Promise((resolve) => {
      setTimeout(() => {
        const { email, password } = formData;
        
        // Provera da li su podaci popunjeni
        if (!email || !password) {
          return Promise.reject({
            response: { data: { message: 'Email and password are required' } }
          });
        }
        
        // Dummy podaci za prijavu - u stvarnosti bi trebalo proveriti iz baze
        const mockUser = {
          _id: 'comp-123456',
          ownerName: 'Business Owner',
          email: email,
          companyName: 'Business Name',
          phone: '+38111223344',
          city: 'Belgrade',
          address: 'Main Street 123',
          businessType: 'Home Appliance Technician',
          role: 'owner',
          hasInventory: true,
          offersMaintenanceContracts: true,
          serviceableApplianceTypes: ['Refrigerator', 'Washing Machine', 'Dishwasher', 'Oven'],
          defaultWarrantyDuration: 12,
          // Specifično za servis kućnih aparata
          serviceOnSite: true, // Omogućeno terensko servisiranje
          trackClientAddresses: true // Omogućeno praćenje adresa klijenata
        };
        
        // Simulirani odgovor sa servera
        const mockResponse = {
          result: mockUser,
          token: 'dummy_jwt_token.that.looks_real',
          businessType: mockUser.businessType
        };
        
        // Sačuvaj token
        localStorage.setItem('token', mockResponse.token);
        
        resolve({ data: mockResponse });
      }, 500);
    });
  }
  
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
  if (useMockData) {
    // Simuliraj kreiranje posla - vrati isti objekat sa dodatim ID-em i vremenom
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            ...jobData,
            _id: `job-${Math.floor(Math.random() * 10000)}`,
            createdAt: new Date().toISOString()
          }
        });
      }, 500);
    });
  }
  
  return API.post('/jobs', jobData);
};

export const getJobs = (businessType) => {
  if (!businessType) {
    businessType = getBusinessType();
  }
  
  if (useMockData) {
    // Vratiti mock podatke iz localStorage ako postoje, inače null (koristiće se reducer)
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockJobs = localStorage.getItem('mockJobs');
        resolve({
          data: mockJobs ? JSON.parse(mockJobs) : null
        });
      }, 500);
    });
  }
  
  return API.get(`/jobs?businessType=${businessType}`);
};

export const getJob = (id) => {
  if (useMockData) {
    // Simuliraj dohvatanje posla po ID-u
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockJobs = localStorage.getItem('mockJobs');
        if (!mockJobs) {
          return reject({ response: { data: { message: 'No jobs found' } } });
        }
        
        const jobs = JSON.parse(mockJobs);
        const job = jobs.find(j => j._id === id);
        
        if (!job) {
          return reject({ response: { data: { message: 'Job not found' } } });
        }
        
        resolve({ data: job });
      }, 500);
    });
  }
  
  return API.get(`/jobs/${id}`);
};

export const updateJob = (id, updatedJobData) => {
  if (useMockData) {
    // Simuliraj ažuriranje posla
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockJobs = localStorage.getItem('mockJobs');
        if (!mockJobs) {
          return reject({ response: { data: { message: 'No jobs found' } } });
        }
        
        const jobs = JSON.parse(mockJobs);
        const jobIndex = jobs.findIndex(j => j._id === id);
        
        if (jobIndex === -1) {
          return reject({ response: { data: { message: 'Job not found' } } });
        }
        
        const updatedJob = {
          ...jobs[jobIndex],
          ...updatedJobData,
          _id: id, // Osiguraj da ID ostane isti
          updatedAt: new Date().toISOString()
        };
        
        jobs[jobIndex] = updatedJob;
        localStorage.setItem('mockJobs', JSON.stringify(jobs));
        
        resolve({ data: updatedJob });
      }, 500);
    });
  }
  
  return API.patch(`/jobs/${id}`, updatedJobData);
};

export const deleteJob = (id) => {
  if (useMockData) {
    // Simuliraj brisanje posla
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockJobs = localStorage.getItem('mockJobs');
        if (!mockJobs) {
          return reject({ response: { data: { message: 'No jobs found' } } });
        }
        
        const jobs = JSON.parse(mockJobs);
        const jobIndex = jobs.findIndex(j => j._id === id);
        
        if (jobIndex === -1) {
          return reject({ response: { data: { message: 'Job not found' } } });
        }
        
        jobs.splice(jobIndex, 1);
        localStorage.setItem('mockJobs', JSON.stringify(jobs));
        
        resolve({ data: { id, message: 'Job deleted successfully' } });
      }, 500);
    });
  }
  
  return API.delete(`/jobs/${id}`);
};

// Worker API calls
export const fetchWorkers = () => API.get('/workers');
export const fetchWorker = (id) => API.get(`/workers/${id}`);
export const createWorker = (workerData) => API.post('/workers', workerData);
export const updateWorker = (id, updatedWorkerData) => API.patch(`/workers/${id}`, updatedWorkerData);
export const deleteWorker = (id) => API.delete(`/workers/${id}`);

// Team API calls
export const fetchTeams = () => API.get('/teams');
export const fetchTeam = (id) => API.get(`/teams/${id}`);
export const createTeam = (teamData) => API.post('/teams', teamData);
export const updateTeam = (id, updatedTeamData) => API.patch(`/teams/${id}`, updatedTeamData);
export const deleteTeam = (id) => API.delete(`/teams/${id}`);

// Model API calls
export const getModels = () => {
  if (useMockData) {
    // Return mock data from localStorage if exists, otherwise null (will use reducer mock function)
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockModels = localStorage.getItem('mockModels');
        resolve({
          data: mockModels ? JSON.parse(mockModels) : null
        });
      }, 500);
    });
  }
  
  return API.get('/models');
};

export const getModel = (id) => {
  if (useMockData) {
    // Simulate fetching a model by ID
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockModels = localStorage.getItem('mockModels');
        if (!mockModels) {
          return reject({ response: { data: { message: 'No models found' } } });
        }
        
        const models = JSON.parse(mockModels);
        const model = models.find(m => m._id === id);
        
        if (!model) {
          return reject({ response: { data: { message: 'Model not found' } } });
        }
        
        resolve({ data: model });
      }, 500);
    });
  }
  
  return API.get(`/models/${id}`);
};

export const createModel = (modelData) => {
  if (useMockData) {
    // Simulate creating a model - return same object with added ID and timestamp
    return new Promise((resolve) => {
      setTimeout(() => {
        const newModel = {
          ...modelData,
          _id: `model-${Math.floor(Math.random() * 10000)}`,
          createdAt: new Date().toISOString()
        };
        
        // Save to localStorage if there are existing models
        const mockModels = localStorage.getItem('mockModels');
        if (mockModels) {
          const models = JSON.parse(mockModels);
          models.push(newModel);
          localStorage.setItem('mockModels', JSON.stringify(models));
        } else {
          localStorage.setItem('mockModels', JSON.stringify([newModel]));
        }
        
        resolve({
          data: newModel
        });
      }, 500);
    });
  }
  
  return API.post('/models', modelData);
};

export const updateModel = (id, updatedModelData) => {
  if (useMockData) {
    // Simulate updating a model
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockModels = localStorage.getItem('mockModels');
        if (!mockModels) {
          return reject({ response: { data: { message: 'No models found' } } });
        }
        
        const models = JSON.parse(mockModels);
        const modelIndex = models.findIndex(m => m._id === id);
        
        if (modelIndex === -1) {
          return reject({ response: { data: { message: 'Model not found' } } });
        }
        
        const updatedModel = {
          ...models[modelIndex],
          ...updatedModelData,
          _id: id, // Ensure ID remains the same
          updatedAt: new Date().toISOString()
        };
        
        models[modelIndex] = updatedModel;
        localStorage.setItem('mockModels', JSON.stringify(models));
        
        resolve({ data: updatedModel });
      }, 500);
    });
  }
  
  return API.patch(`/models/${id}`, updatedModelData);
};

export const deleteModel = (id) => {
  if (useMockData) {
    // Simulate deleting a model
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockModels = localStorage.getItem('mockModels');
        if (!mockModels) {
          return reject({ response: { data: { message: 'No models found' } } });
        }
        
        const models = JSON.parse(mockModels);
        const modelIndex = models.findIndex(m => m._id === id);
        
        if (modelIndex === -1) {
          return reject({ response: { data: { message: 'Model not found' } } });
        }
        
        models.splice(modelIndex, 1);
        localStorage.setItem('mockModels', JSON.stringify(models));
        
        resolve({ data: { id, message: 'Model deleted successfully' } });
      }, 500);
    });
  }
  
  return API.delete(`/models/${id}`);
};

// Client API
export const getClients = () => {
  if (useMockData) {
    // Return mock clients from localStorage if they exist, otherwise null
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockClients = localStorage.getItem('mockClients');
        resolve({
          data: mockClients ? JSON.parse(mockClients) : null
        });
      }, 500);
    });
  }
  
  return API.get('/client');
};

export const getClient = (id) => {
  if (useMockData) {
    // Simulate fetching a client by ID
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockClients = localStorage.getItem('mockClients');
        if (!mockClients) {
          return reject({ response: { data: { message: 'No clients found' } } });
        }
        
        const clients = JSON.parse(mockClients);
        const client = clients.find(c => c._id === id);
        
        if (!client) {
          return reject({ response: { data: { message: 'Client not found' } } });
        }
        
        resolve({ data: client });
      }, 500);
    });
  }
  
  return API.get(`/client/${id}`);
};

export const createClient = (clientData) => {
  if (useMockData) {
    // Simulate creating a client - return the same object with added ID and timestamp
    return new Promise((resolve) => {
      setTimeout(() => {
        const newClient = {
          ...clientData,
          _id: `client-${Math.floor(Math.random() * 10000)}`,
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        const mockClients = localStorage.getItem('mockClients');
        const clients = mockClients ? JSON.parse(mockClients) : [];
        clients.push(newClient);
        localStorage.setItem('mockClients', JSON.stringify(clients));
        
        resolve({
          data: newClient
        });
      }, 500);
    });
  }
  
  return API.post('/client', clientData);
};

export const updateClient = (id, updatedClientData) => {
  if (useMockData) {
    // Simulate updating a client
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockClients = localStorage.getItem('mockClients');
        if (!mockClients) {
          return reject({ response: { data: { message: 'No clients found' } } });
        }
        
        const clients = JSON.parse(mockClients);
        const clientIndex = clients.findIndex(c => c._id === id);
        
        if (clientIndex === -1) {
          return reject({ response: { data: { message: 'Client not found' } } });
        }
        
        const updatedClient = {
          ...clients[clientIndex],
          ...updatedClientData,
          _id: id, // Ensure ID remains the same
          updatedAt: new Date().toISOString()
        };
        
        clients[clientIndex] = updatedClient;
        localStorage.setItem('mockClients', JSON.stringify(clients));
        
        resolve({ data: updatedClient });
      }, 500);
    });
  }
  
  return API.patch(`/client/${id}`, updatedClientData);
};

export const deleteClient = (id) => {
  if (useMockData) {
    // Simulate deleting a client
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockClients = localStorage.getItem('mockClients');
        if (!mockClients) {
          return reject({ response: { data: { message: 'No clients found' } } });
        }
        
        const clients = JSON.parse(mockClients);
        const clientIndex = clients.findIndex(c => c._id === id);
        
        if (clientIndex === -1) {
          return reject({ response: { data: { message: 'Client not found' } } });
        }
        
        clients.splice(clientIndex, 1);
        localStorage.setItem('mockClients', JSON.stringify(clients));
        
        resolve({ data: { id, message: 'Client deleted successfully' } });
      }, 500);
    });
  }
  
  return API.delete(`/client/${id}`);
};

// User profiles
export const getUser = () => API.get("/api/user/profile");
export const getCompany = () => API.get("/api/company/profile");

// Mock API function to get initial user data (will be replaced with actual API)
export const getInitialUserData = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock user data
  return {
    user: {
      id: '12345',
      email: 'user@example.com',
      ownerName: 'Business Owner',
      companyName: 'Business Name',
      businessType: null, // This will be set via profile/admin settings
      planType: 'pro',
      accountCreated: new Date().toISOString(),
      // Other user data as needed
    }
  };
};