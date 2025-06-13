import React, { useState, useEffect } from 'react';
import { ressourceService } from '../services/ressourceService';
import { courseService } from '../services/courseService';
import Navbar from './Navbar';

// Fonction d'aide pour valider les URLs
const isValidUrl = (url) => {
  if (!url || !url.trim()) return false;
  
  try {
    const urlObj = new URL(url.trim());
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const RessourceManagement = () => {
  const [ressources, setRessources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ressourcesData, coursesData] = await Promise.all([
        ressourceService.getAllRessources(),
        courseService.getAllCourses()
      ]);
      
      setRessources(ressourcesData);
      setCourses(coursesData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRessource = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      try {
        await ressourceService.deleteRessource(id);
        setRessources(ressources.filter(r => r.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  // Filtrer les ressources
  const filteredRessources = ressources.filter(ressource => {
    const matchesSearch = ressource.contenu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ressource.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || ressource.course?.id === parseInt(selectedCourse);
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></div>
          </div>
          <p className="mt-4 text-blue-600 font-medium animate-pulse">Chargement des ressources...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8 pt-20">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-500/5 border border-white/20 relative overflow-hidden">
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Ressources
              </h1>
              <p className="text-gray-500 mt-2">
                Gérez les ressources vidéo des cours
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-lg shadow-blue-500/5 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            {/* Filtre par cours */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            >
              <option value="all">Tous les cours</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Tableau des ressources */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl shadow-blue-500/5 border border-white/20">
          {filteredRessources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune ressource trouvée</h3>
              <p className="text-gray-500 max-w-md">
                Aucune ressource ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cours
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contenu (URL Vidéo)
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRessources.map((ressource) => (
                    <tr key={ressource.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{ressource.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ressource.course?.title || 'Course non trouvé'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {ressource.course?.id}
                        </div>
                      </td>                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-900 truncate flex-1" title={ressource.contenu}>
                              {ressource.contenu}
                            </div>
                            {/* Indicateur de validation */}
                            {ressource.contenu && (
                              <div className="flex-shrink-0">
                                {isValidUrl(ressource.contenu) ? (
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="URL valide">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="URL invalide">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                          {ressource.contenu && isValidUrl(ressource.contenu) && (
                            <a
                              href={ressource.contenu}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                            >
                              Voir la vidéo
                            </a>
                          )}
                          {ressource.contenu && !isValidUrl(ressource.contenu) && (
                            <span className="text-xs text-red-600 mt-1 inline-block">
                              URL invalide
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleDeleteRessource(ressource.id)}
                            className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistiques */}
        {filteredRessources.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mt-8 shadow-lg shadow-blue-500/5 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredRessources.length}</div>
                <div className="text-sm text-gray-500">Ressources trouvées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredRessources.filter(r => r.contenu && isValidUrl(r.contenu)).length}
                </div>
                <div className="text-sm text-gray-500">URLs valides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredRessources.filter(r => r.contenu && !isValidUrl(r.contenu)).length}
                </div>
                <div className="text-sm text-gray-500">URLs invalides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(filteredRessources.map(r => r.course?.id).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-500">Cours concernés</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RessourceManagement;
