import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import questionService from '../services/questionService';
import quizService from '../services/quizService';

const QuestionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    quiz: '',
    reponses: [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ]
  });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les quiz
        const quizzesData = await quizService.getAllQuizzes();
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);

        // Si mode édition, charger la question
        if (isEdit) {
          const questionData = await questionService.getQuestionById(id);
          setFormData({
            content: questionData.content || '',
            quiz: questionData.quiz?.id || '',
            reponses: questionData.reponses?.length === 4 
              ? questionData.reponses 
              : [
                  { content: '', isCorrect: false },
                  { content: '', isCorrect: false },
                  { content: '', isCorrect: false },
                  { content: '', isCorrect: false }
                ]
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showToast('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResponseChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      reponses: prev.reponses.map((response, i) => 
        i === index ? { ...response, [field]: value } : response
      )
    }));
  };

  const handleCorrectAnswerChange = (index) => {
    setFormData(prev => ({
      ...prev,
      reponses: prev.reponses.map((response, i) => ({
        ...response,
        isCorrect: i === index
      }))
    }));
  };

  const validateForm = () => {
    if (!formData.content.trim()) {
      showToast('Le contenu de la question est requis', 'error');
      return false;
    }

    if (!formData.quiz) {
      showToast('Veuillez sélectionner un quiz', 'error');
      return false;
    }

    const validResponses = formData.reponses.filter(r => r.content.trim());
    if (validResponses.length !== 4) {
      showToast('Toutes les 4 réponses sont requises', 'error');
      return false;
    }

    const correctAnswers = formData.reponses.filter(r => r.isCorrect);
    if (correctAnswers.length !== 1) {
      showToast('Exactement une réponse doit être correcte', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (isEdit) {
        await questionService.updateQuestion(id, formData);
        showToast('Question modifiée avec succès', 'success');
      } else {
        await questionService.createQuestion(formData);
        showToast('Question créée avec succès', 'success');
      }
      
      setTimeout(() => navigate('/questions'), 1500);    } catch (error) {
      console.error('Error saving question:', error);
      let errorMessage = isEdit 
        ? 'Erreur lors de la modification de la question' 
        : 'Erreur lors de la création de la question';
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.general) {
          errorMessage = errors.general;
        } else {
          const firstError = Object.values(errors)[0];
          if (firstError) {
            errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          }
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isEdit ? 'Modifier la Question' : 'Nouvelle Question'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEdit ? 'Modifiez les détails de la question' : 'Créez une nouvelle question avec 4 réponses'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quiz Selection */}
              <div>
                <label htmlFor="quiz" className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz associé *
                </label>
                <select
                  id="quiz"
                  name="quiz"
                  value={formData.quiz}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  required
                >
                  <option value="">Sélectionnez un quiz</option>
                  {quizzes.map(quiz => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu de la question *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 resize-none"
                  placeholder="Entrez le contenu de la question..."
                  required
                />
              </div>

              {/* Responses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Réponses * (sélectionnez la bonne réponse)
                </label>
                <div className="space-y-4">
                  {formData.reponses.map((response, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id={`correct-${index}`}
                          name="correctAnswer"
                          checked={response.isCorrect}
                          onChange={() => handleCorrectAnswerChange(index)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor={`correct-${index}`} className="ml-2 text-sm text-gray-700">
                          Correcte
                        </label>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={response.content}
                          onChange={(e) => handleResponseChange(index, 'content', e.target.value)}
                          placeholder={`Réponse ${index + 1}`}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/questions')}
                  className="flex-1 px-6 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEdit ? 'Modification...' : 'Création...'}
                    </div>
                  ) : (
                    isEdit ? 'Modifier la question' : 'Créer la question'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
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
  );
};

export default QuestionForm;
