import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

const Statistics = () => {
  const [statisticsData, setStatisticsData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedEmployees, setExpandedEmployees] = useState({});

  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Chargement des statistiques détaillées...');
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/api/statistics/employees-detailed');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Données reçues:', result);
        
        if (result.success && result.data) {
          setStatisticsData(result.data);
          setSummary(result.summary);
          console.log(`✅ ${result.data.length} employés chargés avec statistiques`);
        } else {
          throw new Error(result.error || 'Format de données invalide');
        }
        
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleEmployee = (employeeId) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const getPerformanceBadgeColor = (performance) => {
    switch (performance) {
      case 'Excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Très bien':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Bien':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Satisfaisant':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'À améliorer':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Chargement des statistiques détaillées...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8 pt-20">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 mb-8 shadow-xl border border-white/20">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            📊 Statistiques des Employés - LMS
          </h1>
          <p className="text-gray-600 mb-6">
            Vue d'ensemble des performances et des affectations
          </p>
          
          {/* Résumé global */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="text-2xl font-bold">{summary.totalEmployees || 0}</div>
              <div className="text-blue-100 text-sm">Employés Total</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="text-2xl font-bold">{summary.totalWithAssignments || 0}</div>
              <div className="text-green-100 text-sm">Avec Affectations</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="text-2xl font-bold">{summary.totalWithQuizAttempts || 0}</div>
              <div className="text-purple-100 text-sm">Ont Passé des Quiz</div>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-red-800 font-medium">Erreur: {error}</span>
            </div>
          </div>
        )}

        {/* Liste des employés avec statistiques détaillées */}
        <div className="space-y-6">
          {statisticsData.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 text-center">
              <p className="text-gray-500">Aucun employé trouvé</p>
            </div>
          ) : (
            statisticsData.map((employeeData) => (
              <div key={employeeData.employee.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                {/* En-tête de l'employé */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {employeeData.employee.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{employeeData.employee.fullName}</h3>
                        <p className="text-blue-100">{employeeData.employee.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{employeeData.totalCourses}</div>
                        <div className="text-blue-100 text-sm">Cours</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{employeeData.totalQuizAttempts}</div>
                        <div className="text-blue-100 text-sm">Quiz</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{employeeData.averageScore}%</div>
                        <div className="text-blue-100 text-sm">Moyenne</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPerformanceBadgeColor(employeeData.overallPerformance)}`}>
                        {employeeData.overallPerformance}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleEmployee(employeeData.employee.id)}
                    className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>{expandedEmployees[employeeData.employee.id] ? 'Masquer' : 'Voir'} les détails</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${expandedEmployees[employeeData.employee.id] ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>

                {/* Détails des cours et quiz */}
                {expandedEmployees[employeeData.employee.id] && (
                  <div className="p-6">
                    {employeeData.courses.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">📚</div>
                        <p className="text-gray-500">Aucun cours assigné</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {employeeData.courses.map((course, courseIndex) => (
                          <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                              <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                              <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                              <p className="text-gray-500 text-xs">
                                Assigné le: {course.dateAssigned || 'Non renseigné'}
                              </p>
                            </div>
                            
                            {/* Quiz du cours */}
                            <div className="p-4">
                              {course.quizzes.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">Aucun quiz disponible</p>
                              ) : (
                                <div className="space-y-4">
                                  {course.quizzes.map((quiz) => (
                                    <div key={quiz.id} className="bg-gray-50 rounded-lg p-4">
                                      <h5 className="font-medium text-gray-900 mb-2">{quiz.title}</h5>
                                      <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
                                      
                                      {/* Tentatives */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {quiz.attempts.map((attempt, attemptIndex) => (
                                          <div key={attempt.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                              <span className="text-xs text-gray-500">Tentative {attemptIndex + 1}</span>
                                              <span className="text-lg font-bold text-blue-600">{attempt.percentage}%</span>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                              <div>{attempt.correctAnswers}/{attempt.totalQuestions} bonnes réponses</div>
                                              <div>Temps: {attempt.timeSpentFormatted}</div>
                                              <div className="text-xs">{attempt.submittedAtFormatted}</div>
                                            </div>
                                            {attempt.feedback && (
                                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 italic">
                                                {attempt.feedback}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Statistics;
