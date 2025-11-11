import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';
const API = axios.create({ baseURL: `${API_BASE_URL}/api` });

// Interceptor za zahteve koji dodaje token u header
API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('profile');
  if (profile) {
    try {
      const parsedProfile = JSON.parse(profile);
      if (parsedProfile.token) {
        req.headers.Authorization = `Bearer ${parsedProfile.token}`;
      }
    } catch (e) {
      console.error('Error parsing profile in interceptor:', e);
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
      textDiv.textContent = `Sesija je istekla. Preusmeravanje na login stranicu za ${countdown} sekundi...`;
      messageDiv.appendChild(textDiv);
      document.body.appendChild(messageDiv);

      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          textDiv.textContent = `Sesija je istekla. Preusmeravanje na login stranicu za ${countdown} sekundi...`;
        } else {
          clearInterval(countdownInterval);
          messageDiv.remove();
          window.location.href = '/auth?role=company&type=login';
        }
      }, 1000);
    }
    return Promise.reject(error);
  }
);

// Auth
export const signIn = (formData) => API.post('/auth/company/signin', formData);
export const signUp = (formData) => API.post('/auth/signup', formData);
export const signUpCompany = (formData) => API.post('/auth/registercompany', formData);

// Jobs
export const createJob = (jobData) => {
  return API.post('/jobs', jobData);
};

export const getJobs = (businessType) => {
  return API.get(`/jobs?businessType=${businessType}`);
};

export const getJob = (id) => API.get(`/jobs/${id}`);
export const updateJob = ({ id, jobData }) => API.patch(`/jobs/${id}`, jobData);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const extractJobDataFromMessage = (message) => API.post('/jobs/extract-from-message', { message });

// Workers
export const fetchWorkers = () => API.get('/worker');
export const fetchWorker = (id) => API.get(`/worker/${id}`);
export const createWorker = (workerData) => API.post('/worker', workerData);
export const updateWorker = ({ id, workerData }) => API.put(`/worker/${id}`, workerData);
export const deleteWorker = (id) => API.delete(`/worker/${id}`);

// Teams
export const fetchTeams = () => API.get('/team');
export const fetchTeam = (id) => API.get(`/team/${id}`);
export const createTeam = (teamData) => API.post('/team', teamData);
export const updateTeam = ({ id, teamData }) => API.put(`/team/${id}`, teamData);
export const deleteTeam = (id) => API.delete(`/team/${id}`);

// Services hierarchy
export const fetchDeviceCategories = () => API.get('/services/device-categories');
export const createDeviceCategory = (categoryData) => API.post('/services/device-categories', categoryData);
export const updateDeviceCategory = ({ id, categoryData }) => API.put(`/services/device-categories/${id}`, categoryData);
export const deleteDeviceCategory = (id) => API.delete(`/services/device-categories/${id}`);

export const fetchDeviceTypes = () => API.get('/services/device-types');
export const createDeviceType = (typeData) => API.post('/services/device-types', typeData);
export const updateDeviceType = ({ id, typeData }) => API.put(`/services/device-types/${id}`, typeData);
export const deleteDeviceType = (id) => API.delete(`/services/device-types/${id}`);

export const fetchServicesList = () => API.get('/services');
export const createServiceItem = (serviceData) => API.post('/services', serviceData);
export const updateServiceItem = ({ id, serviceData }) => API.put(`/services/${id}`, serviceData);
export const deleteServiceItem = (id) => API.delete(`/services/${id}`);

// AI Business
export const fetchAIBusinessIdeas = () => API.get('/ai-business');
export const createAIBusinessIdea = (ideaData) => API.post('/ai-business', ideaData);
export const updateAIBusinessIdea = ({ id, ideaData }) => API.put(`/ai-business/${id}`, ideaData);
export const deleteAIBusinessIdea = (id) => API.delete(`/ai-business/${id}`);
export const respondToAIBusinessIdea = ({ id, status, note }) =>
  API.post(`/ai-business/${id}/respond`, { status, note });

// Company
export const fetchCompanyById = (id) => API.get(`/company/${id}`);
export const updateCompanyById = ({ id, companyData }) => API.put(`/company/${id}`, companyData);

// Models
export const fetchModels = () => {
  return API.get('/models');
};
export const fetchModel = (id) => {
  return API.get(`/models/${id}`);
};
export const createModel = (modelData) => {
  return API.post('/models', modelData);
};
export const updateModel = ({ id, modelData }) => {
  return API.put(`/models/${id}`, modelData);
};
export const deleteModel = (id) => {
  return API.delete(`/models/${id}`);
};

// Clients
export const fetchClients = () => {
  return API.get('/client');
};
export const fetchClient = (id) => {
  return API.get(`/client/${id}`);
};
export const createClient = (clientData) => {
  return API.post('/client', clientData);
};
export const updateClient = ({ id, clientData }) => {
  return API.put(`/client/${id}`, clientData);
};
export const deleteClient = (id) => {
  return API.delete(`/client/${id}`);
};

// Spare Parts
export const fetchSpareParts = () => API.get('/sparePart');
export const fetchSparePart = (id) => API.get(`/sparePart/${id}`);
export const createSparePart = (sparePartData) => API.post('/sparePart', sparePartData);
export const updateSparePart = ({ id, sparePartData }) => API.put(`/sparePart/${id}`, sparePartData);
export const deleteSparePart = (id) => API.delete(`/sparePart/${id}`);

// User/Company Profile
export const getUser = () => API.get("/api/user/profile");
export const getCompany = () => API.get("/api/company/profile");

// Super Admin
export const getSuperAdminStats = () => API.get('/superadmin/stats');
export const getAllCompanies = () => API.get('/superadmin/companies');
export const sendGlobalNotification = (notificationData) => API.post('/superadmin/notifications', notificationData);
export const getSentNotifications = () => API.get('/superadmin/notifications');
export const getGlobalNotifications = () => API.get('/notifications/all');
export const createSuperAdmin = (adminData) => API.post('/superadmin/create-admin', adminData);
export const createSuperAdminPublic = (adminData) => API.post('/superadmin/create-admin-public', adminData);

// Inventory - Items
export const getInventoryItems = () => API.get('/inventory/items');
export const getInventoryItem = (id) => API.get(`/inventory/items/${id}`);
export const getInventoryStats = () => API.get('/inventory/items/stats');
export const createInventoryItem = (itemData) => API.post('/inventory/items', itemData);
export const updateInventoryItem = ({ id, itemData }) => API.put(`/inventory/items/${id}`, itemData);
export const deleteInventoryItem = (id) => API.delete(`/inventory/items/${id}`);

// Inventory - Warehouse Transactions
export const getWarehouseTransactions = (params) => API.get('/inventory/transactions', { params });
export const getTransactionsByJob = (jobId) => API.get(`/inventory/transactions/job/${jobId}`);
export const createInputTransaction = (transactionData) => API.post('/inventory/transactions/input', transactionData);
export const createOutputTransaction = (transactionData) => API.post('/inventory/transactions/output', transactionData);
export const createReturnTransaction = (transactionData) => API.post('/inventory/transactions/return', transactionData);

// Inventory - Customs
export const getCustomsDeclarations = () => API.get('/inventory/customs');
export const getCustomsDeclaration = (id) => API.get(`/inventory/customs/${id}`);
export const createCustomsDeclaration = (declarationData) => API.post('/inventory/customs', declarationData);
export const updateCustomsDeclaration = ({ id, declarationData }) => API.put(`/inventory/customs/${id}`, declarationData);
export const deleteCustomsDeclaration = (id) => API.delete(`/inventory/customs/${id}`);

// Inventory - Movements (Withdrawn Items)
export const getWithdrawnItems = (params) => API.get('/inventory/movements', { params });
export const getMovementsByJob = (jobId) => API.get(`/inventory/movements/job/${jobId}`);
export const getWithdrawnItemsStats = (params) => API.get('/inventory/movements/stats', { params });
export const reserveItemForJob = (reservationData) => API.post('/inventory/movements/reserve', reservationData);
export const issueReservedItem = (movementId, data) => API.put(`/inventory/movements/${movementId}/issue`, data);
export const returnItem = (movementId, data) => API.put(`/inventory/movements/${movementId}/return`, data);

// Inventory - Calculations
export const getCalculations = (params) => API.get('/inventory/calculations', { params });

// Payments (for company invoices to clients)
export const getPayments = (params) => API.get('/payments', { params });
export const getPayment = (id) => API.get(`/payments/${id}`);
export const createPayment = (paymentData) => API.post('/payments', paymentData);
export const updatePayment = ({ id, paymentData }) => API.put(`/payments/${id}`, paymentData);
export const markPaymentAsPaid = (id, paymentData) => API.patch(`/payments/${id}/paid`, paymentData);
export const deletePayment = (id) => API.delete(`/payments/${id}`);
export const getPaymentStats = (params) => API.get('/payments/stats', { params });

// Subscription Payments (for app subscription - users pay you)
export const getSubscriptionPayments = (params) => API.get('/subscription-payments', { params });
export const getSubscriptionPayment = (id) => API.get(`/subscription-payments/${id}`);
export const createSubscriptionPayment = (paymentData) => API.post('/subscription-payments', paymentData);
export const markSubscriptionPaymentAsPaid = (id, paymentData) => API.patch(`/subscription-payments/${id}/paid`, paymentData);
export const verifySubscriptionPayment = (id, verified) => API.patch(`/subscription-payments/${id}/verify`, { verified });
export const getSubscriptionPaymentInfo = () => API.get('/subscription-payments/info');
export const getSubscriptionStats = (params) => API.get('/subscription-payments/stats', { params });
