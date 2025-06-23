import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import questionService from '../services/questionService';
import quizService from '../services/quizService';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const questionsData = await questionService.getAllQuestions();
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des questions');
      setQuestions([]);
      showToast('Erreur lors du chargement des questions', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      const quizzesData = await quizService.getAllQuizzes();
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
    } catch (err) {
      console.error('Erreur lors du chargement des quiz:', err);
      setQuizzes([]);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
    fetchQuizzes();
  }, [fetchQuestions, fetchQuizzes]);

  const handleAddQuestion = () => {
    // Navigate to question creation page or show creation modal
    console.log('Add question functionality to be implemented');
  };

  const handleEditQuestion = (question) => {
    // Navigate to question edit page or show edit modal
    console.log('Edit question:', question);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        await questionService.deleteQuestion(questionId);
        setQuestions(prev => prev.filter(question => question.id !== questionId));
        showToast('Question supprimée avec succès', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression de la question:', error);
        showToast('Erreur lors de la suppression de la question', 'error');
      }
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesQuiz = selectedQuiz === 'all' || question.quiz?.id === parseInt(selectedQuiz);
    return matchesSearch && matchesQuiz;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-blue-100 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse"></div>
          </div>
          <p className="mt-4 text-blue-600 font-medium animate-pulse">Chargement des questions...</p>
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
                Gestion des Questions
              </h1>
              <p className="text-gray-500 mt-2">
                Gérez les questions de vos quiz et évaluations
              </p>
            </div>
            
            <button 
              onClick={handleAddQuestion} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nouvelle question
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-lg shadow-blue-500/5 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            >
              <option value="all">Tous les quiz</option>
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
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
              onClick={fetchQuestions}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && filteredQuestions.length === 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg shadow-blue-500/5 border border-white/20 text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune question trouvée</h3>
            <p className="text-gray-600 mb-6">Créez votre première question pour commencer.</p>
            <button 
              onClick={handleAddQuestion}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Créer une question
            </button>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4 mb-8">
          {filteredQuestions.map(question => (
            <div 
              key={question.id} 
              className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg shadow-blue-500/5 border border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{question.text}</h3>
                  {question.quiz && (
                    <p className="text-sm text-blue-600 mb-3">Quiz: {question.quiz.title}</p>
                  )}
                  
                  {question.reponses && question.reponses.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-600">Réponses :</p>
                      {question.reponses.map((reponse, index) => (
                        <div key={index} className={`text-sm p-2 rounded ${reponse.isCorrect ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                          {reponse.text} {reponse.isCorrect && '✓'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditQuestion(question)}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
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
          ))}
        </div>

        {/* Toast Notification */}
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

export default QuestionManagement;
