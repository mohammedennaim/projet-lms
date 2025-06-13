import apiClient from '../utils/apiClient';

class RessourceService {
  // Obtenir toutes les ressources
  async getAllRessources() {
    try {
      const response = await apiClient.get('/api/admin/ressources');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des ressources:', error);
      throw error;
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
      
      const response = await apiClient.post('/api/admin/ressources', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la ressource:', error);
      throw error;
    }
  }

  // Mettre à jour une ressource
  async updateRessource(id, data) {
    try {
      const response = await apiClient.put(`/api/admin/ressources/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la ressource:', error);
      throw error;
    }
  }

  // Supprimer une ressource
  async deleteRessource(id) {
    try {
      await apiClient.delete(`/api/admin/ressources/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la ressource:', error);
      throw error;
    }
  }
  // Obtenir les ressources d'un cours spécifique
  async getRessourcesByCourse(courseId) {
    try {
      // Récupérer toutes les ressources et filtrer côté client
      const response = await apiClient.get('/api/admin/ressources');
      const allRessources = response.data;
      
      // Filtrer par course_id
      const courseRessources = allRessources.filter(ressource => 
        ressource.course && ressource.course.id === parseInt(courseId)
      );
      
      return courseRessources;
    } catch (error) {
      console.error('Erreur lors de la récupération des ressources du cours:', error);
      throw error;
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