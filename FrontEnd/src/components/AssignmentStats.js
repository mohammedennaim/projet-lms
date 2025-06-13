import React, { useState, useEffect } from 'react';
import affectationService from '../services/affectationService';

const AssignmentStats = () => {  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    completedAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await affectationService.getAllAffectations();
      
      if (result.success) {
        const assignmentList = result.data || [];
        
        const totalAssignments = assignmentList.length;
        const activeAssignments = assignmentList.filter(a => a.assigneCours).length;
        const completedAssignments = assignmentList.filter(a => !a.assigneCours).length;
        
        setStats({
          totalAssignments,
          activeAssignments,
          completedAssignments
        });
        
        setIsMockData(result.isMockData || false);
      } else {
        console.error('Failed to fetch assignment stats:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Statistiques d'Assignation
        </h3>
        {isMockData && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Données de démonstration
          </span>
        )}
      </div>
        {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={fetchStats}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Réessayer
            </button>
            {(error.includes('connecté') || error.includes('authentification')) && (
              <button
                onClick={() => window.location.href = '/login'}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Se reconnecter
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total des assignations</span>
          <span className="text-lg font-bold text-blue-600">{stats.totalAssignments}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Assignations actives</span>
          <span className="text-lg font-bold text-green-600">{stats.activeAssignments}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Assignations complétées</span>
          <span className="text-lg font-bold text-gray-600">{stats.completedAssignments}</span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentStats;
