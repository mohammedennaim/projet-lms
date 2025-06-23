import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import quizService from '../services/quizService';
import { courseService } from '../services/courseService';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: ''
  });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const quizzesData = await quizService.getAllQuizzes();
      const normalizedQuizzes = Array.isArray(quizzesData) ? quizzesData : [];
      setQuizzes(normalizedQuizzes);
      setError(null);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des quiz');
      setQuizzes([]);
      showToast('Erreur lors du chargement des quiz', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const coursesData = await courseService.getAllCourses();
      const normalizedCourses = Array.isArray(coursesData) ? coursesData : [];
      setCourses(normalizedCourses);
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, [fetchQuizzes, fetchCourses]);  const handleAddQuiz = () => {
    setFormData({ title: '', description: '', course: '' });
    setEditingQuiz(null);
    setShowModal(true);
  };

  const handleEditQuiz = (quiz) => {
    setFormData({ 
      title: quiz.title || '', 
      description: quiz.description || '',
      course: quiz.course?.id || ''
    });
    setEditingQuiz(quiz);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ title: '', description: '', course: '' });
    setEditingQuiz(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showToast('Le titre du quiz est requis', 'error');
      return;
    }

    if (!formData.course) {
      showToast('Veuillez sélectionner un cours', 'error');
      return;
    }

    try {
      setModalLoading(true);
        // Préparer les données pour l'API en incluant l'ID du cours
      const quizData = {
        title: formData.title,
        description: formData.description,
        course: formData.course // Envoyer directement l'ID du cours
      };
      
      if (editingQuiz) {
        // Update existing quiz
        const updatedQuiz = await quizService.updateQuiz(editingQuiz.id, quizData);
        setQuizzes(prev => prev.map(quiz => 
          quiz.id === editingQuiz.id ? updatedQuiz : quiz
        ));
        showToast('Quiz modifié avec succès', 'success');
      } else {
        // Create new quiz
        const newQuiz = await quizService.createQuiz(quizData);
        setQuizzes(prev => [newQuiz, ...prev]);
        showToast('Quiz créé avec succès', 'success');
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du quiz:', error);
      showToast(
        editingQuiz 
          ? 'Erreur lors de la modification du quiz' 
          : 'Erreur lors de la création du quiz', 
        'error'
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      try {
        await quizService.deleteQuiz(quizId);
        setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
        showToast('Quiz supprimé avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression du quiz:', error);
        showToast('Erreur lors de la suppression du quiz', 'error');
      }
    }
  };
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz && quiz.title && (
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></div>
          </div>
          <p className="mt-4 text-blue-600 font-medium animate-pulse">Chargement des quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-500/5 border border-white/20 relative overflow-hidden">
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Quiz
              </h1>
              <p className="text-gray-500 mt-2">
                Créez et gérez vos quiz et évaluations
              </p>
            </div>
            
            <button 
              onClick={handleAddQuiz} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nouveau quiz
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-lg shadow-blue-500/5 border border-white/20">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher un quiz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Error State */}
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
              onClick={fetchQuizzes}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && filteredQuizzes.length === 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg shadow-blue-500/5 border border-white/20 text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun quiz trouvé</h3>
            <p className="text-gray-600 mb-6">Créez votre premier quiz pour commencer.</p>
            <button 
              onClick={handleAddQuiz}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Créer un quiz
            </button>
          </div>
        )}

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredQuizzes.map(quiz => (
            <div 
              key={quiz.id} 
              className="group bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg shadow-blue-500/5 border border-white/20 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{quiz.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{quiz.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <div>{quiz.questions?.length || 0} question(s)</div>
                    {quiz.course && (
                      <div className="text-blue-600 font-medium mt-1">
                        {quiz.course.title}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuiz(quiz)}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                      title="Supprimer"
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
        </div>        {/* Toast Notification */}
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

        {/* Quiz Creation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20">              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {editingQuiz ? 'Modifier le quiz' : 'Créer un nouveau quiz'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitQuiz} className="space-y-4">                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du quiz *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    placeholder="Entrez le titre du quiz"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                    Cours associé *
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="">Sélectionnez un cours</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 resize-none"
                    placeholder="Entrez une description du quiz"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >                    {modalLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingQuiz ? 'Modification...' : 'Création...'}
                      </div>
                    ) : (
                      editingQuiz ? 'Modifier le quiz' : 'Créer le quiz'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuizManagement;
