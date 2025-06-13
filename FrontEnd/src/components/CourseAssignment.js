import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import courseService from '../services/courseService';
import UserService from '../services/UserService';
import affectationService from '../services/affectationService';

const CourseAssignment = () => {
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [isMockData, setIsMockData] = useState(false);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      console.log('Fetching employees...');
      const response = await UserService.getAllEmployees();
      console.log('Employees response:', response);

      if (response.success) {
        const employeeData = response.data || [];
        console.log('Setting employees:', employeeData);
        setEmployees(employeeData);
      } else {
        console.error('Failed to fetch employees:', response.error);
        setEmployees([]);
        setDataError(response.error);
        showToast(response.error || 'Erreur lors du chargement des employés', 'error');
      }
    } catch (error) {
      console.error('Error in fetchEmployees:', error);
      setEmployees([]);
      setDataError('Erreur lors du chargement des employés');
      showToast('Erreur lors du chargement des employés', 'error');
    }
  }, [showToast]);

  const fetchCourses = useCallback(async () => {
    try {
      console.log('Fetching courses...');
      const response = await courseService.getAllCourses();
      console.log('Courses response:', response);

      if (response.success) {
        const courseData = response.data || [];
        console.log('Setting courses:', courseData);
        setCourses(courseData);
      } else {
        console.error('Failed to fetch courses:', response.error);
        setCourses([]);
        setDataError(response.error);
        showToast(response.error || 'Erreur lors du chargement des cours', 'error');
      }
    } catch (error) {
      console.error('Error in fetchCourses:', error);
      setCourses([]);
      setDataError('Erreur lors du chargement des cours');
      showToast('Erreur lors du chargement des cours', 'error');
    }
  }, [showToast]);

  const fetchAssignments = useCallback(async () => {
    try {
      console.log('Fetching assignments...');
      const result = await affectationService.getAllAffectations();
      console.log('Assignments result:', result);
      
      if (result.success) {
        setAssignments(result.data || []);
        setIsMockData(result.isMockData || false);
        
        if (result.isMockData) {
          showToast('Données de démonstration chargées (API non disponible)', 'warning');
        }
      } else {
        console.error('Failed to fetch assignments:', result.error);
        setAssignments([]);
        setDataError(result.error);
        showToast(result.error || 'Erreur lors du chargement des assignations', 'error');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
      setDataError('Erreur lors du chargement des assignations');
      showToast('Erreur lors du chargement des assignations', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        await Promise.all([
          fetchEmployees(),
          fetchCourses(),
          fetchAssignments()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [fetchEmployees, fetchCourses, fetchAssignments]);

  const handleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAllEmployees = () => {
    const allEmployeeIds = employees.map(emp => emp.id);
    setSelectedEmployees(
      selectedEmployees.length === allEmployeeIds.length 
        ? [] 
        : allEmployeeIds
    );
  };
  const handleAssignCourse = async () => {
    if (!selectedCourse || selectedEmployees.length === 0) {
      showToast('Veuillez sélectionner un cours et au moins un employé', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Utiliser la méthode bulk assign du backend
      await affectationService.assignCourseToUsers(
        selectedCourse,
        selectedEmployees,
        assignmentDate
      );
      
      showToast(`Cours assigné avec succès à ${selectedEmployees.length} employé(s)`, 'success');
      setSelectedCourse('');
      setSelectedEmployees([]);
      setShowAssignmentModal(false);
      fetchAssignments();
    } catch (error) {
      showToast('Erreur lors de l\'assignation du cours', 'error');
      console.error('Error assigning course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette assignation ?')) {
      try {
        await affectationService.deleteAffectation(assignmentId);
        showToast('Assignation supprimée avec succès', 'success');
        fetchAssignments();
      } catch (error) {
        showToast('Erreur lors de la suppression', 'error');
        console.error('Error removing assignment:', error);
      }
    }
  };

  const getEmployeeName = (userId) => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employé inconnu';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Cours inconnu';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 
          toast.type === 'warning' ? 'bg-yellow-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {/* État de chargement */}
        {loadingData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Chargement des données...</span>
            </div>
          </div>
        )}

        {/* Affichage des erreurs */}
        {dataError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-red-700 font-medium">Erreur de chargement</span>
            </div>
            <p className="text-red-600 mt-1">{dataError}</p>
            <button
              onClick={() => {
                fetchEmployees();
                fetchCourses();
                fetchAssignments();
              }}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Indicateur de données mock */}
        {isMockData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path>
              </svg>
              <span className="text-yellow-700 font-medium">Données de démonstration</span>
            </div>
            <p className="text-yellow-600 mt-1">L'API n'est pas disponible. Les données affichées sont des exemples.</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Assignation des Cours
            </h1>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Nouvelle Assignation
            </button>
          </div>

          {/* Liste des assignations existantes */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Assignations Existantes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cours
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'assignation
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getEmployeeName(assignment.user?.id)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getCourseName(assignment.cours?.id)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {new Date(assignment.dateAssigned).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          assignment.assigneCours 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.assigneCours ? 'Assigné' : 'En attente'}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <button
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'assignation */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Nouvelle Assignation</h3>
            
            {/* Sélection du cours */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cours
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un cours...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection des employés */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employés ({employees.length} disponibles)
              </label>
              <select
                multiple
                value={selectedEmployees}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedEmployees(values);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                size="5"
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs employés
              </p>
            </div>

            {/* Date d'assignation */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'assignation
              </label>
              <input
                type="date"
                value={assignmentDate}
                onChange={(e) => setAssignmentDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAssignCourse}
                disabled={loading || !selectedCourse || selectedEmployees.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Assignation...' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAssignment;
