import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ressourceService } from '../services/ressourceService';
import apiClient from '../utils/apiClient';

const ResourceDiagnostic = () => {
  const { isAuthenticated } = useAuth();
  const [diagnostics, setDiagnostics] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
    apiTest: null,
    createTest: null
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const runDiagnostics = async () => {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      const newDiagnostics = {
        token: token ? 'Présent' : 'Absent',
        user: storedUser ? JSON.parse(storedUser) : null,
        isAuthenticated: isAuthenticated,
        apiTest: null,
        createTest: null
      };

      // Test de connexion API
      try {
        const response = await apiClient.get('/api/admin/ressources');
        newDiagnostics.apiTest = {
          success: true,
          message: `API accessible (${response.data.length} ressources trouvées)`
        };
      } catch (error) {
        newDiagnostics.apiTest = {
          success: false,
          message: `Erreur API: ${error.response?.status} - ${error.response?.data?.error || error.message}`
        };
      }

      setDiagnostics(newDiagnostics);
      setLoading(false);
    };

    runDiagnostics();
  }, [isAuthenticated]);

  const runDiagnostics = async () => {
    setLoading(true);
    
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    const newDiagnostics = {
      token: token ? 'Présent' : 'Absent',
      user: storedUser ? JSON.parse(storedUser) : null,
      isAuthenticated: isAuthenticated,
      apiTest: null,
      createTest: null
    };

    // Test de connexion API
    try {
      const response = await apiClient.get('/api/admin/ressources');
      newDiagnostics.apiTest = {
        success: true,
        message: `API accessible (${response.data.length} ressources trouvées)`
      };
    } catch (error) {
      newDiagnostics.apiTest = {
        success: false,
        message: `Erreur API: ${error.response?.status} - ${error.response?.data?.error || error.message}`
      };
    }

    setDiagnostics(newDiagnostics);
    setLoading(false);
  };

  const testResourceCreation = async () => {
    setLoading(true);
    
    try {
      const testData = {
        contenu: 'https://www.youtube.com/watch?v=test123',
        course_id: 35
      };
      
      const result = await ressourceService.createRessource(testData);
      
      setDiagnostics(prev => ({
        ...prev,
        createTest: {
          success: true,
          message: 'Ressource créée avec succès!',
          data: result
        }
      }));
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        createTest: {
          success: false,
          message: `Erreur: ${error.message}`,
          details: error.response?.data || error.originalError
        }
      }));
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h3 className="text-xl font-bold mb-6">Diagnostic de Création de Ressources</h3>
      
      <div className="space-y-4">
        {/* État de l'authentification */}
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">État de l'Authentification</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Token JWT:</span> 
              <span className={`ml-2 ${diagnostics.token === 'Présent' ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.token || 'Chargement...'}
              </span>
            </div>
            <div>
              <span className="font-medium">Authentifié:</span> 
              <span className={`ml-2 ${diagnostics.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {diagnostics.isAuthenticated ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Utilisateur:</span> 
              <span className="ml-2">
                {diagnostics.user ? diagnostics.user.email : 'Aucun'}
              </span>
            </div>
          </div>
        </div>

        {/* Test API */}
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">Test d'Accès API</h4>
          {diagnostics.apiTest ? (
            <div className={`p-3 rounded ${diagnostics.apiTest.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {diagnostics.apiTest.message}
            </div>
          ) : (
            <div className="text-gray-500">En cours de test...</div>
          )}
        </div>

        {/* Test de création */}
        <div className="border p-4 rounded">
          <h4 className="font-semibold mb-2">Test de Création de Ressource</h4>
          <button
            onClick={testResourceCreation}
            disabled={loading || !diagnostics.isAuthenticated}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-3"
          >
            {loading ? 'Test en cours...' : 'Tester la Création'}
          </button>
          
          {diagnostics.createTest && (
            <div className={`p-3 rounded ${diagnostics.createTest.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <div className="font-medium">{diagnostics.createTest.message}</div>
              {diagnostics.createTest.details && (
                <pre className="mt-2 text-sm overflow-auto">
                  {JSON.stringify(diagnostics.createTest.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Bouton de rafraîchissement */}
        <div className="text-center">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Rafraîchir les Diagnostics'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceDiagnostic;
