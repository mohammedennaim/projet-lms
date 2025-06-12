import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';

const CourseForm = ({ course, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when course prop changes  useEffect(() => {
    if (course && isEdit) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        image: course.image || 'https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c='
      });
    } else {
      setFormData({
        title: '',
        description: '',
        image: 'https://media.istockphoto.com/id/1499883210/photo/word-lms-with-learning-management-system-related-icons-learning-management-system-concept-for.jpg?s=1024x1024&w=is&k=20&c=X-X9Hm66AYeRt6s6KwtmVzZvLAAazav91Ul4N573A4c='
      });
    }
    setErrors({});
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
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
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
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: ''
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
            Minimum 10 caractères ({formData.description.length} caractères)
          </small>
        </div>
        
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
