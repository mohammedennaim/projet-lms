import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from './Navbar';

const EmployeeCoursesList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchEmployeeCourses = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch assigned courses for the employee
        const userId = user.userId;
        console.log(`EmployeeCoursesList: Fetching courses for employee ID ${userId}`);
        
        const response = await api.get(`/api/employee/affectations/${userId}`);
        console.log('EmployeeCoursesList: API response received:', response.data);
        
        // Ensure we only display courses assigned to this employee
        const assignedCourses = response.data.courses || [];
        console.log(`EmployeeCoursesList: Found ${assignedCourses.length} assigned courses`);
        
        setCourses(assignedCourses);
      } catch (err) {
        console.error('Error fetching employee courses:', err);
        setError('Failed to load your assigned courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeeCourses();
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Mes Cours Assignés
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-gray-500 sm:mt-4">
            Accédez uniquement aux cours qui vous ont été assignés par l'administrateur
          </p>
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 mx-auto max-w-3xl text-left">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-700">
                <strong>Important:</strong> Ce tableau de bord n'affiche que les cours qui vous ont été spécifiquement assignés par votre administrateur. Si vous ne voyez pas un cours que vous pensez devoir suivre, veuillez contacter votre responsable formation.
              </p>
            </div>
          </div>
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
                >
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-sm">
                    Assigné
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 mb-4 line-clamp-2">
                      {course.description || "Aucune description disponible"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <Link 
                        to={`/course/${course.id}/details`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition"
                      >
                        Voir le cours
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun cours assigné</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Vous n'avez pas encore de cours assignés. Veuillez contacter votre responsable formation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCoursesList;
