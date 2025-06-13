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