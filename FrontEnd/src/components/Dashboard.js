import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState(null);

  const handleLogout = () => {
    logout();
  };

  const handleNavigateToCourses = () => {
    navigate('/courses');
  };

  // Données des cartes pour faciliter la maintenance
  const cards = [
    {
      id: 1,
      title: "Gestion des Cours",
      description: "Créer, modifier et gérer tous vos cours",
      action: "Accéder →",
      icon: (
        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),
      onClick: handleNavigateToCourses,
      available: true,
      bgColor: "bg-blue-50",
      hoverBgColor: "hover:bg-blue-100",
      borderColor: "border-blue-200",
    },
    {
      id: 2,
      title: "Utilisateurs",
      description: "Gérer les étudiants et les enseignants",
      action: "Bientôt disponible",
      icon: (
        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
      available: false,
      bgColor: "bg-green-50",
      hoverBgColor: "hover:bg-green-100",
      borderColor: "border-green-200",
    },
    {
      id: 3,
      title: "Statistiques",
      description: "Voir les performances et les analyses",
      action: "Bientôt disponible",
      icon: (
        <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
      available: false,
      bgColor: "bg-purple-50",
      hoverBgColor: "hover:bg-purple-100",
      borderColor: "border-purple-200",
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header avec effet de verre */}
      <div className="bg-white bg-opacity-80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  LMS Dashboard
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">Gérez votre plateforme d'apprentissage</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <svg className="mr-2 -ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section de bienvenue */}
        <div className="text-center mb-12">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Bienvenue</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Votre espace d'apprentissage
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Accédez à tous vos outils de gestion en un seul endroit
          </p>
        </div>

        {/* Grille de cartes */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={card.available ? card.onClick : undefined}
              onMouseEnter={() => setActiveCard(card.id)}
              onMouseLeave={() => setActiveCard(null)}
              className={`relative overflow-hidden rounded-2xl border ${card.borderColor} ${card.bgColor} ${card.available ? card.hoverBgColor : ''} p-8 transition-all duration-300 ease-in-out ${
                card.available ? 'cursor-pointer transform hover:-translate-y-1 hover:shadow-xl' : 'cursor-default'
              }`}
            >
              {/* Cercle décoratif */}
              <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${card.bgColor} opacity-30 transition-transform duration-500 ${activeCard === card.id ? 'scale-150' : 'scale-100'}`}></div>
              
              {/* Contenu de la carte */}
              <div className="relative">
                <div className={`inline-flex items-center justify-center rounded-xl ${card.bgColor} p-3`}>
                  {card.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-gray-600">{card.description}</p>                <div className={`mt-6 inline-flex items-center font-medium ${card.available ? 'text-blue-600' : 'text-gray-600'}`}>
                  {card.action}
                  {card.available && (
                    <svg className={`ml-2 h-4 w-4 transition-transform duration-300 ${activeCard === card.id ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section d'aide */}
        <div className="mt-16 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Besoin d'aide?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Notre équipe de support est disponible pour vous aider à tirer le meilleur parti de votre plateforme LMS.
            </p>
            <button className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Contacter le support
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white bg-opacity-80 backdrop-blur-sm mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LMS Platform. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;