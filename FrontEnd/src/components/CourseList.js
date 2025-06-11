import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import './CourseList.css';

const CourseList = ({ onSelectCourse, onEditCourse, onDeleteCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [courses, searchTerm]);
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getAllCourses();
      setCourses(coursesData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
        if (onDeleteCourse) onDeleteCourse(courseId);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="course-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <h2>Liste des Cours</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredCourses.length === 0 ? (
        <div className="no-courses">
          <p>Aucun cours trouvé.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <h3 
                  className="course-title" 
                  onClick={() => onSelectCourse && onSelectCourse(course)}
                >
                  {course.title}
                </h3>
                <div className="course-actions">
                  <button
                    className="btn-edit"
                    onClick={() => onEditCourse && onEditCourse(course)}
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(course.id)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="course-description">
                <p>{course.description}</p>
              </div>
              
              <div className="course-footer">
                <div className="course-dates">
                  <small>Créé le {formatDate(course.createdAt)}</small>
                  {course.updatedAt !== course.createdAt && (
                    <small>Modifié le {formatDate(course.updatedAt)}</small>
                  )}
                </div>
                
                {course.employees && course.employees.length > 0 && (
                  <div className="course-enrollment">
                    <span className="enrollment-count">
                      {course.employees.length} inscription(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
