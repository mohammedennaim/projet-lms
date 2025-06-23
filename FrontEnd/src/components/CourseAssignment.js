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
      const courses = await courseService.getAllCourses();
      console.log('Courses response:', courses);

      if (Array.isArray(courses)) {
        console.log('Setting courses:', courses);
        setCourses(courses);
      } else {
        console.error('Courses response is not an array:', courses);
        setCourses([]);
        setDataError('Format de réponse des cours invalide');
        showToast('Erreur lors du chargement des cours', 'error');
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
        setDataError(null); // Clear any previous errors
        
        if (result.isMockData) {
          console.log('Using mock data for assignments');
          showToast('Données de démonstration (serveur non accessible)', 'warning');
        } else {
          console.log('Successfully loaded assignments from API');
        }
      } else {
        console.error('Failed to fetch assignments:', result.error);
        setAssignments([]);
        setDataError(result.error);
        showToast(result.error || 'Erreur lors du chargement des assignations', 'error');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // En cas d'erreur, on utilise les données mock comme fallback
      try {
        const mockResult = await affectationService.getAllAffectations();
        if (mockResult.data && mockResult.data.length > 0) {
          setAssignments(mockResult.data);
          setDataError(null);
          showToast('Utilisation des données de démonstration', 'warning');
        } else {
          setAssignments([]);
          setDataError('Aucune donnée disponible');
          showToast('Aucune assignation trouvée', 'error');
        }
      } catch (fallbackError) {
        console.error('Even fallback failed:', fallbackError);
        setAssignments([]);
        setDataError('Erreur lors du chargement des assignations');
        showToast('Erreur lors du chargement des assignations', 'error');
      }
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
      const result = await affectationService.assignCourseToUsers(
        selectedCourse,
        selectedEmployees,
        assignmentDate
      );
      
      if (result.success) {
        if (result.data && result.data.created > 0) {
          showToast(`Cours assigné avec succès à ${result.data.created} employé(s)`, 'success');
        }
        
        if (result.data && result.data.errors && result.data.errors.length > 0) {
          console.warn('Some assignments had errors:', result.data.errors);
          showToast(`Assignations partielles: ${result.data.errors.length} erreur(s)`, 'warning');
        }
        
        setSelectedCourse('');
        setSelectedEmployees([]);
        setShowAssignmentModal(false);
        fetchAssignments();
      } else {
        showToast('Erreur lors de l\'assignation du cours', 'error');
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      const errorMessage = error.message || 'Erreur lors de l\'assignation du cours';
      showToast(errorMessage, 'error');
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
              
              {/* Bouton Select All */}
              <div className="mb-2">
                <button
                  type="button"
                  onClick={handleSelectAllEmployees}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedEmployees.length === employees.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
                <span className="text-sm text-gray-500 ml-2">
                  ({selectedEmployees.length} sélectionné(s))
                </span>
              </div>

              {/* Liste des employés avec checkboxes */}
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`employee-${employee.id}`}
                      checked={selectedEmployees.includes(employee.id.toString())}
                      onChange={() => handleEmployeeSelection(employee.id.toString())}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label 
                      htmlFor={`employee-${employee.id}`}
                      className="text-sm text-gray-700 cursor-pointer flex-1"
                    >
                      {employee.firstName} {employee.lastName} ({employee.email})
                    </label>
                  </div>
                ))}
              </div>
              
              {employees.length === 0 && (
                <p className="text-sm text-gray-500 italic">Aucun employé disponible</p>
              )}
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
