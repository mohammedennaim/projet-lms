import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';

const AffectationsList = () => {
  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAffectations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/affectations?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des affectations');
      }

      const data = await response.json();
      // Handle both array response and object with affectations property
      const affectationsData = Array.isArray(data) ? data : data.affectations || [];
      setAffectations(affectationsData);
      setTotalPages(Math.ceil((data.total || affectationsData.length) / 10));
      setError(null);
    } catch (err) {
      console.error('Error fetching affectations:', err);
      setError('Erreur lors du chargement des affectations');
      setAffectations([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAffectations();
  }, [fetchAffectations]);

  const handleDelete = async (affectationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/admin/affectations/${affectationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        setAffectations(prev => prev.filter(a => a.id !== affectationId));
      } catch (err) {
        console.error('Error deleting affectation:', err);
        setError('Erreur lors de la suppression de l\'affectation');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
        <div className="max-w-7xl mx-auto">          {/* Header avec informations détaillées */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Gestion des Affectations
                </h1>
                <p className="text-gray-600 mt-2">
                  Gérez les affectations de cours aux employés (ROLE_EMPLOYEE)
                </p>
              </div>
              <div className="text-right">
                <div className="bg-blue-100 rounded-lg px-4 py-2 inline-block">
                  <p className="text-sm text-blue-800 font-medium">
                    {affectations.length} affectation(s) active(s)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-200 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Employés assignés</p>
                    <p className="font-bold text-green-800">{new Set(affectations.map(a => a.user?.id || a.employee?.id)).size}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-200 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Cours assignés</p>
                    <p className="font-bold text-blue-800">{new Set(affectations.map(a => a.cours?.id || a.course?.id)).size}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-200 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Total affectations</p>
                    <p className="font-bold text-purple-800">{affectations.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
            <div className="flex justify-end">
              <button
                onClick={() => window.location.href = '/affectations/create'}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                Nouvelle Affectation
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Affectations List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : affectations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune affectation trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">                <table className="min-w-full">
                  <thead className="bg-gray-50">                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employé (ROLE_EMPLOYEE)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cours assigné
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date d'affectation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {affectations.map((affectation) => (
                      <tr key={affectation.id} className="hover:bg-gray-50">                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                              </div>
                            </div>
                            <div className="ml-4">                              <div className="text-sm font-medium text-gray-900">
                                {(() => {
                                  const user = affectation.user || affectation.employee;
                                  if (!user) return 'Employé non défini';
                                  
                                  const firstName = user.firstName || '';
                                  const lastName = user.lastName || '';
                                  const fullName = user.fullName || '';
                                  const email = user.email || '';
                                  const id = user.id || '';
                                  
                                  if (fullName && fullName.trim() !== '') {
                                    return fullName.trim();
                                  } else if (firstName || lastName) {
                                    return `${firstName} ${lastName}`.trim();
                                  } else if (email && email.includes('@')) {
                                    return email.split('@')[0];
                                  } else if (id) {
                                    return `Utilisateur ${id}`;
                                  } else {
                                    return 'Nom non disponible';
                                  }
                                })()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {(() => {
                                  const user = affectation.user || affectation.employee;
                                  const email = user?.email || '';
                                  return email || 'Email non disponible';
                                })()}
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                ROLE_EMPLOYEE
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                              </div>
                            </div>                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {(() => {
                                  const course = affectation.cours || affectation.course;
                                  if (!course) return 'Cours non défini';
                                  
                                  const title = course.title || '';
                                  return title || 'Titre de cours non disponible';
                                })()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {(() => {
                                  const course = affectation.cours || affectation.course;
                                  const description = course?.description || '';
                                  return description || 'Description non disponible';
                                })()}
                              </div>
                            </div>
                          </div>
                        </td>                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatDate(affectation.dateAssigned || affectation.assignedAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {affectation.dateAssigned || affectation.assignedAt ? 
                              `Il y a ${Math.ceil((new Date() - new Date(affectation.dateAssigned || affectation.assignedAt)) / (1000 * 60 * 60 * 24))} jour(s)` : 
                              'Date non définie'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            affectation.assigneCours ? 
                            'bg-green-100 text-green-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {affectation.assigneCours ? '✅ Cours assigné' : '⏳ En attente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.location.href = `/affectations/${affectation.id}/edit`}
                              className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(affectation.id)}
                              className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default AffectationsList;
