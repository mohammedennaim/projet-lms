import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from './Navbar';

const EmployeeQuizzesList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEmployeeQuizzes = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch assigned quizzes for the employee
        const userId = user.userId;
        const response = await api.get(`/api/employee/affectations/${userId}`);
        
        setQuizzes(response.data.quizzes || []);
      } catch (err) {
        console.error('Error fetching employee quizzes:', err);
        setError('Failed to load your assigned quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeQuizzes();
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Mes Quiz
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-gray-500 sm:mt-4">
            Testez vos connaissances avec les quiz assignés
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-2"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center mb-4 text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {quiz.questionCount || 0} questions
                    </div>
                    <div className="flex justify-end">
                      <Link 
                        to={`/quiz/${quiz.id}/details`}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                      >
                        Passer le quiz
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun quiz disponible</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Vous n'avez pas encore de quiz assignés. Terminez d'abord vos cours.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeQuizzesList;
