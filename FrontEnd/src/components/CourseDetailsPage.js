import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import Navbar from './Navbar';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(id);
        setCourse(courseData);
        
        // Sélectionner automatiquement la première vidéo s'il y en a une
        if (courseData.ressources && courseData.ressources.length > 0) {
          setSelectedVideo(courseData.ressources[0]);
        }
        
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des détails du cours');
        showToast('Erreur lors du chargement du cours', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  // Fonction pour extraire l'ID de la vidéo YouTube
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Fonction pour créer l'URL embed YouTube
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1` : null;
  };

  // Fonction pour vérifier si c'est une URL YouTube
  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
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

  if (error || !course) {
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Cours non trouvé</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/courses')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Retour aux cours
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto pt-24 px-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/courses')}
              className="p-2 bg-white/70 backdrop-blur-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
              <p className="text-gray-600 mt-1">Détails du cours</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal - Vidéo */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              {selectedVideo ? (
                <div>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-900">
                    {isYouTubeUrl(selectedVideo.url) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(selectedVideo.url)}
                        title="Vidéo du cours"
                        className="w-full h-96"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video
                        src={selectedVideo.url}
                        controls
                        className="w-full h-96 object-cover"
                      >
                        Votre navigateur ne supporte pas la lecture vidéo.
                      </video>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Ressource vidéo
                    </h3>
                    <p className="text-gray-600 text-sm">
                      URL: {selectedVideo.url}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center h-96">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    <p className="text-gray-500">Aucune ressource vidéo disponible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description du cours */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations du cours */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations</h3>
              <div className="space-y-3">                <div className="flex justify-between items-center">
                  <span className="text-gray-600">L'employé assigné:</span>
                  <span className="font-medium text-gray-800">{course.employees?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quiz disponibles:</span>
                  <span className="font-medium text-gray-800">{course.quizzes?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ressources:</span>
                  <span className="font-medium text-gray-800">{course.ressources?.length || 0}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Créé le: {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Liste des ressources vidéo */}
            {course.ressources && course.ressources.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ressources vidéo</h3>
                <div className="space-y-2">
                  {course.ressources.map((ressource, index) => (
                    <button
                      key={ressource.id}
                      onClick={() => setSelectedVideo(ressource)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                        selectedVideo?.id === ressource.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedVideo?.id === ressource.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            Ressource {index + 1}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {ressource.url}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz du cours */}
            {course.quizzes && course.quizzes.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz du cours</h3>
                <div className="space-y-3">
                  {course.quizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800">{quiz.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {quiz.questionsCount} question{quiz.questionsCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}            {/* Employés assignés */}
            {course.employees && course.employees.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Employés assignés</h3>
                <div className="space-y-2">
                  {course.employees.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {employee.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{employee.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
