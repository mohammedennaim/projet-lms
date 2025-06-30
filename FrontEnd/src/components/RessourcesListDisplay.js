import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import ressourceService from '../services/ressourceService';
import { useAuth } from '../context/AuthContext';

const RessourcesList = () => {
  const { isAuthenticated } = useAuth();
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRessources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des ressources...');
      const result = await ressourceService.getAllRessources();
      
      if (result.success) {
        console.log('✅ Ressources chargées:', result.data);
        const ressourcesData = Array.isArray(result.data) ? result.data : [];
        
        // Filtrer par terme de recherche si nécessaire
        let filteredRessources = ressourcesData;
        if (searchTerm) {
          filteredRessources = ressourcesData.filter(ressource => 
            (ressource.course?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ressource.contenu || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setRessources(filteredRessources);
        setTotalPages(Math.ceil(filteredRessources.length / 10));
        
        if (result.isMockData) {
          setError('⚠️ Utilisation de données de test (serveur non accessible)');
        }
      } else {
        throw new Error(result.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des ressources:', err);
      setError(err.message || 'Erreur lors du chargement des ressources');
      setRessources([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRessources();
    } else {
      setError('❌ Veuillez vous connecter pour voir les ressources');
      setLoading(false);
    }
  }, [fetchRessources, isAuthenticated]);

  const handleDelete = async (ressourceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      try {
        console.log('🗑️ Suppression de la ressource:', ressourceId);
        await ressourceService.deleteRessource(ressourceId);
        
        console.log('✅ Ressource supprimée avec succès');
        setRessources(prev => prev.filter(r => r.id !== ressourceId));
        setError(null);
      } catch (err) {
        console.error('❌ Erreur lors de la suppression:', err);
        setError('Erreur lors de la suppression de la ressource: ' + (err.message || err));
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Restreint</h2>
              <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder aux ressources.</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-16 h-16 relative mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
            </div>
            <p className="text-gray-600">Chargement des ressources...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📚 Gestion des Ressources
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les ressources pédagogiques de votre plateforme
            </p>
          </div>

          {/* Search and Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Rechercher des ressources..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <button
                onClick={() => window.location.href = '/ressources/create'}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle Ressource
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`rounded-2xl p-4 mb-6 border ${error.includes('⚠️') 
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p>{error}</p>
            </div>
          )}

          {/* Ressources List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            {ressources.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune ressource trouvée</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? `Aucune ressource ne correspond à "${searchTerm}"`
                    : "Commencez par ajouter votre première ressource"
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => window.location.href = '/ressources/create'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                  >
                    Ajouter une ressource
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ressources.slice((page - 1) * 10, page * 10).map((ressource) => (
                  <div key={ressource.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-2">🎥</span>
                          <h3 className="font-semibold text-lg text-gray-900">
                            Ressource #{ressource.id}
                          </h3>
                        </div>
                        {ressource.course && (
                          <p className="text-blue-600 text-sm font-medium mb-2">
                            📖 {ressource.course.title}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                      {ressource.contenu && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Contenu:</p>
                          {ressource.contenu.includes('http') ? (
                            <a
                              href={ressource.contenu}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 break-all text-sm underline"
                            >
                              {ressource.contenu.length > 50 
                                ? `${ressource.contenu.substring(0, 50)}...`
                                : ressource.contenu
                              }
                            </a>
                          ) : (
                            <p className="text-gray-600">
                              {ressource.contenu.length > 100 
                                ? `${ressource.contenu.substring(0, 100)}...`
                                : ressource.contenu
                              }
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                        <span>ID: {ressource.id}</span>
                        {ressource.createdAt && (
                          <span>{formatDate(ressource.createdAt)}</span>
                        )}
                      </div>
                    </div>

                    {ressource.contenu && ressource.contenu.includes('http') && (
                      <div className="mb-4">
                        <a
                          href={ressource.contenu}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Ouvrir la ressource
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = `/ressources/${ressource.id}/edit`}
                        className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm text-center font-medium"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(ressource.id)}
                        className="flex-1 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm text-center font-medium"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  ← Précédent
                </button>
                
                <span className="px-4 py-2 text-gray-700 font-medium">
                  Page {page} sur {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Suivant →
                </button>
              </div>
            )}

            {/* Résumé */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {ressources.length > 0 && (
                <p>
                  Affichage de {Math.min(10, ressources.length - (page - 1) * 10)} ressource(s) sur {ressources.length} au total
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RessourcesList;
