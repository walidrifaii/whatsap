import axios from 'axios';

const getApiBase = () => {
  // 1) Explicit API URL (recommended for separate frontend/backend deployments).
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  // 2) Local development.
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }

  // 3) Default to same-origin backend for deployed apps behind one domain/reverse-proxy.
  return `${window.location.origin}/api`;
};

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000
});

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
