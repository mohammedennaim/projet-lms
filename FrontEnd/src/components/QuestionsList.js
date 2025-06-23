import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import questionService from '../services/questionService';

const QuestionsList = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await questionService.getAllQuestions(page, 10, searchTerm);
      setQuestions(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Erreur lors du chargement des questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
  const handleDelete = async (questionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      try {
        await questionService.deleteQuestion(questionId);
        setQuestions(prev => prev.filter(q => q.id !== questionId));
      } catch (err) {
        console.error('Error deleting question:', err);
        setError('Erreur lors de la suppression de la question');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  if (loading && page === 1) {
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Gestion des Questions
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les questions des quiz de votre plateforme
            </p>
          </div>

          {/* Search and Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Rechercher des questions..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
                <button
                onClick={() => navigate('/questions/create')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                Nouvelle Question
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Questions List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune question trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {question.content || `Question #${question.id}`}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          {question.quiz && (
                            <p><span className="font-medium">Quiz:</span> {question.quiz.title}</p>
                          )}
                          {question.reponses && (
                            <p><span className="font-medium">Réponses:</span> {question.reponses.length} options</p>
                          )}
                          {question.createdAt && (
                            <p><span className="font-medium">Créé le:</span> {new Date(question.createdAt).toLocaleDateString('fr-FR')}</p>
                          )}
                        </div>
                      </div>
                        <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => navigate(`/questions/${question.id}/edit`)}
                          className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                
                <span className="px-4 py-1 text-gray-700">
                  Page {page} sur {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsList;
