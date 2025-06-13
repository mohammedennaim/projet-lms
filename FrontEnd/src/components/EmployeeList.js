import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import userService from '../services/UserService';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord avec l'endpoint spécifique aux employés
      let data;
      try {
        const response = await userService.getAllEmployees();
        data = {
          users: response.data || [],
          pagination: {
            page: 1,
            limit: 10,
            total: (response.data || []).length,
            pages: 1
          }
        };
      } catch (adminError) {
        // Si l'endpoint admin ne fonctionne pas, essayer avec les filtres généraux
        const filters = {
          role: 'employée',
          search: searchTerm || ''
        };
        data = await userService.getUsers(page, 10, filters);
      }
      
      setEmployees(data.users || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: data.users?.length || 0,
        pages: 1
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      if (err.response?.status === 403) {
        setError("Vous n'avez pas l'autorisation d'accéder à cette ressource. Veuillez contacter l'administrateur.");
      } else if (err.response?.status === 401) {
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else if (!navigator.onLine) {
        setError("Vous êtes hors ligne. Veuillez vérifier votre connexion internet.");
      } else {
        setError('Impossible de charger les employés. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await userService.deleteUser(employeeId);
        showToast('Employé supprimé avec succès', 'success');
        fetchEmployees();
      } catch (err) {
        showToast('Erreur lors de la suppression de l\'employé', 'error');
      }
    }
  };
  const handleSubmit = async (formData) => {
    try {
      // Ajouter le rôle 'employée' pour s'assurer qu'il s'agit d'un employé
      formData.roles = 'employée';
      
      // Mettre à jour l'employé existant
      await userService.updateUser(selectedEmployee.id, formData);
      showToast('Employé mis à jour avec succès', 'success');
      
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      showToast(err.message || 'Une erreur est survenue', 'error');
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Retour à la première page lors d'une nouvelle recherche
    fetchEmployees();
  };
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPage(newPage);
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
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
            <div className="relative">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Employés
              </h1>
              <p className="text-gray-500 mt-2">
                Gérez les profils et les inscriptions des employés
              </p>
            </div>
          </div>
            {/* Barre de recherche */}
          <div className="mt-8">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pl-12 pr-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white/90"
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-2 bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Liste des employés */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg shadow-blue-500/5 border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-gray-600 font-medium text-sm tracking-wider">Employé</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-medium text-sm tracking-wider">Email</th>
                  <th className="py-3 px-4 text-center text-gray-600 font-medium text-sm tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">                {employees.length > 0 ? (
                  employees.map((employee) => {
                    return (
                      <tr key={employee.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                              {employee.fullName.charAt(0).toUpperCase()}{employee.fullName.indexOf(' ') > 0 ? employee.fullName.split(' ')[1].charAt(0).toUpperCase() : ''}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{employee.fullName}</p>
                            </div>
                          </div>                        </td>
                        <td className="py-3 px-4 text-gray-600">{employee.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                              title="Modifier"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                              title="Supprimer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })                ) : loading ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500">
                      Chargement des employés...
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500">
                      Aucun employé trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="py-4 px-6 flex justify-between items-center border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Affichage de {Math.min((page - 1) * pagination.limit + 1, pagination.total)} à {Math.min(page * pagination.limit, pagination.total)} sur {pagination.total} employés
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md text-sm ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Précédent
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.pages}
                  className={`px-3 py-1 rounded-md text-sm ${page === pagination.pages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Employee Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Modifier l'employé
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
                <EmployeeForm 
                employee={selectedEmployee}
                onSubmit={handleSubmit}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}

        {/* Toast notification */}
        {toast && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg animate-fadeInUp ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Formulaire d'employé
const EmployeeForm = ({ employee, onSubmit, onCancel }) => {  const [formData, setFormData] = useState({
    fullName: employee?.fullName || '',
    email: employee?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Nettoyer l'erreur quand l'utilisateur corrige
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Champs obligatoires
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Adresse email invalide';
    }
    
    // Validation du mot de passe pour les nouveaux employés ou changements de mot de passe
    if (!employee) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Préparer les données pour la soumission (supprimer confirmPassword)
      const { confirmPassword, ...submitData } = formData;
      
      // Ne pas envoyer le mot de passe s'il est vide (pour les mises à jour)
      if (employee && !submitData.password) {
        delete submitData.password;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="John Doe"
          />
          {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="john.doe@example.com"
          />          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        
        <div>          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe (laisser vide pour ne pas modifier)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Confirmer le mot de passe"
            required={!employee || !!formData.password}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          disabled={loading}
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {employee ? 'Mettre à jour' : 'Créer l\'employé'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeList;
