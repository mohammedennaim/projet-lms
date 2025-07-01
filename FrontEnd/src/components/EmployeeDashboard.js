import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from './Navbar';

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch assigned courses for the current employee
        console.log('Fetching assigned courses for current employee');
        const response = await api.get('/employee/affectations');
        
        console.log('API Response data:', response.data);
        console.log('Assigned courses:', response.data.courses || []);
        
        // Set only the courses assigned to this employee
        const assignedCourses = response.data.courses || [];
        console.log(`Found ${assignedCourses.length} assigned courses`);
        setCourses(assignedCourses);
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load your assigned courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <Navbar />
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Bienvenue, {user.fullName || user.email}
          </h1>
          <p className="text-gray-600 text-lg">Votre espace d'apprentissage personnel</p>
          <div className="mt-4 text-blue-600 bg-blue-50 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p><strong>Important:</strong> Ce tableau de bord affiche uniquement les cours qui vous ont été assignés par votre administrateur.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 flex items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-grow">
              <div className="text-2xl font-bold mb-1">{courses.length}</div>
              <div className="text-gray-600 text-sm">Cours assignés</div>
            </div>
          </div>
        </div>

        {/* Courses Section - Only show assigned courses */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
            <span className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Mes Cours Assignés
          </h2>
          
          {courses.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-600">
              <div className="text-5xl mb-4 text-gray-300">📚</div>
              <p className="text-lg mb-4">Aucun cours ne vous a été assigné pour le moment.</p>
              <p>Consultez votre responsable formation pour plus d'informations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Display only courses that have been assigned to this employee */}
              {courses.map((course) => (
                <div className="relative bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-t-4 border-indigo-600 flex flex-col h-full" key={course.id}>
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-semibold px-3 py-1 rounded-full z-10 shadow-lg tracking-wide uppercase">
                    Assigné
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">{course.title}</h3>
                    <p className="text-gray-600 mb-4 flex-grow text-sm">{course.description || "Aucune description disponible pour ce cours"}</p>
                    <div className="flex items-center mb-4 text-gray-600 text-sm">
                      <span className="flex items-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Link to={`/course/${course.id}/details`} className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-indigo-600 text-white hover:bg-indigo-700 no-underline">
                        Voir le cours
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Ajout d'un pied de page pour clarifier à l'employé */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Ce dashboard ne présente que les cours qui vous sont assignés.</p>
          <p>Pour toute question, veuillez contacter votre administrateur.</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
