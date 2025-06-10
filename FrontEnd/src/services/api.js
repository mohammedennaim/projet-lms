import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => {
    try {
      console.log('Sending registration data:', userData);
      const response = await api.post('/register', userData);
      console.log('Registration response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  },

  login: async (credentials) => {
    try {
      console.log('Sending login data:', credentials);
      const response = await api.post('/login', credentials);
      console.log('Login response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  }
};

export default api;
