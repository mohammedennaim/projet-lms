import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import { ressourceService } from '../services/ressourceService';

// Fonction d'aide pour valider les URLs vidéo
const isValidVideoUrl = (url) => {
  if (!url || !url.trim()) return true; // URL optionnelle
  
  try {
    const urlObj = new URL(url.trim());
    
    // Vérifier que c'est HTTP ou HTTPS
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }
    
    // Vérifier que le domaine est valide
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return false;
    }
    
    // Optionnel : Vérifier des plateformes vidéo populaires
    const validDomains = [
      'youtube.com', 'www.youtube.com', 'youtu.be',
      'vimeo.com', 'www.vimeo.com',
      'dailymotion.com', 'www.dailymotion.com',
      'twitch.tv', 'www.twitch.tv'
    ];
    
    // Si c'est une plateforme connue, c'est valide
    if (validDomains.includes(urlObj.hostname.toLowerCase())) {
      return true;
    }
    
    // Pour d'autres domaines, vérifier juste que c'est une URL bien formée
    return true;
  } catch (error) {
    return false;
  }
};

const CourseForm = ({ course, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: 'https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c=',
    videoUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingVideoUrl, setLoadingVideoUrl] = useState(false);  // Initialize form data when course prop changes
  useEffect(() => {
    const loadCourseData = async () => {
      if (course && isEdit) {
        setLoadingVideoUrl(true);
        try {
          // Charger les données de base du cours
          const baseData = {
            title: course.title || '',
            description: course.description || '',
            image: course.image || 'https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c=',
            videoUrl: ''
          };

          // Récupérer l'URL de la ressource vidéo depuis la base de données
          try {
            const ressources = await ressourceService.getRessourcesByCourse(course.id);
            if (ressources && ressources.length > 0) {
              // Prendre la première ressource trouvée
              baseData.videoUrl = ressources[0].contenu || '';
            }
          } catch (ressourceError) {
            console.warn('Impossible de récupérer les ressources du cours:', ressourceError);
            // Continuer avec videoUrl vide
          }

          setFormData(baseData);
        } catch (error) {
          console.error('Erreur lors du chargement des données du cours:', error);
          // Fallback avec les données de base
          setFormData({
            title: course.title || '',
            description: course.description || '',
            image: course.image || 'https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c=',
            videoUrl: ''
          });
        } finally {
          setLoadingVideoUrl(false);
        }
      } else {
        setFormData({
          title: '',
          description: '',
          image: 'https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c=',
          videoUrl: ''
        });
      }
      setErrors({});
    };

    loadCourseData();
  }, [course, isEdit]);

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    } else if (formData.title.trim().length > 255) {
      newErrors.title = 'Le titre ne peut pas dépasser 255 caractères';
    }    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }    // Video URL validation (optional but if provided, must be valid)
    if (formData.videoUrl && formData.videoUrl.trim()) {
      if (!isValidVideoUrl(formData.videoUrl)) {
        newErrors.videoUrl = 'L\'URL de la vidéo doit être valide (ex: https://youtube.com/watch?v=...)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // Assurer qu'il y a toujours une image (utiliser l'image par défaut si aucune n'est fournie)
    const dataToSubmit = {
      ...formData,
      image: formData.image || "https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c="
    };
      try {
      let savedCourse;
      
      if (isEdit && course) {
        savedCourse = await courseService.updateCourse(course.id, dataToSubmit);
      } else {
        savedCourse = await courseService.createCourse(dataToSubmit);
      }      // Si une URL vidéo est fournie, créer ou mettre à jour la ressource
      if (formData.videoUrl && formData.videoUrl.trim()) {
        const videoUrl = formData.videoUrl.trim();
        
        // Double validation de l'URL avant de créer la ressource
        try {
          const url = new URL(videoUrl);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            throw new Error('Protocole non supporté');
          }
          
          // En mode édition, vérifier s'il existe déjà une ressource pour ce cours
          if (isEdit && course) {
            try {
              const existingRessources = await ressourceService.getRessourcesByCourse(savedCourse.id);
              if (existingRessources && existingRessources.length > 0) {
                // Mettre à jour la première ressource existante
                await ressourceService.updateRessource(existingRessources[0].id, {
                  contenu: videoUrl,
                  course_id: savedCourse.id
                });
              } else {
                // Créer une nouvelle ressource
                await ressourceService.createRessource({
                  contenu: videoUrl,
                  course_id: savedCourse.id
                });
              }
            } catch (getRessourceError) {
              // Si on ne peut pas récupérer les ressources existantes, créer une nouvelle
              await ressourceService.createRessource({
                contenu: videoUrl,
                course_id: savedCourse.id
              });
            }
          } else {
            // Mode création : créer une nouvelle ressource
            await ressourceService.createRessource({
              contenu: videoUrl,
              course_id: savedCourse.id
            });
          }
          
          console.log('Ressource vidéo sauvegardée avec succès pour le cours ID:', savedCourse.id);
        } catch (error) {
          if (error.message === 'Protocole non supporté' || error.name === 'TypeError') {
            console.warn('URL vidéo invalide, ressource non créée:', error.message);
            setErrors(prev => ({
              ...prev,
              videoUrl: 'URL vidéo invalide - ressource non créée'
            }));
          } else {
            console.warn('Erreur lors de la création de la ressource vidéo:', error);
            // Ne pas faire échouer la création du cours si la ressource échoue
          }
        }
      }
      
      if (onSave) {
        onSave(savedCourse);
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'Une erreur est survenue lors de la sauvegarde'
      });
    } finally {
      setLoading(false);
    }
  };  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      image: 'https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c=',
      videoUrl: ''
    });
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md animate-fadeIn">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">{isEdit ? 'Modifier le cours' : 'Nouveau cours'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {errors.submit && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {errors.submit}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-gray-800 font-medium text-sm">
            Titre du cours *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`py-3 px-4 border-2 ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'} rounded-lg transition-all duration-300 focus:outline-none focus:ring`}
            placeholder="Entrez le titre du cours"
            maxLength="255"
          />
          {errors.title && (
            <span className="text-red-500 text-sm font-medium">{errors.title}</span>
          )}
          <small className="text-gray-500 text-xs">
            {formData.title.length}/255 caractères
          </small>
        </div>        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-gray-800 font-medium text-sm">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`py-3 px-4 border-2 ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'} rounded-lg transition-all duration-300 focus:outline-none focus:ring resize-y min-h-[150px]`}
            placeholder="Décrivez le contenu et les objectifs du cours"
            rows="6"
          />
          {errors.description && (
            <span className="text-red-500 text-sm font-medium">{errors.description}</span>
          )}
          <small className="text-gray-500 text-xs">
            Minimum 10 caractères ({formData.description.length} caractères)          </small>
        </div>

        {/* Section URL de l'image masquée 
          <div className="flex flex-col gap-2">
          <label htmlFor="image" className="text-gray-800 font-medium text-sm">
            URL de l'image
          </label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:flex-1">
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-200 rounded-lg transition-all duration-300 focus:outline-none focus:ring"
                placeholder="URL de l'image du cours"
              />
            </div>
            <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={formData.image || "https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c="} 
                alt="Aperçu" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <small className="text-gray-500 text-xs">
            Laissez vide pour utiliser l'image par défaut
          </small>
        </div>
        */}        <div className="flex flex-col gap-2">
          <label htmlFor="videoUrl" className="text-gray-800 font-medium text-sm">
            Ressource vidéo (URL)
            {loadingVideoUrl && (
              <span className="ml-2 text-blue-600 text-xs flex items-center">
                <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Chargement...
              </span>
            )}
          </label><div className="flex flex-col gap-2">
            <div className="relative">              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                disabled={loadingVideoUrl}
                className={`py-3 px-4 pr-10 border-2 ${errors.videoUrl ? 'border-red-500 focus:ring-red-200' : formData.videoUrl && isValidVideoUrl(formData.videoUrl) ? 'border-green-500 focus:ring-green-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'} rounded-lg transition-all duration-300 focus:outline-none focus:ring w-full ${loadingVideoUrl ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder={loadingVideoUrl ? "Chargement de l'URL..." : "https://www.youtube.com/watch?v=... ou https://vimeo.com/..."}
              />
              {/* Indicateur de validation */}
              {formData.videoUrl && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isValidVideoUrl(formData.videoUrl) ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  )}
                </div>
              )}
            </div>
            {errors.videoUrl && (
              <span className="text-red-500 text-sm font-medium">{errors.videoUrl}</span>
            )}
            {formData.videoUrl && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-blue-700 font-medium text-sm">Aperçu de la ressource vidéo:</span>
                </div>
                <a 
                  href={formData.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all underline"
                >
                  {formData.videoUrl}
                </a>
              </div>
            )}
          </div>          <small className="text-gray-500 text-xs">
            L'URL doit commencer par http:// ou https:// (ex: YouTube, Vimeo, Dailymotion...)
          </small>
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium transition-all duration-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></span>
                {isEdit ? 'Modification...' : 'Création...'}
              </>
            ) : (
              isEdit ? 'Modifier' : 'Créer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
