import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import { ressourceService } from '../services/ressourceService';
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
        </div>      </div>
    );
  }

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
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
              Gestion des Ressources
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
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                Nouvelle Ressource
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Ressources List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : ressources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune ressource trouvée</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ressources.map((ressource) => (
                  <div key={ressource.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {ressource.title || ressource.nom || `Ressource #${ressource.id}`}
                        </h3>
                        {ressource.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {ressource.description.length > 100 
                              ? `${ressource.description.substring(0, 100)}...`
                              : ressource.description
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                      {ressource.course && (
                        <p><span className="font-medium">Cours:</span> {ressource.course.title}</p>
                      )}
                      {ressource.contenu && (
                        <p><span className="font-medium">Type:</span> 
                          {ressource.contenu.includes('http') ? 'Lien externe' : 'Contenu texte'}
                        </p>
                      )}
                      {ressource.createdAt && (
                        <p><span className="font-medium">Créé le:</span> {formatDate(ressource.createdAt)}</p>
                      )}
                    </div>

                    {ressource.contenu && ressource.contenu.includes('http') && (
                      <div className="mb-4">
                        <a
                          href={ressource.contenu}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Ouvrir le lien
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.location.href = `/ressources/${ressource.id}/edit`}
                        className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm text-center"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(ressource.id)}
                        className="flex-1 px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors text-sm text-center"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                
                <span className="px-4 py-1 text-gray-700">
                  Page {page} sur {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RessourcesList;
