import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Statistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 24,
    activeCourses: 18,
    totalEmployees: 156,
    activeEmployees: 142,
    newEnrollments: 36,
    completedCourses: 879,
    averageCompletionRate: 73,
    mostPopularCourse: "JavaScript Fundamentals",
    mostActiveEmployee: "Marie Martin",
    totalCertificates: 418
  });
  
  const [timeRange, setTimeRange] = useState('month');

  // Données simulées pour les graphiques
  const [chartData, setChartData] = useState({
    enrollmentsByMonth: [
      { month: "Jan", enrollments: 34 },
      { month: "Fév", enrollments: 28 },
      { month: "Mar", enrollments: 42 },
      { month: "Avr", enrollments: 45 },
      { month: "Mai", enrollments: 36 },
      { month: "Juin", enrollments: 30 },
      { month: "Juil", enrollments: 15 },
      { month: "Août", enrollments: 22 },
      { month: "Sep", enrollments: 48 },
      { month: "Oct", enrollments: 51 },
      { month: "Nov", enrollments: 39 },
      { month: "Déc", enrollments: 28 }
    ],
    completionByDepartment: [
      { department: "IT", completion: 82 },
      { department: "Marketing", completion: 71 },
      { department: "Finance", completion: 65 },
      { department: "RH", completion: 78 },
      { department: "Ventes", completion: 57 }
    ],
    popularCourses: [
      { course: "JavaScript Fundamentals", enrollments: 47 },
      { course: "Project Management", enrollments: 38 },
      { course: "Excel Avancé", enrollments: 35 },
      { course: "Leadership", enrollments: 32 },
      { course: "UX Design", enrollments: 28 }
    ]
  });

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Fonction pour changer la période
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setLoading(true);

    // Simuler le chargement de nouvelles données
    setTimeout(() => {
      // Dans une application réelle, vous feriez un appel API ici
      let newData;
      
      switch(range) {
        case 'week':
          newData = {
            totalCourses: 24,
            activeCourses: 12,
            totalEmployees: 156,
            activeEmployees: 98,
            newEnrollments: 14,
            completedCourses: 45,
            averageCompletionRate: 68,
            mostPopularCourse: "Excel Avancé",
            mostActiveEmployee: "Thomas Petit",
            totalCertificates: 28
          };
          break;
        case 'year':
          newData = {
            totalCourses: 24,
            activeCourses: 22,
            totalEmployees: 156,
            activeEmployees: 152,
            newEnrollments: 312,
            completedCourses: 1548,
            averageCompletionRate: 76,
            mostPopularCourse: "Leadership",
            mostActiveEmployee: "Jean Dupont",
            totalCertificates: 822
          };
          break;
        default: // month
          newData = {
            totalCourses: 24,
            activeCourses: 18,
            totalEmployees: 156,
            activeEmployees: 142,
            newEnrollments: 36,
            completedCourses: 879,
            averageCompletionRate: 73,
            mostPopularCourse: "JavaScript Fundamentals",
            mostActiveEmployee: "Marie Martin",
            totalCertificates: 418
          };
      }
      
      setStats(newData);
      setLoading(false);
    }, 800);
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
            </div>
            
            <div className="flex items-center space-x-2 bg-white/80 p-1 rounded-lg shadow-sm">
              <button
                onClick={() => handleTimeRangeChange('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === 'week' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => handleTimeRangeChange('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === 'month' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => handleTimeRangeChange('year')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
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
          {/* Graphique 1: Inscriptions par mois */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inscriptions par mois</h3>
            <div className="h-64">
              {/* Graphique à barres simplifié */}
              <div className="flex items-end justify-between h-48 px-2">
                {chartData.enrollmentsByMonth.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-8 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-md hover:from-blue-700 hover:to-indigo-500 transition-all duration-300 relative group"
                      style={{ height: `${(item.enrollments / 55) * 100}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none transition-opacity duration-300">
                        {item.enrollments} inscriptions
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Panneau d'informations */}
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
              
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-sm text-gray-500">Total des certificats délivrés</div>
                <div className="text-lg font-semibold text-gray-800 mt-1">{stats.totalCertificates}</div>
              </div>
            </div>
            
            <button className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Exporter le rapport
            </button>
          </div>
        </div>
        
        {/* Graphiques 2ème rangée */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Taux de complétion par département */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de complétion par département</h3>
            
            <div className="space-y-4">
              {chartData.completionByDepartment.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.department}</span>
                    <span className="text-sm text-gray-500">{item.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                      style={{ width: `${item.completion}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cours les plus populaires */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cours les plus populaires</h3>
            
            <div className="space-y-4">
              {chartData.popularCourses.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.course}</div>
                    <div className="text-xs text-gray-500">{item.enrollments} inscriptions</div>
                  </div>
                  <div className="text-indigo-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
