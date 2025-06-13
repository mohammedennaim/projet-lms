import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import UserService from '../services/UserService';
import affectationService from '../services/affectationService';

const QuickAssignment = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Récupérer les cours
      const coursesResponse = await courseService.getAllCourses();
      if (coursesResponse.success) {
        setCourses(coursesResponse.data || []);
      } else {
        showToast(coursesResponse.error || 'Erreur lors du chargement des cours', 'error');
        setCourses([]);
      }

      // Récupérer les employés
      const employeesResponse = await UserService.getAllEmployees();
      if (employeesResponse.success) {
        setEmployees(employeesResponse.data || []);
      } else {
        showToast(employeesResponse.error || 'Erreur lors du chargement des employés', 'error');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Erreur lors du chargement des données', 'error');
      setCourses([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickAssign = async () => {
    if (!selectedCourse || !selectedEmployee) {
      showToast('Veuillez sélectionner un cours et un employé', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await affectationService.assignCourseToUsers(
        selectedCourse,
        [selectedEmployee],
        new Date().toISOString().split('T')[0]
      );

      if (response.success) {
        showToast('Assignation effectuée avec succès !', 'success');
        setSelectedCourse('');
        setSelectedEmployee('');
        // Rafraîchir les données
        fetchData();
      } else {
        showToast(response.error || 'Erreur lors de l\'assignation', 'error');
      }
    } catch (error) {
      console.error('Error assigning course:', error);
      showToast(error.message || 'Erreur lors de l\'assignation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Assignation Rapide</h3>
        <button
          onClick={() => navigate('/assignments')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Voir tout →
        </button>
      </div>

      <div className="space-y-4">
        {/* Sélection du cours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cours
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Sélectionner un cours...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Sélection de l'employé */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employé
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Sélectionner un employé...</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-3">
          <button
            onClick={handleQuickAssign}
            disabled={loading || !selectedCourse || !selectedEmployee}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 disabled:bg-gray-400 transition-all duration-200 text-sm"
          >
            {loading ? 'Assignation...' : 'Assigner'}
          </button>
          <button
            onClick={() => navigate('/assignments')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm"
          >
            Gestion complète
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{courses.length} cours disponibles</span>
          <span>{employees.length} employés actifs</span>
        </div>
      </div>
    </div>
  );
};

export default QuickAssignment;
