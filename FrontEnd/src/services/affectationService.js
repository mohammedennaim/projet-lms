import api from './api';
import { handleApiError, isNetworkError, getMockData } from '../utils/errorUtils';

const affectationService = {
  // Récupérer toutes les affectations
  getAllAffectations: async () => {
    try {
      console.log('Fetching affectations from API...');
      const response = await api.get('/api/admin/affectations');
      console.log('Affectations response:', response);
      // Normaliser la réponse - retourner toujours un tableau d'affectations
      let affectations = [];
      if (Array.isArray(response.data)) {
        affectations = response.data;
      } else if (Array.isArray(response.data.affectations)) {
        affectations = response.data.affectations;
      } else if (Array.isArray(response.data.data)) {
        affectations = response.data.data;
      }
      return {
        data: affectations,
        success: true
      };
    } catch (error) {
      console.error('Error fetching affectations:', error);
      
      // Si c'est une erreur réseau, utiliser les données mock
      if (isNetworkError(error)) {
        console.warn('Network error, returning mock data for affectations');
        return {
          data: getMockData('affectations'),
          success: true,
          isMockData: true
        };
      }
      
      // Gérer les autres types d'erreurs (401, 403, 404, etc.)
      const errorResult = handleApiError(error, 'Erreur lors du chargement des affectations');
      return {
        ...errorResult,
        data: []
      };
    }
  },

  // Récupérer une affectation par ID
  getAffectationById: async (id) => {
    try {
      const response = await api.get(`/api/admin/affectations/${id}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching affectation:', error);
      
      if (isNetworkError(error)) {
        return {
          data: null,
          success: false,
          error: 'Connexion au serveur impossible'
        };
      }
      
      const errorResult = handleApiError(error, 'Erreur lors du chargement de l\'affectation');
      return {
        ...errorResult,
        data: null
      };
    }
  },

  // Créer une nouvelle affectation
  createAffectation: async (affectationData) => {
    try {
      const response = await api.post('/api/admin/affectations', affectationData);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error creating affectation:', error);
      
      if (isNetworkError(error)) {
        const errorMessage = 'Connexion au serveur impossible. Création de l\'affectation échouée.';
        const customError = new Error(errorMessage);
        customError.success = false;
        customError.originalError = error;
        throw customError;
      }
      
      const errorResult = handleApiError(error, 'Erreur lors de la création de l\'affectation');
      const customError = new Error(errorResult.error);
      customError.success = false;
      customError.originalError = error;
      throw customError;
    }
  },

  // Mettre à jour une affectation
  updateAffectation: async (id, affectationData) => {
    try {
      const response = await api.put(`/api/admin/affectations/${id}`, affectationData);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error updating affectation:', error);
      
      if (isNetworkError(error)) {
        const errorMessage = 'Connexion au serveur impossible. Mise à jour de l\'affectation échouée.';
        const customError = new Error(errorMessage);
        customError.success = false;
        customError.originalError = error;
        throw customError;
      }
      
      const errorResult = handleApiError(error, 'Erreur lors de la mise à jour de l\'affectation');
      const customError = new Error(errorResult.error);
      customError.success = false;
      customError.originalError = error;
      throw customError;
    }
  },

  // Supprimer une affectation
  deleteAffectation: async (id) => {
    try {
      const response = await api.delete(`/api/admin/affectations/${id}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error deleting affectation:', error);
      
      if (isNetworkError(error)) {
        const errorMessage = 'Connexion au serveur impossible. Suppression de l\'affectation échouée.';
        const customError = new Error(errorMessage);
        customError.success = false;
        customError.originalError = error;
        throw customError;
      }
      
      const errorResult = handleApiError(error, 'Erreur lors de la suppression de l\'affectation');
      const customError = new Error(errorResult.error);
      customError.success = false;
      customError.originalError = error;
      throw customError;
    }
  },

  // Récupérer les affectations d'un utilisateur
  getAffectationsByUser: async (userId) => {
    try {
      const response = await api.get(`/api/admin/affectations/user/${userId}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching user affectations:', error);
      
      if (isNetworkError(error)) {
        return {
          data: [],
          success: false,
          error: 'Connexion au serveur impossible'
        };
      }
      
      const errorResult = handleApiError(error, 'Erreur lors du chargement des affectations de l\'utilisateur');
      return {
        ...errorResult,
        data: []
      };
    }
  },

  // Récupérer les affectations d'un cours
  getAffectationsByCourse: async (courseId) => {
    try {
      const response = await api.get(`/api/admin/affectations/course/${courseId}`);
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error fetching course affectations:', error);
      
      if (isNetworkError(error)) {
        return {
          data: [],
          success: false,
          error: 'Connexion au serveur impossible'
        };
      }
      
      const errorResult = handleApiError(error, 'Erreur lors du chargement des affectations du cours');
      return {
        ...errorResult,
        data: []
      };
    }
  },

  // Assigner un cours à plusieurs utilisateurs (méthode bulk)
  assignCourseToUsers: async (courseId, userIds, assignmentDate = null) => {
    try {
      const assignmentData = {
        courseId: courseId,
        userIds: userIds,
        dateAssigned: assignmentDate || new Date().toISOString().split('T')[0]
      };

      console.log('Sending bulk assignment data:', assignmentData);
      const response = await api.post('/api/admin/affectations/bulk-assign', assignmentData);
      console.log('Bulk assignment response:', response);
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error bulk assigning course to users:', error);
      
      if (isNetworkError(error)) {
        const errorMessage = 'Connexion au serveur impossible. Assignation en lot échouée.';
        const customError = new Error(errorMessage);
        customError.success = false;
        customError.originalError = error;
        throw customError;
      }
      
      const errorResult = handleApiError(error, 'Erreur lors de l\'assignation en lot');
      const customError = new Error(errorResult.error);
      customError.success = false;
      customError.originalError = error;
      throw customError;
    }
  }
};

export default affectationService;
