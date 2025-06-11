import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import './CourseManagement.css';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast('Erreur lors du chargement des cours', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setShowModal(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
        showToast('Cours supprimé avec succès', 'success');
      } catch (err) {
        showToast('Erreur lors de la suppression du cours', 'error');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedCourse) {
        await courseService.updateCourse(selectedCourse.id, formData);
        setCourses(courses.map(course => 
          course.id === selectedCourse.id ? { ...course, ...formData } : course
        ));
        showToast('Cours mis à jour avec succès', 'success');
      } else {
        const newCourse = await courseService.createCourse(formData);
        setCourses([...courses, newCourse]);
        showToast('Cours créé avec succès', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement du cours', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="course-management">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="course-management">
      <div className="course-header">
        <h1>Gestion des Cours</h1>
        <button onClick={handleAddCourse} className="add-course-btn">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Ajouter un cours
        </button>
      </div>

      <div className="course-filters">
        <input
          type="text"
          placeholder="Rechercher un cours..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-input"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="draft">Brouillon</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      {error && (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p className="empty-state-text">{error}</p>
        </div>
      )}

      {!error && filteredCourses.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <p className="empty-state-text">Aucun cours trouvé</p>
        </div>
      )}

      <div className="course-grid">
        {filteredCourses.map(course => (
          <div key={course.id} className="course-card">
            <img
              src={course.image || 'https://via.placeholder.com/300x200'}
              alt={course.title}
              className="course-image"
            />
            <div className="course-status status-active">
              {course.status}
            </div>
            <div className="course-content">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-description">{course.description}</p>
            </div>
            <div className="course-meta">
              <div className="course-stats">
                <span>👥 {course.students || 0} étudiants</span>
                <span>⭐ {course.rating || 0}/5</span>
              </div>
              <div className="course-actions">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="action-btn edit-btn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="action-btn delete-btn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedCourse ? 'Modifier le cours' : 'Ajouter un cours'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="close-btn"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSubmit(Object.fromEntries(formData));
            }}>
              <div className="form-group">
                <label className="form-label">Titre</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={selectedCourse?.title}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedCourse?.description}
                  className="form-input form-textarea"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select
                  name="status"
                  defaultValue={selectedCourse?.status || 'draft'}
                  className="form-select"
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Actif</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-btn"
                >
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  {selectedCourse ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' ? '✅' : '❌'}
          </div>
          <p className="toast-message">{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
