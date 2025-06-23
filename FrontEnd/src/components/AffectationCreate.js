import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

const AffectationCreate = () => {  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [dateAssigned, setDateAssigned] = useState(() => {
    // Date d'aujourd'hui par défaut au format YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  // Charger les employés et cours
  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const token = localStorage.getItem('token');        console.log('Chargement des employés et cours...');
        
        // Test de connectivité avec l'API
        console.log('URL de l\'API employés:', 'http://localhost:8000/api/admin/users?role=ROLE_EMPLOYEE');
        
        // Charger les employés
        const employeesResponse = await fetch('http://localhost:8000/api/admin/users?role=ROLE_EMPLOYEE', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          console.log('Employés chargés (données brutes):', employeesData);
          const employeesList = Array.isArray(employeesData) ? employeesData : employeesData.users || [];
          console.log('Liste des employés extraite:', employeesList);
          
          if (employeesList.length > 0) {
            console.log('Premier employé (exemple):', employeesList[0]);
          }
            // Améliorer les données des employés pour s'assurer qu'on a les noms complets
          const processedEmployees = employeesList.map((employee, index) => {
            console.log(`Traitement employé ${index + 1}:`, JSON.stringify(employee, null, 2));
            
            // Extraction sécurisée des données
            const rawFirstName = employee.firstName;
            const rawLastName = employee.lastName;
            const rawFullName = employee.fullName;
            const rawEmail = employee.email;
            const rawId = employee.id;
            
            console.log(`Données brutes employé ${index + 1}:`, {
              rawFirstName, rawLastName, rawFullName, rawEmail, rawId
            });
            
            // Nettoyage et validation des données
            const firstName = (rawFirstName && String(rawFirstName).trim() !== '' && String(rawFirstName) !== 'null') ? String(rawFirstName).trim() : '';
            const lastName = (rawLastName && String(rawLastName).trim() !== '' && String(rawLastName) !== 'null') ? String(rawLastName).trim() : '';
            const fullName = (rawFullName && String(rawFullName).trim() !== '' && String(rawFullName) !== 'null') ? String(rawFullName).trim() : '';
            const email = (rawEmail && String(rawEmail).trim() !== '' && String(rawEmail) !== 'null') ? String(rawEmail).trim() : '';
            const id = rawId ? String(rawId) : '';
            
            console.log(`Données nettoyées employé ${index + 1}:`, {
              firstName, lastName, fullName, email, id
            });
            
            // Construction du nom d'affichage avec logique de fallback
            let displayName = 'Nom non disponible';
            
            if (fullName) {
              displayName = fullName;
              console.log(`Utilisé fullName: "${fullName}"`);
            } else if (firstName || lastName) {
              displayName = `${firstName} ${lastName}`.trim();
              console.log(`Construit depuis firstName/lastName: "${displayName}"`);
            } else if (email && email.includes('@')) {
              displayName = email.split('@')[0];
              console.log(`Utilisé email username: "${displayName}"`);
            } else if (id) {
              displayName = `Utilisateur ${id}`;
              console.log(`Utilisé ID: "${displayName}"`);
            }
            
            // Validation de l'email
            let cleanEmail = 'Email non disponible';
            if (email && email.includes('@')) {
              cleanEmail = email;
            }
            
            const processedEmployee = {
              ...employee,
              id: id,
              email: cleanEmail,
              fullName: fullName,
              firstName: firstName,
              lastName: lastName,
              displayName: displayName
            };
            
            console.log(`Employé ${index + 1} final:`, processedEmployee);
            return processedEmployee;
          });
            setEmployees(processedEmployees);
          console.log('Nombre d\'employés avec ROLE_EMPLOYEE:', processedEmployees.length);
          console.log('Employés traités:', processedEmployees);
          
          // Si aucun employé trouvé, ajouter des informations de debug
          if (processedEmployees.length === 0) {
            console.warn('⚠️ AUCUN EMPLOYÉ TROUVÉ avec le rôle ROLE_EMPLOYEE');
            console.log('Vérifiez:');
            console.log('1. Que des utilisateurs existent avec le rôle ROLE_EMPLOYEE dans la base de données');
            console.log('2. Que les fixtures ont été chargées: php bin/console doctrine:fixtures:load');
            console.log('3. Que le serveur backend est démarré et accessible');
            setError('Aucun employé trouvé avec le rôle ROLE_EMPLOYEE. Vérifiez la base de données et les fixtures.');
          }
        } else {
          console.error('Erreur lors du chargement des employés:', employeesResponse.status);
          const errorText = await employeesResponse.text();
          console.error('Détail de l\'erreur:', errorText);
        }        // Charger les cours
        console.log('URL de l\'API cours:', 'http://localhost:8000/api/admin/courses');
        const coursesResponse = await fetch('http://localhost:8000/api/admin/courses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
          
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          console.log('Cours chargés (données brutes):', coursesData);
          const coursesList = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
          console.log('Liste des cours extraite:', coursesList);
          
          if (coursesList.length > 0) {
            console.log('Premier cours (exemple):', coursesList[0]);
          }
          
          // Traitement des données des cours
          const processedCourses = coursesList.map((course, index) => {
            console.log(`Traitement cours ${index + 1}:`, JSON.stringify(course, null, 2));
            
            const id = course.id || '';
            const title = course.title || '';
            const description = course.description || '';
            
            console.log(`Données cours ${index + 1}:`, { id, title, description });
            
            return {
              ...course,
              id: id,
              title: title || 'Titre non défini',
              description: description || 'Description non définie'
            };
          });
          
          setCourses(processedCourses);
          console.log('Nombre de cours disponibles:', processedCourses.length);
          console.log('Cours traités:', processedCourses);
          
          // Si aucun cours trouvé, ajouter des informations de debug
          if (processedCourses.length === 0) {
            console.warn('⚠️ AUCUN COURS TROUVÉ');
            console.log('Vérifiez:');
            console.log('1. Que des cours existent dans la base de données');
            console.log('2. Que les fixtures ont été chargées: php bin/console doctrine:fixtures:load');
            console.log('3. Que le serveur backend est démarré et accessible');
            setError('Aucun cours trouvé. Vérifiez la base de données et les fixtures.');
          }
        } else {
          console.error('Erreur lors du chargement des cours:', coursesResponse.status);
          const errorText = await coursesResponse.text();
          console.error('Détail de l\'erreur:', errorText);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee || !selectedCourse || !dateAssigned) {
      setError('Veuillez sélectionner un employé, un cours et une date d\'affectation');
      return;
    }

    setLoading(true);
    setError(null);    try {
      const token = localStorage.getItem('token');
      console.log('Envoi des données:', {
        userId: selectedEmployee,
        courseId: selectedCourse,
        dateAssigned: dateAssigned
      });
      
      const response = await fetch('http://localhost:8000/api/admin/affectations', {
        method: 'POST',
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

      console.log('Statut de la réponse:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur détaillée:', errorData);
        throw new Error(errorData.message || errorData.error || 'Erreur lors de la création de l\'affectation');
      }

      setSuccess(true);
      // Rediriger vers la liste après 2 secondes
      setTimeout(() => {
        window.location.href = '/affectations';
      }, 2000);

    } catch (err) {
      console.error('Error creating affectation:', err);
      setError(err.message || 'Erreur lors de la création de l\'affectation');
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    window.location.href = '/affectations';
  };

  if (dataLoading) {
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
              Nouvelle Affectation
            </h1>            <p className="text-gray-600 mt-2">
              Gérez les affectations de cours aux employés
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <p className="text-green-800">Affectation créée avec succès ! Redirection en cours...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Information détaillée sur les données chargées */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">État du système</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="flex items-center justify-between">                      <span className="text-sm text-blue-700">Employés</span>
                      <span className="text-sm font-bold text-blue-900">{employees.length}</span>
                    </div>
                    {employees.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Aucun employé trouvé</p>
                    )}
                  </div>
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Cours disponibles</span>
                      <span className="text-sm font-bold text-blue-900">{courses.length}</span>
                    </div>
                    {courses.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Aucun cours disponible</p>
                    )}
                  </div>
                </div>
              </div>              {/* Alerte si pas de données avec solutions */}
              {(employees.length === 0 || courses.length === 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Données manquantes !</h3>
                      <div className="mt-2 text-sm text-yellow-700">                        {employees.length === 0 && (
                          <div className="mb-3">
                            <p>• <strong>Aucun employé trouvé.</strong></p>
                            <p className="ml-4 text-xs mt-1">Solutions possibles :</p>
                            <ul className="ml-8 text-xs list-disc">
                              <li>Exécuter les fixtures : <code className="bg-gray-200 px-1 rounded">php bin/console doctrine:fixtures:load</code></li>
                              <li>Créer un utilisateur employé</li>
                              <li>Vérifier que le serveur backend est démarré</li>
                            </ul>
                          </div>
                        )}
                        {courses.length === 0 && (
                          <div>
                            <p>• <strong>Aucun cours disponible pour l'affectation.</strong></p>
                            <p className="ml-4 text-xs mt-1">Créez d'abord des cours avant de faire des affectations.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}{/* Sélection de l'employé avec informations détaillées */}
              <div>                <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
                  Employé *{selectedEmployee && (
                    <span className="ml-2 text-blue-600 font-semibold">
                      - {(() => {
                        const employee = employees.find(emp => emp.id.toString() === selectedEmployee.toString());
                        return employee ? employee.displayName : 'Employé non trouvé';
                      })()}
                    </span>
                  )}
                </label>
                <select
                  id="employee"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={employees.length === 0}
                >
                  <option value="">
                    {employees.length === 0 ? "Aucun employé disponible" : "Sélectionner un employé"}
                  </option>                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.displayName} - {employee.email}
                      {employee.roles && ` (${employee.roles})`}
                    </option>
                  ))}
                </select>                {employees.length === 0 ? (
                  <p className="text-sm text-red-600 mt-1">
                    ❌ Aucun employé trouvé. Vérifiez que des utilisateurs employés existent.
                  </p>
                ) : (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ {employees.length} employé(s) disponible(s)
                  </p>
                )}
              </div>              {/* Sélection du cours avec informations détaillées */}
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
                  disabled={courses.length === 0}
                >
                  <option value="">
                    {courses.length === 0 ? "Aucun cours disponible" : "Sélectionner un cours"}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                      {course.description && ` - ${course.description.substring(0, 50)}${course.description.length > 50 ? '...' : ''}`}
                    </option>
                  ))}
                </select>
                {courses.length === 0 ? (
                  <p className="text-sm text-red-600 mt-1">
                    ❌ Aucun cours disponible. Veuillez d'abord créer des cours.
                  </p>
                ) : (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ {courses.length} cours disponible(s) pour l'affectation
                  </p>                )}
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
                  📅 Date par défaut : aujourd'hui ({new Date(dateAssigned).toLocaleDateString('fr-FR')})
                </p>
              </div>              {/* Boutons */}
              <div className="flex gap-4 pt-4">                <button
                  type="submit"
                  disabled={loading || employees.length === 0 || courses.length === 0 || !dateAssigned}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création en cours...
                    </span>
                  ) : (
                    'Créer l\'affectation'
                  )}
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

export default AffectationCreate;
