import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import './CourseDetails.css';

const CourseDetails = ({ courseId, onClose, onEdit }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="course-details-overlay">
        <div className="course-details-modal">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des détails du cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-details-overlay">
        <div className="course-details-modal">
          <div className="error-container">
            <h3>Erreur</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="course-details-overlay" onClick={onClose}>
      <div className="course-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{course.title}</h2>
          <button className="close-button" onClick={onClose} title="Fermer">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="course-info-section">
            <h3>Description</h3>
            <p className="course-description">{course.description}</p>
          </div>

          <div className="course-meta-section">
            <div className="meta-row">
              <span className="meta-label">Date de création :</span>
              <span className="meta-value">{formatDate(course.createdAt)}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Dernière modification :</span>
              <span className="meta-value">{formatDate(course.updatedAt)}</span>
            </div>
          </div>

          {course.employees && course.employees.length > 0 && (
            <div className="course-enrollment-section">
              <h3>Inscriptions ({course.employees.length})</h3>
              <div className="employees-list">
                {course.employees.map((employee, index) => (
                  <div key={employee.id || index} className="employee-item">
                    <div className="employee-info">
                      <span className="employee-name">
                        {employee.firstName} {employee.lastName}
                      </span>
                      {employee.email && (
                        <span className="employee-email">{employee.email}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!course.employees || course.employees.length === 0) && (
            <div className="no-enrollments">
              <p>Aucune inscription pour ce cours.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
          {onEdit && (
            <button className="btn btn-primary" onClick={() => onEdit(course)}>
              Modifier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
