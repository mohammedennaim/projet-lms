import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';
import Navbar from './Navbar';

const EmployeeQuizStatistics = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizStatistics();
        
        if (response.success) {
          setStatistics(response.data);
        } else {
          setError(response.message || 'Erreur lors du chargement des statistiques');
        }
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const formatTime = (seconds) => {
    if (!seconds) return '0m 0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Très bien': return 'bg-blue-100 text-blue-800';
      case 'Bien': return 'bg-yellow-100 text-yellow-800';
      case 'Satisfaisant': return 'bg-orange-100 text-orange-800';
      case 'Passable': return 'bg-red-100 text-red-800';
      case 'Insuffisant': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-24 px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg text-center">
            <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Erreur</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.totalQuizzesTaken === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-24 px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg text-center">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune statistique</h3>
            <p className="text-gray-600">Vous n'avez pas encore passé de quiz.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-24 px-6 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Statistiques Quiz</h1>
          <p className="text-gray-600">Suivez vos performances et votre progression</p>
        </div>

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quiz passés</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalQuizzesTaken}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Score moyen</p>
                <p className={`text-2xl font-bold ${getScoreColor(statistics.averageScore)}`}>
                  {Math.round(statistics.averageScore)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meilleur score</p>
                <p className={`text-2xl font-bold ${getScoreColor(statistics.bestScore)}`}>
                  {Math.round(statistics.bestScore)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Temps total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(statistics.totalTimeSpent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Répartition des performances */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition des performances</h3>
            <div className="space-y-3">
              {Object.entries(statistics.performanceBreakdown).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(level)}`}>
                    {level}
                  </span>
                  <span className="text-gray-700 font-medium">{count} quiz</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz récents */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz récents</h3>
            <div className="space-y-4">
              {statistics.recentQuizzes.map((quizResult, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">
                      {quizResult.quiz.title}
                    </h4>
                    <span className={`text-sm font-bold ${getScoreColor(quizResult.score)}`}>
                      {Math.round(quizResult.score)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{quizResult.quiz.course}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(quizResult.performanceLevel)}`}>
                      {quizResult.performanceLevel}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(quizResult.submittedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeQuizStatistics;
