import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import affectationService from '../services/affectationService';

const RecentAssignments = () => {
  const navigate = useNavigate();
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentAssignments();
  }, []);
  const fetchRecentAssignments = async () => {
    try {
      setLoading(true);
      const result = await affectationService.getAllAffectations();
      
      if (result.success) {
        const assignmentList = result.data || [];
        
        // Trier par date et prendre les 5 plus récents
        const sortedAssignments = assignmentList
          .sort((a, b) => new Date(b.dateAssigned) - new Date(a.dateAssigned))
          .slice(0, 5);
        
        setRecentAssignments(sortedAssignments);
      } else {
        console.error('Failed to fetch recent assignments:', result.error);
        setRecentAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching recent assignments:', error);
      setRecentAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Assignations Récentes</h3>
        <button
          onClick={() => navigate('/assignments')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Voir tout →
        </button>
      </div>

      {recentAssignments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Aucune assignation récente</p>
          <button
            onClick={() => navigate('/assignments')}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Créer une assignation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentAssignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                assignment.assigneCours ? 'bg-green-500' : 'bg-yellow-500'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {assignment.cours?.title || 'Cours inconnu'}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    assignment.assigneCours 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.assigneCours ? 'Assigné' : 'En attente'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate">
                    {assignment.user?.firstName} {assignment.user?.lastName || 'Employé inconnu'}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatDate(assignment.dateAssigned)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate('/assignments')}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm"
        >
          Gérer toutes les assignations
        </button>
      </div>
    </div>
  );
};

export default RecentAssignments;
