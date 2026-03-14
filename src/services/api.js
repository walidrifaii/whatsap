import axios from 'axios';

const API_BASE = "https://api-whats-2-r6be.onrender.com/api";

const api = axios.create({ baseURL: API_BASE });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (name, email, password) => api.post('/auth/register', { name, email, password });
export const getMe = () => api.get('/auth/me');

// Clients
export const getClients = () => api.get('/clients');
export const createClient = (name) => api.post('/clients', { name });
export const connectClient = (id) => api.post(`/clients/${id}/connect`);
export const disconnectClient = (id) => api.post(`/clients/${id}/disconnect`);
export const deleteClient = (id) => api.delete(`/clients/${id}`);
export const getClient = (id) => api.get(`/clients/${id}`);

// Campaigns
export const getCampaigns = () => api.get('/campaigns');
export const createCampaign = (data) => api.post('/campaigns', data);
export const getCampaign = (id) => api.get(`/campaigns/${id}`);
export const startCampaign = (id) => api.post(`/campaigns/${id}/start`);
export const pauseCampaign = (id) => api.post(`/campaigns/${id}/pause`);
export const deleteCampaign = (id) => api.delete(`/campaigns/${id}`);

// Contacts
export const getContacts = (campaignId, params) => api.get(`/contacts/${campaignId}`, { params });
export const uploadContacts = (campaignId, file) => {
  const form = new FormData();
  form.append('contacts', file);
  return api.post(`/contacts/${campaignId}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const addContact = (campaignId, data) => api.post(`/contacts/${campaignId}/add`, data);

// Logs
export const getLogs = (params) => api.get('/logs', { params });
export const getLogStats = (params) => api.get('/logs/stats', { params });

// Messages
export const sendMessage = (clientId, phone, message) =>
  api.post('/messages/send', { clientId, phone, message });

export default api;
