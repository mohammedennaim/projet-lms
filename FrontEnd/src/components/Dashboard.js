import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import courseService from '../services/courseService';
import userService from '../services/UserService';
import dashboardService from '../services/dashboardService';
import AssignmentDebug from './AssignmentDebug';
import ApiTestComponent from './ApiTestComponent';
import AuthDiagnostic from './AuthDiagnostic';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();  const [activeCard, setActiveCard] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());  const [stats, setStats] = useState({
    totalCourses: 0,
    newEnrollments: 0,
    totalEmployees: 0,
    recentUsers: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isMockData, setIsMockData] = useState(false);// Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);  // Charger les données des cours depuis la base de données
  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const fetchDashboardData = async () => {
    try {
      setLoadingStats(true);
      
      // Récupérer les statistiques depuis le nouveau service dashboardService
      const response = await dashboardService.getStats();
      
      if (response.success && response.data) {
        const dashboardData = response.data;
        
        // Calculer les nouvelles inscriptions depuis les utilisateurs récents
        const newEnrollments = dashboardService.calculateNewEnrollments(dashboardData);
        
        setStats({
          totalCourses: dashboardData.courses?.total || 0,
          newEnrollments: newEnrollments,
          totalEmployees: dashboardData.users?.total || 0,
          recentUsers: dashboardData.users?.recent || []
        });
        
        setIsMockData(response.isMockData || false);
      } else {
        // Fallback vers l'ancien système si le nouveau service ne fonctionne pas
        await fetchDashboardDataFallback();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
      // Fallback vers l'ancien système
      await fetchDashboardDataFallback();
    } finally {
      setLoadingStats(false);
    }
  };

  // Méthode de fallback utilisant l'ancien système
  const fetchDashboardDataFallback = async () => {
    try {
      // Récupérer les cours
      const courses = await courseService.getAllCourses();
      
      // Récupérer les employés
      let employeeCount = 0;
      try {
        const employeesResponse = await userService.getUsers(1, 1000, { role: 'employée' });
        employeeCount = employeesResponse.pagination?.total || employeesResponse.users?.length || 0;
      } catch (employeeError) {
        console.error('Erreur lors du chargement des employés:', employeeError);
        // Essayer avec getAllEmployees si getUsers ne fonctionne pas
        try {
          const allEmployees = await userService.getAllEmployees();
          employeeCount = allEmployees.data?.length || 0;
        } catch (fallbackError) {
          console.error('Erreur lors du chargement des employés (fallback):', fallbackError);
        }
      }
      
      setStats({
        totalCourses: courses.length,
        newEnrollments: employeeCount, // Dans le fallback, on utilise le nombre total d'employés
        totalEmployees: employeeCount,
        recentUsers: []
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données (fallback):', error);
      // Garder les valeurs par défaut en cas d'erreur
    }
  };const handleNavigateToCourses = () => {
    navigate('/courses');
  };  const handleNavigateToEmployees = () => {
    navigate('/employees');
  };

  const handleNavigateToQuizzes = () => {
    navigate('/quizzes');
  };

  const handleNavigateToQuestions = () => {
    navigate('/questions');
  };

  const handleNavigateToAffectations = () => {
    navigate('/affectations');
  };

  const handleNavigateToStatistics = () => {
    navigate('/statistics');
  };// Données des statistiques
  const statsData = [
    {
      title: "Total Cours",
      value: loadingStats ? "..." : stats.totalCourses,
      change: "Cours",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },    {
      title: "Nouvelles Inscriptions",
      value: loadingStats ? "..." : stats.newEnrollments,
      change: stats.recentUsers.length > 0 ? `${stats.recentUsers.length} récentes` : "Employés",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
        </svg>
      ),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      isDynamic: true,
      recentData: stats.recentUsers
    }
  ];
  // Données des cartes principales
  const cards = [
    {
      id: 1,
      title: "Gestion des Cours",
      description: "Créer, modifier et organiser vos contenus pédagogiques",
      action: "Accéder maintenant",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),      onClick: handleNavigateToCourses,
      available: true,
      gradient: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/25"    },
    {
      id: 3,
      title: "Gestion des Employés",
      description: "Gérer les profils et les accès des employés",
      action: "Accéder maintenant",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      onClick: handleNavigateToEmployees,
      available: true,
      gradient: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/25"
    },    {
      id: 4,
      title: "Gestion des Quiz",
      description: "Créer et gérer les quiz de votre plateforme",
      action: "Accéder maintenant",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
      onClick: handleNavigateToQuizzes,
      available: true,
      gradient: "from-teal-500 to-cyan-600",
      shadowColor: "shadow-teal-500/25"
    },
    {
      id: 5,
      title: "Gestion des Questions",
      description: "Gérer les questions des quiz",
      action: "Accéder maintenant",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      onClick: handleNavigateToQuestions,
      available: true,
      gradient: "from-rose-500 to-pink-600",
      shadowColor: "shadow-rose-500/25"
    },
    {
      id: 6,
      title: "Gestion des Affectations",
      description: "Voir et gérer les affectations cours-employés",
      action: "Accéder maintenant",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
        </svg>
      ),
      onClick: handleNavigateToAffectations,
      available: true,
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/25"
    },
    {
      id: 7,
      title: "Analytics & Rapports",
      description: "Visualiser les performances et statistiques détaillées",
      action: "Accéder maintenant",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
      onClick: handleNavigateToStatistics,
      available: true,
      gradient: "from-purple-500 to-pink-600",
      shadowColor: "shadow-purple-500/25"
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };
  return (
    <>
      {/* Navbar */}
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Contenu principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        {/* Message de bienvenue personnalisé */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}
              </h2>
              <p className="text-gray-600">Voici un aperçu de votre plateforme d'apprentissage</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Indicateur de données de démonstration */}
              {isMockData && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span className="text-xs text-yellow-700 font-medium">Données de démonstration</span>
                </div>
              )}
              
              {/* Bouton de rafraîchissement */}
              <button
                onClick={fetchDashboardData}
                disabled={loadingStats}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                <svg 
                  className={`w-4 h-4 text-gray-600 ${loadingStats ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span className="text-sm text-gray-700">
                  {loadingStats ? 'Actualisation...' : 'Actualiser'}
                </span>
              </button>
            </div>
          </div>
        </div>{/* Grille de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              {/* Indicateur de données dynamiques */}
              {stat.isDynamic && (
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">En temps réel</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.change}</div>
                </div>
              </div>
              
              <h3 className="text-sm font-medium text-gray-600 mb-3">{stat.title}</h3>
              
              {/* Affichage des utilisateurs récents pour les nouvelles inscriptions */}
              {stat.isDynamic && stat.recentData && stat.recentData.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-gray-500 mb-2">Dernières inscriptions :</div>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {stat.recentData.slice(0, 3).map((user, userIndex) => (
                      <div key={userIndex} className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2) : '??'}
                        </div>
                        <span className="text-gray-600 truncate flex-1">
                          {user.fullName || user.email || 'Utilisateur anonyme'}
                        </span>
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                  {stat.recentData.length > 3 && (
                    <div className="text-xs text-gray-400 pt-1">
                      +{stat.recentData.length - 3} autres...
                    </div>
                  )}
                </div>
              )}
              
              {/* Message de fallback si pas de données récentes */}
              {stat.isDynamic && (!stat.recentData || stat.recentData.length === 0) && (
                <div className="mt-3 text-xs text-gray-400 italic">
                  Aucune nouvelle inscription récente
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section principale avec deux colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cartes principales */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
              Modules Principaux
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={card.available ? card.onClick : undefined}
                  onMouseEnter={() => setActiveCard(card.id)}
                  onMouseLeave={() => setActiveCard(null)}
                  className={`group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg transition-all duration-300 ${
                    card.available 
                      ? `cursor-pointer hover:shadow-2xl hover:-translate-y-2 ${card.shadowColor}` 
                      : 'cursor-not-allowed opacity-75'
                  }`}
                >
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Icône avec gradient */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg ${card.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h4>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{card.description}</p>
                  
                  <div className={`flex items-center text-sm font-medium ${card.available ? 'text-blue-600' : 'text-gray-400'}`}>
                    <span>{card.action}</span>
                    {card.available && (
                      <svg className={`ml-2 w-4 h-4 transition-transform duration-300 ${activeCard === card.id ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>          {/* Sidebar avec informations */}
          <div className="space-y-6">
            {/* Informations simples */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-3">                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plateforme</span>
                  <span className="text-sm font-medium text-gray-900">LMS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Version</span>
                  <span className="text-sm font-medium text-gray-900">1.0.0</span>
                </div>
              </div>
            </div>

            {/* Widget météo/heure */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-blue-100 text-sm">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              </div>
            </div>
          </div>
        </div>        {/* Section d'aide améliorée */}
        <div className="mt-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Besoin d'assistance ?</h3>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Notre équipe de support est disponible 24/7 pour vous accompagner dans l'utilisation de votre plateforme LMS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Centre d'aide
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors border border-white/30">
                Contacter le support
              </button>
            </div>
          </div>        </div>
        </main>
      </div>      {/* Composant de debug pour les administrateurs en développement */}
      {user && user.roles && user.roles.includes('ROLE_ADMIN') && process.env.NODE_ENV === 'development' && (
        <div data-debug>
          <AssignmentDebug />
        </div>
      )}      {/* Composant de test API pour diagnostiquer les problèmes de connexion */}
      {user && user.roles && user.roles.includes('ROLE_ADMIN') && (
        <div data-api-test>
          <ApiTestComponent />
        </div>
      )}

      {/* Diagnostic d'authentification */}
      {user && user.roles && user.roles.includes('ROLE_ADMIN') && (
        <div data-auth-diagnostic>
          <AuthDiagnostic />
        </div>
      )}
    </>
  );
};

export default Dashboard;