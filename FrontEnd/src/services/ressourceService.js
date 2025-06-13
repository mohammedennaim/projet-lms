import api from './api';
import { handleApiError, isNetworkError, getMockData } from '../utils/errorUtils';
import apiClient from '../utils/apiClient';

class RessourceService {
  // Obtenir toutes les ressources
  async getAllRessources() {
    try {
      console.log('Fetching ressources from API...');
      const response = await apiClient.get('/api/admin/ressources');
      console.log('Ressources response:', response);
      
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des ressources:', error);
      
      if (isNetworkError(error)) {
        console.warn('Network error, returning mock data for ressources');
        return {
          data: getMockData('ressources'),
          success: true,
          isMockData: true
        };
      }
      
      return handleApiError(error, 'Erreur lors du chargement des ressources');
    }
  }

  // Obtenir tous les cours
  async getAllCourses() {
    try {
      console.log('Fetching courses from API...');
      const response = await apiClient.get('/api/admin/courses');
      console.log('Courses response:', response);
      
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
      
      if (isNetworkError(error)) {
        console.warn('Network error, returning mock data for courses');
        return {
          data: getMockData('courses'),
          success: true,
          isMockData: true
        };
      }
      
      return handleApiError(error, 'Erreur lors du chargement des cours');
    }
  }

  // Obtenir tous les employés
  async getAllEmployees() {
    try {
      console.log('Fetching employees from API...');
      const response = await apiClient.get('/api/admin/employees');
      console.log('Employees response:', response);
      
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      
      if (isNetworkError(error)) {
        console.warn('Network error, returning mock data for employees');
        return {
          data: getMockData('employees'),
          success: true,
          isMockData: true
        };
      }
      
      return handleApiError(error, 'Erreur lors du chargement des employés');
    }
  }

  // Créer une nouvelle ressource
  async createRessource(data) {
    try {
      // Validation de l'URL si c'est fourni
      if (data.contenu && data.contenu.trim()) {
        const url = data.contenu.trim();
        
        // Vérifier que c'est une URL valide
        try {
          const urlObj = new URL(url);
          if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            throw new Error('L\'URL doit commencer par http:// ou https://');
          }
        } catch (urlError) {
          throw new Error('URL invalide: ' + urlError.message);
        }
      }
      
      console.log('Creating ressource:', data);
      const response = await api.post('/api/admin/ressources', data);
      console.log('Create ressource response:', response);
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la création de la ressource:', error);
      
      if (isNetworkError(error)) {
        const errorMessage = 'Connexion au serveur impossible. Création de la ressource échouée.';
        const customError = new Error(errorMessage);
        customError.success = false;
        customError.originalError = error;
        throw customError;
      }
      
      const errorResult = handleApiError(error, 'Erreur lors de la création de la ressource');
      const customError = new Error(errorResult.error);
      customError.success = false;
      customError.originalError = error;
      throw customError;
    }
  }
  // Mettre à jour une ressource
  async updateRessource(id, data) {
    try {
      console.log('Updating ressource:', id, data);
      const response = await api.put(`/api/admin/ressources/${id}`, data);
      console.log('Update ressource response:', response);
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la ressource:', error);
      
      if (isNetworkError(error)) {
        const errorMessage = 'Connexion au serveur impossible. Mise à jour de la ressource échouée.';
        const customError = new Error(errorMessage);
        customError.success = false;
        customError.originalError = error;
        throw customError;
      }
      
      const errorResult = handleApiError(error, 'Erreur lors de la mise à jour de la ressource');
      const customError = new Error(errorResult.error);
      customError.success = false;
      customError.originalError = error;
      throw customError;
    }
  }

  // Supprimer une ressource
  async deleteRessource(id) {
    try {
      console.log('Deleting ressource:', id);
      await api.delete(`/api/admin/ressources/${id}`);
      console.log('Delete ressource success');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la suppression de la ressource:', error);
      
      if (isNetworkError(error)) {
        const errorMessage = 'Connexion au serveur impossible. Suppression de la ressource échouée.';
        const customError = new Error(errorMessage);
        customError.success = false;
        customError.originalError = error;
        throw customError;
      }
      
      const errorResult = handleApiError(error, 'Erreur lors de la suppression de la ressource');
      const customError = new Error(errorResult.error);
      customError.success = false;
      customError.originalError = error;
      throw customError;
    }
  }
  // Obtenir les ressources d'un cours spécifique
  async getRessourcesByCourse(courseId) {
    try {
      const response = await apiClient.get(`/api/admin/courses/${courseId}/ressources`);
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des ressources du cours:', error);
      
      if (isNetworkError(error)) {
        console.warn('Network error, returning mock data for course ressources');
        return {
          data: getMockData('courseRessources'),
          success: true,
          isMockData: true
        };
      }
      
      return handleApiError(error, 'Erreur lors du chargement des ressources du cours');
    }
  }

  // Obtenir une ressource par ID
  async getRessourceById(id) {
    try {
      const response = await apiClient.get(`/api/admin/ressources/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la ressource:', error);
      throw error;
    }
  }
}

export const ressourceService = new RessourceService();
export default ressourceService;