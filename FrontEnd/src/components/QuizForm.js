import React, { useState, useEffect } from 'react';
import courseService from '../services/courseService';
import quizService from '../services/quizService';

const QuizForm = ({ onQuizCreated, isWorkflowMode = false, predefinedCourseId }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: predefinedCourseId || ''
  });

  useEffect(() => {
    // Si un courseId est prédéfini, utilisez-le dans le formulaire
    if (predefinedCourseId) {
      setFormData(prev => ({
        ...prev,
        course: predefinedCourseId
      }));
    }
    
    fetchCourses();
  }, [predefinedCourseId]);

  const fetchCourses = async () => {
    try {
      const coursesData = await courseService.getAllCourses();
      const normalizedCourses = Array.isArray(coursesData) ? coursesData : [];
      setCourses(normalizedCourses);
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
      setError('Erreur lors du chargement des cours');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre du quiz est requis');
      return;
    }

    if (!formData.course) {
      setError('Veuillez sélectionner un cours');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Préparer les données pour l'API en incluant l'ID du cours
      const quizData = {
        title: formData.title,
        description: formData.description,
        course: formData.course // Envoyer directement l'ID du cours
      };
      
      // Create new quiz
      const newQuiz = await quizService.createQuiz(quizData);
      
      // Réinitialiser le formulaire si pas dans le mode workflow
      if (!isWorkflowMode) {
        setFormData({
          title: '',
          description: '',
          course: predefinedCourseId || ''
        });
      }
      
      // Notifier le composant parent
      if (onQuizCreated) {
        onQuizCreated(newQuiz);
      }
      
    } catch (error) {
      console.error('Erreur lors de la création du quiz:', error);
      setError('Erreur lors de la création du quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-blue-500/5 border border-white/20 relative overflow-hidden">
      <div className="absolute -left-40 -top-40 w-80 h-80 bg-purple-200 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-200 rounded-full opacity-10 blur-3xl"></div>
      
      <div className="relative">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Créer un nouveau quiz
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titre du quiz <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
              placeholder="Entrez le titre du quiz"
              required
            />
          </div>

          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
              Cours associé <span className="text-red-500">*</span>
            </label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 ${predefinedCourseId ? 'bg-gray-100' : ''}`}
              required
              disabled={predefinedCourseId !== undefined}
            >
              <option value="">Sélectionnez un cours</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {predefinedCourseId && (
              <p className="mt-1 text-xs text-gray-500">
                Le cours est prédéfini dans le workflow de création.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 resize-none"
              placeholder="Entrez une description du quiz (objectifs, thématiques abordées...)"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Création en cours...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Créer le quiz
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizForm;
