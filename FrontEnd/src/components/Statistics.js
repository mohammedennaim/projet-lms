import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import statisticsService from '../services/statisticsService';

const Statistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    newEnrollments: 0,
    completedCourses: 0,
    averageCompletionRate: 0,
    mostPopularCourse: "Chargement...",
    mostActiveEmployee: "Chargement...",
    totalCertificates: 0,
    avgTimeSpent: "0 heures",
    successRate: 0
  });
  
  const [timeRange, setTimeRange] = useState('month');
  // Données dynamiques pour les graphiques
  const [chartData, setChartData] = useState({
    enrollmentsByPeriod: [],
    completionByDepartment: [],
    popularCourses: []
  });

  // Charger les données de statistiques
  const loadStatistics = useCallback(async (range = timeRange, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await statisticsService.getAllStats(range);
      
      if (response.success) {
        const formattedStats = statisticsService.formatStats(response.data);
        setStats(formattedStats);
        setChartData(response.data.charts);
        setIsMockData(response.isMockData);
        setLastUpdated(new Date());
        
        if (response.isMockData) {
          setError('⚠️ Utilisation de données de démonstration (serveur non accessible)');
        }
      } else {
        throw new Error(response.error || 'Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques. Utilisation de données de démonstration.');
      
      // Charger les données de démonstration en cas d'erreur
      const mockStats = statisticsService.getMockAllStats(range);
      const formattedStats = statisticsService.formatStats(mockStats);
      setStats(formattedStats);
      setChartData(mockStats.charts);
      setIsMockData(true);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Initialisation et auto-refresh
  useEffect(() => {
    loadStatistics();
    
    // Configuration du rafraîchissement automatique
    let cleanup;
    if (autoRefresh) {
      cleanup = statisticsService.startRealTimeUpdates((response) => {
        if (response.success) {
          const formattedStats = statisticsService.formatStats(response.data);
          setStats(formattedStats);
          setChartData(response.data.charts);
          setIsMockData(response.isMockData);
          setLastUpdated(new Date());
        }
      }, 30000); // Mise à jour toutes les 30 secondes
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [loadStatistics, autoRefresh]);

  // Fonction pour changer la période
  const handleTimeRangeChange = async (range) => {
    if (range === timeRange) return;
    
    setTimeRange(range);
    await loadStatistics(range, true);
  };

  // Basculer le rafraîchissement automatique
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Rafraîchissement manuel
  const handleManualRefresh = () => {
    loadStatistics(timeRange, true);
  };

  // Chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></div>
          </div>
          <p className="mt-4 text-blue-600 font-medium animate-pulse">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8 pt-20">
        {/* Header avec sélecteur de période */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-500/5 border border-white/20 relative overflow-hidden">
          {/* Effet de brillance */}
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Tableau de Bord Analytique
              </h1>
              <p className="text-gray-500 mt-2">
                Visualisez les performances et tendances de votre plateforme LMS
              </p>
              
              {/* Indicateurs de statut */}
              <div className="flex items-center gap-4 mt-3">
                {isMockData && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span className="text-xs text-yellow-700 font-medium">Données de démonstration</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span>Dernière MàJ: {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Contrôles de rafraîchissement */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 bg-white/80 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  <svg 
                    className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  <span className="text-sm text-gray-700">
                    {loading ? 'MàJ...' : 'Actualiser'}
                  </span>
                </button>
                
                <button
                  onClick={toggleAutoRefresh}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors duration-200 ${
                    autoRefresh 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm">Auto</span>
                </button>
              </div>
              
              {/* Sélecteur de période */}
              <div className="flex items-center space-x-2 bg-white/80 p-1 rounded-lg shadow-sm">
                <button
                  onClick={() => handleTimeRangeChange('week')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 ${
                    timeRange === 'week' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={() => handleTimeRangeChange('month')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 ${
                    timeRange === 'month' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Mois
                </button>
                <button
                  onClick={() => handleTimeRangeChange('year')}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 ${
                    timeRange === 'year' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Année
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Carte statistique 1 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
                <div className="text-xs text-green-500 flex items-center justify-end">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                  {stats.activeCourses} actifs
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total des Cours</h3>
          </div>
          
          {/* Carte statistique 2 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
                <div className="text-xs text-green-500 flex items-center justify-end">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                  {stats.activeEmployees} actifs
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total des Employés</h3>
          </div>
          
          {/* Carte statistique 3 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.completedCourses}</div>
                <div className="text-xs text-green-500 flex items-center justify-end">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                  {stats.averageCompletionRate}% taux moyen
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Cours Complétés</h3>
          </div>
          
          {/* Carte statistique 4 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.newEnrollments}</div>
                <div className="text-xs text-gray-500 flex items-center justify-end">
                  Nouvelles inscriptions
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Inscriptions</h3>
          </div>
        </div>
          {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Graphique 1: Inscriptions par période */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Inscriptions par {timeRange === 'week' ? 'jour' : timeRange === 'year' ? 'mois' : 'semaine'}
              </h3>
              {loading && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="h-64">
              {/* Graphique à barres dynamique */}
              <div className="flex items-end justify-between h-48 px-2">
                {chartData.enrollmentsByPeriod?.map((item, index) => {
                  const maxValue = Math.max(...(chartData.enrollmentsByPeriod?.map(d => d.enrollments) || [1]));
                  const height = maxValue > 0 ? (item.enrollments / maxValue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-8 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-md hover:from-blue-700 hover:to-indigo-500 transition-all duration-300 relative group"
                        style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none transition-opacity duration-300 whitespace-nowrap">
                          {item.enrollments} inscription{item.enrollments > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{item.period}</div>
                    </div>
                  );
                })}
                
                {/* Affichage si pas de données */}
                {(!chartData.enrollmentsByPeriod || chartData.enrollmentsByPeriod.length === 0) && !loading && (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      <p className="text-sm">Aucune donnée disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Panneau d'informations dynamiques */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations clés</h3>
            
            <div className="space-y-4 flex-1">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-sm text-gray-500">Cours le plus populaire</div>
                <div className="text-lg font-semibold text-gray-800 mt-1">{stats.mostPopularCourse}</div>
              </div>
              
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-sm text-gray-500">Employé le plus actif</div>
                <div className="text-lg font-semibold text-gray-800 mt-1">{stats.mostActiveEmployee}</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-sm text-gray-500">Temps moyen par utilisateur</div>
                <div className="text-lg font-semibold text-gray-800 mt-1">{stats.avgTimeSpent}</div>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-sm text-gray-500">Total des certificats délivrés</div>
                <div className="text-lg font-semibold text-gray-800 mt-1">{stats.totalCertificates}</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-sm text-gray-500">Taux de réussite</div>
                <div className="text-lg font-semibold text-gray-800 mt-1">{stats.successRate}%</div>
              </div>
            </div>
            
            <button 
              onClick={handleManualRefresh}
              disabled={loading}
              className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              {loading ? 'Actualisation...' : 'Exporter le rapport'}
            </button>
          </div>
        </div>
          {/* Graphiques 2ème rangée */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Taux de complétion par département */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Taux de complétion par département</h3>
              {loading && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            
            <div className="space-y-4">
              {chartData.completionByDepartment?.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.department}</span>
                    <span className="text-sm text-gray-500">{item.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${item.completion}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {/* Affichage si pas de données */}
              {(!chartData.completionByDepartment || chartData.completionByDepartment.length === 0) && !loading && (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <p className="text-sm">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Cours les plus populaires */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cours les plus populaires</h3>
              {loading && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            
            <div className="space-y-4">
              {chartData.popularCourses?.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.course}</div>
                    <div className="text-xs text-gray-500">{item.enrollments} inscription{item.enrollments > 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-indigo-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              ))}
              
              {/* Affichage si pas de données */}
              {(!chartData.popularCourses || chartData.popularCourses.length === 0) && !loading && (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  <p className="text-sm">Aucun cours trouvé</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message d'erreur dynamique */}
        {error && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span className="text-yellow-800 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Statistics;
