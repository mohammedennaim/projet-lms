import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';
import Navbar from './Navbar';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionTimes, setQuestionTimes] = useState({});

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizService.getQuizByIdForEmployee(quizId);
        
        if (response.success) {
          setQuiz(response.data);
          
          // Initialiser le temps de début
          setStartTime(new Date());
          setQuestionStartTime(new Date());
          
          // Si le quiz a déjà été passé, afficher les résultats
          if (response.data.alreadySubmitted) {
            const resultsResponse = await quizService.getQuizResults(quizId);
            if (resultsResponse.success) {
              setResults(resultsResponse.data);
              setShowResults(true);
            }
          }
        } else {
          setError(response.message || 'Erreur lors du chargement du quiz');
        }
      } catch (err) {
        setError('Erreur lors du chargement du quiz');
        console.error('Error fetching quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const handleAnswerSelect = (questionId, responseId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: responseId
    }));
  };

  const saveQuestionTime = (questionId) => {
    if (questionStartTime) {
      const timeSpent = Math.floor((new Date() - questionStartTime) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [questionId]: timeSpent
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      // Sauvegarder le temps passé sur la question actuelle
      saveQuestionTime(quiz.questions[currentQuestionIndex].id);
      
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(new Date()); // Nouveau temps de début pour la question suivante
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Sauvegarder le temps passé sur la question actuelle
      saveQuestionTime(quiz.questions[currentQuestionIndex].id);
      
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(new Date()); // Nouveau temps de début pour la question précédente
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || quiz.questions.length === 0) return;

    // Vérifier que toutes les questions ont été répondues
    const unansweredQuestions = quiz.questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      alert(`Veuillez répondre à toutes les questions. ${unansweredQuestions.length} question(s) non répondue(s).`);
      return;
    }

    try {
      setSubmitting(true);
      
      // Sauvegarder le temps de la dernière question
      saveQuestionTime(quiz.questions[currentQuestionIndex].id);
      
      // Calculer le temps total
      const totalTimeSpent = startTime ? Math.floor((new Date() - startTime) / 1000) : 0;
      
      // Formater les réponses pour l'API
      const formattedAnswers = quiz.questions.map(question => ({
        questionId: question.id,
        selectedResponseId: answers[question.id]
      }));

      const response = await quizService.submitQuiz(quizId, formattedAnswers, {
        timeSpent: totalTimeSpent,
        questionTimes: questionTimes
      });
      
      if (response.success) {
        // Récupérer les résultats détaillés
        const resultsResponse = await quizService.getQuizResults(quizId);
        if (resultsResponse.success) {
          setResults(resultsResponse.data);
          setShowResults(true);
        }
      } else {
        setError(response.message || 'Erreur lors de la soumission du quiz');
      }
    } catch (err) {
      setError('Erreur lors de la soumission du quiz');
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-24 px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg text-center">
            <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Erreur</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-24 px-6 pb-12">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Résultats du Quiz</h1>
                <h2 className="text-xl text-gray-600">{results.quiz.title}</h2>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Math.round(results.percentage || results.score)}%
                  </div>
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    {results.performanceLevel}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {results.correctAnswers || 0} / {results.totalQuestions || 0} bonnes réponses
                  </div>
                  {results.timeSpent && (
                    <div className="text-sm text-gray-500">
                      Temps passé: {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
                    </div>
                  )}
                  <p className="text-gray-600 mt-4">
                    Score obtenu le {new Date(results.submittedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {results.feedback && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-yellow-800 mb-2">Feedback personnalisé</h4>
                  <p className="text-yellow-700 text-sm">{results.feedback}</p>
                </div>
              )}

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Détail des réponses :</h3>
                
                {results.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        question.selectedResponse.isCorrect 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {question.selectedResponse.isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Question {index + 1}: {question.content}
                        </h4>
                        <div className="space-y-2">
                          <div className={`p-2 rounded ${
                            question.selectedResponse.isCorrect 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}>
                            <span className="text-sm font-medium">Votre réponse: </span>
                            <span className="text-sm">{question.selectedResponse.content}</span>
                          </div>
                          {question.timeSpent && (
                            <div className="text-xs text-gray-500">
                              Temps passé: {Math.floor(question.timeSpent / 60)}m {question.timeSpent % 60}s
                            </div>
                          )}
                          {!question.selectedResponse.isCorrect && (
                            <div className="bg-green-50 border border-green-200 p-2 rounded">
                              <span className="text-sm font-medium text-green-700">Bonne(s) réponse(s): </span>
                              {question.correctResponses.map((correct, idx) => (
                                <div key={correct.id} className="text-sm text-green-700">
                                  {correct.content}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Retour au cours
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-24 px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune question disponible</h3>
            <p className="text-gray-600 mb-6">Ce quiz ne contient pas de questions.</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quiz.alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-24 px-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg text-center">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Quiz déjà passé</h3>
            <p className="text-gray-600 mb-2">Vous avez déjà passé ce quiz.</p>
            <p className="text-gray-600 mb-6">Score obtenu: {Math.round(quiz.previousScore)}%</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Retour au cours
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-24 px-6 pb-12">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} sur {quiz.questions.length}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.content}
            </h2>

            {/* Responses */}
            <div className="space-y-3 mb-8">
              {currentQuestion.responses.map((response) => (
                <label
                  key={response.id}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    answers[currentQuestion.id] === response.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={response.id}
                    checked={answers[currentQuestion.id] === response.id}
                    onChange={() => handleAnswerSelect(currentQuestion.id, response.id)}
                    className="mr-4 text-blue-600"
                  />
                  <span className="text-gray-700">{response.content}</span>
                </label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Précédent
              </button>

              <div className="flex space-x-4">
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQuestion.id]}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      !answers[currentQuestion.id]
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting || !answers[currentQuestion.id]}
                    className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                      submitting || !answers[currentQuestion.id]
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {submitting ? 'Soumission...' : 'Terminer le quiz'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
