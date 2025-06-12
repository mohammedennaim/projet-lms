import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);

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
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 font-sans p-8 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 font-sans p-8 animate-fadeIn">
      <div className="bg-white rounded-3xl p-10 mb-8 shadow-md flex justify-between items-center relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-blue-500 before:to-blue-700">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 m-0 animate-slideInLeft">Gestion des Cours</h1>
        <button onClick={handleAddCourse} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-4 px-8 rounded-xl text-base font-semibold cursor-pointer flex items-center gap-3 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg relative overflow-hidden">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Ajouter un cours
        </button>
      </div>      <div className="bg-white rounded-3xl p-8 mb-8 shadow-md flex gap-6 flex-wrap animate-slideInUp">
        <input
          type="text"
          placeholder="Rechercher un cours..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] py-4 px-5 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:bg-white"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="flex-1 min-w-[200px] py-4 px-5 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:bg-white appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%234a5568%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27%3E%3C/path%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1.5rem]"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="draft">Brouillon</option>
          <option value="archived">Archivé</option>
        </select>
      </div>      {error && (
        <div className="text-center p-16 bg-white rounded-3xl shadow-md animate-fadeIn">
          <div className="text-6xl text-gray-300 mb-6">⚠️</div>
          <p className="text-xl text-gray-500 mb-8">{error}</p>
        </div>
      )}

      {!error && filteredCourses.length === 0 && (
        <div className="text-center p-16 bg-white rounded-3xl shadow-md animate-fadeIn">
          <div className="text-6xl text-gray-300 mb-6 animate-bounce">📚</div>
          <p className="text-xl text-gray-500 mb-8">Aucun cours trouvé</p>
        </div>
      )}      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 animate-fadeIn">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-md transition-all duration-300 hover:translate-y-[-8px] hover:scale-[1.02] hover:shadow-lg relative transform-gpu">
            <img
              src={course.image || 'https://via.placeholder.com/300x200'}
              alt={course.title}
              className="w-full h-[220px] object-cover border-b border-gray-200 transition-transform duration-300 group-hover:scale-105"
            />
            <div className={`
              absolute top-5 right-5 py-2 px-4 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm
              ${course.status === 'active' ? 'bg-green-500/90 text-white' : 
                course.status === 'draft' ? 'bg-gray-200/90 text-gray-700' : 
                'bg-red-500/90 text-white'}
            `}>
              {course.status}
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 leading-snug">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{course.description}</p>
            </div>
            <div className="flex justify-between items-center p-5 bg-gray-50 border-t border-gray-200">
              <div className="flex gap-6 text-gray-600 text-sm">
                <span className="flex items-center gap-2">👥 {course.students || 0} étudiants</span>
                <span className="flex items-center gap-2">⭐ {course.rating || 0}/5</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="p-3 border-none rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 hover:translate-y-[-2px]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-3 border-none rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 hover:translate-y-[-2px]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>      {showModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-10 w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto relative animate-slideInUp shadow-2xl">
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
              <h2 className="text-3xl font-semibold text-gray-800 m-0">
                {selectedCourse ? 'Modifier le cours' : 'Ajouter un cours'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="bg-transparent border-none text-gray-500 cursor-pointer p-3 transition-all duration-300 rounded-lg hover:text-gray-800 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSubmit(Object.fromEntries(formData));
            }}>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-800 mb-3">Titre</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={selectedCourse?.title}
                  className="w-full py-4 px-5 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:bg-white"
                  required
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-800 mb-3">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedCourse?.description}
                  className="w-full py-4 px-5 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:bg-white min-h-[120px] resize-y"
                  required
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-800 mb-3">Statut</label>
                <select
                  name="status"
                  defaultValue={selectedCourse?.status || 'draft'}
                  className="w-full py-4 px-5 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:bg-white appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%234a5568%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27M19 9l-7 7-7-7%27%3E%3C/path%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1.5rem]"
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Actif</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-4 px-8 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-800 bg-white cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:translate-y-[-2px]"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="py-4 px-8 border-none rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg relative overflow-hidden"
                >
                  {selectedCourse ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {toast && (
        <div className={`fixed bottom-8 right-8 py-5 px-7 rounded-2xl bg-white shadow-2xl flex items-center gap-4 animate-slideInRight z-50 ${toast.type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
          <div className={`text-2xl ${toast.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {toast.type === 'success' ? '✅' : '❌'}
          </div>
          <p className="text-sm text-gray-800 font-medium">{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
