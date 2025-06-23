// Service pour tester la connectivité et diagnostiquer les problèmes
import { getMockData } from '../utils/errorUtils';

const testService = {
  // Test de connectivité basique
  testConnection: async () => {
    try {
      const response = await fetch('http://localhost:8000', {
        method: 'GET',
        mode: 'cors'
      });
      
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Serveur accessible' : `Erreur ${response.status}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Serveur non accessible'
      };
    }
  },

  // Test des endpoints d'affectation
  testAffectationsEndpoint: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/admin/affectations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.text();
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (parseError) {
          return {
            success: false,
            error: 'Réponse JSON invalide',
            rawData: data
          };
        }

        return {
          success: true,
          data: parsedData,
          message: 'Endpoint des affectations accessible'
        };
      } else {
        return {
          success: false,
          status: response.status,
          statusText: response.statusText,
          message: `Erreur ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Impossible de contacter l\'endpoint des affectations'
      };
    }
  },

  // Test de l'authentification
  testAuth: async () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token) {
      return {
        success: false,
        message: 'Aucun token d\'authentification trouvé'
      };
    }

    if (!user) {
      return {
        success: false,
        message: 'Aucune information utilisateur trouvée'
      };
    }

    try {
      const parsedUser = JSON.parse(user);
      return {
        success: true,
        token: token ? 'Présent' : 'Absent',
        user: parsedUser,
        message: 'Authentification valide'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Données utilisateur corrompues'
      };
    }
  },

  // Obtenir les données mock pour les tests
  getMockAssignments: () => {
    return {
      success: true,
      data: getMockData('affectations'),
      message: 'Données de test chargées'
    };
  },

  // Test complet du système
  runFullDiagnostic: async () => {
    console.log('🔍 Début du diagnostic complet...');
    
    const results = {
      connection: await testService.testConnection(),
      auth: testService.testAuth(),
      affectationsEndpoint: await testService.testAffectationsEndpoint(),
      mockData: testService.getMockAssignments()
    };

    console.log('📊 Résultats du diagnostic:', results);
    
    return results;
  }
};

export default testService;
