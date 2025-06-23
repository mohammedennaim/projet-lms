import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';

const AffectationEdit = () => {
  const { id } = useParams();  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dateAssigned, setDateAssigned] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Charger l'affectation existante
        const affectationResponse = await fetch(`http://localhost:8000/api/admin/affectations/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
          if (affectationResponse.ok) {
          const affectation = await affectationResponse.json();
          setSelectedEmployee(affectation.user?.id || affectation.employee?.id || '');
          setSelectedCourse(affectation.cours?.id || affectation.course?.id || '');
          
          // Récupérer et formater la date d'affectation
          if (affectation.dateAssigned) {
            // Convertir la date au format YYYY-MM-DD pour l'input date
            const date = new Date(affectation.dateAssigned);
            setDateAssigned(date.toISOString().split('T')[0]);
          } else {
            // Date d'aujourd'hui par défaut si pas de date existante
            const today = new Date();
            setDateAssigned(today.toISOString().split('T')[0]);
          }
        }// Charger les employés
        const employeesResponse = await fetch('http://localhost:8000/api/admin/users?role=ROLE_EMPLOYEE', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
          if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
            // Améliorer les données des employés pour s'assurer qu'on a les noms complets
          const employeesList = Array.isArray(employeesData) ? employeesData : employeesData.users || [];
          const processedEmployees = employeesList.map(employee => {
            // Nettoyage des données pour éviter les undefined
            const firstName = employee.firstName || '';
            const lastName = employee.lastName || '';
            const fullName = employee.fullName || '';
            const email = employee.email || '';
            const id = employee.id || '';
            
            let displayName = '';
            
            // Logique de priorité pour le nom d'affichage
            if (fullName && fullName.trim() !== '') {
              displayName = fullName.trim();
            } else if (firstName || lastName) {
              displayName = `${firstName} ${lastName}`.trim();
            } else if (email && email.includes('@')) {
              displayName = email.split('@')[0];
            } else if (id) {
              displayName = `Utilisateur ${id}`;
            } else {
              displayName = 'Nom non disponible';
            }
            
            return {
              ...employee,
              id: id,
              email: email || 'Email non disponible',
              fullName: fullName,
              firstName: firstName,
              lastName: lastName,
              displayName: displayName
            };
          });
          
          setEmployees(processedEmployees);
        }

        // Charger les cours
        const coursesResponse = await fetch('http://localhost:8000/api/admin/courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(Array.isArray(coursesData) ? coursesData : coursesData.courses || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee || !selectedCourse || !dateAssigned) {
      setError('Veuillez sélectionner un employé, un cours et une date d\'affectation');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/affectations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedEmployee,
          courseId: selectedCourse,
          dateAssigned: dateAssigned
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification de l\'affectation');
      }

      setSuccess(true);
      // Rediriger vers la liste après 2 secondes
      setTimeout(() => {
        window.location.href = '/affectations';
      }, 2000);

    } catch (err) {
      console.error('Error updating affectation:', err);
      setError(err.message || 'Erreur lors de la modification de l\'affectation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/affectations';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Modifier l'Affectation
            </h1>
            <p className="text-gray-600 mt-2">
              Modifier l'affectation d'un cours à un employé
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <p className="text-green-800">Affectation modifiée avec succès ! Redirection en cours...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection de l'employé */}
              <div>
                <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
                  Employé *
                </label>
                <select
                  id="employee"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner un employé</option>                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.displayName} - {employee.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection du cours */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                  Cours *
                </label>
                <select
                  id="course"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner un cours</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}                </select>
              </div>

              {/* Champ de date d'affectation */}
              <div>
                <label htmlFor="dateAssigned" className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'affectation *
                </label>
                <input
                  type="date"
                  id="dateAssigned"
                  value={dateAssigned}
                  onChange={(e) => setDateAssigned(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  📅 Date actuelle : {dateAssigned ? new Date(dateAssigned).toLocaleDateString('fr-FR') : 'Non définie'}
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4">                <button
                  type="submit"
                  disabled={submitting || !dateAssigned}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Modification...' : 'Modifier l\'affectation'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffectationEdit;
