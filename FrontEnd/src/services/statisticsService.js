import api from './api';

const statisticsService = {
  // Récupérer les statistiques générales
  getGeneralStats: async (timeRange = 'month') => {
    try {
      const response = await api.get(`/admin/statistics?range=${timeRange}`);
      return {
        success: true,
        data: response.data,
        isMockData: false
      };
    } catch (error) {
      console.error('Error fetching general statistics:', error);
      
      // Retourner des données de démonstration si l'API échoue
      return {
        success: true,
        data: statisticsService.getMockGeneralStats(timeRange),
        isMockData: true
      };
    }
  },

  // Récupérer les statistiques des cours
  getCourseStats: async (timeRange = 'month') => {
    try {
      const response = await api.get(`/admin/statistics/courses?range=${timeRange}`);
      return {
        success: true,
        data: response.data,
        isMockData: false
      };
    } catch (error) {
      console.error('Error fetching course statistics:', error);
      
      return {
        success: true,
        data: statisticsService.getMockCourseStats(timeRange),
        isMockData: true
      };
    }
  },

  // Récupérer les statistiques des utilisateurs
  getUserStats: async (timeRange = 'month') => {
    try {
      const response = await api.get(`/admin/statistics/users?range=${timeRange}`);
      return {
        success: true,
        data: response.data,
        isMockData: false
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      
      return {
        success: true,
        data: statisticsService.getMockUserStats(timeRange),
        isMockData: true
      };
    }
  },

  // Récupérer les données pour graphiques
  getChartData: async (timeRange = 'month') => {
    try {
      const response = await api.get(`/admin/statistics/charts?range=${timeRange}`);
      return {
        success: true,
        data: response.data,
        isMockData: false
      };
    } catch (error) {
      console.error('Error fetching chart data:', error);
      
      return {
        success: true,
        data: statisticsService.getMockChartData(timeRange),
        isMockData: true
      };
    }
  },

  // Récupérer toutes les statistiques en une fois
  getAllStats: async (timeRange = 'month') => {
    try {
      const [general, courses, users, charts] = await Promise.all([
        statisticsService.getGeneralStats(timeRange),
        statisticsService.getCourseStats(timeRange),
        statisticsService.getUserStats(timeRange),
        statisticsService.getChartData(timeRange)
      ]);

      return {
        success: true,
        data: {
          general: general.data,
          courses: courses.data,
          users: users.data,
          charts: charts.data
        },
        isMockData: general.isMockData || courses.isMockData || users.isMockData || charts.isMockData
      };
    } catch (error) {
      console.error('Error fetching all statistics:', error);
      
      return {
        success: true,
        data: statisticsService.getMockAllStats(timeRange),
        isMockData: true
      };
    }
  },

  // Données de démonstration pour les statistiques générales
  getMockGeneralStats: (timeRange) => {
    const baseStats = {
      week: {
        totalCourses: 24,
        activeCourses: 12,
        totalEmployees: 156,
        activeEmployees: 98,
        newEnrollments: 14,
        completedCourses: 45,
        averageCompletionRate: 68,
        totalCertificates: 28,
        avgTimeSpent: '2.3 heures',
        successRate: 85
      },
      month: {
        totalCourses: 24,
        activeCourses: 18,
        totalEmployees: 156,
        activeEmployees: 142,
        newEnrollments: 36,
        completedCourses: 879,
        averageCompletionRate: 73,
        totalCertificates: 418,
        avgTimeSpent: '4.7 heures',
        successRate: 89
      },
      year: {
        totalCourses: 24,
        activeCourses: 22,
        totalEmployees: 156,
        activeEmployees: 152,
        newEnrollments: 312,
        completedCourses: 1548,
        averageCompletionRate: 76,
        totalCertificates: 822,
        avgTimeSpent: '45.2 heures',
        successRate: 92
      }
    };

    return baseStats[timeRange] || baseStats.month;
  },

  // Données de démonstration pour les cours
  getMockCourseStats: (timeRange) => {
    const baseData = {
      week: {
        mostPopularCourse: "Excel Avancé",
        mostActiveEmployee: "Thomas Petit",
        recentCompletions: [
          { course: "Excel Avancé", completions: 12 },
          { course: "JavaScript", completions: 8 },
          { course: "Management", completions: 6 }
        ],
        topPerformers: [
          { name: "Thomas Petit", completions: 5 },
          { name: "Sophie Martin", completions: 4 },
          { name: "Lucas Dubois", completions: 3 }
        ]
      },
      month: {
        mostPopularCourse: "JavaScript Fundamentals",
        mostActiveEmployee: "Marie Martin",
        recentCompletions: [
          { course: "JavaScript Fundamentals", completions: 47 },
          { course: "Project Management", completions: 38 },
          { course: "Excel Avancé", completions: 35 }
        ],
        topPerformers: [
          { name: "Marie Martin", completions: 15 },
          { name: "Jean Dupont", completions: 12 },
          { name: "Emma Leroy", completions: 11 }
        ]
      },
      year: {
        mostPopularCourse: "Leadership",
        mostActiveEmployee: "Jean Dupont",
        recentCompletions: [
          { course: "Leadership", completions: 245 },
          { course: "JavaScript Fundamentals", completions: 198 },
          { course: "Project Management", completions: 167 }
        ],
        topPerformers: [
          { name: "Jean Dupont", completions: 48 },
          { name: "Marie Martin", completions: 42 },
          { name: "Sophie Martin", completions: 39 }
        ]
      }
    };

    return baseData[timeRange] || baseData.month;
  },

  // Données de démonstration pour les utilisateurs
  getMockUserStats: (timeRange) => {
    return {
      newRegistrations: timeRange === 'week' ? 8 : timeRange === 'year' ? 156 : 23,
      activeUsers: timeRange === 'week' ? 98 : timeRange === 'year' ? 152 : 142,
      departmentActivity: [
        { department: "IT", activity: timeRange === 'week' ? 65 : timeRange === 'year' ? 95 : 82 },
        { department: "Marketing", activity: timeRange === 'week' ? 58 : timeRange === 'year' ? 88 : 71 },
        { department: "Finance", activity: timeRange === 'week' ? 42 : timeRange === 'year' ? 78 : 65 },
        { department: "RH", activity: timeRange === 'week' ? 71 : timeRange === 'year' ? 92 : 78 },
        { department: "Ventes", activity: timeRange === 'week' ? 39 : timeRange === 'year' ? 68 : 57 }
      ]
    };
  },

  // Données de démonstration pour les graphiques
  getMockChartData: (timeRange) => {
    if (timeRange === 'week') {
      return {
        enrollmentsByPeriod: [
          { period: "Lun", enrollments: 8 },
          { period: "Mar", enrollments: 6 },
          { period: "Mer", enrollments: 12 },
          { period: "Jeu", enrollments: 15 },
          { period: "Ven", enrollments: 9 },
          { period: "Sam", enrollments: 3 },
          { period: "Dim", enrollments: 2 }
        ],
        completionByDepartment: [
          { department: "IT", completion: 65 },
          { department: "Marketing", completion: 58 },
          { department: "Finance", completion: 42 },
          { department: "RH", completion: 71 },
          { department: "Ventes", completion: 39 }
        ],
        popularCourses: [
          { course: "Excel Avancé", enrollments: 12 },
          { course: "JavaScript", enrollments: 8 },
          { course: "Management", enrollments: 6 },
          { course: "UX Design", enrollments: 4 },
          { course: "Leadership", enrollments: 3 }
        ]
      };
    } else if (timeRange === 'year') {
      return {
        enrollmentsByPeriod: [
          { period: "Jan", enrollments: 45 },
          { period: "Fév", enrollments: 38 },
          { period: "Mar", enrollments: 52 },
          { period: "Avr", enrollments: 48 },
          { period: "Mai", enrollments: 41 },
          { period: "Juin", enrollments: 35 },
          { period: "Juil", enrollments: 22 },
          { period: "Août", enrollments: 28 },
          { period: "Sep", enrollments: 58 },
          { period: "Oct", enrollments: 62 },
          { period: "Nov", enrollments: 49 },
          { period: "Déc", enrollments: 34 }
        ],
        completionByDepartment: [
          { department: "IT", completion: 95 },
          { department: "Marketing", completion: 88 },
          { department: "Finance", completion: 78 },
          { department: "RH", completion: 92 },
          { department: "Ventes", completion: 68 }
        ],
        popularCourses: [
          { course: "Leadership", enrollments: 245 },
          { course: "JavaScript Fundamentals", enrollments: 198 },
          { course: "Project Management", enrollments: 167 },
          { course: "Excel Avancé", enrollments: 145 },
          { course: "UX Design", enrollments: 123 }
        ]
      };
    }

    // Données pour le mois (par défaut)
    return {
      enrollmentsByPeriod: [
        { period: "S1", enrollments: 8 },
        { period: "S2", enrollments: 12 },
        { period: "S3", enrollments: 9 },
        { period: "S4", enrollments: 7 }
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
    };
  },

  // Données complètes de démonstration
  getMockAllStats: (timeRange) => {
    return {
      general: statisticsService.getMockGeneralStats(timeRange),
      courses: statisticsService.getMockCourseStats(timeRange),
      users: statisticsService.getMockUserStats(timeRange),
      charts: statisticsService.getMockChartData(timeRange)
    };
  },

  // Formater les données pour l'affichage
  formatStats: (stats) => {
    return {
      totalCourses: stats.general?.totalCourses || 0,
      activeCourses: stats.general?.activeCourses || 0,
      totalEmployees: stats.general?.totalEmployees || 0,
      activeEmployees: stats.general?.activeEmployees || 0,
      newEnrollments: stats.general?.newEnrollments || 0,
      completedCourses: stats.general?.completedCourses || 0,
      averageCompletionRate: stats.general?.averageCompletionRate || 0,
      mostPopularCourse: stats.courses?.mostPopularCourse || "Aucun",
      mostActiveEmployee: stats.courses?.mostActiveEmployee || "Aucun",
      totalCertificates: stats.general?.totalCertificates || 0,
      avgTimeSpent: stats.general?.avgTimeSpent || "0 heures",
      successRate: stats.general?.successRate || 0
    };
  },

  // Mettre à jour les statistiques en temps réel
  startRealTimeUpdates: (callback, interval = 30000) => {
    const updateStats = async () => {
      try {
        const stats = await statisticsService.getAllStats();
        callback(stats);
      } catch (error) {
        console.error('Error updating real-time stats:', error);
      }
    };

    // Première mise à jour immédiate
    updateStats();

    // Puis mise à jour périodique
    const intervalId = setInterval(updateStats, interval);

    // Retourner une fonction pour arrêter les mises à jour
    return () => clearInterval(intervalId);
  }
};

export default statisticsService;
