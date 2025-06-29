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
    if (location.pathname.includes('/workflow/course')) {
      setCurrentStep('course');
    } else if (location.pathname.includes('/workflow/resource')) {
      setCurrentStep('resource');
    } else if (location.pathname.includes('/workflow/quiz')) {
      setCurrentStep('quiz');
    } else if (location.pathname.includes('/workflow/question')) {
      setCurrentStep('question');
    }
    
    // Si un courseId est présent dans les params, mettre à jour le state
    if (courseId && !workflowData.courseId) {
      setWorkflowData(prev => ({ ...prev, courseId }));
    }
    
    // Si un quizId est présent dans les params, mettre à jour le state
    if (quizId && !workflowData.quizId) {
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
    setWorkflowData(prev => ({ ...prev, courseId: savedCourse.id }));
    setCurrentStep('resource');
    navigate(`/workflow/resource/${savedCourse.id}`);
    showToast(`Le cours "${savedCourse.title}" a été créé avec succès!`, 'success');
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
      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className={`text-sm font-medium ${currentStep === 'course' ? 'text-blue-600' : 'text-gray-500'}`}>Cours</div>
          <div className={`text-sm font-medium ${currentStep === 'resource' ? 'text-blue-600' : 'text-gray-500'}`}>Ressources</div>
          <div className={`text-sm font-medium ${currentStep === 'quiz' ? 'text-blue-600' : 'text-gray-500'}`}>Quiz</div>
          <div className={`text-sm font-medium ${currentStep === 'question' ? 'text-blue-600' : 'text-gray-500'}`}>Questions</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ 
              width: currentStep === 'course' ? '25%' : 
                     currentStep === 'resource' ? '50%' : 
                     currentStep === 'quiz' ? '75%' : '100%' 
            }}
          ></div>
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
