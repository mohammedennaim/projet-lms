import axios from 'axios';

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
  getAllEmployees() {
    return axios.get(`${API_URL}/employees`, {
      headers: this.authHeader()
    });
  }
  
  getEmployeeById(id) {
    return axios.get(`${API_URL}/employees/${id}`, {
      headers: this.authHeader()
    });
  }
    // User listing with pagination and filtering
  getUsers(page = 1, limit = 10, filters = {}) {
    return axios.get(`${API_URL}/admin/users`, {
      headers: this.authHeader(),
      params: {
        page,
        limit,
        ...filters
      }
    })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error("Error fetching users:", error);
      // Add more detailed error handling
      if (error.response && error.response.status === 403) {
        throw new Error("You don't have permission to access this resource");
      }
      throw error;
    });
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