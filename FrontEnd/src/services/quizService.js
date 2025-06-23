import api from './api';

const quizService = {  // Get all quizzes
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
  }
};

export default quizService;
