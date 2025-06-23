import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const EmployeeQuizDetails = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizDetails = async () => {
      if (!quizId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/employee/quiz/${quizId}/details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement du quiz');
        }

        const data = await response.json();
        setQuiz(data.data || data);
        setError(null);
      } catch (err) {
        console.error('Error fetching quiz details:', err);
        setError('Erreur lors du chargement des détails du quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  if (loading) {
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
              Détails du Quiz
            </h1>
            <p className="text-gray-600 mt-2">
              Consultez les détails et questions du quiz
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Quiz Details */}
          {quiz && (
            <>
              {/* Quiz Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {quiz.quiz?.title || 'Quiz sans titre'}
                </h2>
                {quiz.quiz?.description && (
                  <p className="text-gray-600 mb-4">
                    {quiz.quiz.description}
                  </p>
                )}
                <div className="text-sm text-gray-500">
                  <p>Nombre de questions: {quiz.questionsCount || quiz.questions?.length || 0}</p>
                </div>
              </div>

              {/* Questions */}
              {quiz.questions && quiz.questions.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Questions</h3>
                  
                  <div className="space-y-6">
                    {quiz.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-4">
                          {index + 1}. {question.content}
                        </h4>
                        
                        {question.reponses && question.reponses.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 mb-2">Options de réponse:</p>
                            {question.reponses.map((reponse, respIndex) => (
                              <div key={reponse.id} className="flex items-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 mr-3 text-sm bg-gray-100 rounded-full">
                                  {String.fromCharCode(65 + respIndex)}
                                </span>
                                <span className="text-gray-700">{reponse.content}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                
                {user?.roles?.includes('ROLE_EMPLOYEE') && (
                  <button
                    onClick={() => window.location.href = `/quiz/${quizId}/take`}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                  >
                    Passer le Quiz
                  </button>
                )}
              </div>
            </>
          )}

          {!quiz && !loading && !error && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg text-center">
              <p className="text-gray-500">Quiz non trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeQuizDetails;
