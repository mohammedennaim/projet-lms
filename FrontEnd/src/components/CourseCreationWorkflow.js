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
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-white/30">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Étape 1: Créer un nouveau cours
              </h2>
              <p className="text-gray-600">Commencez par définir les informations de base de votre cours</p>
            </div>
            <CourseForm 
              onSave={handleCourseSaved} 
              onCancel={handleCancel} 
            />
          </div>
        );
      case 'resource':
        return (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-white/30">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Étape 2: Ajouter des ressources au cours
              </h2>
              <p className="text-gray-600">Enrichissez votre cours avec des vidéos et autres contenus</p>
            </div>
            <AddVideoResource 
              onResourceAdded={handleResourceAdded}
              courseId={workflowData.courseId} 
            />
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => {
                  setCurrentStep('course');
                  navigate(`/workflow/course/${workflowData.courseId}`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour</span>
              </button>
              <button 
                onClick={handleResourcesCompleted}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Continuer vers la création de quiz</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-white/30">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Étape 3: Créer un quiz pour le cours
              </h2>
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <p className="text-blue-800 font-medium">
                  Créez un quiz pour le cours "{workflowData.courseTitle}". 
                  Ce quiz permettra d'évaluer les connaissances acquises.
                </p>
              </div>
            </div>
            {/* Nous allons adapter le QuizForm pour notre workflow */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border border-gray-200/50">
              <QuizForm 
                predefinedCourseId={workflowData.courseId}
                onQuizCreated={handleQuizSaved}
                isWorkflowMode={true}
              />
            </div>
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => {
                  setCurrentStep('resource');
                  navigate(`/workflow/resource/${workflowData.courseId}`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour aux ressources</span>
              </button>
            </div>
          </div>
        );
      case 'question':
        return (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10 border border-white/30">
            <div className="mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Étape 4: Ajouter des questions au quiz
              </h2>
              <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                <p className="text-green-800 font-medium">
                  Ajoutez des questions à votre quiz. Vous pouvez ajouter autant de questions que vous le souhaitez.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-green-50/30 rounded-2xl p-6 border border-gray-200/50">
              <QuestionForm 
                predefinedQuizId={workflowData.quizId}
                onQuestionAdded={handleQuestionAdded}
                isWorkflowMode={true}
              />
            </div>
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => {
                  setCurrentStep('quiz');
                  navigate(`/workflow/quiz/${workflowData.courseId}`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour au quiz</span>
              </button>
              <button 
                onClick={handleWorkflowCompleted}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Terminer la création</span>
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-red-500/10 border border-red-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Étape inconnue</h3>
              <p className="text-gray-600">Une erreur s'est produite lors du chargement de l'étape.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Barre de navigation en haut */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg shadow-blue-500/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Création de Cours
                  </h1>
                  <p className="text-sm text-gray-500">Assistant de création étape par étape</p>
                </div>
              </div>
            </div>

            {/* Actions de navigation */}
            <div className="flex items-center space-x-4">
              {/* Indicateur d'étape rapide */}
              <div className="hidden md:flex items-center space-x-2 bg-white/60 rounded-full px-4 py-2 backdrop-blur-sm border border-white/30">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  Étape {currentStep === 'course' ? '1' : currentStep === 'resource' ? '2' : currentStep === 'quiz' ? '3' : '4'}/4
                </span>
              </div>

              {/* Bouton d'aide */}
              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Bouton annuler */}
              <button 
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
              >
                Annuler
              </button>

              {/* Bouton de retour aux cours */}
              <button 
                onClick={() => navigate('/courses')}
                className="px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-200 font-medium shadow-sm border border-gray-200"
              >
                Retour aux cours
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Container principal avec padding adapté */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>        {/* Message Toast */}
        {toast && (
          <div className={`mb-6 p-4 rounded-2xl backdrop-blur-xl border shadow-lg ${
            toast.type === 'success' ? 'bg-green-50/80 text-green-800 border-green-200/50 shadow-green-500/10' : 
            toast.type === 'error' ? 'bg-red-50/80 text-red-800 border-red-200/50 shadow-red-500/10' : 
            'bg-blue-50/80 text-blue-800 border-blue-200/50 shadow-blue-500/10'
          } animate-in slide-in-from-top duration-300`}>
            <div className="flex items-center space-x-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                toast.type === 'success' ? 'bg-green-200' : 
                toast.type === 'error' ? 'bg-red-200' : 'bg-blue-200'
              }`}>
                {toast.type === 'success' ? (
                  <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : toast.type === 'error' ? (
                  <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="font-medium">{toast.message}</p>
            </div>
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
    </div>
  );
};

export default CourseCreationWorkflow;
