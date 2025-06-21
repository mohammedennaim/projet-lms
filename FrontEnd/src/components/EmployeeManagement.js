import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/UserService';

const EmployeeManagement = () => {
  // We're using the user object from useAuth for displaying the username
  const { user } = useAuth(); 
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [toast, setToast] = useState(null);
  // Fetch real employees data from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the actual API endpoint to get employee data
        const response = await UserService.getAllEmployees();
        
        if (response.success && Array.isArray(response.data)) {
          // Transform API data to match component expectations
          const transformedEmployees = response.data.map(emp => {
            const nameParts = emp.fullName.split(' ');
            return {
              id: emp.id,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              email: emp.email,
              role: emp.roles || 'employée',
              department: 'IT', // Default department since it's not in API
              enrolledCourses: 0, // Default values
              completionRate: 0
            };
          });
          setEmployees(transformedEmployees);
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Une erreur est survenue lors du chargement des employés");
        
        // Fallback to mock data if API fails
        const mockEmployees = [
          {
            id: 1,
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@example.com',
            role: 'employée',
            department: 'IT',
            enrolledCourses: 3,
            completionRate: 78
          },
          {
            id: 2,
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie.martin@example.com',
            role: 'employée',
            department: 'HR',
            enrolledCourses: 5,
            completionRate: 92
          },
          {
            id: 3,
            firstName: 'Pierre',
            lastName: 'Dubois',
            email: 'pierre.dubois@example.com',
            role: 'employée',
            department: 'Finance',
            enrolledCourses: 2,
            completionRate: 65
          },
          {
            id: 4,
            firstName: 'Sophie',
            lastName: 'Bernard',
            email: 'sophie.bernard@example.com',
            role: 'employée',
            department: 'Marketing',
            enrolledCourses: 4,
            completionRate: 88
          },
          {
            id: 5,
            firstName: 'Thomas',
            lastName: 'Petit',
            email: 'thomas.petit@example.com',
            role: 'employée',
            department: 'IT',
            enrolledCourses: 6,
            completionRate: 75
          }
        ];
        
        setEmployees(mockEmployees);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  // Gestion des filtres
  const filteredEmployees = Array.isArray(employees) ? employees.filter(employee => {
    const matchesSearch = 
      (employee.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.role || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  }) : [];

  // Gestion des départements uniques pour le filtre
  const departments = ['all', ...new Set(employees.map(emp => emp.department || 'IT'))];

  // Affichage du toast
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  // Chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></div>
          </div>
          <p className="mt-4 text-blue-600 font-medium animate-pulse">Chargement des employés...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8 pt-20">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-500/5 border border-white/20 relative overflow-hidden">
          {/* Effet de brillance */}
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Employés
              </h1>
              <p className="text-gray-500 mt-2">
                Bienvenue, <span className="font-medium text-blue-600">{user?.firstName || 'Utilisateur'}</span> - 
                Gérez les profils et les inscriptions des employés
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  className="w-full px-4 py-2 pl-10 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              
              <select
                className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">Tous les départements</option>
                {departments.filter(d => d !== 'all').map((department, index) => (
                  <option key={index} value={department}>{department}</option>
                ))}
              </select>
              
              <button
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Nouvel Employé
                </span>
              </button>
            </div>
          </div>
        </div>
          {/* Liste des employés */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 md:p-4 shadow-xl shadow-blue-500/5 border border-white/20 overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-700 mb-2">Erreur de chargement</h3>
              <p className="text-red-500 max-w-md mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun employé trouvé</h3>
              <p className="text-gray-500 max-w-md">
                Nous n'avons trouvé aucun employé correspondant à vos critères. Veuillez essayer avec une autre recherche ou réinitialiser les filtres.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Département</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => {                    return (
                      <tr 
                        key={employee.id} 
                        className="bg-white hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.firstName} {employee.lastName}</div>
                              <div className="text-sm text-gray-500">{employee.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.department}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.role}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.enrolledCourses} cours</div>
                          <div className="FSw-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full" 
                              style={{ width: `${employee.completionRate}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{employee.completionRate}% complété</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {}}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                              </svg>
                            </button>
                            <button 
                              className="text-indigo-600 hover:text-indigo-800"
                              onClick={() => {}}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {}}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Toast notification */}
        {toast && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeManagement;
