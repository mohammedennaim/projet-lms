import axios from 'axios';
import { handleApiError } from '../utils/errorUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class UserService {
  // Authentication methods
  login(credentials) {
    return axios.post(`${API_URL}/login`, credentials);
  }
  
  register(userData) {
    return axios.post(`${API_URL}/register`, userData);
  }
  
  // User management methods
  getAllUsers() {
    return axios.get(`${API_URL}/users`, {
      headers: this.authHeader()
    });
  }
  
  getUserById(id) {
    return axios.get(`${API_URL}/users/${id}`, {
      headers: this.authHeader()
    });
  }
  
  createUser(userData) {
    return axios.post(`${API_URL}/users`, userData, {
      headers: this.authHeader()
    });
  }
  
  updateUser(id, userData) {
    return axios.put(`${API_URL}/users/${id}`, userData, {
      headers: this.authHeader()
    });
  }
  
  deleteUser(id) {
    return axios.delete(`${API_URL}/users/${id}`, {
      headers: this.authHeader()
    });
  }
  // Employee-specific methods
  async getAllEmployees() {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: this.authHeader()
      });
      
      // Filter employees on the client side
      const employees = (response.data.users || []).filter(user => 
        user.roles === 'employée'
      );
      
      return {
        success: true,
        data: employees
      };
    } catch (error) {
      console.error('Error fetching employees:', error);
      return handleApiError(error, 'Erreur lors du chargement des employés');
    }
  }
  
  async getEmployeeById(id) {
    try {
      const response = await axios.get(`${API_URL}/employees/${id}`, {
        headers: this.authHeader()
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching employee:', error);
      return handleApiError(error, 'Erreur lors du chargement de l\'employé');
    }
  }

  // Get users with filters and pagination
  getUsers(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    return axios.get(`${API_URL}/users?${params}`, {
      headers: this.authHeader()
    }).then(response => response.data);
  }
  
  // Helper methods
  authHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  setToken(token) {
    localStorage.setItem('token', token);
  }
  
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}

const userServiceInstance = new UserService();
export default userServiceInstance;