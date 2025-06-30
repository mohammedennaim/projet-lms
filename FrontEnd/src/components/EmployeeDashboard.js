import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from './Navbar';
import './EmployeeDashboard.css';

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

        // Fetch only assigned courses for the employee
        const userId = user.userId;
        console.log(`Fetching assigned courses for employee with ID: ${userId}`);
        const response = await api.get(`/api/employee/affectations/${userId}`);
        
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
      <div className="employee-dashboard">
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      <Navbar />
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1 className="welcome-title">Bienvenue, {user.fullName || user.email}</h1>
          <p className="welcome-subtitle">Votre espace d'apprentissage personnel</p>
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
        
        <div className="courses-count">
          <div className="stats-card">
            <div className="stats-icon courses">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="stats-details">
              <div className="stats-value">{courses.length}</div>
              <div className="stats-label">Cours assignés</div>
            </div>
          </div>
        </div>

        {/* Courses Section - Only show assigned courses */}
        <div className="mb-10">
          <h2 className="section-title">
            <span className="section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Mes Cours Assignés
          </h2>
          
          {courses.length === 0 ? (
            <div className="empty-section">
              <div className="empty-icon">📚</div>
              <p className="empty-text">Aucun cours ne vous a été assigné pour le moment.</p>
              <p>Consultez votre responsable formation pour plus d'informations.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {/* Display only courses that have been assigned to this employee */}
              {courses.map((course) => (
                <div className="course-card" key={course.id}>
                  <div className="assigned-badge">Assigné</div>
                  <div className="card-content">
                    <h3 className="card-title">{course.title}</h3>
                    <p className="card-description">{course.description || "Aucune description disponible pour ce cours"}</p>
                    <div className="card-meta">
                      <span className="card-meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 card-meta-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="card-actions">
                      <Link to={`/course/${course.id}/details`} className="card-button card-button-primary">
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
