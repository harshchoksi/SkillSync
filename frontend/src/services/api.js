// src/services/api.js - Axios instance with interceptors
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT token ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skillsync_token');
      localStorage.removeItem('skillsync_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth API ──────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── User API ──────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.put('/users/password', data),
  getAllUsers: (params) => api.get('/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// ── Service API ────────────────────────────────────────────────────────────
export const serviceAPI = {
  getAll: (params) => api.get('/services', { params }),
  getOne: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/services/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/services/${id}`),
  getMyServices: () => api.get('/services/seller/my-services'),
  getCategories: () => api.get('/services/categories'),
};

// ── Order API ──────────────────────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (role) => api.get('/orders', { params: { role } }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  adminGetAll: () => api.get('/orders/admin/all'),
};

// ── Review API ─────────────────────────────────────────────────────────────
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getForService: (serviceId, params) => api.get(`/reviews/service/${serviceId}`, { params }),
  getForSeller: (sellerId) => api.get(`/reviews/seller/${sellerId}`),
};

// ── Chat API ───────────────────────────────────────────────────────────────
export const chatAPI = {
  getHistory: (userId) => api.get(`/chat/${userId}`),
  getConversations: () => api.get('/chat/conversations'),
  sendMessage: (data) => api.post('/chat/message', data),
};
