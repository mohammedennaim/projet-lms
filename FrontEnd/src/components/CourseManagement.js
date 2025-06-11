import React, { useState, useEffect } from 'react';
import CourseList from './CourseList';
import CourseForm from './CourseForm';
import CourseDetails from './CourseDetails';
import { courseService } from '../services/courseService';
import './CourseManagement.css';

const CourseManagement = () => {
  const [view, setView] = useState('list'); // 'list', 'form', 'details'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle creating new course
  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsEdit(false);
    setView('form');
  };

  // Handle editing course
  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEdit(true);
    setView('form');
  };

  // Handle viewing course details
  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setView('details');
  };

  // Handle course save (create or update)
  const handleCourseSave = (savedCourse) => {
    const message = isEdit 
      ? 'Cours modifié avec succès' 
      : 'Cours créé avec succès';
    
    showNotification(message, 'success');
    setView('list');
    setSelectedCourse(null);
    setRefreshTrigger(prev => prev + 1); // Trigger list refresh
  };

  // Handle course delete
  const handleCourseDelete = (courseId) => {
    showNotification('Cours supprimé avec succès', 'success');
    setRefreshTrigger(prev => prev + 1); // Trigger list refresh
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setView('list');
    setSelectedCourse(null);
    setIsEdit(false);
  };

  // Handle close details
  const handleCloseDetails = () => {
    setView('list');
    setSelectedCourse(null);
  };

  // Handle edit from details view
  const handleEditFromDetails = (course) => {
    setSelectedCourse(course);
    setIsEdit(true);
    setView('form');
  };

  return (
    <div className="course-management">
      {/* Header */}
      <div className="course-management-header">
        <div className="header-content">
          <h1>Gestion des Cours</h1>
          <p>Gérez et organisez les cours de votre plateforme LMS</p>
        </div>
        {view === 'list' && (
          <button 
            className="btn-create-course"
            onClick={handleCreateCourse}
          >
            <span className="btn-icon">+</span>
            Nouveau cours
          </button>
        )}
      </div>

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <span 
          className={`breadcrumb-item ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
        >
          Liste des cours
        </span>
        {view === 'form' && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">
              {isEdit ? 'Modifier le cours' : 'Nouveau cours'}
            </span>
          </>
        )}
        {view === 'details' && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">
              Détails du cours
            </span>
          </>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <span className="notification-message">{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="course-management-content">
        {view === 'list' && (
          <CourseList
            key={refreshTrigger} // Force re-render when refresh triggered
            onSelectCourse={handleViewCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleCourseDelete}
          />
        )}

        {view === 'form' && (
          <CourseForm
            course={selectedCourse}
            isEdit={isEdit}
            onSave={handleCourseSave}
            onCancel={handleCancelForm}
          />
        )}

        {view === 'details' && selectedCourse && (
          <CourseDetails
            courseId={selectedCourse.id}
            onClose={handleCloseDetails}
            onEdit={handleEditFromDetails}
          />
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
