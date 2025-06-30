import api from './api';

const quizService = {
  // Get all quizzes
  getAllQuizzes: async () => {
    try {
      const response = await api.get('/admin/quizzes');
      // Handle different response structures
      return response.data?.data || response.data?.quizzes || response.data || [];
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  // Get quiz by ID
  getQuizById: async (id) => {
    try {
      const response = await api.get(`/admin/quizzes/${id}`);
      return response.data?.data || response.data?.quiz || response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },

  // Create new quiz
  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/admin/quizzes', quizData);
      return response.data?.data || response.data?.quiz || response.data;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  },

  // Update quiz
  updateQuiz: async (id, quizData) => {
    try {
      const response = await api.put(`/admin/quizzes/${id}`, quizData);
      return response.data?.data || response.data?.quiz || response.data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    try {
      await api.delete(`/admin/quizzes/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  },

  // Employee quiz methods
  getQuizByIdForEmployee: async (id) => {
    try {
      const response = await api.get(`/employee/quiz/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz for employee:', error);
      throw error;
    }
  },

  // Submit quiz answers
  submitQuiz: async (id, answers, timeData = {}) => {
    try {
      const payload = {
        answers: answers,
        timeSpent: timeData.timeSpent,
        questionTimes: timeData.questionTimes
      };
      
      const response = await api.post(`/employee/quiz/${id}/submit`, payload);
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  },

  // Get quiz results
  getQuizResults: async (id) => {
    try {
      const response = await api.get(`/employee/quiz/${id}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }
  },

  // Get quiz statistics for employee
  getQuizStatistics: async () => {
    try {
      const response = await api.get(`/employee/quiz/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      throw error;
    }
  },
};

export default quizService;
