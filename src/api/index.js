import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Request interceptor za dodavanje tokena
api.interceptors.request.use((config) => {
  const profile = localStorage.getItem('profile');
  if (profile) {
    const { token } = JSON.parse(profile);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Spare Parts API calls
export const fetchSpareParts = () => api.get('/api/sparePart');
export const createSparePart = (sparePartData) => api.post('/api/sparePart', sparePartData);
export const updateSparePart = (id, updatedSparePart) => api.patch(`/api/sparePart/${id}`, updatedSparePart);
export const deleteSparePart = (id) => api.delete(`/api/sparePart/${id}`);

export default api; 