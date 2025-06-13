import React, { useState, useEffect } from 'react';
import { ressourceService } from '../services/ressourceService';
import { courseService } from '../services/courseService';

const EditVideoResource = ({ resourceId, onResourceUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    contenu: '',
    course_id: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [urlValidation, setUrlValidation] = useState({ isValid: false, message: '' });

  useEffect(() => {
    fetchData();
  }, [resourceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resourceData, coursesData] = await Promise.all([
        ressourceService.getRessourceById(resourceId),
        courseService.getAllCourses()
      ]);
      
      setCourses(coursesData);
      
      // Pré-remplir le formulaire avec les données existantes
      setFormData({
        contenu: resourceData.contenu || '',
        course_id: resourceData.course?.id || ''
      });
      
      // Valider l'URL existante
      if (resourceData.contenu) {
        validateUrl(resourceData.contenu);
      }
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Validation en temps réel de l'URL
  const validateUrl = (url) => {
    if (!url || !url.trim()) {
      setUrlValidation({ isValid: false, message: '' });
      return;
    }

    const trimmedUrl = url.trim();
    
    try {
      const urlObj = new URL(trimmedUrl);
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        setUrlValidation({ isValid: true, message: 'URL valide' });
      } else {
        setUrlValidation({ isValid: false, message: 'L\'URL doit commencer par http:// ou https://' });
      }
    } catch (error) {
      setUrlValidation({ isValid: false, message: 'Format d\'URL invalide' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Valider l'URL en temps réel
    if (name === 'contenu') {
      validateUrl(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.contenu.trim()) {
      setError('L\'URL de la vidéo est requise');
      return;
    }

    if (!formData.course_id) {
      setError('Veuillez sélectionner un cours');
      return;
    }

    if (!urlValidation.isValid) {
      setError('Veuillez entrer une URL valide');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const resourceData = {
        contenu: formData.contenu.trim(),
        course_id: parseInt(formData.course_id)
      };

      const updatedResource = await ressourceService.updateRessource(resourceId, resourceData);
      
      // Notifier le composant parent
      if (onResourceUpdated) {
        onResourceUpdated(updatedResource);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la mise à jour de la ressource');
      console.error('Erreur:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-blue-500/5 border border-white/20 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-t-blue-600 border-blue-100 rounded-full animate-spin"></div>
          <p className="mt-2 text-blue-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl shadow-blue-500/5 border border-white/20 relative overflow-hidden">
      <div className="absolute -left-40 -top-40 w-80 h-80 bg-orange-200 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-blue-200 rounded-full opacity-10 blur-3xl"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            Modifier la Ressource Vidéo #{resourceId}
          </h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du cours */}
          <div>
            <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-2">
              Cours <span className="text-red-500">*</span>
            </label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            >
              <option value="">Sélectionnez un cours...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* URL de la vidéo */}
          <div>
            <label htmlFor="contenu" className="block text-sm font-medium text-gray-700 mb-2">
              Ressource Vidéo URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
              <input
                type="url"
                id="contenu"
                name="contenu"
                value={formData.contenu}
                onChange={handleInputChange}
                placeholder="https://example.com/video.mp4"
                required
                className={`w-full pl-12 pr-12 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                  urlValidation.isValid 
                    ? 'border-green-300 focus:ring-green-500/50 focus:border-green-500' 
                    : formData.contenu && !urlValidation.isValid 
                      ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500'
                      : 'border-gray-200 focus:ring-blue-500/50 focus:border-blue-500'
                }`}
              />
              
              {/* Indicateur de validation */}
              {formData.contenu && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  {urlValidation.isValid ? (
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
            
            {/* Message de validation */}
            {urlValidation.message && (
              <p className={`mt-2 text-sm ${urlValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {urlValidation.message}
              </p>
            )}
            
            <p className="mt-2 text-sm text-gray-500">
              Modifiez l'URL de la vidéo (ex: YouTube, Vimeo, ou lien direct)
            </p>
          </div>

          {/* Prévisualisation de l'URL */}
          {formData.contenu && urlValidation.isValid && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Prévisualisation</h4>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <a 
                  href={formData.contenu} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
                >
                  {formData.contenu}
                </a>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={saving || !urlValidation.isValid || !formData.course_id}
              className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-orange-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Mettre à Jour
                </>
              )}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideoResource;
