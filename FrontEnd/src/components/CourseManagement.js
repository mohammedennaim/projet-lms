import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import Navbar from './Navbar';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [animateCard, setAnimateCard] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast('Erreur lors du chargement des cours', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setShowModal(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
        showToast('Cours supprimé avec succès', 'success');
      } catch (err) {
        showToast('Erreur lors de la suppression du cours', 'error');
      }
    }
  };
  const handleSubmit = async (formData) => {
    try {
      // Assurer que l'image par défaut est utilisée si aucune n'est spécifiée
      if (!formData.image) {
        formData.image = "https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c=";
      }
      
      if (selectedCourse) {
        await courseService.updateCourse(selectedCourse.id, formData);
        setCourses(courses.map(course => 
          course.id === selectedCourse.id ? { ...course, ...formData } : course
        ));
        showToast('Cours mis à jour avec succès', 'success');
      } else {
        const newCourse = await courseService.createCourse(formData);
        setCourses([...courses, newCourse]);
        showToast('Cours créé avec succès', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement du cours', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Statut avec couleurs et icônes
  const getStatusInfo = (status) => {
    switch(status) {
      case 'active':
        return {
          label: 'Actif',
          bgColor: 'bg-gradient-to-r from-emerald-500 to-green-500',
          textColor: 'text-white',
          icon: (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        };
      case 'draft':
        return {
          label: 'Brouillon',
          bgColor: 'bg-gradient-to-r from-gray-400 to-gray-500',
          textColor: 'text-white',
          icon: (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          )
        };
      case 'archived':
        return {
          label: 'Archivé',
          bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
          textColor: 'text-white',
          icon: (
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
            </svg>
          )
        };
      default:
        return {
          label: status,
          bgColor: 'bg-gradient-to-r from-gray-400 to-gray-500',
          textColor: 'text-white',
          icon: null
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></div>
          </div>
          <p className="mt-4 text-blue-600 font-medium animate-pulse">Chargement des cours...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Navbar */}
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-500/5 border border-white/20 relative overflow-hidden">
          {/* Effet de brillance */}
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Cours
              </h1>
              <p className="text-gray-500 mt-2">
                Créez et gérez vos cours en toute simplicité
              </p>
            </div>
            
            <button 
              onClick={handleAddCourse} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nouveau cours
            </button>
          </div>
        </div>        {/* Recherche */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-lg shadow-blue-500/5 border border-white/20">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Messages d'erreur ou pas de résultats */}
        {error && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg shadow-blue-500/5 border border-white/20 text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Une erreur est survenue</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchCourses}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Réessayer
            </button>
          </div>
        )}

        {!error && filteredCourses.length === 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg shadow-blue-500/5 border border-white/20 text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun cours trouvé</h3>
            <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche ou créez un nouveau cours.</p>
            <button 
              onClick={handleAddCourse}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Créer un cours
            </button>
          </div>
        )}

        {/* Grille de cours */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCourses.map(course => (
            <div 
              key={course.id} 
              className="group bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg shadow-blue-500/5 border border-white/20 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2"
              onMouseEnter={() => setAnimateCard(course.id)}
              onMouseLeave={() => setAnimateCard(null)}
            >
              {/* Image avec overlay gradient */}            <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/40 z-10 transition-opacity duration-300 ${animateCard === course.id ? 'opacity-70' : 'opacity-40'}`}></div>
                <img
                  src="https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c="
                  alt={course.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${animateCard === course.id ? 'scale-110' : 'scale-100'}`}
                />
                
                {/* Badge de statut */}
                <div className={`absolute top-4 right-4 z-20 py-1.5 px-3 rounded-full text-xs font-medium flex items-center ${getStatusInfo(course.status).bgColor} ${getStatusInfo(course.status).textColor} shadow-lg backdrop-blur-md`}>
                  {getStatusInfo(course.status).icon}
                  {getStatusInfo(course.status).label}
                </div>
              </div>
              
              {/* Contenu */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                
                {/* Métriques */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <span>{course.students || 0} étudiants</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg>
                    </div>
                    <span>{course.rating || 0}/5</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 group-hover:underline"
                  >
                    Voir détails
                    <svg className={`w-4 h-4 transition-transform duration-300 ${animateCard === course.id ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal avec effet de verre */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div 
              className="bg-white/90 backdrop-blur-xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header du modal */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl relative">
                <h2 className="text-2xl font-bold">
                  {selectedCourse ? 'Modifier le cours' : 'Créer un nouveau cours'}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {selectedCourse ? 'Mettez à jour les informations du cours' : 'Remplissez les informations pour créer un cours'}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {/* Formulaire */}
              <form 
                className="p-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleSubmit(Object.fromEntries(formData));
                }}
              >
                <div className="space-y-6">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre du cours</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={selectedCourse?.title}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="Entrez le titre du cours"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      defaultValue={selectedCourse?.description}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all min-h-[120px] resize-y"
                      placeholder="Décrivez le contenu du cours"
                      required
                    />
                  </div>
                    {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL de l'image (optionnel)</label>
                    <input
                      type="url"
                      name="image"
                      defaultValue={selectedCourse?.image || "https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c="}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      placeholder="https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c="
                    />
                  </div>
                  
                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <div className="relative">
                      <select
                        name="status"
                        defaultValue={selectedCourse?.status || 'draft'}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
                      >
                        <option value="draft">Brouillon</option>
                        <option value="active">Actif</option>
                        <option value="archived">Archivé</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informations supplémentaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre d'étudiants</label>
                      <input
                        type="number"
                        name="students"
                        defaultValue={selectedCourse?.students || 0}
                        min="0"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Note (sur 5)</label>
                      <input
                        type="number"
                        name="rating"
                        defaultValue={selectedCourse?.rating || 0}
                        min="0"
                        max="5"
                        step="0.1"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
                  >
                    {selectedCourse ? 'Mettre à jour' : 'Créer le cours'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast notifications améliorées */}
        {toast && (
          <div 
            className={`fixed bottom-6 right-6 z-50 animate-slideInUp`}
          >
            <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl bg-white/90 backdrop-blur-xl border ${
              toast.type === 'success' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                toast.type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
              }`}>
                {toast.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">{toast.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CourseManagement;