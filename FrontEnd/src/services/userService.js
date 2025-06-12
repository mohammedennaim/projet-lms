import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const userAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include JWT token
userAPI.interceptors.request.use(
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

// Add response interceptor to handle errors
userAPI.interceptors.response.use(
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

// User service functions
const userService = {
  // Get all users with optional pagination and filters
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    try {
      let queryParams = `page=${page}&limit=${limit}`;
      
      if (filters.role) {
        queryParams += `&role=${filters.role}`;
      }
      
      if (filters.search) {
        queryParams += `&search=${encodeURIComponent(filters.search)}`;
      }
      
      const response = await userAPI.get(`/admin/users?${queryParams}`);
      return response.data; // Returns { users: [...], pagination: {...} }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
  },
  
  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await userAPI.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  },
  
  // Create new user
  createUser: async (userData) => {
    try {
      const response = await userAPI.post('/admin/users', userData);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    }
  },
  
  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await userAPI.put(`/admin/users/${id}`, userData);
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
  },
  
  // Delete user
  deleteUser: async (id) => {
    try {
      await userAPI.delete(`/admin/users/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
  },
  
  // Search users
  searchUsers: async (searchTerm) => {
    try {
      const response = await userAPI.get(`/admin/users?search=${encodeURIComponent(searchTerm)}`);
      return response.data.users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Erreur lors de la recherche d\'utilisateurs');
    }
  }
};

export default userService;
