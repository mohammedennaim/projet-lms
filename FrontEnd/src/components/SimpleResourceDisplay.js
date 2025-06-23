import React, { useState, useEffect } from 'react';
import { ressourceService } from '../services/ressourceService';
import { useAuth } from '../context/AuthContext';

const SimpleResourceDisplay = () => {
  const { isAuthenticated } = useAuth();
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRessources = async () => {
      try {
        setLoading(true);
        console.log('🔍 Chargement des ressources...');
        console.log('Authentifié:', isAuthenticated);
        console.log('Token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
        
        const result = await ressourceService.getAllRessources();
        console.log('Résultat du service:', result);
        
        if (result.success) {
          setRessources(result.data || []);
          if (result.isMockData) {
            setError('⚠️ Données de test utilisées (serveur non accessible)');
          }
        } else {
          setError(result.error || 'Erreur lors du chargement');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRessources();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">📚 Ressources</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">📚 Liste des Ressources</h2>
        <span className="text-sm text-gray-500">
          {ressources.length} ressource(s)
        </span>
      </div>

      {error && (
        <div className={`p-3 rounded-md mb-4 ${error.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {error}
        </div>
      )}

      {!isAuthenticated && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Veuillez vous connecter pour voir les ressources.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      )}

      {isAuthenticated && ressources.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-600 mb-4">Aucune ressource trouvée</p>
          <button
            onClick={() => window.location.href = '/ressources/create'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ➕ Ajouter une ressource
          </button>
        </div>
      )}

      {ressources.length > 0 && (
        <div className="space-y-4">
          {ressources.map((ressource) => (
            <div key={ressource.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">🎥</span>
                    <h3 className="font-semibold">Ressource #{ressource.id}</h3>
                  </div>
                  
                  {ressource.course && (
                    <p className="text-blue-600 text-sm mb-2">
                      📖 Cours: {ressource.course.title}
                    </p>
                  )}
                  
                  {ressource.contenu && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700">Contenu: </span>
                      {ressource.contenu.includes('http') ? (
                        <a
                          href={ressource.contenu}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          {ressource.contenu.length > 50 
                            ? `${ressource.contenu.substring(0, 50)}...`
                            : ressource.contenu
                          }
                        </a>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {ressource.contenu.length > 100 
                            ? `${ressource.contenu.substring(0, 100)}...`
                            : ressource.contenu
                          }
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Créé le: {ressource.createdAt 
                      ? new Date(ressource.createdAt).toLocaleDateString('fr-FR')
                      : 'Date inconnue'
                    }
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => window.location.href = `/ressources/${ressource.id}/edit`}
                    className="px-3 py-1 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-50"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Supprimer cette ressource ?')) {
                        // Logique de suppression
                        console.log('Suppression de la ressource', ressource.id);
                      }
                    }}
                    className="px-3 py-1 text-red-600 border border-red-600 rounded text-sm hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleResourceDisplay;
