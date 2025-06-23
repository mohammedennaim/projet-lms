import api from './api';

const dashboardService = {
  // Get dashboard statistics and data
  getDashboardData: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return {
        success: true,
        data: response.data,
        isMockData: false
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Return mock data if API call fails
      return {
        success: true,
        data: dashboardService.getMockData(),
        isMockData: true
      };
    }
  },

  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return {
        success: true,
        data: response.data,
        isMockData: false
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: true,
        data: dashboardService.getMockData(),
        isMockData: true
      };
    }
  },

  // Get recent activities
  getRecentActivities: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data.recentActivities || [];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  },

  // Get recent courses
  getRecentCourses: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data.courses?.recent || [];
    } catch (error) {
      console.error('Error fetching recent courses:', error);
      return [];
    }
  },

  // Calculate new enrollments from recent users
  calculateNewEnrollments: (dashboardData, days = 30) => {
    if (!dashboardData || !dashboardData.users || !dashboardData.users.recent) {
      return 0;
    }

    // Pour la démonstration, on compte tous les utilisateurs récents comme nouvelles inscriptions
    return dashboardData.users.recent.length;
  },

  // Get mock data for demo purposes
  getMockData: () => {
    const currentDate = new Date();
    const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      users: {
        total: 15,
        byRole: [
          { roles: '["ROLE_ADMIN"]', count: '2' },
          { roles: '["ROLE_EMPLOYEE"]', count: '13' }
        ],
        recent: [
          {
            id: 1,
            email: 'sophie.martin@example.com',
            fullName: 'Sophie Martin',
            roles: 'ROLE_EMPLOYEE'
          },
          {
            id: 2,
            email: 'lucas.dubois@example.com',
            fullName: 'Lucas Dubois',
            roles: 'ROLE_EMPLOYEE'
          },
          {
            id: 3,
            email: 'emma.leroy@example.com',
            fullName: 'Emma Leroy',
            roles: 'ROLE_EMPLOYEE'
          },
          {
            id: 4,
            email: 'thomas.moreau@example.com',
            fullName: 'Thomas Moreau',
            roles: 'ROLE_EMPLOYEE'
          },
          {
            id: 5,
            email: 'julie.rousseau@example.com',
            fullName: 'Julie Rousseau',
            roles: 'ROLE_EMPLOYEE'
          }
        ]
      },
      courses: {
        total: 8,
        recent: [
          {
            id: 1,
            title: 'Formation JavaScript ES6+',
            description: 'Cours avancé sur les nouvelles fonctionnalités JavaScript',
            createdAt: currentDate.toISOString()
          },
          {
            id: 2,
            title: 'Management d\'équipe',
            description: 'Techniques de gestion et leadership',
            createdAt: lastWeek.toISOString()
          }
        ]
      },
      enrollments: {
        total: 25
      }
    };
  }
};

export default dashboardService;
