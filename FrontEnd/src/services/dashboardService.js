import api from './api';

const dashboardService = {  // Get dashboard statistics and data
  getDashboardData: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Return mock data if API call fails
      return {
        stats: {
          totalCourses: 0,
          totalStudents: 0,
          totalInstructors: 0,
          activeEnrollments: 0
        },
        recentCourses: [],
        recentActivities: []
      };
    }
  },  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalInstructors: 0,
        activeEnrollments: 0
      };
    }
  },  // Get recent activities
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
  }
};

export default dashboardService;
