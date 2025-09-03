import axios from 'axios';

// Determine if we're running on GitHub Pages (production)
const isProduction = window.location.hostname === 'itsamisha.github.io';
const API_BASE_URL = isProduction 
  ? 'https://your-backend-url.herokuapp.com' // Replace with your actual deployed backend URL
  : (process.env.REACT_APP_API_URL || 'http://localhost:8080');

// Demo mode for GitHub Pages when no backend is available
export const DEMO_MODE = isProduction && API_BASE_URL.includes('your-backend-url');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: DEMO_MODE ? 1000 : 10000, // Quick timeout in demo mode
});

// Public API client (no auth)
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for public API to debug issues
publicApi.interceptors.response.use(
  (response) => {
    console.log('PublicAPI Response:', response);
    return response;
  },
  (error) => {
    console.error('PublicAPI Error:', error);
    console.error('PublicAPI Error Response:', error.response);
    console.error('PublicAPI Error Message:', error.message);
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
