import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CourseForm from './CourseForm';
import AddVideoResource from './AddVideoResource';
import QuizForm from './QuizForm';
import QuestionForm from './QuestionForm';
import { useAuth } from '../context/AuthContext';

const CourseCreationWorkflow = () => {
  const navigate = useNavigate();
  const { step, courseId, quizId } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState('course');
  const [workflowData, setWorkflowData] = useState({
    courseId: courseId || null,
    quizId: quizId || null,
    resourceIds: [],
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Déterminer l'étape actuelle à partir de l'URL
  useEffect(() => {
    console.log('URL changée:', location.pathname);
    if (location.pathname.includes('/workflow/course')) {
      console.log('Setting current step to: course');
      setCurrentStep('course');
    } else if (location.pathname.includes('/workflow/resource')) {
      console.log('Setting current step to: resource');
      setCurrentStep('resource');
    } else if (location.pathname.includes('/workflow/quiz')) {
      console.log('Setting current step to: quiz');
      setCurrentStep('quiz');
    } else if (location.pathname.includes('/workflow/question')) {
      console.log('Setting current step to: question');
      setCurrentStep('question');
    }
    
    // Si un courseId est présent dans les params, mettre à jour le state
    if (courseId && !workflowData.courseId) {
      console.log('Setting courseId in workflow data:', courseId);
      setWorkflowData(prev => ({ ...prev, courseId }));
    }
    
    // Si un quizId est présent dans les params, mettre à jour le state
    if (quizId && !workflowData.quizId) {
      console.log('Setting quizId in workflow data:', quizId);
      setWorkflowData(prev => ({ ...prev, quizId }));
    }
  }, [location.pathname, courseId, quizId]);

  // Gérer les redirections selon l'étape
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Si l'URL change, mettre à jour l'étape actuelle
    if (step && step !== currentStep) {
      setCurrentStep(step);
    }
  }, [step, isAuthenticated, navigate, currentStep]);

  // Affichage du toast
  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Gérer la sauvegarde d'un cours et passer à l'étape suivante
  const handleCourseSaved = (savedCourse) => {
    console.log('Cours sauvegardé dans le workflow:', savedCourse);
    setWorkflowData(prev => ({ 
      ...prev, 
      courseId: savedCourse.id,
      courseTitle: savedCourse.title 
    }));
    setCurrentStep('resource');
    navigate(`/workflow/resource/${savedCourse.id}`);
    showToast(`Le cours "${savedCourse.title}" a été créé avec succès! Passons aux ressources.`, 'success');
  };

  // Gérer l'ajout d'une ressource
  const handleResourceAdded = (newResource) => {
    setWorkflowData(prev => ({ 
      ...prev, 
      resourceIds: [...prev.resourceIds, newResource.id] 
    }));
    showToast(`Ressource ajoutée avec succès!`, 'success');
  };

  // Passer de l'étape ressource à quiz
  const handleResourcesCompleted = () => {
    setCurrentStep('quiz');
    navigate(`/workflow/quiz/${workflowData.courseId}`);
    showToast('Passons maintenant à la création du quiz!', 'info');
  };

  // Gérer la sauvegarde d'un quiz et passer à l'étape suivante
  const handleQuizSaved = (savedQuiz) => {
    setWorkflowData(prev => ({ ...prev, quizId: savedQuiz.id }));
    setCurrentStep('question');
    navigate(`/workflow/question/${savedQuiz.id}`);
    showToast(`Le quiz "${savedQuiz.title}" a été créé avec succès!`, 'success');
  };

  // Gérer l'ajout d'une question
  const handleQuestionAdded = (newQuestion) => {
    showToast('Question ajoutée avec succès!', 'success');
  };

  // Finir le workflow
  const handleWorkflowCompleted = () => {
    navigate(`/courses/${workflowData.courseId}`);
    showToast('Félicitations! Votre cours est maintenant complet!', 'success');
  };

  // Annuler le workflow
  const handleCancel = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler la création? Tous les changements non enregistrés seront perdus.")) {
      navigate('/courses');
    }
  };

  // Rendering différent selon l'étape actuelle
  const renderCurrentStep = () => {
    switch(currentStep) {
      case 'course':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Étape 1: Créer un nouveau cours</h2>
            <CourseForm 
              onSave={handleCourseSaved} 
              onCancel={handleCancel} 
            />
          </div>
        );
      case 'resource':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Étape 2: Ajouter des ressources au cours</h2>
            <AddVideoResource 
              onResourceAdded={handleResourceAdded}
              courseId={workflowData.courseId} 
            />
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => {
                  setCurrentStep('course');
                  navigate(`/workflow/course/${workflowData.courseId}`);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Retour
              </button>
              <button 
                onClick={handleResourcesCompleted}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Continuer vers la création de quiz
              </button>
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Étape 3: Créer un quiz pour le cours</h2>
            <div className="mt-6 mb-6">
              <p className="italic text-gray-600">
                Créez un quiz pour le cours "{workflowData.courseTitle}". 
                Ce quiz permettra d'évaluer les connaissances acquises.
              </p>
            </div>
            {/* Nous allons adapter le QuizForm pour notre workflow */}
            <div className="border p-4 rounded bg-white shadow">
              <QuizForm 
                predefinedCourseId={workflowData.courseId}
                onQuizCreated={handleQuizSaved}
                isWorkflowMode={true}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => {
                  setCurrentStep('resource');
                  navigate(`/workflow/resource/${workflowData.courseId}`);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Retour aux ressources
              </button>
            </div>
          </div>
        );
      case 'question':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Étape 4: Ajouter des questions au quiz</h2>
            <div className="mt-4 mb-6">
              <p className="italic text-gray-600">
                Ajoutez des questions à votre quiz. Vous pouvez ajouter autant de questions que vous le souhaitez.
              </p>
            </div>
            <QuestionForm 
              predefinedQuizId={workflowData.quizId}
              onQuestionAdded={handleQuestionAdded}
              isWorkflowMode={true}
            />
            <div className="mt-6 flex justify-between">
              <button 
                onClick={() => {
                  setCurrentStep('quiz');
                  navigate(`/workflow/quiz/${workflowData.courseId}`);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Retour au quiz
              </button>
              <button 
                onClick={handleWorkflowCompleted}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Terminer la création
              </button>
            </div>
          </div>
        );
      default:
        return <div>Étape inconnue</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Barre d'étapes moderne */}
      <div className="mb-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-blue-500/5 border border-white/20">
          <div className="flex items-center justify-between">
            {/* Étape 1: Cours */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                currentStep === 'course' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-semibold ${
                  currentStep === 'course' ? 'text-blue-600' : 'text-gray-500'
                }`}>Cours</p>
                <p className="text-xs text-gray-400">Créer le cours</p>
              </div>
            </div>

            {/* Ligne de connexion */}
            <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
              ['resource', 'quiz', 'question'].includes(currentStep) 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                : 'bg-gray-200'
            }`}></div>

            {/* Étape 2: Ressources */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                currentStep === 'resource' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                  : ['quiz', 'question'].includes(currentStep)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4v16a1 1 0 001 1h8a1 1 0 001-1V4M12 8v8m-4-4h8" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-semibold ${
                  currentStep === 'resource' ? 'text-blue-600' : 
                  ['quiz', 'question'].includes(currentStep) ? 'text-green-600' : 'text-gray-500'
                }`}>Ressources</p>
                <p className="text-xs text-gray-400">Ajouter contenus</p>
              </div>
            </div>

            {/* Ligne de connexion */}
            <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
              ['quiz', 'question'].includes(currentStep) 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                : 'bg-gray-200'
            }`}></div>

            {/* Étape 3: Quiz */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                currentStep === 'quiz' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                  : currentStep === 'question'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-semibold ${
                  currentStep === 'quiz' ? 'text-blue-600' : 
                  currentStep === 'question' ? 'text-green-600' : 'text-gray-500'
                }`}>Quiz</p>
                <p className="text-xs text-gray-400">Créer évaluation</p>
              </div>
            </div>

            {/* Ligne de connexion */}
            <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
              currentStep === 'question' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                : 'bg-gray-200'
            }`}></div>

            {/* Étape 4: Questions */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                currentStep === 'question' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-semibold ${
                  currentStep === 'question' ? 'text-blue-600' : 'text-gray-500'
                }`}>Questions</p>
                <p className="text-xs text-gray-400">Ajouter questions</p>
              </div>
            </div>
          </div>

          {/* Barre de progression globale */}
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: currentStep === 'course' ? '25%' : 
                       currentStep === 'resource' ? '50%' : 
                       currentStep === 'quiz' ? '75%' : '100%' 
              }}
            ></div>
          </div>

          {/* Indicateur textuel de progression */}
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              Étape {currentStep === 'course' ? '1' : currentStep === 'resource' ? '2' : currentStep === 'quiz' ? '3' : '4'} sur 4
            </p>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {toast && (
        <div className={`mb-4 p-4 rounded ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' : 
          toast.type === 'error' ? 'bg-red-100 text-red-800 border-red-200' : 
          'bg-blue-100 text-blue-800 border-blue-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Contenu selon l'étape actuelle */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        renderCurrentStep()
      )}
    </div>
  );
};

export default CourseCreationWorkflow;
