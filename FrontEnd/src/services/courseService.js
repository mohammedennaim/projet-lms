import axios from 'axios';
import { handleApiError } from '../utils/errorUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const courseAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include JWT token
courseAPI.interceptors.request.use(
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
courseAPI.interceptors.response.use(
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

// Course service functions
export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await courseAPI.get('/admin/courses');
      return {
        success: true,
        data: response.data.courses || []
      };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return handleApiError(error, 'Erreur lors de la récupération des cours');
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await courseAPI.get(`/admin/courses/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching course:', error);
      return handleApiError(error, 'Erreur lors de la récupération du cours');
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    try {
      const response = await courseAPI.post('/admin/courses', courseData);
      // Admin API returns { message, course }
      return response.data.course || response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Erreur lors de la création du cours');
    }
  },

  // Update course
  updateCourse: async (id, courseData) => {
    try {
      const response = await courseAPI.put(`/admin/courses/${id}`, courseData);
      // Admin API returns { message, course }
      return response.data.course || response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw new Error('Erreur lors de la mise à jour du cours');
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    try {
      await courseAPI.delete(`/admin/courses/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new Error('Erreur lors de la suppression du cours');
    }
  },

  // Search courses
  searchCourses: async (searchTerm) => {
    try {
      const response = await courseAPI.get(`/admin/courses?search=${encodeURIComponent(searchTerm)}`);
      // Return courses array from admin API response structure
      return response.data.courses || [];
    } catch (error) {
      console.error('Error searching courses:', error);
      throw new Error('Erreur lors de la recherche de cours');
    }
  },

  // Get courses with pagination
  getCoursesWithPagination: async (page = 1, limit = 10) => {
    try {
      const response = await courseAPI.get(`/admin/courses?page=${page}&limit=${limit}`);
      return response.data; // Returns { courses: [...], pagination: {...} }
    } catch (error) {
      console.error('Error fetching courses with pagination:', error);
      throw new Error('Erreur lors de la récupération des cours avec pagination');
    }
  }
};

export default courseService;
