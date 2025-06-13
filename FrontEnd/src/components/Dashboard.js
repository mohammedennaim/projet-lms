import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats] = useState({
    totalCourses: 24,
    activeStudents: 156,
    completionRate: 87,
    newEnrollments: 12
  });
  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);  const handleNavigateToCourses = () => {
    navigate('/courses');
  };

  const handleNavigateToEmployees = () => {
    navigate('/employees');
  };

  // Données des statistiques
  const statsData = [
    {
      title: "Total Cours",
      value: stats.totalCourses,
      change: "+3 ce mois",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Étudiants Actifs",
      value: stats.activeStudents,
      change: "+18 cette semaine",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Taux de Réussite",
      value: `${stats.completionRate}%`,
      change: "+5% ce mois",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
      ),
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Nouvelles Inscriptions",
      value: stats.newEnrollments,
      change: "Aujourd'hui",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
        </svg>
      ),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
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
      ),
      onClick: handleNavigateToCourses,
      available: true,
      gradient: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/25"
    },
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
    },
    {
      id: 4,
      title: "Analytics & Rapports",
      description: "Visualiser les performances et statistiques détaillées",
      action: "Bientôt disponible",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
      available: false,
      gradient: "from-purple-500 to-pink-600",
      shadowColor: "shadow-purple-500/25"
    }
  ];

  // Activités récentes simulées
  const recentActivities = [
    { id: 1, action: "Nouveau cours créé", course: "React Avancé", time: "Il y a 2h", type: "success" },
    { id: 2, action: "Étudiant inscrit", course: "JavaScript Basics", time: "Il y a 4h", type: "info" },
    { id: 3, action: "Quiz complété", course: "HTML/CSS", time: "Il y a 6h", type: "warning" },
    { id: 4, action: "Certificat délivré", course: "Node.js", time: "Il y a 1j", type: "success" }
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message de bienvenue personnalisé */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.name || 'Utilisateur'}!
          </h2>
          <p className="text-gray-600">Voici un aperçu de votre plateforme d'apprentissage</p>
        </div>

        {/* Grille de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.change}</div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
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
          </div>

          {/* Sidebar avec activités récentes */}
          <div className="space-y-6">
            {/* Activités récentes */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités Récentes</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'info' ? 'bg-blue-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.course}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
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
        </div>

        {/* Section d'aide améliorée */}
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
      </div>

      {/* Footer moderne */}
      <footer className="mt-16 bg-white/50 backdrop-blur-sm border-t border-white/20">        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} LMS Platform.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Dashboard;