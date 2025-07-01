import api from './api';

const employeeService = {
  // Get employee profile
  getProfile: async () => {
    try {
      const response = await api.get('/employee/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching employee profile:', error);
      throw error;
    }
  },

  // Update employee profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/employee/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee profile:', error);
      throw error;
    }
  },

  // Get assigned courses, quizzes and resources for current employee
  getAssignments: async () => {
    try {
      const response = await api.get('/employee/affectations');
      return response.data;
    } catch (error) {
      console.error('Error fetching employee assignments:', error);
      throw error;
    }
  },

  // Get quiz details for employee
  getQuizDetails: async (quizId) => {
    try {
      const response = await api.get(`/employee/quiz/${quizId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      throw error;
    }
  },

  // Submit quiz answers
  submitQuizAnswers: async (quizId, answers) => {
    try {
      const response = await api.post(`/employee/quiz/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz answers:', error);
      throw error;
    }
  },

  // Get employee quiz history
  getQuizHistory: async () => {
    try {
      const response = await api.get('/employee/quizzes/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      throw error;
    }
  },
  
  // Get course details
  getCourseDetails: async (courseId) => {
    try {
      const response = await api.get(`/api/employee/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  }
};

export default employeeService;
