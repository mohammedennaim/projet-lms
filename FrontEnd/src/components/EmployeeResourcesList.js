import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from './Navbar';

const EmployeeResourcesList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resources, setResources] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchEmployeeResources = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch assigned resources for the employee
        const userId = user.userId;
        const response = await api.get(`/api/employee/affectations/${userId}`);
        
        setResources(response.data.resources || []);
      } catch (err) {
        console.error('Error fetching employee resources:', err);
        setError('Failed to load your assigned resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeResources();
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Mes Ressources
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-gray-500 sm:mt-4">
            Accédez à toutes les ressources complémentaires
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 h-2"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-500 mb-4 line-clamp-2">
                      {resource.description || "Aucune description disponible"}
                    </p>
                    <div className="flex items-center mb-4 text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {resource.type}
                    </div>
                    <div className="flex justify-end">
                      <a 
                        href={resource.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white text-sm px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                      >
                        Voir la ressource
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune ressource disponible</h3>
                <p className="mt-2 text-base text-gray-500">
                  Vous n'avez pas de ressources assignées pour le moment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeResourcesList;
