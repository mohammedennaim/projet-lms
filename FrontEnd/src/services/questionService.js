import api from './api';

const questionService = {
  // Get all questions with pagination and search
  getAllQuestions: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get('/admin/questions', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  // Get questions by quiz ID
  getQuestionsByQuiz: async (quizId) => {
    try {
      const response = await api.get(`/admin/questions?quiz=${quizId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching questions for quiz:', error);
      throw error;
    }
  },

  // Get question by ID
  getQuestionById: async (id) => {
    try {
      const response = await api.get(`/admin/questions/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  },
  // Create new question
  createQuestion: async (questionData) => {
    try {
      console.log('Sending question data:', questionData);
      const response = await api.post('/admin/questions', questionData);
      console.log('Response received:', response);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
  // Update question
  updateQuestion: async (id, questionData) => {
    try {
      const response = await api.put(`/admin/questions/${id}`, questionData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  // Delete question
  deleteQuestion: async (id) => {
    try {
      await api.delete(`/admin/questions/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Validate question
  validateQuestion: async (id) => {
    try {
      const response = await api.post(`/admin/questions/${id}/validate`);
      return response.data;
    } catch (error) {
      console.error('Error validating question:', error);
      throw error;
    }
  }
};

export default questionService;
