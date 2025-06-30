import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/employee/my-courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des cours');
        }

        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching my courses:', err);
        setError('Erreur lors du chargement de vos cours assignés');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  const markAsComplete = async (affectationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/affectations/${affectationId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === affectationId 
          ? { ...course, assigneCours: true }
          : course
      ));
    } catch (err) {
      console.error('Error marking as complete:', err);
      setError('Erreur lors de la mise à jour du statut');
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

  if (loading) {
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Mes Cours Assignés
                </h1>
                <p className="text-gray-600 mt-2">
                  Consultez et gérez vos cours assignés
                </p>
              </div>
              <div className="text-right">
                <div className="bg-blue-100 rounded-lg px-4 py-2 inline-block">
                  <p className="text-sm text-blue-800 font-medium">
                    {courses.length} cours assigné(s)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-200 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Cours terminés</p>
                    <p className="font-bold text-green-800">{courses.filter(c => c.assigneCours).length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-200 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600">En attente</p>
                    <p className="font-bold text-yellow-800">{courses.filter(c => !c.assigneCours).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Courses List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <p className="text-gray-500 text-lg">Aucun cours assigné</p>
                <p className="text-gray-400 text-sm mt-1">Vous n'avez pas encore de cours assignés.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {courses.map((affectation) => {
                  const course = affectation.cours || affectation.course;
                  return (
                    <div key={affectation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-medium text-gray-900 mr-3">
                              {course?.title || 'Cours sans titre'}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              affectation.assigneCours 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {affectation.assigneCours ? '✅ Terminé' : '⏳ En cours'}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            {course?.description || 'Aucune description disponible'}
                          </p>
                          
                          <div className="text-sm text-gray-500">
                            <p>📅 Assigné le : {formatDate(affectation.dateAssigned)}</p>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {!affectation.assigneCours && (
                            <button
                              onClick={() => markAsComplete(affectation.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Marquer comme terminé
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
