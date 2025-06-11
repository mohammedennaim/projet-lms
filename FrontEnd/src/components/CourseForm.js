import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import './CourseForm.css';

const CourseForm = ({ course, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when course prop changes
  useEffect(() => {
    if (course && isEdit) {
      setFormData({
        title: course.title || '',
        description: course.description || ''
      });
    } else {
      setFormData({
        title: '',
        description: ''
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
    
    try {
      let savedCourse;
      
      if (isEdit && course) {
        savedCourse = await courseService.updateCourse(course.id, formData);
      } else {
        savedCourse = await courseService.createCourse(formData);
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
    <div className="course-form-container">
      <div className="course-form-header">
        <h2>{isEdit ? 'Modifier le cours' : 'Nouveau cours'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="course-form">
        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Titre du cours *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Entrez le titre du cours"
            maxLength="255"
          />
          {errors.title && (
            <span className="error-text">{errors.title}</span>
          )}
          <small className="form-hint">
            {formData.title.length}/255 caractères
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Décrivez le contenu et les objectifs du cours"
            rows="6"
          />
          {errors.description && (
            <span className="error-text">{errors.description}</span>
          )}
          <small className="form-hint">
            Minimum 10 caractères ({formData.description.length} caractères)
          </small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-cancel"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
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
